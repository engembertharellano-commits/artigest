"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Palette,
  Database,
  Plus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FolderLock,
  Sparkles,
} from "lucide-react";

interface Tecnica {
  id: number;
  nombre: string;
  _count?: { obras: number };
}

export default function ConfiguracionPage() {
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [nuevaTecnica, setNuevaTecnica] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const cargarTecnicas = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tecnicas");
      if (res.ok) {
        const data = await res.json();
        setTecnicas(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTecnicas();
  }, []);

  const handleCrearTecnica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTecnica.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg("");
      setMensaje("");

      const res = await fetch("/api/tecnicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaTecnica.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "No se pudo crear la técnica");
      }

      setNuevaTecnica("");
      setMensaje("✓ Técnica añadida con éxito");
      await cargarTecnicas();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al agregar técnica");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full pb-24" style={{ backgroundColor: "#000000" }}>
      {/* ── HEADER CONFIGURACIÓN ─────────────────────── */}
      <div
        className="relative px-10 py-12 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 80% at 90% 40%, rgba(212,175,55,0.06) 0%, transparent 75%)",
          }}
        />

        <div>
          <p
            className="text-[10px] uppercase tracking-[0.3em] mb-3"
            style={{ color: "#d4af37" }}
          >
            ◎ Preferencias de Taller · L&apos;Art d&apos;Avril
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
            Configuración del Estudio
          </h1>
          <p className="mt-2 text-sm max-w-xl" style={{ color: "#8c8c8c" }}>
            Gestiona las técnicas artísticas disponibles en el catálogo y consulta
            el estado de tu base de datos local y privada.
          </p>
        </div>
      </div>

      <div className="px-10 py-10 max-w-4xl space-y-10">
        {/* 1. IDENTIDAD DE MARCA */}
        <div
          className="p-6 rounded-sm space-y-4"
          style={{
            backgroundColor: "#0c0c0c",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3
              className="text-xl font-light text-white"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Identidad del Proyecto
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-zinc-950 rounded-sm border border-zinc-900">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Nombre de la Galería / Taller
              </p>
              <p className="text-base text-white font-medium mt-1">L&apos;Art d&apos;Avril</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Avril · Estudio de Arte</p>
            </div>

            <div className="p-4 bg-zinc-950 rounded-sm border border-zinc-900">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Moneda de Operación Oficial
              </p>
              <p className="text-base text-amber-300 font-medium mt-1">USD ($ Dólar Americano)</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Base para costos y precios</p>
            </div>
          </div>
        </div>

        {/* 2. GESTIÓN DE TÉCNICAS ARTÍSTICAS */}
        <div
          className="p-6 rounded-sm space-y-6"
          style={{
            backgroundColor: "#0c0c0c",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} className="text-amber-400" />
              <h3
                className="text-xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Técnicas Artísticas Activas
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Añade nuevas disciplinas para clasificar tus obras (ej: Pastel, Gouache, Tinta china, Collage).
            </p>
          </div>

          {/* Formulario Nueva Técnica */}
          <form onSubmit={handleCrearTecnica} className="flex gap-3">
            <input
              type="text"
              placeholder="Nueva técnica (ej: Gouache o Pastel graso)"
              value={nuevaTecnica}
              onChange={(e) => setNuevaTecnica(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
              style={{ borderColor: "rgba(212,175,55,0.25)" }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-medium shrink-0"
              style={{
                backgroundColor: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.4)",
                color: "#d4af37",
              }}
            >
              <Plus size={14} />
              {submitting ? "Añadiendo..." : "Agregar"}
            </button>
          </form>

          {mensaje && <p className="text-xs text-emerald-400">{mensaje}</p>}
          {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

          {/* Lista de Técnicas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {tecnicas.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-zinc-950 rounded-sm border border-zinc-900 flex justify-between items-center text-xs"
              >
                <span className="text-white font-medium">{t.nombre}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {t._count?.obras || 0} {t._count?.obras === 1 ? "obra" : "obras"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. BASE DE DATOS LOCAL Y PRIVACIDAD */}
        <div
          className="p-6 rounded-sm space-y-4"
          style={{
            backgroundColor: "#0c0c0c",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3
              className="text-xl font-light text-white"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Base de Datos Local & Soberanía de Datos
            </h3>
          </div>

          <div className="text-xs text-zinc-400 space-y-2 leading-relaxed">
            <p>
              Toda la información de <strong>L&apos;Art d&apos;Avril</strong> (obras, clientes, compras
              de insumos, precios y retiros de dinero) está guardada de forma 100% privada en un archivo
              local en tu propia computadora:
            </p>
            <p className="font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded-sm border border-zinc-900">
              .../ArtiGest/artigest/prisma/artigest.db
            </p>
            <p className="text-[11px] text-zinc-500">
              ✓ No depende de internet ni de servidores externos para funcionar.
              ✓ Para respaldar todo tu negocio, solo debes copiar ese archivo <span className="text-zinc-400 font-mono">artigest.db</span> en un pendrive o en tu Google Drive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
