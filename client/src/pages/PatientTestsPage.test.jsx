import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PatientTestsPage from "./PatientTestsPage.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("PatientTestsPage booking", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/tests") {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: "test-1",
                name: "Complete Blood Count",
                price: 100,
                labVisitAvailable: true,
                homeCollectionAvailable: true,
              },
              {
                _id: "test-2",
                name: "Lipid Profile",
                price: 150,
                labVisitAvailable: true,
                homeCollectionAvailable: true,
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: {
          data: [
            {
              technicianId: "tech-1",
              technicianName: "QA Technician",
              startTime: "09:00",
            },
          ],
        },
      });
    });
    api.post.mockResolvedValue({
      data: { data: { test: { name: "Complete Blood Count" } } },
    });
  });

  it("books the selected slot through the existing appointment endpoint", async () => {
    render(
      <MemoryRouter>
        <PatientTestsPage />
      </MemoryRouter>,
    );

    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: { value: date },
    });
    const tests = screen.getByLabelText("Tests (select one or more)");
    tests.options[1].selected = true;
    fireEvent.change(tests);
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        `/appointments/slots?testIds=test-1%2Ctest-2&date=${date}`,
      ),
    );
    await screen.findByRole("button", { name: "09:00 · QA Technician" });
    fireEvent.click(screen.getByRole("button", { name: "Book slot" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/appointments",
        expect.objectContaining({
          testId: "test-1",
          testIds: ["test-1", "test-2"],
          technicianId: "tech-1",
          appointmentDate: date,
          startTime: "09:00",
          collectionType: "LAB_VISIT",
        }),
      ),
    );
    expect(
      await screen.findByText(/Appointment booked successfully/),
    ).toBeInTheDocument();
  });

  it("prevents booking tests without a shared collection type", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/tests") {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: "test-1",
                name: "Lab-only test",
                labVisitAvailable: true,
                homeCollectionAvailable: false,
              },
              {
                _id: "test-2",
                name: "Home-only test",
                labVisitAvailable: false,
                homeCollectionAvailable: true,
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: {
          data: [
            {
              technicianId: "tech-1",
              technicianName: "QA Technician",
              startTime: "09:00",
            },
          ],
        },
      });
    });

    render(
      <MemoryRouter>
        <PatientTestsPage />
      </MemoryRouter>,
    );

    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: { value: date },
    });
    const tests = screen.getByLabelText("Tests (select one or more)");
    tests.options[1].selected = true;
    fireEvent.change(tests);

    expect(
      await screen.findByText(/do not share an available collection type/),
    ).toBeInTheDocument();
    await screen.findByRole("button", { name: "09:00 · QA Technician" });
    expect(screen.getByRole("button", { name: "Book slot" })).toBeDisabled();
  });
});
