import type { ClientRect } from "@dnd-kit/core";
import { nextRectInDirection } from "@/features/dispatch/dispatchKeyboardCoordinates";

function cell(column: number, row: number): ClientRect {
  const left = column * 100;
  const top = row * 80;
  return { left, top, width: 100, height: 80, right: left + 100, bottom: top + 80 };
}

const grid = [0, 1, 2].flatMap((row) => [0, 1, 2].map((column) => cell(column, row)));
const card: ClientRect = { left: 110, top: 90, width: 80, height: 40, right: 190, bottom: 130 };

describe("nextRectInDirection", () => {
  it.each([
    ["right", cell(2, 1)],
    ["left", cell(0, 1)],
    ["down", cell(1, 2)],
    ["up", cell(1, 0)],
  ] as const)("moves to the neighbouring cell on the %s", (direction, expected) => {
    expect(nextRectInDirection(card, grid, direction)).toEqual(expected);
  });

  it("stays in place at the edge of the board", () => {
    const lastColumn: ClientRect = { ...card, left: 210, right: 290 };

    expect(nextRectInDirection(lastColumn, grid, "right")).toBeUndefined();
  });

  it("prefers the cell in the same row over a closer cell in another row", () => {
    const nearbyAbove: ClientRect = {
      left: 100,
      top: 50,
      width: 20,
      height: 20,
      right: 120,
      bottom: 70,
    };
    const inFirstColumn: ClientRect = { ...card, left: 10, right: 90 };

    expect(
      nextRectInDirection(inFirstColumn, [cell(0, 1), cell(1, 1), nearbyAbove], "right"),
    ).toEqual(cell(1, 1));
  });
});
