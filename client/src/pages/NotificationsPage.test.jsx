import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationsPage from "./NotificationsPage.jsx";
import api from "../services/api.js";

const mockUser = vi.hoisted(() => ({ role: "PATIENT" }));
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: mockUser }),
}));
vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        data: {
          notifications: [
            {
              _id: "notification-1",
              type: "APPOINTMENT_BOOKED",
              title: "Appointment booked",
              message: "Your appointment is scheduled.",
              createdAt: "2026-10-05T00:00:00.000Z",
              metadata: { appointmentId: "appointment-1" },
            },
          ],
          unreadCount: 1,
        },
      },
    });
    api.patch.mockResolvedValue({ data: { success: true } });
  });

  it("links appointment notifications to patient appointments and marks them read", async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    const relatedLink = await screen.findByRole("link", {
      name: "View related appointment",
    });
    expect(relatedLink).toHaveAttribute("href", "/patient/appointments");
    fireEvent.click(relatedLink);
    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(
        "/notifications/notification-1/read",
      ),
    );
  });
});
