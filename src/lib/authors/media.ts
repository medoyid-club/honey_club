type AuthorMediaFields = {
  avatar_url?: string | null;
  cover_url?: string | null;
};

/** Portrait for sidebar and small avatars. */
export function authorAvatarSrc(page: AuthorMediaFields): string | null {
  const url = page.avatar_url?.trim();
  return url || null;
}

/** Wide card image on /authors — cover first, then avatar. */
export function authorCardImageSrc(page: AuthorMediaFields): string | null {
  const cover = page.cover_url?.trim();
  if (cover) return cover;
  return authorAvatarSrc(page);
}
