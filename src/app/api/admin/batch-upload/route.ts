import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { addBatchArtworks } from "@/lib/gallery-store";
import { parseArtworkFilename } from "@/lib/filename-parser";
import { DEFAULT_GALLERY_ID } from "@/lib/seed-data";
import type { UploadCategory } from "@/lib/types";

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

function isUploadCategory(value: string): value is UploadCategory {
  return value === "individual" || value === "group" || value === "collaborative";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const galleryId = String(formData.get("galleryId") || DEFAULT_GALLERY_ID);
  const categoryRaw = String(formData.get("category") || "individual");
  const rawRows = String(formData.get("rows") || "[]");
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!isUploadCategory(categoryRaw)) {
    return NextResponse.json({ error: "알 수 없는 작품 유형입니다." }, { status: 400 });
  }

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

  try {
    const drafts = await Promise.all(
      files.map(async (file, index) => {
        const parsed = parseArtworkFilename(file.name);
        const override = rowMap.get(file.name);
        const title = override?.title?.trim() || parsed.title;
        const authorName = override?.authorName?.trim() || parsed.authorName;
        const studentNumber = override?.studentNumber?.trim() || parsed.studentNumber;

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
            description: `${authorName}의 이미지 작품`,
            imageUrl: `/uploads/${safeFilename}`,
            sourceFilename: file.name
          };
        }

        if (parsed.fileType === "pdf") {
          const safeFilename = `${Date.now()}-${index}-${sanitizeFilename(file.name)}`;
          const fullPath = path.join(uploadDir, safeFilename);
          const buffer = Buffer.from(await file.arrayBuffer());
          await writeFile(fullPath, buffer);

          return {
            type: "text" as const,
            title,
            authorName,
            studentNumber,
            description: `${authorName}의 PDF 글 작품`,
            pdfUrl: `/uploads/${safeFilename}`,
            contentText: `${title} PDF 작품`,
            sourceFilename: file.name
          };
        }

        throw new Error(`${file.name}: 지원하지 않는 파일 형식입니다.`);
      })
    );

    const artworks = await addBatchArtworks(galleryId, categoryRaw, drafts);

    return NextResponse.json({
      ok: true,
      artworks,
      summary: `${artworks.length}개 작품을 ${categoryRaw} 유형으로 저장했습니다.`
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다."
      },
      { status: 400 }
    );
  }
}
