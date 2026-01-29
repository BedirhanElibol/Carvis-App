import { supabase } from '../supabaseClient';

// ================================================
// SUPABASE API UTILITY
// Centralized query helpers with consistent error handling
// Based on api-patterns skill
// ================================================

/**
 * Standard API response format
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {any} data
 * @property {string|null} error
 * @property {Object} meta
 */

/**
 * Wrap Supabase query with consistent error handling
 * @param {Function} queryFn - Async function that returns Supabase query result
 * @returns {Promise<ApiResponse>}
 */
export const safeQuery = async (queryFn) => {
    try {
        const { data, error, count } = await queryFn();

        if (error) {
            console.error('Supabase Error:', error.message);
            return {
                success: false,
                data: null,
                error: mapSupabaseError(error),
                meta: { code: error.code }
            };
        }

        return {
            success: true,
            data,
            error: null,
            meta: { count }
        };
    } catch (err) {
        console.error('Query Error:', err);
        return {
            success: false,
            data: null,
            error: 'Beklenmeyen bir hata oluştu',
            meta: {}
        };
    }
};

/**
 * Map Supabase error codes to user-friendly messages
 */
const mapSupabaseError = (error) => {
    const errorMap = {
        'PGRST116': 'Kayıt bulunamadı',
        '23505': 'Bu kayıt zaten mevcut',
        '23503': 'İlişkili kayıt bulunamadı',
        '42501': 'Bu işlem için yetkiniz yok',
        'JWT expired': 'Oturum süresi doldu, lütfen tekrar giriş yapın',
    };

    return errorMap[error.code] || error.message || 'Bir hata oluştu';
};

// ================================================
// COMMON QUERY PATTERNS
// ================================================

/**
 * Fetch with pagination
 * @param {string} table - Table name
 * @param {Object} options - Query options
 */
export const fetchPaginated = async (table, {
    select = '*',
    page = 1,
    limit = 20,
    orderBy = 'created_at',
    ascending = false,
    filters = {}
} = {}) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .range(from, to)
        .order(orderBy, { ascending });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    });

    const result = await safeQuery(() => query);

    if (result.success) {
        result.meta = {
            ...result.meta,
            page,
            limit,
            totalPages: Math.ceil((result.meta.count || 0) / limit),
            hasMore: to < (result.meta.count || 0) - 1
        };
    }

    return result;
};

/**
 * Upsert with conflict handling
 */
export const upsertSafe = async (table, data, options = {}) => {
    return safeQuery(() =>
        supabase
            .from(table)
            .upsert(data, { onConflict: options.onConflict })
            .select()
    );
};

/**
 * Soft delete (set deleted_at instead of removing)
 */
export const softDelete = async (table, id) => {
    return safeQuery(() =>
        supabase
            .from(table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .select()
    );
};

// ================================================
// REALTIME SUBSCRIPTION HELPERS
// ================================================

/**
 * Create a subscription with auto-cleanup
 * @param {string} table - Table name
 * @param {string} event - Event type ('INSERT' | 'UPDATE' | 'DELETE' | '*')
 * @param {Function} callback - Callback function
 * @param {Object} filter - Optional filter
 * @returns {Function} Cleanup function
 */
export const subscribeToTable = (table, event, callback, filter = {}) => {
    const channel = supabase
        .channel(`${table}_changes`)
        .on(
            'postgres_changes',
            {
                event,
                schema: 'public',
                table,
                ...filter
            },
            (payload) => callback(payload)
        )
        .subscribe();

    // Return cleanup function
    return () => {
        supabase.removeChannel(channel);
    };
};

// ================================================
// BATCH OPERATIONS
// ================================================

/**
 * Insert multiple records in batches
 * @param {string} table
 * @param {Array} records
 * @param {number} batchSize
 */
export const batchInsert = async (table, records, batchSize = 100) => {
    const results = [];

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const result = await safeQuery(() =>
            supabase.from(table).insert(batch).select()
        );
        results.push(result);

        if (!result.success) break;
    }

    return {
        success: results.every(r => r.success),
        insertedCount: results.reduce((sum, r) => sum + (r.data?.length || 0), 0),
        errors: results.filter(r => !r.success).map(r => r.error)
    };
};
