import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppRoutes from "./AppRoutes.jsx";

const mockUser = vi.hoisted(() => ({ name: "QA Patient", role: "PATIENT" }));
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: mockUser, loading: false, logout: vi.fn() }),
}));

describe("Protected routes", () => {
  it("shows access denied instead of rendering a role-restricted page", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/analytics"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Access denied" })).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access this page.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute("href", "/dashboard");
  });
});