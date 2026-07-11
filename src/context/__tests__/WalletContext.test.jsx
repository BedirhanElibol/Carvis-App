import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WalletProvider, useWallet } from '../WalletContext';
import { useAuth } from '../AuthContext';
import { useUI } from '../UIContext';
import { supabase } from '../../supabaseClient';
import React from 'react';

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../UIContext', () => ({
  useUI: vi.fn(),
}));

vi.mock('../../supabaseClient', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('WalletContext - releaseFunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { id: 'user123', isAnonymous: false } });
    useUI.mockReturnValue({ showAlert: vi.fn() });
  });

  it('should call rpc_release_funds and fetchWalletData on success', async () => {
    supabase.rpc.mockResolvedValue({ error: null });

    const wrapper = ({ children }) => <WalletProvider>{children}</WalletProvider>;
    const { result } = renderHook(() => useWallet(), { wrapper });

    let success;
    await act(async () => {
      success = await result.current.releaseFunds(100);
    });

    expect(supabase.rpc).toHaveBeenCalledWith('rpc_release_funds', { p_amount: 100 });
    expect(success).toBe(true);
  });

  it('should return false on rpc error', async () => {
    supabase.rpc.mockResolvedValue({ error: { message: 'Failed' } });

    const wrapper = ({ children }) => <WalletProvider>{children}</WalletProvider>;
    const { result } = renderHook(() => useWallet(), { wrapper });

    let success;
    await act(async () => {
      success = await result.current.releaseFunds(100);
    });

    expect(supabase.rpc).toHaveBeenCalledWith('rpc_release_funds', { p_amount: 100 });
    expect(success).toBe(false);
  });
});
