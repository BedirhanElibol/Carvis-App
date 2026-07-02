import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useProductQna(productId) {
    const [qnaList, setQnaList] = useState([]);
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState(null);

    const fetchQna = useCallback(async () => {
        if (!productId) return;
        try {
            const { data, error: fetchError } = await supabase
                .from('product_qna')
                .select('*')
                .eq('product_id', productId)
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            if (data) setQnaList(data);
        } catch (err) {
            console.error('Failed to fetch Q&A:', err);
            setError(err);
        }
    }, [productId]);

    useEffect(() => {
        fetchQna();
    }, [fetchQna]);

    const askQuestion = async (questionText, sellerId) => {
        if (!questionText.trim() || !productId) return false;
        
        setAsking(true);
        setError(null);
        
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) {
                alert("Soru sormak için giriş yapmalısınız.");
                return false;
            }

            const { error: insertError } = await supabase.from('product_qna').insert({
                product_id: productId,
                user_id: userData.user.id,
                seller_id: sellerId,
                question: questionText,
                is_public: true
            });

            if (insertError) throw insertError;

            await fetchQna();
            return true;
        } catch (err) {
            console.error('Failed to ask question:', err);
            setError(err);
            return false;
        } finally {
            setAsking(false);
        }
    };

    return {
        qnaList,
        asking,
        error,
        askQuestion,
        refreshQna: fetchQna
    };
}
