import type { ClientRect, KeyboardCoordinateGetter } from "@dnd-kit/core";

type Direction = "up" | "down" | "left" | "right";

type Point = { x: number; y: number };

const keyDirections: Partial<Record<string, Direction>> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

function centerOf(rect: ClientRect): Point {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function contains(rect: ClientRect, point: Point): boolean {
  return (
    point.x >= rect.left && point.x < rect.right && point.y >= rect.top && point.y < rect.bottom
  );
}

function distanceInDirection(origin: Point, target: Point, direction: Direction): number | null {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const [along, across] = direction === "left" || direction === "right" ? [dx, dy] : [dy, dx];
  const forward = direction === "right" || direction === "down" ? along : -along;
  if (forward <= 1) {
    return null;
  }
  return forward + 2 * Math.abs(across);
}

export function nextRectInDirection(
  current: ClientRect,
  candidates: readonly ClientRect[],
  direction: Direction,
): ClientRect | undefined {
  const cardCenter = centerOf(current);
  const containing = candidates.find((rect) => contains(rect, cardCenter));
  const origin = containing === undefined ? cardCenter : centerOf(containing);
  let best: { rect: ClientRect; distance: number } | undefined;
  for (const rect of candidates) {
    if (rect === containing) {
      continue;
    }
    const distance = distanceInDirection(origin, centerOf(rect), direction);
    if (distance !== null && (best === undefined || distance < best.distance)) {
      best = { rect, distance };
    }
  }
  return best?.rect;
}

export const dispatchKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const direction = keyDirections[event.code];
  const { collisionRect, droppableRects, droppableContainers } = context;
  if (direction === undefined || collisionRect === null) {
    return undefined;
  }
  event.preventDefault();
  const candidates = droppableContainers
    .getEnabled()
    .flatMap((container) => droppableRects.get(container.id) ?? []);
  const target = nextRectInDirection(collisionRect, candidates, direction);
  if (target === undefined) {
    return undefined;
  }
  const center = centerOf(target);
  return {
    x: center.x - collisionRect.width / 2,
    y: center.y - collisionRect.height / 2,
  };
};
