import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HomePage from "./HomePage.jsx";

describe("HealthCare landing page", () => {
  afterEach(() => cleanup());

  it("renders the long platform page and links CTAs to existing routes", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Smarter Healthcare. Simpler Lab Appointments." })).toBeInTheDocument();
    expect(container.querySelectorAll("main section")).toHaveLength(14);
    expect(screen.getByRole("link", { name: "Book an Appointment" })).toHaveAttribute("href", "/patient/tests");
    expect(
      screen.getAllByRole("link", { name: "Technician Registration" }).some((link) => link.getAttribute("href") === "/register/technician"),
    ).toBe(true);
    expect(screen.getByText(/sample user feedback/i)).toBeInTheDocument();
    expect(screen.getByText(/not attributed to actual customers/i)).toBeInTheDocument();
  });

  it("opens mobile navigation and expands FAQ answers with accessible controls", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(
      within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("link", { name: "Services" }),
    );
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    const faqButton = screen.getByRole("button", { name: "What is HealthCare?" });
    expect(faqButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(faqButton);
    expect(faqButton).toHaveAttribute("aria-expanded", "true");
    const answer = container.querySelector(`#${faqButton.getAttribute("aria-controls")}`);
    expect(answer).toBeVisible();
    expect(answer).toHaveTextContent(/web platform for medical laboratory appointment management/i);
  });
});
