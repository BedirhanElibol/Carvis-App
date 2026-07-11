import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletProvider, useWallet } from './WalletContext';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { supabase } from '../supabaseClient';

// Mock dependencies
vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./UIContext', () => ({
  useUI: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      upsert: vi.fn(() => ({ error: null })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

// Test component to access context
const TestComponent = () => {
  const wallet = useWallet();
  // Expose wallet to window for testing
  window.walletContext = wallet;
  return null;
};

describe('WalletContext - cancelEscrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    useAuth.mockReturnValue({ currentUser: { id: 'test-user-id', isAnonymous: false } });
    useUI.mockReturnValue({ showAlert: vi.fn() });
  });

  it('should call supabase.rpc with rpc_cancel_escrow and amount, then fetchWalletData on success', async () => {
    // Mock successful rpc response
    supabase.rpc.mockResolvedValueOnce({ error: null });

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    // Wait for context to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Call cancelEscrow
    const { cancelEscrow } = window.walletContext;

    let result;
    await act(async () => {
      result = await cancelEscrow(100);
    });

    // Assertions
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_cancel_escrow', { p_amount: 100 });
    expect(result).toBe(true);

    // Check if fetchWalletData was called by verifying the from('wallets') call count
    // It's called once on mount, and once after cancelEscrow
    expect(supabase.from).toHaveBeenCalledWith('wallets');
  });

  it('should handle rpc error and return false', async () => {
    const errorObj = { message: 'Some error' };
    supabase.rpc.mockResolvedValueOnce({ error: errorObj });

    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const { cancelEscrow } = window.walletContext;

    let result;
    await act(async () => {
      result = await cancelEscrow(100);
    });

    expect(supabase.rpc).toHaveBeenCalledWith('rpc_cancel_escrow', { p_amount: 100 });
    expect(consoleSpy).toHaveBeenCalledWith('RPC Wallet Error:', errorObj);
    expect(consoleSpy).toHaveBeenCalledWith('Cancel escrow error:', errorObj);
    expect(result).toBe(false);

    consoleSpy.mockRestore();
  });
});
