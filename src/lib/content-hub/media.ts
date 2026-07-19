import { uploadAuthorMedia } from "@/lib/author-media";
import { extractYoutubeVideoIds } from "@/lib/content-hub/parse-message";
import { downloadTelegramPhoto } from "@/lib/content-hub/telegram-api";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeYoutubeId, youtubeThumbnailUrl } from "@/lib/youtube-id";

export async function resolveBlogCoverUrl(params: {
  authorPageId: string;
  photoFileId: string | null;
  rawUrls: string[];
  clubYoutubeIds: string[];
}): Promise<string | null> {
  const { authorPageId, photoFileId, rawUrls, clubYoutubeIds } = params;

  if (photoFileId) {
    const downloaded = await downloadTelegramPhoto(photoFileId);
    if (downloaded) {
      const supabase = createServiceClient();
      const url = await uploadAuthorMedia(supabase, authorPageId, "blog-cover", {
        buffer: downloaded.buffer,
        contentType: downloaded.contentType,
        ext: downloaded.ext,
      });
      if (url) return url;
    }
  }

  const preferredIds = [...clubYoutubeIds, ...extractYoutubeVideoIds(rawUrls)];
  for (const raw of preferredIds) {
    const id = normalizeYoutubeId(raw);
    if (!id) continue;
    const thumb = youtubeThumbnailUrl(id, "maxresdefault");
    if (thumb) return thumb;
  }

  return null;
}
