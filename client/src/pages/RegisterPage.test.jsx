import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "./RegisterPage.jsx";
import api from "../services/api.js";

const mockRegister = vi.hoisted(() => vi.fn());
const mockUpdateUser = vi.hoisted(() => vi.fn());

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ register: mockRegister, updateUser: mockUpdateUser }),
}));

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const testCatalog = [
  { _id: "test-cbc", name: "Complete Blood Count", code: "CBC" },
  { _id: "test-lipid", name: "Lipid Profile", code: "LIPID" },
];

describe("RegisterPage qualified tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: testCatalog } });
    api.post.mockResolvedValue({
      data: { data: { verificationDocuments: [{ _id: "doc-1" }] } },
    });
  });

  afterEach(() => cleanup());

  it("loads active tests when TECHNICIAN is selected and clears IDs when switching back", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(api.get).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "TECHNICIAN" },
    });

    const qualifiedTests = await screen.findByLabelText("Qualified tests");
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/tests"));
    expect(screen.getByRole("option", { name: "Complete Blood Count (CBC)" })).toBeInTheDocument();

    qualifiedTests.options[0].selected = true;
    qualifiedTests.options[1].selected = true;
    fireEvent.change(qualifiedTests);
    expect([...qualifiedTests.selectedOptions].map((option) => option.value)).toEqual([
      "test-cbc",
      "test-lipid",
    ]);

    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "PATIENT" },
    });
    expect(screen.queryByLabelText("Qualified tests")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "TECHNICIAN" },
    });
    const reloadedTests = await screen.findByLabelText("Qualified tests");
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect([...reloadedTests.selectedOptions]).toHaveLength(0);
  });

  it("loads active tests for the technician-only registration route", async () => {
    render(
      <MemoryRouter>
        <RegisterPage technicianOnly />
      </MemoryRouter>,
    );

    expect(await screen.findByLabelText("Qualified tests")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/tests");
    expect(screen.queryByLabelText("Role")).not.toBeInTheDocument();
  });

  it("submits multiple qualified IDs and uploads the required license through the existing endpoint", async () => {
    mockRegister.mockResolvedValue({
      data: {
        token: "technician-token",
        user: { id: "technician-1", role: "TECHNICIAN" },
      },
    });
    render(
      <MemoryRouter>
        <RegisterPage technicianOnly />
      </MemoryRouter>,
    );

    await screen.findByLabelText("Qualified tests");
    fireEvent.change(screen.getByPlaceholderText("Jane Doe"), {
      target: { value: "QA Technician" },
    });
    fireEvent.change(screen.getByPlaceholderText("jane@example.com"), {
      target: { value: "qa-tech-registration@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Passw0rd!123" },
    });
    fireEvent.change(screen.getByPlaceholderText("BSc MLT"), {
      target: { value: "BSc MLT" },
    });
    fireEvent.change(screen.getByPlaceholderText("3 years"), {
      target: { value: "3 years" },
    });
    fireEvent.change(screen.getByPlaceholderText("CBC, Lipid Profile"), {
      target: { value: "CBC, Lipid Profile" },
    });
    const tests = screen.getByLabelText("Qualified tests");
    tests.options[0].selected = true;
    tests.options[1].selected = true;
    fireEvent.change(tests);

    const license = new File(["license"], "license.pdf", {
      type: "application/pdf",
    });
    const licenseInput = screen.getByLabelText(
      "Licence / Registration Document",
    );
    Object.defineProperty(licenseInput, "files", {
      configurable: true,
      value: [license],
    });
    fireEvent.change(licenseInput);
    fireEvent.submit(licenseInput.closest("form"));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "TECHNICIAN",
          qualifiedTests: ["test-cbc", "test-lipid"],
        }),
      );
      expect(api.post).toHaveBeenCalledWith(
        "/users/me/verification-documents",
        expect.any(FormData),
      );
    });
    expect(mockUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "technician-1",
        verificationDocuments: [{ _id: "doc-1" }],
      }),
    );
  });
});