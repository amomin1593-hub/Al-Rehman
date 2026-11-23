import { StoreProvider } from "@/components/StoreProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getCatalog, getHome } from "@/lib/server/db";

// Always show the latest products, prices and stock from the database
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [catalog, home] = await Promise.all([getCatalog(), getHome()]);
  return (
    <CatalogProvider catalog={catalog}>
      <StoreProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <Header announcement={home.announcement} />
        <main id="main">{children}</main>
        <Footer categories={catalog.categories} />
        <CartDrawer />
        <WhatsAppFloat />
      </StoreProvider>
    </CatalogProvider>
  );
}
