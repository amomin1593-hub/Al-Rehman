import ProductArt from "./ProductArt";
import { FINISH_HEX, type Product } from "@/lib/catalog";

export default function ProductImage({
  product,
  finish,
  className = "",
  idSuffix = "",
}: {
  product: Product;
  finish?: string;
  className?: string;
  idSuffix?: string;
}) {
  if (product.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.image_url} alt={product.name} loading="lazy" className={`h-full w-full bg-white object-contain ${className}`} />;
  }
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
