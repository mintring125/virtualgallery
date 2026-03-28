export type ViewerRole = "teacher" | "student" | "guest";

export type Artwork = {
  id: string;
  type: "image" | "text";
  title: string;
  authorName: string;
  studentNumber?: string;
  description: string;
  imageUrl?: string;
  contentText?: string;
  sourceFilename: string;
  position: [number, number, number];
  rotationY?: number;
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
  fileType: "image" | "text" | "unknown";
  status: "ok" | "needs-review";
  reason?: string;
};
