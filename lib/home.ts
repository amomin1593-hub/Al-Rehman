// Home page content types. Edited from /admin/home.
export type Slide = {
  label: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string | null;
  /** optional tall photo for phones (portrait, e.g. 1080×1350) */
  imageMobile?: string | null;
  // drawing used when there is no image
  art: string;
  finish: string;
  tone: string;
};
export type Tile = { eyebrow: string; title: string; text: string; href: string; image: string | null; art: string; finish: string; tone: string };
/** Dark "Quality & Trust" section. Wrap a word in *stars* to show it in gold italics. */
export type Story = { eyebrow: string; title: string; text: string; cta: string; href: string };
/** Video section. Empty url = section hidden. url can be an uploaded .mp4 or a YouTube / Vimeo link. */
export type Video = { url: string; mobileUrl?: string; poster: string | null; eyebrow: string; title: string; text: string; cta: string; href: string };
export type HomeContent = { announcement: string; slides: Slide[]; tiles: Tile[]; story?: Story; video?: Video };

export const DEFAULT_STORY: Story = {
  eyebrow: "Quality & Trust",
  title: "Quality you can feel, *service* you can trust.",
  text: "Sanitary ware chosen for finish, durability and fair price, delivered to your door from Gujranwala.",
  cta: "Shop all",
  href: "/shop",
};
export const DEFAULT_VIDEO: Video = {
  url: "",
  poster: null,
  eyebrow: "See it in action",
  title: "Made for everyday rituals.",
  text: "",
  cta: "Explore the collection",
  href: "/shop",
};

export const storyOf = (h: HomeContent): Story => ({ ...DEFAULT_STORY, ...(h.story ?? {}) });
export const videoOf = (h: HomeContent): Video => ({ ...DEFAULT_VIDEO, ...(h.video ?? {}) });

/** Turns a YouTube / Vimeo link into an embeddable, silent, looping player URL. Returns null for direct video files. */
export function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&playsinline=1&modestbranding=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?background=1&autoplay=1&loop=1&muted=1`;
  return null;
}
