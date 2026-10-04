import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TechnicianAvailabilityPage from "./TechnicianAvailabilityPage.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({ default: { get: vi.fn() } }));

describe("TechnicianAvailabilityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockRejectedValue(new Error("offline"));
  });

  it("disables schedule saves when the persisted schedule failed to load", async () => {
    render(
      <MemoryRouter>
        <TechnicianAvailabilityPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saving is disabled to protect your existing schedule.",
    );
    expect(screen.getByRole("button", { name: "Save hours" })).toBeDisabled();
  });
});