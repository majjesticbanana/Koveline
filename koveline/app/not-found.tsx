import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5 text-center">
      <div>
        <div className="text-5xl">☕</div>
        <h1 className="mt-3 text-3xl font-black">This page is empty</h1>
        <p className="mt-2 text-muted">
          We couldn&apos;t find that unit. Let&apos;s get you back to studying.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-2xl bg-gradient-to-br from-coffee to-coffee-dark px-6 py-3 font-extrabold text-white shadow-warm-sm transition hover:brightness-105"
        >
          Back to all units
        </Link>
      </div>
    </main>
  );
}
