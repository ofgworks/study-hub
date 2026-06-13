import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-neutral-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-700 text-white">
            <BrainCircuit size={18} />
          </span>
          Atolye Beyni
        </Link>
        <nav className="flex items-center gap-2 text-sm text-neutral-600">
          <Link
            href="/"
            className="rounded-md px-3 py-2 font-medium transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Beyin
          </Link>
          <Link
            href="/library"
            className="rounded-md px-3 py-2 font-medium transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Eski kutuphane
          </Link>
        </nav>
      </div>
    </header>
  );
}
