export type ViewerRole = "teacher" | "student" | "guest";

export type UploadCategory = "individual" | "group" | "collaborative";

export type WallSlot = "front" | "left" | "right";

export type WallConfig = Record<WallSlot, UploadCategory | null>;

export type FrameVariant = "portrait" | "landscapeWide" | "wallMural";

export type Artwork = {
  id: string;
  type: "image" | "text";
  title: string;
  authorName: string;
  studentNumber?: string;
  description: string;
  imageUrl?: string;
  pdfUrl?: string;
  contentText?: string;
  sourceFilename: string;
  displayCategory?: UploadCategory;
  wallSlot?: WallSlot;
  position: [number, number, number];
  rotationY?: number;
  frameScale?: number;
  frameVariant?: FrameVariant;
  createdAt: string;
};

export type ArtworkComment = {
  id: string;
  artworkId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type PresenceUser = {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
  role: ViewerRole;
};

export type BulkUploadRow = {
  id: string;
  sourceFilename: string;
  title: string;
  authorName: string;
  studentNumber: string;
  fileType: "image" | "pdf" | "unknown";
  status: "ok" | "needs-review";
  reason?: string;
  previewUrl?: string;
};
