import type { FrameVariant, UploadCategory, WallSlot } from "@/lib/types";

export const ROOM_WIDTH = 42;
export const ROOM_DEPTH = 34;
export const ROOM_HEIGHT = 9.6;
export const HALF_ROOM_WIDTH = ROOM_WIDTH / 2;
export const HALF_ROOM_DEPTH = ROOM_DEPTH / 2;
export const BACK_WALL_Z = -16.5;

type PlacementResult = {
  displayCategory: UploadCategory;
  wallSlot: WallSlot;
  position: [number, number, number];
  rotationY: number;
  frameScale?: number;
  frameVariant: FrameVariant;
};

const FRONT_SPAN = 35;
const SIDE_SPAN = 24;
const FRONT_Y = 3.1;
const GROUP_Y = 4.0;
const COLLAB_Y = 5.1;
const FRONT_Z = -15.8;
const LEFT_X = -20.35;
const RIGHT_X = 20.2;
export function getCategoryCapacity(category: UploadCategory) {
  if (category === "individual") {
    return 11;
  }
  if (category === "group") {
    return 4;
  }

  return 1;
}

export function getWallOrder(): WallSlot[] {
  return ["front", "left", "right"];
}

function distributeEvenly(index: number, totalCount: number, maxCount: number, span: number) {
  const safeCount = Math.max(1, Math.min(totalCount, maxCount));

  if (safeCount === 1) {
    return 0;
  }

  const start = -span / 2;
  const step = span / (safeCount - 1);

  return Number((start + step * index).toFixed(2));
}

function getVisualStyle(category: UploadCategory) {
  if (category === "group") {
    return {
      frameScale: 1.6,
      frameVariant: "portrait" as const,
      centerY: GROUP_Y
    };
  }

  if (category === "collaborative") {
    return {
      frameScale: 1,
      frameVariant: "wallMural" as const,
      centerY: COLLAB_Y
    };
  }

  return {
    frameScale: 1,
    frameVariant: "portrait" as const,
    centerY: FRONT_Y
  };
}

export function getPlacementForArtwork(input: {
  category: UploadCategory;
  wallSlot: WallSlot;
  index: number;
  totalCount: number;
}): PlacementResult {
  const { category, wallSlot, index, totalCount } = input;
  const style = getVisualStyle(category);

  if (wallSlot === "front") {
    return {
      displayCategory: category,
      wallSlot,
      position: [distributeEvenly(index, totalCount, getCategoryCapacity(category), FRONT_SPAN), style.centerY, FRONT_Z],
      rotationY: 0,
      frameScale: style.frameScale,
      frameVariant: style.frameVariant
    };
  }

  if (wallSlot === "left") {
    return {
      displayCategory: category,
      wallSlot,
      position: [LEFT_X, style.centerY, distributeEvenly(index, totalCount, getCategoryCapacity(category), SIDE_SPAN)],
      rotationY: Math.PI / 2,
      frameScale: style.frameScale,
      frameVariant: style.frameVariant
    };
  }

  return {
    displayCategory: category,
    wallSlot,
    position: [RIGHT_X, style.centerY, category === "collaborative" ? 0 : distributeEvenly(index, totalCount, getCategoryCapacity(category), SIDE_SPAN)],
    rotationY: -Math.PI / 2,
    frameScale: style.frameScale,
    frameVariant: style.frameVariant
  };
}
