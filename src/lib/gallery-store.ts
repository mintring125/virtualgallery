import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getArtworkPlacement } from "@/lib/artwork-layout";
import { DEFAULT_GALLERY_ID, seedArtworks, seedComments } from "@/lib/seed-data";
import type { Artwork, ArtworkComment } from "@/lib/types";

type GalleryRecord = {
  id: string;
  title: string;
  description: string;
  artworks: Artwork[];
  comments: ArtworkComment[];
};

type GalleryStore = {
  galleries: Record<string, GalleryRecord>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "gallery-store.json");

function createInitialStore(): GalleryStore {
  return {
    galleries: {
      [DEFAULT_GALLERY_ID]: {
        id: DEFAULT_GALLERY_ID,
        title: "3학년 2반 온라인 전시실",
        description: "교실 작품을 아바타로 둘러보는 3D 갤러리",
        artworks: seedArtworks,
        comments: seedComments
      }
    }
  };
}

function syncSeedArtworks(gallery: GalleryRecord): GalleryRecord {
  const seedMap = new Map(seedArtworks.map((artwork) => [artwork.id, artwork]));
  const syncedExisting = gallery.artworks.map((artwork) => seedMap.get(artwork.id) ?? artwork);
  const existingIds = new Set(syncedExisting.map((artwork) => artwork.id));
  const missing = seedArtworks.filter((artwork) => !existingIds.has(artwork.id));

  return {
    ...gallery,
    artworks: [...syncedExisting, ...missing]
  };
}

async function ensureStoreFile() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(createInitialStore(), null, 2), "utf8");
  }
}

async function readStore(): Promise<GalleryStore> {
  await ensureStoreFile();
  const raw = await readFile(STORE_PATH, "utf8");

  return JSON.parse(raw) as GalleryStore;
}

async function writeStore(store: GalleryStore) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function readGalleryRecord(galleryId: string = DEFAULT_GALLERY_ID): Promise<GalleryRecord> {
  const store = await readStore();
  const existing = store.galleries[galleryId];

  if (existing) {
    if (galleryId === DEFAULT_GALLERY_ID) {
      const merged = syncSeedArtworks(existing);
      store.galleries[galleryId] = merged;
      await writeStore(store);

      return merged;
    }

    return existing;
  }

  const fallback = createInitialStore().galleries[DEFAULT_GALLERY_ID];
  store.galleries[galleryId] = {
    ...fallback,
    id: galleryId,
    title: `${galleryId} 전시실`
  };
  await writeStore(store);

  return store.galleries[galleryId];
}

export async function addBatchArtworks(
  galleryId: string,
  drafts: Array<{
    type: "image" | "text";
    title: string;
    authorName: string;
    studentNumber?: string;
    description: string;
    imageUrl?: string;
    contentText?: string;
    sourceFilename: string;
  }>
): Promise<Artwork[]> {
  const store = await readStore();
  const gallery = store.galleries[galleryId] ?? (await readGalleryRecord(galleryId));
  const baseCount = gallery.artworks.length;
  const now = new Date().toISOString();

  const created = drafts.map((draft, index) => ({
    id: `art-${Date.now()}-${index}`,
    type: draft.type,
    title: draft.title,
    authorName: draft.authorName,
    studentNumber: draft.studentNumber,
    description: draft.description,
    imageUrl: draft.imageUrl,
    contentText: draft.contentText,
    sourceFilename: draft.sourceFilename,
    createdAt: now,
    ...getArtworkPlacement(baseCount + index)
  }));

  gallery.artworks = [...gallery.artworks, ...created];
  store.galleries[galleryId] = gallery;
  await writeStore(store);

  return created;
}

export async function addCommentToArtwork(input: {
  artworkId: string;
  authorName: string;
  body: string;
}): Promise<ArtworkComment> {
  const store = await readStore();
  const targetGallery = Object.values(store.galleries).find((gallery) =>
    gallery.artworks.some((artwork) => artwork.id === input.artworkId)
  );

  if (!targetGallery) {
    throw new Error("작품을 찾을 수 없습니다.");
  }

  const comment: ArtworkComment = {
    id: `comment-${Date.now()}`,
    artworkId: input.artworkId,
    authorName: input.authorName,
    body: input.body,
    createdAt: new Date().toISOString()
  };

  targetGallery.comments = [...targetGallery.comments, comment];
  store.galleries[targetGallery.id] = targetGallery;
  await writeStore(store);

  return comment;
}
