"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Palette,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalObras: 0,
    obrasDisponibles: 0,
    totalMateriales: 0,
    totalIngresos: 0,
    totalGastos: 0,
  });

  const [balance, setBalance] = useState({
    totalVentas: 0,
    totalGastosTaller: 0,
    totalRetirosGanancia: 0,
    fondoTrabajoDisponible: 0,
  });

  const [obrasPorTecnica, setObrasPorTecnica] = useState<any[]>([]);
  const [materialesCriticos, setMaterialesCriticos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/finanzas/balance").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/tecnicas").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/materiales?stockBajo=true").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([s, b, tecs, matsCrit]) => {
        if (s) setStats(s);
        if (b) setBalance(b);
        if (tecs) setObrasPorTecnica(tecs);
        if (matsCrit) setMaterialesCriticos(matsCrit);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full pb-24" style={{ backgroundColor: "#000000" }}>
      {/* ── HEADER EJECUTIVO ─────────────────────────── */}
      <div
        className="relative px-10 py-12 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 80% at 85% 30%, rgba(212,175,55,0.08) 0%, transparent 75%)",
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "#d4af37" }}
            >
              ◎ Panel de Mando · L&apos;Art d&apos;Avril
            </p>
            <h1
              className="font-light tracking-wide"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              Resumen Ejecutivo del Estudio
            </h1>
            <p className="mt-2 text-sm max-w-xl" style={{ color: "#8c8c8c" }}>
              Visión integral de tu producción artística, salud financiera del fondo
              y disponibilidad de insumos en tiempo real.
            </p>
          </div>

          <Link
            href="/finanzas"
            className="flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.18em] font-medium transition-all"
            style={{
              backgroundColor: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#d4af37",
            }}
          >
            <Sparkles size={14} />
            Simulador de Precios
          </Link>
        </div>

        {/* CINTAS RESUMEN DE MANDO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <div
            className="p-5 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.85)",
              border: "1px solid rgba(212,175,55,0.35)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#d4af37" }}>
              Fondo de Trabajo (Caja)
            </p>
            <p
              className="text-3xl font-light mt-1 text-white"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              ${balance.fondoTrabajoDisponible.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-500">USD</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">Dinero libre para reinversión</p>
          </div>

          <div
            className="p-5 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Obras en Catálogo
            </p>
            <p
              className="text-3xl font-light mt-1 text-white"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {stats.totalObras}{" "}
              <span className="text-xs font-sans text-emerald-400">
                ({stats.obrasDisponibles} disp.)
              </span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">Colección actual de Avril</p>
          </div>

          <div
            className="p-5 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Insumos en Taller
            </p>
            <p
              className="text-3xl font-light mt-1 text-white"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {stats.totalMateriales}{" "}
              <span className="text-xs font-sans text-zinc-500">referencias</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">
              {materialesCriticos.length > 0 ? (
                <span className="text-rose-400">{materialesCriticos.length} por reponer</span>
              ) : (
                "Stock óptimo"
              )}
            </p>
          </div>

          <div
            className="p-5 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
              Total Ventas Recaudadas
            </p>
            <p
              className="text-3xl font-light mt-1 text-emerald-300"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              ${balance.totalVentas.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-500">USD</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">Ingresos cobrados íntegros</p>
          </div>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL DEL DASHBOARD ───────────── */}
      <div className="px-10 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA 1 Y 2: PRODUCCIÓN Y TÉCNICAS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribución por Técnica */}
          <div
            className="p-7 rounded-sm"
            style={{
              backgroundColor: "#0c0c0c",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "#d4af37" }}>
                  Taller & Disciplinas
                </p>
                <h3
                  className="text-2xl font-light text-white"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Producción por Técnica Artística
                </h3>
              </div>
              <Link
                href="/obras"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
              >
                Ver galería <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-4">
              {obrasPorTecnica.map((t) => {
                const count = t._count?.obras || 0;
                const ratio = stats.totalObras > 0 ? (count / stats.totalObras) * 100 : 0;

                return (
                  <div key={t.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white font-medium">{t.nombre}</span>
                      <span className="text-zinc-400 font-mono">
                        {count} {count === 1 ? "obra" : "obras"} ({ratio.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-all duration-500"
                        style={{ width: `${Math.max(count > 0 ? 8 : 0, ratio)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acceso Rápido a Módulos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/obras"
              className="p-5 rounded-sm flex items-center justify-between group transition-all"
              style={{
                backgroundColor: "#0c0c0c",
                border: "1px solid rgba(212,175,55,0.12)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
                e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)";
                e.currentTarget.style.backgroundColor = "#0c0c0c";
              }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Catálogo</p>
                <h4
                  className="text-xl font-light text-white mt-1 group-hover:text-amber-200"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Gestión de Obras
                </h4>
                <p className="text-xs text-zinc-400 mt-1">Registrar piezas y estados</p>
              </div>
              <ArrowRight size={18} className="text-zinc-600 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/materiales"
              className="p-5 rounded-sm flex items-center justify-between group transition-all"
              style={{
                backgroundColor: "#0c0c0c",
                border: "1px solid rgba(212,175,55,0.12)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
                e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)";
                e.currentTarget.style.backgroundColor = "#0c0c0c";
              }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Taller</p>
                <h4
                  className="text-xl font-light text-white mt-1 group-hover:text-amber-200"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Inventario & Kárdex
                </h4>
                <p className="text-xs text-zinc-400 mt-1">Compras, agotados y stock</p>
              </div>
              <ArrowRight size={18} className="text-zinc-600 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* COLUMNA 3: SALUD DEL TALLER Y ALERTAS */}
        <div className="space-y-6">
          {/* Alertas de Stock */}
          <div
            className="p-6 rounded-sm"
            style={{
              backgroundColor: "#0c0c0c",
              border:
                materialesCriticos.length > 0
                  ? "1px solid rgba(239,68,68,0.25)"
                  : "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p
                className={`text-[10px] uppercase tracking-[0.2em] font-medium ${
                  materialesCriticos.length > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {materialesCriticos.length > 0 ? "⚠️ Reposición Urgente" : "✓ Insumos al Día"}
              </p>
              <Link href="/materiales" className="text-[10px] text-zinc-500 hover:text-white">
                Ir a Insumos →
              </Link>
            </div>

            {materialesCriticos.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500/50 mb-2" />
                <p className="text-xs text-zinc-400">
                  Todos los materiales cuentan con stock por encima del nivel mínimo.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {materialesCriticos.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-sm bg-zinc-950 border border-zinc-900 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="text-white font-medium">{m.nombre}</p>
                      <p className="text-[10px] text-zinc-500">Mínimo: {m.stockMinimo} {m.unidad}</p>
                    </div>
                    <span className="text-rose-400 font-mono font-medium">
                      {m.stockActual} {m.unidad}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consejo Curatorial y Financiero */}
          <div
            className="p-6 rounded-sm text-xs text-zinc-400 leading-relaxed"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "#d4af37" }}>
              ✦ Filosofía L&apos;Art d&apos;Avril
            </p>
            <p className="text-zinc-300 italic mb-3 font-light" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
              &ldquo;Donde el color aprende a decir lo que el silencio calla.&rdquo;
            </p>
            <p>
              Mantener un fondo de trabajo sólido te permite comprar lienzos de gran formato y
              pigmentos de grado artista sin presiones inmediatas, dándole a cada obra el tiempo y
              nobleza que merece.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
