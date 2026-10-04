import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TechnicianReportPage from "./TechnicianReportPage.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("TechnicianReportPage test association", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            _id: "appointment-1",
            test: { _id: "test-1", name: "Blood Count", code: "CBC" },
            tests: [
              { _id: "test-1", name: "Blood Count", code: "CBC" },
              { _id: "test-2", name: "Lipid Profile", code: "LIPID" },
            ],
          },
        ],
      },
    });
    api.post.mockResolvedValue({ data: { data: {} } });
  });

  it("submits each result with its selected appointment test", async () => {
    render(
      <MemoryRouter initialEntries={["/technician/reports/appointment-1"]}>
        <Routes>
          <Route
            path="/technician/reports/:appointmentId"
            element={<TechnicianReportPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const resultTest = await screen.findByRole("combobox", {
      name: "Result 1 test",
    });
    expect(resultTest).toHaveDisplayValue("Blood Count (CBC)");
    fireEvent.change(resultTest, { target: { value: "test-2" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Result 1 marker" }), {
      target: { value: "Cholesterol" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Result 1 value" }), {
      target: { value: "180" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Clinical interpretation" }), {
      target: { value: "Within range" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Submit for approval" }),
    );

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/reports/appointments/appointment-1",
        expect.objectContaining({
          results: [
            expect.objectContaining({
              test: "test-2",
              marker: "Cholesterol",
              value: "180",
            }),
          ],
        }),
      ),
    );
  });
});
