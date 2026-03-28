import { NextResponse } from "next/server";
import { addCommentToArtwork } from "@/lib/gallery-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    artworkId?: string;
    authorName?: string;
    body?: string;
  };

  const artworkId = body.artworkId?.trim();
  const authorName = body.authorName?.trim();
  const commentBody = body.body?.trim();

  if (!artworkId || !authorName || !commentBody) {
    return NextResponse.json({ error: "작품, 작성자, 댓글 내용을 모두 입력해야 합니다." }, { status: 400 });
  }

  const comment = await addCommentToArtwork({
    artworkId,
    authorName,
    body: commentBody
  });

  return NextResponse.json({ ok: true, comment });
}
