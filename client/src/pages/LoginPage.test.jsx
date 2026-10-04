import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage.jsx";

const mockLogin = vi.hoisted(() => vi.fn());
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe("LoginPage", () => {
  it("shows invalid-credential errors inline and does not navigate away", async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: "Invalid email or password." } },
    });
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "patient@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("patient@example.com");
  });
});