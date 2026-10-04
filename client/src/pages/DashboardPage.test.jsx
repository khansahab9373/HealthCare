import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage.jsx";
import api from "../services/api.js";

const mockUser = vi.hoisted(() => ({ name: "QA Patient", role: "PATIENT" }));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: vi.fn(),
  }),
}));

vi.mock("../services/api.js", () => ({ default: { get: vi.fn() } }));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an error and retry instead of zero counts when loading fails", async () => {
    api.get.mockRejectedValue(new Error("offline"));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load dashboard data. Please try again.",
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("Appointments")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(api.get).toHaveBeenCalledTimes(6);
  });
});
