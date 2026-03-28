import type { BulkUploadRow } from "@/lib/types";

const HANGUL_NAME = /[가-힣]{2,4}/;
const LEADING_NUMBER = /^(\d{1,2})/;

export function inferFileType(filename: string): BulkUploadRow["fileType"] {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp")) {
    return "image";
  }

  if (lower.endsWith(".pdf")) {
    return "pdf";
  }

  return "unknown";
}

export function parseArtworkFilename(filename: string): BulkUploadRow {
  const stem = filename.replace(/\.[^.]+$/, "");
  const compact = stem.replace(/[-]+/g, "_");
  const tokens = compact.split("_").filter(Boolean);
  const leading = compact.match(LEADING_NUMBER)?.[1] ?? "";
  const authorToken = tokens.find((token) => HANGUL_NAME.test(token)) ?? "";
  const authorName = authorToken.match(HANGUL_NAME)?.[0] ?? "";
  const filtered = tokens.filter((token) => token !== leading && token !== authorToken);
  const title = filtered.join(" ").trim();

  const issues: string[] = [];

  if (!leading) {
    issues.push("번호 미인식");
  }
  if (!authorName) {
    issues.push("이름 미인식");
  }
  if (!title) {
    issues.push("제목 후보 없음");
  }

  return {
    id: filename,
    sourceFilename: filename,
    title: title || "제목 확인 필요",
    authorName,
    studentNumber: leading,
    fileType: inferFileType(filename),
    status: issues.length > 0 ? "needs-review" : "ok",
    reason: issues.length > 0 ? issues.join(", ") : undefined
  };
}
