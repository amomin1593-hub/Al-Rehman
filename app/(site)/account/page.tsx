import type { Metadata } from "next";
import AccountView from "@/components/AccountView";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <AccountView initialTab={tab} />;
}
