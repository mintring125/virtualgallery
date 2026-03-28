import { NextResponse } from "next/server";
import { DEFAULT_GALLERY_ID } from "@/lib/seed-data";
import { updateWallConfig } from "@/lib/gallery-store";
import type { UploadCategory, WallConfig } from "@/lib/types";

export const runtime = "nodejs";

function isCategoryOrNull(value: unknown): value is UploadCategory | null {
  return value === null || value === "individual" || value === "group" || value === "collaborative";
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    galleryId?: string;
    wallConfig?: WallConfig;
  };

  const galleryId = body.galleryId?.trim() || DEFAULT_GALLERY_ID;
  const wallConfig = body.wallConfig;

  if (
    !wallConfig ||
    !isCategoryOrNull(wallConfig.front) ||
    !isCategoryOrNull(wallConfig.left) ||
    !isCategoryOrNull(wallConfig.right)
  ) {
    return NextResponse.json({ error: "벽 배치 설정이 올바르지 않습니다." }, { status: 400 });
  }

  const updated = await updateWallConfig(galleryId, wallConfig);

  return NextResponse.json({
    ok: true,
    wallConfig: updated.wallConfig
  });
}
