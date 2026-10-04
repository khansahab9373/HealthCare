import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn() },
}));

const AuthState = () => {
  const { user, loading } = useAuth();
  return <p>{loading ? "Loading" : user?.name || "Signed out"}</p>;
};

describe("AuthContext initialization", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("recovers from malformed cached user JSON", async () => {
    localStorage.setItem("bloodcare_user", "{");
    localStorage.setItem("bloodcare_token", "valid-token");
    api.get.mockResolvedValue({
      data: {
        data: {
          _id: "user-1",
          name: "Verified user",
          email: "user@example.com",
          role: "PATIENT",
          address: { street: "Private" },
        },
      },
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    expect(await screen.findByText("Verified user")).toBeInTheDocument();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/auth/me"));
    expect(
      JSON.parse(localStorage.getItem("bloodcare_user")),
    ).not.toHaveProperty("address");
  });

  it("clears a cached user when no token exists", async () => {
    localStorage.setItem("bloodcare_user", JSON.stringify({ name: "Stale" }));

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    expect(await screen.findByText("Signed out")).toBeInTheDocument();
    expect(localStorage.getItem("bloodcare_user")).toBeNull();
  });
});
