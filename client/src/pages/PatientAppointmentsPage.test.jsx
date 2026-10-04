import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientAppointmentsPage from "./PatientAppointmentsPage.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

describe("PatientAppointmentsPage rescheduling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/appointments/my") {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: "appointment-1",
                status: "TECHNICIAN_ASSIGNED",
                test: { _id: "test-1", name: "Blood Count" },
                tests: [{ _id: "test-1", name: "Blood Count" }],
                appointmentDate: "2099-06-01T09:00:00.000Z",
                startTime: "09:00",
                collectionType: "LAB_VISIT",
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: {
          data: [
            {
              technicianId: "technician-1",
              technicianName: "QA Technician",
              startTime: "10:00",
            },
          ],
        },
      });
    });
    api.patch.mockResolvedValue({
      data: {
        data: {
          _id: "appointment-1",
          status: "CONFIRMED",
          test: { name: "Blood Count" },
          tests: [{ name: "Blood Count" }],
          appointmentDate: "2099-06-01T10:00:00.000Z",
          startTime: "10:00",
          collectionType: "LAB_VISIT",
        },
      },
    });
  });

  it("opens the slot picker before requiring a replacement slot", async () => {
    render(
      <MemoryRouter>
        <PatientAppointmentsPage />
      </MemoryRouter>,
    );

    const rescheduleButton = await screen.findByRole("button", {
      name: "Reschedule",
    });
    expect(rescheduleButton).toBeEnabled();
    expect(document.querySelector('input[type="date"]')).not.toBeInTheDocument();

    fireEvent.click(rescheduleButton);

    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /10:00/ })).toBeVisible();
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/appointments/slots?testIds=test-1&date="),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: /10:00/ }));
    const confirmButton = screen.getByRole("button", {
      name: "Confirm reschedule",
    });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(
        "/appointments/appointment-1/reschedule",
        {
          appointmentDate: "2099-06-01",
          startTime: "10:00",
          technicianId: "technician-1",
        },
      ),
    );
  });
});
