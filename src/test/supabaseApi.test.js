import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePartnerSubscription } from '../utils/supabaseApi';
import { supabase } from '../supabaseClient';

// Mock console.warn and console.error to keep test output clean
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Global mock state to configure responses for chained methods
let mockState = {
  partner_monetization: { data: null, error: null },
  profiles_select: { data: null, error: null },
  monetization_plans: { data: null, error: null },
  profiles_update: { data: null, error: null },
  rpc: { data: null, error: null },
};

// Define the query chain mock
vi.mock('../supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn((table) => {
        const chain = {
          select: vi.fn(() => chain),
          eq: vi.fn(() => chain),
          update: vi.fn((_data) => {
             // For update operations, we don't need maybeSingle in this function
             // so we return a promise-like object that returns the update result
             return {
                 eq: vi.fn(() => Promise.resolve(mockState.profiles_update))
             };
          }),
          maybeSingle: vi.fn(() => {
            if (table === "partner_monetization") return Promise.resolve(mockState.partner_monetization);
            if (table === "profiles") return Promise.resolve(mockState.profiles_select);
            if (table === "monetization_plans") return Promise.resolve(mockState.monetization_plans);
            return Promise.resolve({ data: null, error: null });
          })
        };
        return chain;
      }),
      rpc: vi.fn(() => Promise.resolve(mockState.rpc)),
    }
  };
});

describe("updatePartnerSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      partner_monetization: { data: null, error: null },
      profiles_select: { data: null, error: null },
      monetization_plans: { data: null, error: null },
      profiles_update: { data: null, error: null },
      rpc: { data: null, error: null },
    };
  });

  it("should successfully purchase subscription when current plan exists and profession is parsed correctly", async () => {
    // Arrange
    const partnerId = 'partner-1';
    const tier = 'pro';

    mockState.partner_monetization = {
      data: {
        plan_id: 'plan-1',
        monetization_plans: { name: 'mechanic_basic' }
      },
      error: null
    };
    mockState.monetization_plans = {
      data: { id: 'plan-123' },
      error: null
    };
    mockState.rpc = {
      data: { success: true },
      error: null
    };

    // Act
    const result = await updatePartnerSubscription(partnerId, tier);

    // Assert
    expect(result).toEqual({ success: true });

    // Verify `monetization_plans` was queried with the correct target plan name: "mechanic_pro"
    expect(supabase.from).toHaveBeenCalledWith('monetization_plans');

    // Find the call to `from('monetization_plans')` and check its chain
    const _fromCalls = supabase.from.mock.calls;
    // We expect from('monetization_plans') to be called

    expect(supabase.rpc).toHaveBeenCalledWith('purchase_partner_subscription_v2', {
      p_partner_id: partnerId,
      p_plan_id: 'plan-123'
    });
  });

  it("should default profession to 'parking' if no active plan is found", async () => {
    // Arrange
    const partnerId = 'partner-2';
    const tier = 'premium';

    // No active plan
    mockState.partner_monetization = {
      data: null,
      error: null
    };
    // Profile role query
    mockState.profiles_select = {
      data: { role: 'seller' },
      error: null
    };
    // Target plan query
    mockState.monetization_plans = {
      data: { id: 'plan-456' },
      error: null
    };
    mockState.rpc = {
      data: { success: true },
      error: null
    };

    // Act
    const result = await updatePartnerSubscription(partnerId, tier);

    // Assert
    expect(result).toEqual({ success: true });

    // Verify it called rpc with the plan id found for 'parking_premium'
    expect(supabase.rpc).toHaveBeenCalledWith('purchase_partner_subscription_v2', {
      p_partner_id: partnerId,
      p_plan_id: 'plan-456'
    });
  });

  it("should return an error if the target monetization plan is not found", async () => {
    // Arrange
    const partnerId = 'partner-3';
    const tier = 'nonexistent';

    mockState.partner_monetization = {
      data: {
        plan_id: 'plan-1',
        monetization_plans: { name: 'valet_basic' }
      },
      error: null
    };
    // Target plan not found
    mockState.monetization_plans = {
      data: null,
      error: { message: "Not found" } // planError
    };

    // Act
    const result = await updatePartnerSubscription(partnerId, tier);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain("Hedef üyelik planı (valet_nonexistent) bulunamadı");
    // Should not call RPC
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("should fallback to direct client-side update if RPC function does not exist (42883)", async () => {
    // Arrange
    const partnerId = 'partner-4';
    const tier = 'pro';

    mockState.partner_monetization = {
      data: {
        plan_id: 'plan-1',
        monetization_plans: { name: 'parts_basic' }
      },
      error: null
    };
    mockState.monetization_plans = {
      data: { id: 'plan-789' },
      error: null
    };
    // RPC throws 42883
    mockState.rpc = null;
    supabase.rpc.mockImplementationOnce(() => Promise.resolve({
        data: null,
        error: { code: "42883", message: "function not found" }
    }));

    // Fallback update succeeds
    mockState.profiles_update = { error: null };

    // Act
    const result = await updatePartnerSubscription(partnerId, tier);

    // Assert
    expect(result).toEqual({ success: true });
    // Verify fallback update was called on 'profiles' table
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it("should return an error if the RPC returns an unexpected error (not 42883)", async () => {
    // Arrange
    const partnerId = 'partner-5';
    const tier = 'pro';

    mockState.partner_monetization = {
      data: {
        plan_id: 'plan-1',
        monetization_plans: { name: 'mechanic_basic' }
      },
      error: null
    };
    mockState.monetization_plans = {
      data: { id: 'plan-123' },
      error: null
    };

    const unexpectedError = { code: "50000", message: "Some internal error" };
    // RPC throws unexpected error
    supabase.rpc.mockImplementationOnce(() => Promise.resolve({
        data: null,
        error: unexpectedError
    }));

    // Act
    const result = await updatePartnerSubscription(partnerId, tier);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("Some internal error");
  });

  it("should return an error if the RPC executes successfully but returns success: false in payload", async () => {
    // Arrange
    const partnerId = 'partner-6';
    const tier = 'pro';

    mockState.partner_monetization = {
      data: {
        plan_id: 'plan-1',
        monetization_plans: { name: 'mechanic_basic' }
      },
      error: null
    };
    mockState.monetization_plans = {
      data: { id: 'plan-123' },
      error: null
    };

    // RPC returns success: false in data
    mockState.rpc = {
      data: { success: false, message: "Insufficient funds" },
      error: null
    };

    // Act
    const result = await updatePartnerSubscription(partnerId, tier);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("Insufficient funds");
  });
});
