import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, vi, describe, it, expect } from "vitest";
import MobileNavigation from "./MobileNavigation.jsx";

const logout = vi.fn();
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { name: "QA Patient", role: "PATIENT" },
    logout,
  }),
}));

describe("MobileNavigation", () => {
  afterEach(() => cleanup());

  it("opens patient navigation and logs out", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
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

  it("marks the active route and closes on Escape with focus restored", () => {
    render(
      <MemoryRouter initialEntries={["/patient/tests"]}>
        <MobileNavigation />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(trigger);
    expect(screen.getByRole("link", { name: "Book a test" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
