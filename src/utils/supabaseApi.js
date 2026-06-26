import { supabase } from "../supabaseClient";

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
      console.error("Supabase Error:", error.message);
      return {
        success: false,
        data: null,
        error: mapSupabaseError(error),
        meta: { code: error.code },
      };
    }
    return { success: true, data, error: null, meta: { count } };
  } catch (err) {
    console.error("Query Error:", err);
    return {
      success: false,
      data: null,
      error: "Beklenmeyen bir hata oluştu",
      meta: {},
    };
  }
};

/**
 * Map Supabase error codes to user-friendly messages
 */
const mapSupabaseError = (error) => {
  const errorMap = {
    PGRST116: "Kayıt bulunamadı",
    23505: "Bu kayıt zaten mevcut",
    23503: "İlişkili kayıt bulunamadı",
    42501: "Bu işlem için yetkiniz yok",
    "JWT expired": "Oturum süresi doldu, lütfen tekrar giriş yapın",
  };
  return errorMap[error.code] || error.message || "Bir hata oluştu";
};

/**
 * Fetch with pagination
 * @param {string} table - Table name
 * @param {Object} options - Query options
 */
export const fetchPaginated = async (
  table,
  {
    select = "*",
    page = 1,
    limit = 20,
    orderBy = "created_at",
    ascending = false,
    filters = {},
  } = {},
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from(table)
    .select(select, { count: "exact" })
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
      hasMore: to < (result.meta.count || 0) - 1,
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
      .select(),
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
      .eq("id", id)
      .select(),
  );
};

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
      "postgres_changes",
      { event, schema: "public", table, ...filter },
      (payload) => callback(payload),
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Fetch recent activity (orders, quotes) for a partner
 */
export const getPartnerRecentActivity = async (sellerId, limit = 5) => {
  try {
    if (!sellerId) return { success: false, error: "Seller ID is required" };

    // Fetch Orders, Quotes, and Consultations concurrently
    const [
      { data: orders, error: orderError },
      { data: quotes, error: quoteError },
      { data: consultations, error: consError }
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("id, total_amount, status, created_at, customer_id")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("quotes")
        .select("id, price, status, created_at, customer_id")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("consultations")
        .select("id, fee, status, created_at, user_id, topic")
        .eq("expert_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(limit)
    ]);

    if (orderError) throw orderError;
    if (quoteError) throw quoteError;
    if (consError) throw consError;

    // Combine and sort
    const activity = [
      ...orders.map(o => ({ ...o, activity_type: 'ORDER' })),
      ...quotes.map(q => ({ ...q, activity_type: 'QUOTE' })),
      ...consultations.map(c => ({ ...c, activity_type: 'CONSULTATION', total_amount: c.fee }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);

    return { success: true, data: activity };
  } catch (error) {
    console.error("Recent Activity Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch stats for a partner dashboard
 */
export const getPartnerDashboardStats = async (sellerId) => {
  try {
    if (!sellerId) return { success: false, error: "Seller ID is required" };

    // 1. Total Sales & Order Count
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("total_amount, status")
      .eq("seller_id", sellerId);

    if (orderError) throw orderError;

    // 2. Product Count
    const { count: productCount, error: productError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", sellerId);

    if (productError) throw productError;

    // 3. Consultation Income (Missing query added)
    const { data: consultationStats, error: consStatsError } = await supabase
      .from("consultations")
      .select("fee")
      .eq("expert_id", sellerId)
      .in("status", ["completed", "paid"]);

    if (consStatsError) throw consStatsError;

    // 4. Fetch Quotes Count
    const { count: quoteCount, error: quoteError } = await supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("status", "pending");

    if (quoteError) throw quoteError;

    const totalSales = orders
      .filter((o) => o.status === "paid" || o.status === "completed")
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const totalConsultationIncome = consultationStats.reduce((sum, c) => sum + (c.fee || 0), 0);

    // 5. Fetch Wallet Balance
    const { data: walletData } = await supabase
      .from("wallets")
      .select("pending_balance, balance")
      .eq("user_id", sellerId)
      .maybeSingle();

    return {
      success: true,
      data: {
        totalSales: totalSales + totalConsultationIncome,
        orderCount: orders.length + consultationStats.length,
        productCount: productCount || 0,
        activeQuotes: quoteCount || 0,
        pendingBalance: walletData?.pending_balance || 0,
        availableBalance: walletData?.balance || 0,
      },
    };
  } catch (error) {
    console.error("Partner Stats Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch global stats for admin dashboard (RPC Based - No simulation)
 */
export const getAdminGlobalStats = async () => {
  return safeQuery(() => 
    supabase.rpc("get_admin_dashboard_stats_v2")
  );
};

/**
 * Update user account status (Suspend/Activate)
 */
export const updateUserStatus = async (userId, isSuspended) => {
  return safeQuery(() =>
    supabase
      .from("profiles")
      .update({ 
        is_suspended: isSuspended,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
  );
};

/**
 * Fetch system settings
 */
export const getSystemSettings = async () => {
  return safeQuery(() =>
    supabase.from("system_settings").select("*")
  );
};

/**
 * Update a specific system setting
 */
export const updateSystemSetting = async (key, value) => {
  return safeQuery(() =>
    supabase
      .from("system_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key)
      .select()
  );
};

/**
 * Purchase partner subscription tier
 */
export const updatePartnerSubscription = async (partnerId, tier) => {
  try {
    // 1. Get the current active plan to identify the partner's profession
    const { data: currentPlans } = await supabase
      .from("partner_monetization")
      .select(`
        plan_id,
        monetization_plans (
          name
        )
      `)
      .eq("partner_id", partnerId)
      .maybeSingle();

    let profession = "";
    if (currentPlans?.monetization_plans?.name) {
      const planName = currentPlans.monetization_plans.name;
      // Get the profession prefix: "parking_", "valet_", "mechanic_", "parts_"
      const parts = planName.split("_");
      if (parts.length > 0) {
        profession = parts[0];
      }
    }

    // Fallback: If profession is not found, try to query profiles/role
    if (!profession) {
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", partnerId)
        .maybeSingle();
      
      // Default to 'parking' if general partner, or look at specific settings
      profession = "parking";
    }

    // 2. Fetch the target plan ID from monetization_plans
    const targetPlanName = `${profession}_${tier}`;
    const { data: targetPlan, error: planError } = await supabase
      .from("monetization_plans")
      .select("id")
      .eq("name", targetPlanName)
      .maybeSingle();

    if (planError || !targetPlan) {
      throw new Error(`Hedef üyelik planı (${targetPlanName}) bulunamadı. Lütfen SQL migrations dosyasının çalıştırıldığından emin olun.`);
    }

    // 3. Call the secure RPC function to purchase the subscription
    const { data: rpcData, error: rpcError } = await supabase.rpc("purchase_partner_subscription_v2", {
      p_partner_id: partnerId,
      p_plan_id: targetPlan.id
    });

    if (rpcError) {
      // Fallback: if function doesn't exist (e.g. DDL not run yet), execute client-side direct update
      if (rpcError.code === "42883") {
        console.warn("purchase_partner_subscription_v2 RPC not found. Falling back to client-side updates.");
        const { error: fallbackError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: tier
          })
          .eq("id", partnerId);

        if (fallbackError) throw fallbackError;
        return { success: true };
      }
      throw rpcError;
    }

    if (rpcData && !rpcData.success) {
      return { success: false, error: rpcData.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Purchase Subscription Error:", error);
    return { success: false, error: error.message || error };
  }
};
