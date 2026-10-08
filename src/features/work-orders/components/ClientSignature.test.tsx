import { fireEvent, render, screen } from "@testing-library/react";
import { ClientSignature } from "@/features/work-orders/components/ClientSignature";
import { apiBaseUrl } from "@/shared/api/baseClient";

const photoId = "9f8e7d6c-5b4a-4321-8fed-cba987654321";

describe("ClientSignature", () => {
  it("shows the signature photo from the API with a link to the full image", () => {
    render(<ClientSignature photoId={photoId} />);

    const image = screen.getByRole("img", { name: "Podpis klienta, otwiera się w nowej karcie" });
    expect(image).toHaveAttribute("src", `${apiBaseUrl}/api/v1/photos/${photoId}`);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `${apiBaseUrl}/api/v1/photos/${photoId}`,
    );
  });

  it("explains when the signature photo cannot be loaded", () => {
    render(<ClientSignature photoId={photoId} />);

    fireEvent.error(screen.getByRole("img"));

    expect(screen.getByText("Nie udało się wczytać podpisu klienta.")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
