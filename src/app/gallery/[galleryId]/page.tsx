import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { readGalleryRecord } from "@/lib/gallery-store";
import { seedPresenceUsers } from "@/lib/seed-data";
import type { ViewerRole } from "@/lib/types";

type GalleryPageProps = {
  params: Promise<{ galleryId: string }>;
  searchParams: Promise<{ role?: string; name?: string }>;
};

function normalizeRole(value: string | undefined): ViewerRole {
  if (value === "teacher" || value === "guest") {
    return value;
  }

  return "student";
}

export const dynamic = "force-dynamic";

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const [{ galleryId }, query] = await Promise.all([params, searchParams]);
  const viewerRole = normalizeRole(query.role);
  const viewerName = query.name?.trim() || (viewerRole === "teacher" ? "담임" : "학생");
  const gallery = await readGalleryRecord(galleryId);

  return (
    <main className="page-shell page-shell-gallery">
      <GalleryExperience
        galleryId={galleryId}
        artworks={gallery.artworks}
        comments={gallery.comments}
        presenceUsers={seedPresenceUsers}
        viewerName={viewerName}
        viewerRole={viewerRole}
      />
    </main>
  );
}
