import { getPlacementForArtwork } from "@/lib/artwork-layout";
import type { Artwork, ArtworkComment, PresenceUser } from "@/lib/types";

export const DEFAULT_GALLERY_ID = "class-3-2";

const imageUrls = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80"
];

const individualWorks = [
  ["01", "김민수", "봄 풍경화"],
  ["02", "박서윤", "비 오는 날"],
  ["03", "이준호", "우리 동네"],
  ["04", "최하린", "미래의 교실"],
  ["05", "정다은", "바다의 색"],
  ["06", "한지우", "내가 좋아하는 길"],
  ["07", "서지호", "운동장의 오후"],
  ["08", "윤가은", "나무에게"],
  ["09", "조예린", "노을 계단"],
  ["10", "임도현", "우리 반 소개"],
  ["11", "문서아", "초록 언덕"]
] as const;

const groupWorks = [
  ["12", "1모둠", "모둠 작품 1"],
  ["13", "2모둠", "모둠 작품 2"],
  ["14", "3모둠", "모둠 작품 3"],
  ["15", "4모둠", "모둠 작품 4"]
] as const;

export const seedArtworks: Artwork[] = [
  ...individualWorks.map(([studentNumber, authorName, title], index): Artwork => {
    const isImage = index % 2 === 0;

    return {
      id: `art-${index + 1}`,
      type: isImage ? "image" : "text",
      title,
      authorName,
      studentNumber,
      description: `${authorName} 학생의 개인 작품`,
      imageUrl: isImage ? imageUrls[index % imageUrls.length] : undefined,
      pdfUrl: !isImage ? "/samples/student-text.pdf" : undefined,
      contentText: !isImage ? `${title}에 대한 글 작품입니다.` : undefined,
      sourceFilename: `${studentNumber}_${authorName}_${title}.${isImage ? "jpg" : "pdf"}`,
      createdAt: `2026-03-28T09:${String(index).padStart(2, "0")}:00+09:00`,
      ...getPlacementForArtwork({
        category: "individual",
        wallSlot: "front",
        index,
        totalCount: individualWorks.length
      })
    };
  }),
  ...groupWorks.map(([studentNumber, authorName, title], index): Artwork => ({
    id: `art-${individualWorks.length + index + 1}`,
    type: "image",
    title,
    authorName,
    studentNumber,
    description: `${authorName} 공동 캔버스 작품`,
    imageUrl: imageUrls[(index + 1) % imageUrls.length],
    sourceFilename: `${studentNumber}_${authorName}_${title}.png`,
    createdAt: `2026-03-28T10:${String(index).padStart(2, "0")}:00+09:00`,
    ...getPlacementForArtwork({
      category: "group",
      wallSlot: "left",
      index,
      totalCount: groupWorks.length
    })
  })),
  {
    id: "art-16",
    type: "image",
    title: "학급 협동화",
    authorName: "우리 반",
    studentNumber: "16",
    description: "오른쪽 벽을 대표하는 큰 학급 협동화",
    imageUrl: imageUrls[4],
    sourceFilename: "16_우리반_학급협동화.jpg",
    createdAt: "2026-03-28T10:10:00+09:00",
    ...getPlacementForArtwork({
      category: "collaborative",
      wallSlot: "right",
      index: 0,
      totalCount: 1
    })
  }
];

export const seedComments: ArtworkComment[] = [
  {
    id: "comment-1",
    artworkId: "art-1",
    authorName: "담임",
    body: "하늘과 길의 대비가 좋아요.",
    createdAt: "2026-03-28T09:11:00+09:00"
  },
  {
    id: "comment-2",
    artworkId: "art-12",
    authorName: "김민수",
    body: "모둠 색 조합이 잘 살아 있어요.",
    createdAt: "2026-03-28T09:12:00+09:00"
  },
  {
    id: "comment-3",
    artworkId: "art-16",
    authorName: "박서윤",
    body: "우리 반 전체 분위기가 잘 담겼어요.",
    createdAt: "2026-03-28T09:13:00+09:00"
  }
];

export const seedPresenceUsers: PresenceUser[] = [
  {
    id: "presence-1",
    name: "김민수",
    color: "#ff8a4c",
    position: [-6.5, 0.6, -2.5],
    role: "student"
  },
  {
    id: "presence-2",
    name: "박서윤",
    color: "#69c1ff",
    position: [0.6, 0.6, -1.4],
    role: "student"
  },
  {
    id: "presence-3",
    name: "담임",
    color: "#f3d17d",
    position: [6.4, 0.6, 1.8],
    role: "teacher"
  }
];
