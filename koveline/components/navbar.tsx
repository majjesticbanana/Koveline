import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-[66px] max-w-[920px] items-center justify-between px-[22px]">
        <Link href="/" className="flex items-center gap-[11px]">
          <svg viewBox="0 0 44 44" width="34" height="34" aria-hidden="true">
            <defs>
              <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7a5230" />
                <stop offset="1" stopColor="#be824b" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#kg)" />
            <path d="M22 13.4c-3.7-2.4-8.4-2.4-12-1.3v17.5c3.6-1.1 8.3-1.1 12 1.3z" fill="#fff" fillOpacity=".96" />
            <path d="M22 13.4c3.7-2.4 8.4-2.4 12-1.3v17.5c-3.6-1.1-8.3-1.1-12 1.3z" fill="#fff" fillOpacity=".8" />
            <path d="M9 35.2c2.6-1.9 5-1.9 7.5 0s4.9 1.9 7.5 0 5-1.9 7.5 0" fill="none" stroke="#bdeae4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="font-display text-[1.4rem] font-extrabold tracking-tight text-ink">
            Kove<span className="text-coffee">line</span>
          </span>
        </Link>
        <div className="flex items-center gap-[18px]">
          <Link href="/" className="text-[0.95rem] font-semibold text-muted transition-colors hover:text-coffee">
            Units
          </Link>
          <span className="rounded-full border border-[#bfded8] bg-lagoon-soft px-3.5 py-1.5 text-[0.82rem] font-bold text-lagoon-deep">
            Grade 9 Islam
          </span>
        </div>
      </div>
    </header>
  );
}
