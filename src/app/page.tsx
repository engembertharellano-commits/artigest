"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const modules = [
  {
    glyph: "◈",
    eyebrow: "Catálogo",
    label: "Obras",
    description:
      "Registra cada pieza con técnica, dimensiones y estado. Tu galería privada, siempre organizada.",
    href: "/obras",
  },
  {
    glyph: "◇",
    eyebrow: "Inventario",
    label: "Materiales",
    description:
      "Pinturas, lienzos, pinceles, barnices. Control de stock y alertas cuando el estudio necesita reabastecerse.",
    href: "/materiales",
  },
  {
    glyph: "◉",
    eyebrow: "Económico",
    label: "Finanzas",
    description:
      "Gastos operativos, registro de ventas y simulador de precio con margen real sobre cada obra.",
    href: "/finanzas",
  },
  {
    glyph: "◎",
    eyebrow: "Resumen",
    label: "Dashboard",
    description:
      "Vista ejecutiva: valor de inventario, ingresos del mes, margen por técnica y alertas de stock.",
    href: "/dashboard",
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({
    totalObras: 0,
    obrasDisponibles: 0,
    totalMateriales: 0,
    totalIngresos: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error("Error al cargar stats:", err));
  }, []);

  return (
    <div className="min-h-full" style={{ backgroundColor: "#000000" }}>
      {/* ── HERO ─────────────────────────────────────── */}
      <div
        className="relative px-10 py-20 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-6"
            style={{ color: "#d4af37" }}
          >
            ✧ L&apos;Art d&apos;Avril · Panel de Gestión · 2026
          </p>

          <h1
            className="font-light leading-tight mb-6"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2.8rem, 5vw, 4.2rem)",
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            El estudio que{" "}
            <em style={{ color: "#d4af37", fontStyle: "italic" }}>
              merece
            </em>{" "}
            tu arte.
          </h1>

          <p
            className="text-base leading-relaxed mb-10"
            style={{ color: "#8c8c8c", maxWidth: "520px", lineHeight: "1.75" }}
          >
            Administra tu obra, controla cada insumo y toma decisiones financieras
            con la elegancia y rigor que exige tu producción artística.
          </p>

          {/* Stats Vivas */}
          <div className="flex flex-wrap gap-4">
            <div
              className="px-5 py-3.5 rounded-sm"
              style={{
                backgroundColor: "rgba(18,18,18,0.8)",
                border: "1px solid rgba(212,175,55,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="font-light"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "1.6rem",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                {stats.totalObras}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.2em] mt-1"
                style={{ color: "#8c8c8c" }}
              >
                Obras en catálogo
              </p>
            </div>

            <div
              className="px-5 py-3.5 rounded-sm"
              style={{
                backgroundColor: "rgba(18,18,18,0.8)",
                border: "1px solid rgba(16,185,129,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="font-light text-emerald-400"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "1.6rem",
                  lineHeight: 1,
                }}
              >
                {stats.obrasDisponibles}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.2em] mt-1 text-emerald-400/80"
              >
                Disponibles para venta
              </p>
            </div>

            <div
              className="px-5 py-3.5 rounded-sm"
              style={{
                backgroundColor: "rgba(18,18,18,0.8)",
                border: "1px solid rgba(212,175,55,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="font-light"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "1.6rem",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                {stats.totalMateriales}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.2em] mt-1"
                style={{ color: "#8c8c8c" }}
              >
                Insumos en inventario
              </p>
            </div>

            <div
              className="px-5 py-3.5 rounded-sm"
              style={{
                backgroundColor: "rgba(18,18,18,0.8)",
                border: "1px solid rgba(212,175,55,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="font-light"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "1.6rem",
                  color: "#d4af37",
                  lineHeight: 1,
                }}
              >
                ${stats.totalIngresos.toFixed(2)}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.2em] mt-1"
                style={{ color: "#8c8c8c" }}
              >
                Ventas registradas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODULES ──────────────────────────────────── */}
      <div className="px-10 py-12">
        <p
          className="text-[10px] uppercase tracking-[0.3em] mb-8"
          style={{ color: "#555" }}
        >
          Módulos del sistema
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group block p-7 rounded-sm"
              style={{
                backgroundColor: "#0c0c0c",
                border: "1px solid rgba(212,175,55,0.12)",
                transition: "all 0.4s cubic-bezier(0.25,1,0.5,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
                e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.04)";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(212,175,55,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)";
                e.currentTarget.style.backgroundColor = "#0c0c0c";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-4"
                style={{ color: "#d4af37", opacity: 0.7 }}
              >
                {mod.glyph} {mod.eyebrow}
              </p>

              <h2
                className="font-light mb-3"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "1.9rem",
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                }}
              >
                {mod.label}
              </h2>

              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "#8c8c8c", lineHeight: "1.7" }}
              >
                {mod.description}
              </p>

              <div
                className="text-[11px] uppercase tracking-[0.2em] flex items-center gap-2"
                style={{ color: "rgba(212,175,55,0.5)" }}
              >
                Acceder al módulo
                <span
                  className="transition-transform group-hover:translate-x-1"
                  style={{ display: "inline-block" }}
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
