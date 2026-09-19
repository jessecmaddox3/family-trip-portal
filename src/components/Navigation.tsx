"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { PortalConfig } from "@/lib/types";

export default function Navigation({
  config,
  years,
}: {
  config: PortalConfig;
  years: number[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const candidate = Number(pathname.match(/\/trip\/(\d{4})(?:\/|$)/)?.[1]);
  const year = years.includes(candidate) ? candidate : config.currentYear;
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Trip Details", href: `/trip/${year}` },
    { label: "Schedule", href: `/trip/${year}/schedule` },
    { label: "Tides", href: `/trip/${year}/tides` },
    { label: "Meals", href: `/trip/${year}/meals` },
    { label: "Packing", href: `/trip/${year}/packing` },
    { label: "Guide", href: `/trip/${year}/guide` },
    { label: "People", href: `/trip/${year}/people` },
    { label: "Photos", href: `/trip/${year}/photos` },
    { label: "History", href: "/history" },
  ];

  return (
    <nav className="bg-ocean-500 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-sand-300"
        >
          {config.brandName}
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex gap-1">
          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-ocean-100 hover:bg-ocean-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-md hover:bg-ocean-400 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="portal-mobile-menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <div
        className="max-w-6xl mx-auto px-4 pb-2 flex gap-3 text-xs"
        aria-label="Trip years"
      >
        <span className="text-ocean-200">Trip year:</span>
        {years.map((y) => (
          <Link
            key={y}
            href={`/trip/${y}`}
            aria-current={y === year ? "page" : undefined}
            className={y === year ? "font-bold underline" : "text-ocean-100"}
          >
            {y}
          </Link>
        ))}
      </div>
      {/* Mobile menu */}
      {open && (
        <div
          id="portal-mobile-menu"
          className="lg:hidden border-t border-ocean-400 bg-ocean-600"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-ocean-100 hover:bg-ocean-500 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
