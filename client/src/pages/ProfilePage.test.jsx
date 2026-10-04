import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "./ProfilePage.jsx";

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: {
      _id: "admin-1",
      name: "QA Admin",
      email: "admin@example.com",
      role: "ADMIN",
      isActive: true,
      phone: "555-0100",
      address: { street: "Private street" },
      qualification: "Private qualification",
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
    updateProfile: vi.fn(),
  }),
}));

describe("ProfilePage", () => {
  it("shows admin account details without patient or technician fields", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
    expect(screen.queryByText("Phone")).not.toBeInTheDocument();
    expect(screen.queryByText("Saved collection address")).not.toBeInTheDocument();
    expect(screen.queryByText("Qualification")).not.toBeInTheDocument();
    expect(screen.queryByText("Verification documents")).not.toBeInTheDocument();
  });
});