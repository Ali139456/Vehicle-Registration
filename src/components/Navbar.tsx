'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <div className="relative h-14 w-14 flex-shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/logo.png"
              alt="Vehicle Registration"
              fill
              className="object-contain"
              sizes="64px"
              priority
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
