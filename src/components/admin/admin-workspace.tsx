"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { parseArtworkFilename } from "@/lib/filename-parser";
import type { Artwork, BulkUploadRow, UploadCategory } from "@/lib/types";

type AdminWorkspaceProps = {
  galleryId: string;
  existingArtworks: Artwork[];
};

const categoryLabels: Record<UploadCategory, string> = {
  individual: "개인작품 11개",
  group: "모둠작품 4개",
  collaborative: "협동화 1개"
};

const categoryDescriptions: Record<UploadCategory, string> = {
  individual: "첫 업로드라면 정면 벽 11칸 기준으로 자동 배치됩니다.",
  group: "다음 빈 벽면에 큰 캔버스 4개가 자동 정렬됩니다.",
  collaborative: "남은 벽면에 큰 협동화 1개가 벽화 스타일로 배치됩니다."
};

function cleanupPreviewUrls(rows: BulkUploadRow[]) {
  rows.forEach((row) => {
    if (row.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(row.previewUrl);
    }
  });
}

export function AdminWorkspace({ galleryId, existingArtworks }: AdminWorkspaceProps) {
  const router = useRouter();
  const [category, setCategory] = useState<UploadCategory>("individual");
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<BulkUploadRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => cleanupPreviewUrls(rows);
  }, [rows]);

  const reviewCount = useMemo(() => rows.filter((row) => row.status === "needs-review").length, [rows]);

  const groupedCounts = useMemo(() => {
    return {
      front: existingArtworks.filter((artwork) => artwork.wallSlot === "front").length,
      left: existingArtworks.filter((artwork) => artwork.wallSlot === "left").length,
      right: existingArtworks.filter((artwork) => artwork.wallSlot === "right").length
    };
  }, [existingArtworks]);

  function updateFromFiles(nextFiles: File[]) {
    cleanupPreviewUrls(rows);
    setFiles(nextFiles);
    setRows(
      nextFiles.map((file) => ({
        ...parseArtworkFilename(file.name),
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
      }))
    );
    setMessage("");
    setError("");
  }

  function updateRow(id: string, patch: Partial<BulkUploadRow>) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const merged = { ...row, ...patch };
        const issues: string[] = [];

        if (!merged.authorName.trim()) {
          issues.push("이름 확인 필요");
        }
        if (!merged.title.trim()) {
          issues.push("제목 확인 필요");
        }

        return {
          ...merged,
          status: issues.length > 0 ? "needs-review" : "ok",
          reason: issues.length > 0 ? issues.join(", ") : undefined
        };
      })
    );
  }

  function resetSelection() {
    cleanupPreviewUrls(rows);
    setFiles([]);
    setRows([]);
    setMessage("");
    setError("");
  }

  function onSubmit() {
    startTransition(async () => {
      try {
        setMessage("");
        setError("");

        if (files.length === 0) {
          setError("먼저 업로드할 파일을 선택해야 합니다.");
          return;
        }

        const hasInvalid = rows.some((row) => !row.authorName.trim() || !row.title.trim());

        if (hasInvalid) {
          setError("이름과 제목이 비어 있는 항목을 먼저 수정해야 합니다.");
          return;
        }

        const formData = new FormData();
        formData.append("galleryId", galleryId);
        formData.append("category", category);
        formData.append(
          "rows",
          JSON.stringify(
            rows.map((row) => ({
              sourceFilename: row.sourceFilename,
              title: row.title,
              authorName: row.authorName,
              studentNumber: row.studentNumber
            }))
          )
        );

        files.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/admin/batch-upload", {
          method: "POST",
          body: formData
        });
        const payload = (await response.json()) as { error?: string; summary?: string };

        if (!response.ok) {
          setError(payload.error || "업로드에 실패했습니다.");
          return;
        }

        setMessage(payload.summary || "업로드를 완료했습니다.");
        resetSelection();
        router.refresh();
      } catch {
        setError("업로드 중 예기치 못한 오류가 발생했습니다.");
      }
    });
  }

  return (
    <main className="page-shell stack">
      <section className="hero-card stack">
        <span className="eyebrow">Admin Workspace</span>
        <h1 className="section-title">교사 운영 화면</h1>
        <p className="muted">
          유형을 고르고 파일을 한 번에 올리면 정면, 왼쪽, 오른쪽 벽 순서로 자동 배치됩니다. 이미지 파일은 즉시 이미지 작품으로,
          PDF 파일은 글 작품으로 인식합니다.
        </p>
        <div className="meta-grid">
          <div className="info-chip">{`정면 벽: ${groupedCounts.front}개`}</div>
          <div className="info-chip">{`왼쪽 벽: ${groupedCounts.left}개`}</div>
          <div className="info-chip">{`오른쪽 벽: ${groupedCounts.right}개`}</div>
        </div>
      </section>

      <section className="panel-card stack">
        <div className="toolbar-row">
          <div className="stack">
            <h2 className="section-title">유형 선택 후 일괄 업로드</h2>
            <p className="muted">{categoryDescriptions[category]}</p>
          </div>
          <label className="stack">
            <span className="muted">작품 유형</span>
            <select className="inline-input" onChange={(event) => setCategory(event.target.value as UploadCategory)} value={category}>
              <option value="individual">{categoryLabels.individual}</option>
              <option value="group">{categoryLabels.group}</option>
              <option value="collaborative">{categoryLabels.collaborative}</option>
            </select>
          </label>
        </div>

        <div className="toolbar-row">
          <div className="helper-box">
            <strong>{categoryLabels[category]}</strong>
            <span className="muted">{`현재 ${rows.length}개 파일 선택, ${reviewCount}개 검토 필요`}</span>
          </div>
          <label className="cta-link upload-button">
            파일 선택
            <input
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              hidden
              multiple
              onChange={(event) => updateFromFiles(Array.from(event.target.files ?? []))}
              type="file"
            />
          </label>
        </div>

        {message ? <div className="success-box">{message}</div> : null}
        {error ? <div className="error-box">{error}</div> : null}

        <div className="table">
          <div className="table-row table-header table-row-upload">
            <span>미리보기</span>
            <span>파일명</span>
            <span>번호</span>
            <span>이름</span>
            <span>제목</span>
            <span>형식</span>
            <span>상태</span>
          </div>

          {rows.length === 0 ? <div className="table-empty">파일을 고르면 여기서 자동 파싱 결과와 썸네일을 확인할 수 있습니다.</div> : null}

          {rows.map((row) => (
            <div className="table-row table-row-upload" key={row.id}>
              <div className="upload-preview-cell">
                {row.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={row.title} className="upload-preview-thumb" src={row.previewUrl} />
                ) : (
                  <div className="upload-preview-pdf">PDF</div>
                )}
              </div>
              <span>{row.sourceFilename}</span>
              <input className="inline-input" onChange={(event) => updateRow(row.id, { studentNumber: event.target.value })} value={row.studentNumber} />
              <input className="inline-input" onChange={(event) => updateRow(row.id, { authorName: event.target.value })} value={row.authorName} />
              <input className="inline-input" onChange={(event) => updateRow(row.id, { title: event.target.value })} value={row.title} />
              <span className="status-pill ok">{row.fileType === "image" ? "이미지" : "PDF 글"}</span>
              <span className={`status-pill ${row.status === "ok" ? "ok" : "warn"}`}>{row.status === "ok" ? "정상" : row.reason}</span>
            </div>
          ))}
        </div>

        <div className="toolbar-row">
          <button className="cta-link button-reset" disabled={isPending || rows.length === 0} onClick={onSubmit} type="button">
            {isPending ? "저장 중..." : "검수 후 저장"}
          </button>
          <button className="ghost-link button-reset" disabled={isPending || rows.length === 0} onClick={resetSelection} type="button">
            선택 초기화
          </button>
        </div>
      </section>
    </main>
  );
}
