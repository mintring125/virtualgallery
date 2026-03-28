"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { parseArtworkFilename } from "@/lib/filename-parser";
import type { Artwork, BulkUploadRow } from "@/lib/types";

type AdminWorkspaceProps = {
  galleryId: string;
  existingArtworks: Artwork[];
};

export function AdminWorkspace({ galleryId, existingArtworks }: AdminWorkspaceProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<BulkUploadRow[]>([]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const reviewCount = useMemo(() => rows.filter((row) => row.status === "needs-review").length, [rows]);

  function updateFromFiles(nextFiles: File[]) {
    setFiles(nextFiles);
    setRows(nextFiles.map((file) => parseArtworkFilename(file.name)));
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
          setError("이름과 제목이 비어 있는 행을 먼저 수정해야 합니다.");
          return;
        }

        const formData = new FormData();
        formData.append("galleryId", galleryId);
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
        setFiles([]);
        setRows([]);
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
          작품 파일을 한 번에 선택하면 파일명에서 번호와 이름을 추론하고, 검수 후 바로 저장합니다. 이미지는 `public/uploads`에,
          메타데이터와 댓글은 로컬 JSON 저장소에 보관됩니다.
        </p>
        <div className="meta-grid">
          <div className="info-chip">운영 기기: PC</div>
          <div className="info-chip">입력: 키보드 + 마우스</div>
          <div className="info-chip">{`현재 작품 수: ${existingArtworks.length}개`}</div>
        </div>
      </section>

      <section className="panel-card stack">
        <div className="toolbar-row">
          <div className="stack">
            <h2 className="section-title">파일명 기반 일괄 업로드</h2>
            <p className="muted">이미지(`jpg`, `png`, `webp`)와 글 파일(`txt`, `md`)을 동시에 선택해 전시에 추가할 수 있습니다.</p>
          </div>
          <label className="cta-link upload-button">
            파일 선택
            <input
              accept=".jpg,.jpeg,.png,.webp,.txt,.md"
              hidden
              multiple
              onChange={(event) => updateFromFiles(Array.from(event.target.files ?? []))}
              type="file"
            />
          </label>
        </div>

        {message ? <div className="success-box">{message}</div> : null}
        {error ? <div className="error-box">{error}</div> : null}

        <div className="helper-box">
          <strong>검수 포인트</strong>
          <span className="muted">{`현재 ${rows.length}개 파일 선택, ${reviewCount}개 행 검토 필요`}</span>
        </div>

        <div className="table">
          <div className="table-row table-header table-row-editable">
            <span>파일명</span>
            <span>번호</span>
            <span>이름</span>
            <span>제목</span>
            <span>상태</span>
          </div>

          {rows.length === 0 ? (
            <div className="table-empty">파일을 선택하면 여기에 자동 파싱 결과가 표시됩니다.</div>
          ) : null}

          {rows.map((row) => (
            <div className="table-row table-row-editable" key={row.id}>
              <span>{row.sourceFilename}</span>
              <input
                className="inline-input"
                onChange={(event) => updateRow(row.id, { studentNumber: event.target.value })}
                value={row.studentNumber}
              />
              <input
                className="inline-input"
                onChange={(event) => updateRow(row.id, { authorName: event.target.value })}
                value={row.authorName}
              />
              <input
                className="inline-input"
                onChange={(event) => updateRow(row.id, { title: event.target.value })}
                value={row.title}
              />
              <span className={`status-pill ${row.status === "ok" ? "ok" : "warn"}`}>
                {row.status === "ok" ? "정상" : row.reason}
              </span>
            </div>
          ))}
        </div>

        <div className="toolbar-row">
          <button className="cta-link button-reset" disabled={isPending || rows.length === 0} onClick={onSubmit} type="button">
            {isPending ? "저장 중..." : "검수 후 저장"}
          </button>
          <button
            className="ghost-link button-reset"
            disabled={isPending || rows.length === 0}
            onClick={() => updateFromFiles([])}
            type="button"
          >
            선택 초기화
          </button>
        </div>
      </section>

      <section className="panel-card stack">
        <h2 className="section-title">현재 전시 작품</h2>
        <div className="card-grid">
          {existingArtworks.map((artwork) => (
            <article className="comment-item" key={artwork.id}>
              <strong>{artwork.title}</strong>
              <span className="muted">{`${artwork.studentNumber ?? "--"}번 ${artwork.authorName}`}</span>
              <span className="muted">{artwork.type === "image" ? "이미지 작품" : "글 작품"}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
