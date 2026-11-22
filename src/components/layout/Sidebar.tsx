"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Inicio",        href: "/",             glyph: "✦" },
  { label: "Obras",         href: "/obras",         glyph: "◈" },
  { label: "Materiales",    href: "/materiales",    glyph: "◇" },
  { label: "Finanzas",      href: "/finanzas",      glyph: "◉" },
  { label: "Configuración", href: "/configuracion", glyph: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 flex flex-col shrink-0 border-r"
      style={{
        backgroundColor: "#000000",
        borderColor: "rgba(212,175,55,0.15)",
      }}
    >
      {/* Logo */}
      <div className="px-7 pt-8 pb-6">
        <p
          className="text-xs uppercase tracking-[0.3em] mb-3"
          style={{ color: "#d4af37" }}
        >
          ✧ Gestión Artística
        </p>
        <h1
          className="text-2xl font-light leading-none"
          style={{
            fontFamily: "var(--font-cormorant)",
            color: "#ffffff",
            letterSpacing: "0.05em",
          }}
        >
          ArtiGest
        </h1>
        <p
          className="text-xs mt-1 italic"
          style={{
            fontFamily: "var(--font-cormorant)",
            color: "#8c8c8c",
            letterSpacing: "0.05em",
          }}
        >
          L&apos;Art d&apos;Avril
        </p>
      </div>

      {/* Divider */}
      <div className="mx-7 h-px mb-5" style={{ backgroundColor: "rgba(212,175,55,0.2)" }} />

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-0.5">
        <p
          className="text-[10px] uppercase tracking-[0.25em] px-3 mb-3"
          style={{ color: "#555555" }}
        >
          Módulos
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs uppercase tracking-[0.18em] group"
              style={{
                backgroundColor: isActive ? "rgba(212,175,55,0.08)" : "transparent",
                color: isActive ? "#d4af37" : "#8c8c8c",
                borderLeft: isActive
                  ? "1px solid rgba(212,175,55,0.5)"
                  : "1px solid transparent",
              }}
            >
              <span style={{ color: isActive ? "#d4af37" : "#555" }}>
                {item.glyph}
              </span>
              {item.label}
              {isActive && (
                <span
                  className="ml-auto text-[8px]"
                  style={{ color: "#d4af37", opacity: 0.6 }}
                >
                  ●
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mx-7 h-px mt-4" style={{ backgroundColor: "rgba(212,175,55,0.1)" }} />
      <div className="px-7 py-5">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-1"
          style={{ color: "#555" }}
        >
          Proyecto activo
        </p>
        <p
          className="text-sm italic"
          style={{
            fontFamily: "var(--font-cormorant)",
            color: "#d4af37",
            letterSpacing: "0.05em",
          }}
        >
          L&apos;Art d&apos;Avril
        </p>
        <p className="text-[10px] mt-2" style={{ color: "#333" }}>
          ArtiGest · v1.0
        </p>
      </div>
    </aside>
  );
}
