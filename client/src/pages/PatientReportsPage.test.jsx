import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientReportsPage from "./PatientReportsPage.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({ default: { get: vi.fn() } }));

describe("PatientReportsPage PDF download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            _id: "report-1",
            status: "PUBLISHED",
            test: { code: "CBC", name: "Complete Blood Count" },
            technician: { name: "QA Technician" },
            createdAt: "2026-10-01T00:00:00.000Z",
            results: [],
          },
        ],
      },
    });
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:test-report"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  it("downloads the report as a blob through the existing endpoint", async () => {
    api.get.mockImplementation((url, options) => {
      if (url === "/reports/report-1/download") {
        expect(options).toEqual({ responseType: "blob" });
        return Promise.resolve({ data: new Blob(["pdf"]) });
      }
      return Promise.resolve({
        data: {
          data: [
            {
              _id: "report-1",
              status: "PUBLISHED",
              test: { code: "CBC", name: "Complete Blood Count" },
              technician: { name: "QA Technician" },
              createdAt: "2026-10-01T00:00:00.000Z",
              results: [],
            },
          ],
        },
      });
    });

    render(
      <MemoryRouter>
        <PatientReportsPage />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Download PDF" }));

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/reports/report-1/download", {
        responseType: "blob",
      }),
    );
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
  });
});