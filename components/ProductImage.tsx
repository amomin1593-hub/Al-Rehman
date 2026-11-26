import ProductArt from "./ProductArt";
import { FINISH_HEX, photoFor, type Product } from "@/lib/catalog";

export default function ProductImage({
  product,
  finish,
  className = "",
  idSuffix = "",
  fit = "cover",
}: {
  product: Product;
  finish?: string;
  className?: string;
  idSuffix?: string;
  /** cover = fill the frame (grids); contain = show the whole photo on a soft blurred backdrop */
  fit?: "cover" | "contain";
}) {
  const url = photoFor(product, finish);
  if (url) return <Photo url={url} alt={product.name} fit={fit} className={className} />;
  const hex = FINISH_HEX[finish ?? product.finishes[0] ?? "chrome"] ?? FINISH_HEX.chrome;
  return (
    <ProductArt
      art={product.art}
      tone={product.tone}
      finish={hex}
      id={`p${product.id}${idSuffix}${finish ?? ""}`}
      className={`h-full w-full ${className}`}
    />
  );
}

/** A photo that always fills its frame neatly, whatever its shape. */
export function Photo({ url, alt, fit = "cover", className = "", eager }: { url: string; alt: string; fit?: "cover" | "contain"; className?: string; eager?: boolean }) {
  if (fit === "cover") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} loading={eager ? "eager" : "lazy"} className={`h-full w-full bg-white object-cover ${className}`} />;
  }
  return (
    <div className={`relative h-full w-full overflow-hidden bg-white ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} loading={eager ? "eager" : "lazy"} className="relative h-full w-full object-contain" />
    </div>
  );
}
