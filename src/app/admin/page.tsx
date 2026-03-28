import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { readGalleryRecord } from "@/lib/gallery-store";
import { DEFAULT_GALLERY_ID } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const gallery = await readGalleryRecord(DEFAULT_GALLERY_ID);

  return <AdminWorkspace existingArtworks={gallery.artworks} galleryId={gallery.id} />;
}
