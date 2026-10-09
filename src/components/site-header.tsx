"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { calculators } from "@/lib/site";

const pages = [
  { title: "Guides", href: "/guides" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();

  // Menus remember the path they were opened on, so they close on navigation.
  const [mobileOpenOn, setMobileOpenOn] = useState<string | null>(null);
  const [dropdownOpenOn, setDropdownOpenOn] = useState<string | null>(null);
  const mobileOpen = mobileOpenOn === pathname;
  const dropdownOpen = dropdownOpenOn === pathname;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen && !dropdownOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (mobileOpen) menuButtonRef.current?.focus();
      setMobileOpenOn(null);
      setDropdownOpenOn(null);
    }

    function onPointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpenOn(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileOpen, dropdownOpen]);

  const onCalculator = pathname.startsWith("/calculators");

  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-[15px] font-medium transition-colors hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-300 ${
      active
        ? "text-blue-700 dark:text-blue-300"
        : "text-slate-700 dark:text-slate-200"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-blue-700 text-base text-white"
          >
            M
          </span>
          <span>
            Monthly
            <span className="text-blue-700 dark:text-blue-400">Wise</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              aria-expanded={dropdownOpen}
              aria-controls="calculators-menu"
              onClick={() =>
                setDropdownOpenOn(dropdownOpen ? null : pathname)
              }
              className={`${linkClass(onCalculator)} inline-flex items-center gap-1`}
            >
              Calculators
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path
                  fill="currentColor"
                  d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <ul
                id="calculators-menu"
                className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                {calculators.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2 text-[15px] hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        pathname === item.href
                          ? "font-semibold text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {pages.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpenOn(mobileOpen ? null : pathname)}
          className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
            {mobileOpen ? (
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            ) : (
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-6 pt-4 md:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Calculators
          </p>
          <ul className="mt-2 space-y-1">
            {calculators.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 text-base ${
                    pathname === item.href
                      ? "bg-blue-50 font-semibold text-blue-700 dark:bg-slate-800 dark:text-blue-300"
                      : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-4 space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
            {pages.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-3 text-base font-medium ${
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300"
                        : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
