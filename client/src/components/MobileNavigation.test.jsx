import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import MobileNavigation from "./MobileNavigation.jsx";

const logout = vi.fn();
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { name: "QA Patient", role: "PATIENT" },
    logout,
  }),
}));

describe("MobileNavigation", () => {
  it("opens patient navigation and logs out", () => {
    render(
      <MemoryRouter>
        <MobileNavigation />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a test" })).toHaveAttribute(
      "href",
      "/patient/tests",
    );
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(logout).toHaveBeenCalledOnce();
  });
});
