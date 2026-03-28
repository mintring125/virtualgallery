import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { addBatchArtworks } from "@/lib/gallery-store";
import { parseArtworkFilename } from "@/lib/filename-parser";
import { DEFAULT_GALLERY_ID } from "@/lib/seed-data";

export const runtime = "nodejs";

type UploadDraft = {
  sourceFilename: string;
  title: string;
  authorName: string;
  studentNumber: string;
};

function sanitizeFilename(filename: string) {
  return filename.replace(/[^\w.\-가-힣]/g, "_");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const galleryId = String(formData.get("galleryId") || DEFAULT_GALLERY_ID);
  const rawRows = String(formData.get("rows") || "[]");
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "업로드할 파일이 없습니다." }, { status: 400 });
  }

  const rowMap = new Map<string, UploadDraft>();

  try {
    const rows = JSON.parse(rawRows) as UploadDraft[];
    rows.forEach((row) => rowMap.set(row.sourceFilename, row));
  } catch {
    return NextResponse.json({ error: "업로드 메타데이터를 읽지 못했습니다." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const drafts = await Promise.all(
    files.map(async (file, index) => {
      const parsed = parseArtworkFilename(file.name);
      const override = rowMap.get(file.name);
      const title = override?.title?.trim() || parsed.title;
      const authorName = override?.authorName?.trim() || parsed.authorName;
      const studentNumber = override?.studentNumber?.trim() || parsed.studentNumber;
      const baseDescription =
        parsed.fileType === "text"
          ? `${authorName || "학생"}의 글 작품`
          : `${authorName || "학생"}의 미술 작품`;

      if (parsed.fileType === "unknown") {
        throw new Error(`${file.name}: 지원하지 않는 파일 형식입니다.`);
      }

      if (!title || !authorName) {
        throw new Error(`${file.name}: 제목 또는 이름이 비어 있습니다.`);
      }

      if (parsed.fileType === "image") {
        const safeFilename = `${Date.now()}-${index}-${sanitizeFilename(file.name)}`;
        const fullPath = path.join(uploadDir, safeFilename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(fullPath, buffer);

        return {
          type: "image" as const,
          title,
          authorName,
          studentNumber,
          description: baseDescription,
          imageUrl: `/uploads/${safeFilename}`,
          sourceFilename: file.name
        };
      }

      const contentText = await file.text();

      return {
        type: "text" as const,
        title,
        authorName,
        studentNumber,
        description: baseDescription,
        contentText,
        sourceFilename: file.name
      };
    })
  );

  const artworks = await addBatchArtworks(galleryId, drafts);

  return NextResponse.json({
    ok: true,
    artworks,
    summary: `${artworks.length}개 작품을 저장했습니다.`
  });
}
