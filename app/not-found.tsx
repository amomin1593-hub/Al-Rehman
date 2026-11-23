import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="h-display text-[56px]">This page has gone down the drain.</h1>
      <Link href="/" className="btn-dark mt-10">Back to home</Link>
    </div>
  );
}
