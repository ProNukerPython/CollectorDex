import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlaceholderPage } from "./placeholder-page";

describe("PlaceholderPage", () => {
  it("renders title and description in Spanish", () => {
    render(
      <PlaceholderPage
        title="Catálogo"
        description="Descripción de prueba"
      />,
    );

    expect(screen.getByRole("heading", { name: "Catálogo" })).toBeInTheDocument();
    expect(screen.getByText("Descripción de prueba")).toBeInTheDocument();
    expect(screen.getByText("Próximamente")).toBeInTheDocument();
  });
});
