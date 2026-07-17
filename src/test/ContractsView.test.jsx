import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ContractsView from "../features/partners/components/ContractsView";

// Mock Supabase client
vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(() => Promise.resolve({ data: {}, error: null }))
    }
  }
}));

describe("ContractsView Component", () => {
  it("renders correctly with default valet role when no user role is present", () => {
    const mockUser = {
      id: "test-user-id",
      email: "valet@rapidsy.com",
      role: "valet",
      raw_user_meta_data: { accepted_contract: false }
    };

    render(<ContractsView currentUser={mockUser} />);

    expect(screen.getByText("Çalışma Koşulları & Yasal Sözleşmeler")).toBeDefined();
    expect(screen.getByText("Profesyonel Vale Hizmet ve Sorumluluk Güvencesi Sözleşmesi")).toBeDefined();
    expect(screen.getByText("VALET-CONT-2026-V2")).toBeDefined();
  });

  it("renders correct contract details for mechanic role", () => {
    const mockUser = {
      id: "test-user-id",
      email: "mechanic@rapidsy.com",
      role: "mechanic",
      raw_user_meta_data: { accepted_contract: false }
    };

    render(<ContractsView currentUser={mockUser} />);

    expect(screen.getByText("Oto Servis & Mekanik Bakım Hizmet Standartları Sözleşmesi")).toBeDefined();
    expect(screen.getByText("MECH-CONT-2026-V4")).toBeDefined();
  });

  it("renders correct contract details for parts role", () => {
    const mockUser = {
      id: "test-user-id",
      email: "parts@rapidsy.com",
      role: "parts",
      raw_user_meta_data: { accepted_contract: false }
    };

    render(<ContractsView currentUser={mockUser} />);

    expect(screen.getByText("Yedek Parça Satış ve Teslimat Güvencesi Sözleşmesi")).toBeDefined();
    expect(screen.getByText("PARTS-CONT-2026-V2")).toBeDefined();
  });

  it("triggers acceptance and updates status", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "mechanic@rapidsy.com",
      role: "mechanic",
      raw_user_meta_data: { accepted_contract: false }
    };

    render(<ContractsView currentUser={mockUser} />);

    const signButton = screen.getByRole("button", { name: "Sözleşmeyi İmzala" });
    expect(signButton).toBeDefined();

    fireEvent.click(signButton);

    await waitFor(() => {
      expect(screen.getByText("Sözleşme İmzalandı")).toBeDefined();
    });
  });
});
