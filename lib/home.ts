// Home page content types. Edited from /admin/home.
export type Slide = {
  label: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string | null;
  // drawing used when there is no image
  art: string;
  finish: string;
  tone: string;
};
export type Tile = { eyebrow: string; title: string; text: string; href: string; image: string | null; art: string; finish: string; tone: string };
export type HomeContent = { announcement: string; slides: Slide[]; tiles: Tile[] };
