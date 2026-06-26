import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPartnerRecentActivity } from "./supabaseApi";
import { supabase } from "../supabaseClient";

// Mock Supabase Client
vi.mock("../supabaseClient", () => {
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  };

  return {
    supabase: {
      from: vi.fn(() => queryBuilder),
      rpc: vi.fn(),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      })),
      removeChannel: vi.fn(),
    },
  };
});

describe("supabaseApi - getPartnerRecentActivity", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns an error when sellerId is missing", async () => {
    const result = await getPartnerRecentActivity(null);
    expect(result).toEqual({ success: false, error: "Seller ID is required" });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("handles error when fetching orders fails", async () => {
    const dbError = new Error("DB Error fetching orders");

    // Mock the chain for 'orders' to return an error
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: dbError }),
    };

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "orders") return mockQueryBuilder;
      return null;
    });

    const result = await getPartnerRecentActivity("seller-123");

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Recent Activity Error:", dbError);
    expect(supabase.from).toHaveBeenCalledWith("orders");
    expect(supabase.from).not.toHaveBeenCalledWith("quotes");
    expect(supabase.from).not.toHaveBeenCalledWith("consultations");
  });

  it("handles error when fetching quotes fails", async () => {
    const dbError = new Error("DB Error fetching quotes");

    const ordersBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    const quotesBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: dbError }),
    };

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "orders") return ordersBuilder;
      if (table === "quotes") return quotesBuilder;
      return null;
    });

    const result = await getPartnerRecentActivity("seller-123");

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Recent Activity Error:", dbError);
    expect(supabase.from).toHaveBeenCalledWith("quotes");
    expect(supabase.from).not.toHaveBeenCalledWith("consultations");
  });

  it("handles error when fetching consultations fails", async () => {
    const dbError = new Error("DB Error fetching consultations");

    const ordersBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    const quotesBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    const consultationsBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: dbError }),
    };

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "orders") return ordersBuilder;
      if (table === "quotes") return quotesBuilder;
      if (table === "consultations") return consultationsBuilder;
      return null;
    });

    const result = await getPartnerRecentActivity("seller-123");

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Recent Activity Error:", dbError);
    expect(supabase.from).toHaveBeenCalledWith("consultations");
  });

  it("successfully fetches, combines, sorts and limits recent activity", async () => {
    const mockOrders = [
      { id: "o1", total_amount: 100, status: "completed", created_at: "2024-01-03T10:00:00Z", customer_id: "c1" },
      { id: "o2", total_amount: 50, status: "pending", created_at: "2024-01-01T10:00:00Z", customer_id: "c2" },
    ];

    const mockQuotes = [
      { id: "q1", price: 200, status: "accepted", created_at: "2024-01-04T10:00:00Z", customer_id: "c3" },
    ];

    const mockConsultations = [
      { id: "c1", fee: 150, status: "completed", created_at: "2024-01-02T10:00:00Z", user_id: "u1", topic: "General" },
      { id: "c2", fee: 300, status: "pending", created_at: "2024-01-05T10:00:00Z", user_id: "u2", topic: "Expert" }, // Newest
    ];

    const ordersBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
    };

    const quotesBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockQuotes, error: null }),
    };

    const consultationsBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockConsultations, error: null }),
    };

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "orders") return ordersBuilder;
      if (table === "quotes") return quotesBuilder;
      if (table === "consultations") return consultationsBuilder;
      return null;
    });

    const result = await getPartnerRecentActivity("seller-123", 3);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);

    // Check sorting (newest first)
    expect(result.data[0].id).toBe("c2"); // 2024-01-05
    expect(result.data[1].id).toBe("q1"); // 2024-01-04
    expect(result.data[2].id).toBe("o1"); // 2024-01-03

    // Check type mapping
    expect(result.data[0].activity_type).toBe("CONSULTATION");
    expect(result.data[0].total_amount).toBe(300); // fee mapped to total_amount

    expect(result.data[1].activity_type).toBe("QUOTE");

    expect(result.data[2].activity_type).toBe("ORDER");
    expect(result.data[2].total_amount).toBe(100);
  });
});
