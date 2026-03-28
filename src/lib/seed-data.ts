import { getArtworkPlacement } from "@/lib/artwork-layout";
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

export const seedArtworks: Artwork[] = [
  {
    id: "art-1",
    type: "image",
    title: "봄 풍경화",
    authorName: "김민수",
    studentNumber: "01",
    description: "색연필로 그린 학교 앞 봄 풍경.",
    imageUrl: imageUrls[0],
    sourceFilename: "01_김민수_봄풍경.jpg",
    createdAt: "2026-03-28T09:00:00+09:00",
    ...getArtworkPlacement(0)
  },
  {
    id: "art-2",
    type: "text",
    title: "비 오는 날",
    authorName: "박서윤",
    studentNumber: "02",
    description: "교실 창문을 보며 쓴 짧은 시.",
    contentText:
      "빗방울이 창문을 천천히 내려오고, 운동장은 조용해진다. 우산 위로 떨어지는 소리가 오늘의 박자가 된다.",
    sourceFilename: "02_박서윤_비오는날.txt",
    createdAt: "2026-03-28T09:01:00+09:00",
    ...getArtworkPlacement(1)
  },
  {
    id: "art-3",
    type: "image",
    title: "우리 동네",
    authorName: "이준호",
    studentNumber: "03",
    description: "태블릿 드로잉으로 그린 동네 지도.",
    imageUrl: imageUrls[1],
    sourceFilename: "03_이준호_우리동네.png",
    createdAt: "2026-03-28T09:02:00+09:00",
    ...getArtworkPlacement(2)
  },
  {
    id: "art-4",
    type: "text",
    title: "미래의 교실",
    authorName: "최하린",
    studentNumber: "04",
    description: "미래 교실을 상상하며 쓴 설명글.",
    contentText:
      "미래의 교실에는 벽 대신 큰 화면이 있고, 친구들의 작품은 손끝으로 넘겨 볼 수 있다. 하지만 서로의 이야기를 듣는 시간은 더 많아졌으면 좋겠다.",
    sourceFilename: "04_최하린_미래의교실.txt",
    createdAt: "2026-03-28T09:03:00+09:00",
    ...getArtworkPlacement(3)
  },
  {
    id: "art-5",
    type: "image",
    title: "바다의 색",
    authorName: "정다은",
    studentNumber: "05",
    description: "파란색 계열만 사용해 만든 추상화.",
    imageUrl: imageUrls[2],
    sourceFilename: "05_정다은_바다의색.jpg",
    createdAt: "2026-03-28T09:04:00+09:00",
    ...getArtworkPlacement(4)
  },
  {
    id: "art-6",
    type: "text",
    title: "내가 좋아하는 길",
    authorName: "한지우",
    studentNumber: "06",
    description: "등굣길을 떠올리며 쓴 짧은 글.",
    contentText:
      "학교로 가는 길에는 늘 같은 나무가 서 있다. 계절이 바뀔 때마다 그 길도 조금씩 다른 표정을 보여 준다.",
    sourceFilename: "06_한지우_내가좋아하는길.txt",
    createdAt: "2026-03-28T09:05:00+09:00",
    ...getArtworkPlacement(5)
  },
  {
    id: "art-7",
    type: "image",
    title: "운동장의 오후",
    authorName: "서지호",
    studentNumber: "07",
    description: "학교 운동장을 기억하며 그린 장면.",
    imageUrl: imageUrls[3],
    sourceFilename: "07_서지호_운동장의오후.png",
    createdAt: "2026-03-28T09:06:00+09:00",
    ...getArtworkPlacement(6)
  },
  {
    id: "art-8",
    type: "text",
    title: "나무에게",
    authorName: "윤가은",
    studentNumber: "08",
    description: "나무에게 말을 건네는 형식의 시.",
    contentText:
      "바람이 불어도 네가 서 있는 자리는 늘 그곳이다. 나는 네가 흔들릴 때마다 더 단단하다는 생각을 한다.",
    sourceFilename: "08_윤가은_나무에게.txt",
    createdAt: "2026-03-28T09:07:00+09:00",
    ...getArtworkPlacement(7)
  },
  {
    id: "art-9",
    type: "image",
    title: "노을 계단",
    authorName: "조예린",
    studentNumber: "09",
    description: "주황빛 계단 장면을 재구성한 그림.",
    imageUrl: imageUrls[4],
    sourceFilename: "09_조예린_노을계단.jpg",
    createdAt: "2026-03-28T09:08:00+09:00",
    ...getArtworkPlacement(8)
  },
  {
    id: "art-10",
    type: "text",
    title: "우리 반 소개",
    authorName: "임도현",
    studentNumber: "10",
    description: "우리 반의 분위기를 설명하는 글.",
    contentText:
      "우리 반은 조용할 때는 아주 조용하지만, 발표를 시작하면 누구보다 활기차다. 서로의 작품을 볼 때는 더 다정해진다.",
    sourceFilename: "10_임도현_우리반소개.txt",
    createdAt: "2026-03-28T09:09:00+09:00",
    ...getArtworkPlacement(9)
  },
  {
    id: "art-11",
    type: "image",
    title: "초록 언덕",
    authorName: "문서아",
    studentNumber: "11",
    description: "완만한 언덕과 하늘을 그린 풍경화.",
    imageUrl: imageUrls[5],
    sourceFilename: "11_문서아_초록언덕.webp",
    createdAt: "2026-03-28T09:10:00+09:00",
    ...getArtworkPlacement(10)
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
    artworkId: "art-4",
    authorName: "김민수",
    body: "마지막 문장이 기억에 남아요.",
    createdAt: "2026-03-28T09:12:00+09:00"
  },
  {
    id: "comment-3",
    artworkId: "art-8",
    authorName: "박서윤",
    body: "나무를 친구처럼 표현한 점이 좋아요.",
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
