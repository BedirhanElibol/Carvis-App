import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EscrowService } from './EscrowService';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}));

const createQueryChain = (result) => {
  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    then: function(resolve) { resolve(result); }
  };
  return chain;
};

describe('EscrowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('blockFunds', () => {
    it('should successfully block funds', async () => {
      const mockResult = { data: { id: 1, status: 'blocked' }, error: null };
      const chain = createQueryChain(mockResult);

      supabase.from.mockImplementation(() => chain);

      const result = await EscrowService.blockFunds('order-1', 100);

      expect(supabase.from).toHaveBeenCalledWith('escrow_vault');
      expect(chain.insert).toHaveBeenCalledWith([{ order_id: 'order-1', amount: 100, status: "blocked" }]);
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, status: 'blocked' });
      expect(result.error).toBeNull();
    });

    it('should return error if block funds fails', async () => {
      const mockResult = { data: null, error: { message: 'Insert failed' } };
      const chain = createQueryChain(mockResult);

      supabase.from.mockImplementation(() => chain);

      const result = await EscrowService.blockFunds('order-1', 100);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toEqual({ message: 'Insert failed' });
    });
  });

  describe('submitProof', () => {
    it('should successfully submit proof', async () => {
      const mockResult = { data: { id: 1 }, error: null };
      const chain = createQueryChain(mockResult);

      supabase.from.mockImplementation(() => chain);

      const result = await EscrowService.submitProof('order-1', ['url1', 'url2'], 'Job done');

      expect(supabase.from).toHaveBeenCalledWith('service_proofs');
      expect(chain.upsert).toHaveBeenCalledWith([{ order_id: 'order-1', photo_urls: ['url1', 'url2'], description: 'Job done' }]);
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
      expect(result.error).toBeNull();
    });

    it('should return error if submit proof fails', async () => {
      const mockResult = { data: null, error: { message: 'Upsert failed' } };
      const chain = createQueryChain(mockResult);

      supabase.from.mockImplementation(() => chain);

      const result = await EscrowService.submitProof('order-1', [], '');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toEqual({ message: 'Upsert failed' });
    });
  });

  describe('releaseFunds', () => {
    it('should return error if currentUserId is missing', async () => {
      const result = await EscrowService.releaseFunds('order-1', null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Güvenlik İhlali: Oturum bilgisi bulunamadı.');
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return error if order fetch fails or user is not owner', async () => {
      const orderChain = createQueryChain({ data: null, error: { message: 'Not found' } });
      supabase.from.mockImplementation(() => orderChain);

      const result = await EscrowService.releaseFunds('order-1', 'user-1');

      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(orderChain.select).toHaveBeenCalledWith('customer_id');
      expect(orderChain.eq).toHaveBeenCalledWith('id', 'order-1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Güvenlik İhlali: Bu işleme yetkiniz yok.');
    });

    it('should return error if user is not the order owner', async () => {
      const orderChain = createQueryChain({ data: { customer_id: 'user-2' }, error: null });
      supabase.from.mockImplementation(() => orderChain);

      const result = await EscrowService.releaseFunds('order-1', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Güvenlik İhlali: Bu işleme yetkiniz yok.');
    });

    it('should return error if vault is not found or not blocked', async () => {
      const orderChain = createQueryChain({ data: { customer_id: 'user-1' }, error: null });
      const vaultChain = createQueryChain({ data: null, error: { message: 'Vault not found' } });

      supabase.from.mockImplementation((table) => {
        if (table === 'orders') return orderChain;
        if (table === 'escrow_vault') return vaultChain;
      });

      const result = await EscrowService.releaseFunds('order-1', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bloke ödeme bulunamadı.');
    });

    it('should return error if vault release update fails', async () => {
      const orderChain = createQueryChain({ data: { customer_id: 'user-1' }, error: null });
      const vaultGetChain = createQueryChain({ data: { id: 'vault-1', status: 'blocked' }, error: null });

      const vaultUpdateChain = {
        update: vi.fn(() => vaultUpdateChain),
        eq: vi.fn(() => Promise.resolve({ error: { message: 'Update failed' } })),
        then: function(resolve) { resolve({ error: { message: 'Update failed' } }); }
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'orders') return orderChain;
        if (table === 'escrow_vault') {
          return {
            select: vi.fn(() => vaultGetChain),
            update: vi.fn(() => vaultUpdateChain)
          };
        }
      });

      const result = await EscrowService.releaseFunds('order-1', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bloke çözülemedi.');
    });

    it('should successfully release funds, approve proof, and call rpc', async () => {
      const orderChain = createQueryChain({ data: { customer_id: 'user-1' }, error: null });
      const vaultGetChain = createQueryChain({ data: { id: 'vault-1', status: 'blocked' }, error: null });

      const vaultUpdateChain = {
        update: vi.fn(() => vaultUpdateChain),
        eq: vi.fn(() => Promise.resolve({ error: null })),
        then: function(resolve) { resolve({ error: null }); }
      };

      const proofUpdateChain = {
        update: vi.fn(() => proofUpdateChain),
        eq: vi.fn(() => Promise.resolve({ error: null })),
        then: function(resolve) { resolve({ error: null }); }
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'orders') return orderChain;
        if (table === 'escrow_vault') {
          // It's called twice: first with select, then with update
          return {
            select: vi.fn(() => vaultGetChain),
            update: vaultUpdateChain.update
          };
        }
        if (table === 'service_proofs') {
          return {
             update: proofUpdateChain.update
          };
        }
      });

      supabase.rpc.mockResolvedValue({ error: null });

      const result = await EscrowService.releaseFunds('order-1', 'user-1');

      // Verify vault update
      expect(vaultUpdateChain.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'released' }));
      expect(vaultUpdateChain.eq).toHaveBeenCalledWith('id', 'vault-1');

      // Verify proof update
      expect(proofUpdateChain.update).toHaveBeenCalledWith({ is_approved: true });
      expect(proofUpdateChain.eq).toHaveBeenCalledWith('order_id', 'order-1');

      // Verify RPC call
      expect(supabase.rpc).toHaveBeenCalledWith('rpc_release_escrow', {
        p_order_id: 'order-1',
        p_user_id: 'user-1'
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error if rpc call fails', async () => {
        const orderChain = createQueryChain({ data: { customer_id: 'user-1' }, error: null });
        const vaultGetChain = createQueryChain({ data: { id: 'vault-1', status: 'blocked' }, error: null });

        const vaultUpdateChain = {
          update: vi.fn(() => vaultUpdateChain),
          eq: vi.fn(() => Promise.resolve({ error: null })),
          then: function(resolve) { resolve({ error: null }); }
        };

        const proofUpdateChain = {
          update: vi.fn(() => proofUpdateChain),
          eq: vi.fn(() => Promise.resolve({ error: null })),
          then: function(resolve) { resolve({ error: null }); }
        };

        supabase.from.mockImplementation((table) => {
          if (table === 'orders') return orderChain;
          if (table === 'escrow_vault') {
            return {
              select: vi.fn(() => vaultGetChain),
              update: vaultUpdateChain.update
            };
          }
          if (table === 'service_proofs') {
            return {
              update: proofUpdateChain.update
            };
          }
        });

        supabase.rpc.mockResolvedValue({ error: { message: 'RPC Error' } });

        const result = await EscrowService.releaseFunds('order-1', 'user-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('RPC Error');
      });
  });
});
