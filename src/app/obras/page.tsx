"use client";

import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageShell";
import {
  Search,
  Plus,
  SlidersHorizontal,
  X,
  Sparkles,
  Layers,
  Maximize2,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Bookmark,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { parsePreciosDeNotas, formatNotasConPrecios } from "@/lib/precios";

interface Tecnica {
  id: number;
  nombre: string;
}

interface Obra {
  id: number;
  titulo: string;
  tecnicaId: number;
  tecnica: Tecnica;
  anchoCm: number | null;
  altoCm: number | null;
  estado: string;
  descripcion: string | null;
  notas: string | null;
  createdAt: string;
}

const ESTADOS = [
  { label: "Disponible", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { label: "En proceso", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { label: "Reservada", color: "text-sky-400 border-sky-500/30 bg-sky-500/10" },
  { label: "Vendida", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  { label: "Consignación", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
];

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedTecnica, setSelectedTecnica] = useState("todas");
  const [selectedEstado, setSelectedEstado] = useState("todos");

  // Modal Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado del Formulario
  const [formTitulo, setFormTitulo] = useState("");
  const [formTecnicaId, setFormTecnicaId] = useState<number | "">("");
  const [formAncho, setFormAncho] = useState("");
  const [formAlto, setFormAlto] = useState("");
  const [formEstado, setFormEstado] = useState("Disponible");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formNotas, setFormNotas] = useState("");

  // Carga inicial
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resObras, resTecnicas] = await Promise.all([
        fetch("/api/obras"),
        fetch("/api/tecnicas"),
      ]);

      if (resObras.ok) {
        const dataObras = await resObras.json();
        setObras(dataObras);
      }
      if (resTecnicas.ok) {
        const dataTecnicas = await resTecnicas.json();
        setTecnicas(dataTecnicas);
      }
    } catch (err) {
      console.error("Error al cargar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abrir modal para crear
  const handleOpenCrear = () => {
    setEditingObra(null);
    setFormTitulo("");
    setFormTecnicaId(tecnicas[0]?.id || "");
    setFormAncho("");
    setFormAlto("");
    setFormEstado("Disponible");
    setFormDescripcion("");
    setFormNotas("");
    setErrorMessage("");
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEditar = (obra: Obra) => {
    setEditingObra(obra);
    setFormTitulo(obra.titulo);
    setFormTecnicaId(obra.tecnicaId);
    setFormAncho(obra.anchoCm ? String(obra.anchoCm) : "");
    setFormAlto(obra.altoCm ? String(obra.altoCm) : "");
    setFormEstado(obra.estado);
    setFormDescripcion(obra.descripcion || "");
    const { notasLimpias } = parsePreciosDeNotas(obra.notas);
    setFormNotas(notasLimpias);
    setErrorMessage("");
    setModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      setErrorMessage("Por favor ingresa el título de la obra.");
      return;
    }
    if (!formTecnicaId) {
      setErrorMessage("Selecciona una técnica artística.");
      return;
    }

    try {
      setFormSubmitting(true);
      setErrorMessage("");

      const { precioLocal, precioInt } = parsePreciosDeNotas(editingObra?.notas);
      const notasFinales =
        precioLocal && precioInt
          ? formatNotasConPrecios(precioLocal, precioInt, formNotas)
          : formNotas;

      const payload = {
        titulo: formTitulo,
        tecnicaId: Number(formTecnicaId),
        anchoCm: formAncho || null,
        altoCm: formAlto || null,
        estado: formEstado,
        descripcion: formDescripcion,
        notas: notasFinales,
      };

      const url = editingObra ? `/api/obras/${editingObra.id}` : "/api/obras";
      const method = editingObra ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ocurrió un error al guardar.");
      }

      setModalOpen(false);
      await cargarDatos();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar la solicitud.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Eliminar obra
  const handleDelete = async (id: number, titulo: string) => {
    if (!confirm(`¿Deseas retirar "${titulo}" del catálogo de obras?`)) return;

    try {
      const res = await fetch(`/api/obras/${id}`, { method: "DELETE" });
      if (res.ok) {
        setObras((prev) => prev.filter((o) => o.id !== id));
      } else {
        alert("No se pudo eliminar la obra.");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // Cambio rápido de estado
  const handleQuickEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/obras/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setObras((prev) =>
          prev.map((o) => (o.id === id ? { ...o, estado: nuevoEstado } : o))
        );
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  // Obras filtradas
  const obrasFiltradas = useMemo(() => {
    return obras.filter((o) => {
      const matchSearch =
        o.titulo.toLowerCase().includes(search.toLowerCase()) ||
        (o.descripcion && o.descripcion.toLowerCase().includes(search.toLowerCase()));
      const matchTecnica =
        selectedTecnica === "todas" || o.tecnicaId === Number(selectedTecnica);
      const matchEstado =
        selectedEstado === "todos" || o.estado === selectedEstado;

      return matchSearch && matchTecnica && matchEstado;
    });
  }, [obras, search, selectedTecnica, selectedEstado]);

  // Conteo de métricas rápidas
  const totalObras = obras.length;
  const disponiblesCount = obras.filter((o) => o.estado === "Disponible").length;
  const enProcesoCount = obras.filter((o) => o.estado === "En proceso").length;
  const vendidasCount = obras.filter((o) => o.estado === "Vendida").length;

  return (
    <div className="min-h-full pb-20" style={{ backgroundColor: "#000000" }}>
      {/* ── HEADER DE MUSEO ───────────────────────────── */}
      <div
        className="relative px-10 py-12 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 40% 80% at 95% 40%, rgba(212,175,55,0.08) 0%, transparent 75%)",
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "#d4af37" }}
            >
              ◈ Catálogo de Colección · L&apos;Art d&apos;Avril
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
              Inventario de Obras
            </h1>
            <p className="mt-2 text-sm max-w-xl" style={{ color: "#8c8c8c" }}>
              Cada cuadro, soporte y creación clasificados con técnica, proporciones
              y estado de disponibilidad en tiempo real.
            </p>
          </div>

          <button
            onClick={handleOpenCrear}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-all group shrink-0"
            style={{
              backgroundColor: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#d4af37",
              boxShadow: "0 0 20px rgba(212,175,55,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.22)";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.7)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(212,175,55,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.12)";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(212,175,55,0.1)";
            }}
          >
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
            Registrar Obra
          </button>
        </div>

        {/* Cintas de Métricas Clave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
          <div
            className="p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#8c8c8c" }}>
              Total Catálogo
            </p>
            <p
              className="text-2xl font-light mt-1"
              style={{ fontFamily: "var(--font-cormorant)", color: "#ffffff" }}
            >
              {totalObras} <span className="text-xs text-zinc-500 font-sans">obras</span>
            </p>
          </div>

          <div
            className="p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
              Disponibles
            </p>
            <p
              className="text-2xl font-light mt-1 text-emerald-300"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {disponiblesCount}
            </p>
          </div>

          <div
            className="p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80">
              En Taller
            </p>
            <p
              className="text-2xl font-light mt-1 text-amber-300"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {enProcesoCount}
            </p>
          </div>

          <div
            className="p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400/80">
              Colección Privada
            </p>
            <p
              className="text-2xl font-light mt-1 text-purple-300"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {vendidasCount}
            </p>
          </div>
        </div>
      </div>

      {/* ── BARRA DE BÚSQUEDA Y FILTROS ──────────────── */}
      <div className="px-10 py-6 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Buscador */}
          <div
            className="relative w-full md:w-96 flex items-center px-4 py-2.5 rounded-sm"
            style={{
              backgroundColor: "#0c0c0c",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <Search size={15} style={{ color: "#d4af37", opacity: 0.7 }} className="mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Buscar obra o concepto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtros Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filtro Técnica */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#555" }}>
                Técnica:
              </span>
              <select
                value={selectedTecnica}
                onChange={(e) => setSelectedTecnica(e.target.value)}
                className="px-3 py-2 text-xs uppercase tracking-wider rounded-sm focus:outline-none"
                style={{
                  backgroundColor: "#0c0c0c",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: "#d4af37",
                }}
              >
                <option value="todas">Todas las técnicas</option>
                {tecnicas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#555" }}>
                Estado:
              </span>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="px-3 py-2 text-xs uppercase tracking-wider rounded-sm focus:outline-none"
                style={{
                  backgroundColor: "#0c0c0c",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: "#ffffff",
                }}
              >
                <option value="todos">Todos los estados</option>
                {ESTADOS.map((est) => (
                  <option key={est.label} value={est.label}>
                    {est.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── GALERÍA DE OBRAS ─────────────────────────── */}
      <div className="px-10 py-10">
        {loading ? (
          <div className="py-24 text-center">
            <p
              className="text-4xl animate-pulse"
              style={{ color: "#d4af37", fontFamily: "var(--font-cormorant)" }}
            >
              ✧
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mt-3">
              Abriendo sala de exposición...
            </p>
          </div>
        ) : obrasFiltradas.length === 0 ? (
          <div
            className="py-20 px-6 text-center rounded-sm max-w-xl mx-auto"
            style={{
              border: "1px dashed rgba(212,175,55,0.2)",
              backgroundColor: "rgba(12,12,12,0.5)",
            }}
          >
            <p
              className="text-5xl mb-4 font-light"
              style={{ color: "rgba(212,175,55,0.3)", fontFamily: "var(--font-cormorant)" }}
            >
              ✧
            </p>
            <h3
              className="text-xl font-light text-white mb-2"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Ninguna obra coincide con los criterios
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Ajusta los filtros de búsqueda o registra una nueva pieza en tu catálogo.
            </p>
            <button
              onClick={handleOpenCrear}
              className="px-5 py-2.5 text-xs uppercase tracking-[0.2em]"
              style={{
                border: "1px solid rgba(212,175,55,0.4)",
                color: "#d4af37",
              }}
            >
              + Registrar Nueva Obra
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {obrasFiltradas.map((obra) => {
              const estadoObj =
                ESTADOS.find((e) => e.label === obra.estado) || ESTADOS[0];
              const { precioLocal, precioInt, notasLimpias } = parsePreciosDeNotas(obra.notas);

              return (
                <div
                  key={obra.id}
                  className="group relative flex flex-col justify-between rounded-sm overflow-hidden"
                  style={{
                    backgroundColor: "#0c0c0c",
                    border: "1px solid rgba(212,175,55,0.14)",
                    transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)";
                    e.currentTarget.style.boxShadow =
                      "0 15px 40px -10px rgba(212,175,55,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.14)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Encabezado de la Obra */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Técnica Badge */}
                      <span
                        className="text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-sm"
                        style={{
                          backgroundColor: "rgba(212,175,55,0.08)",
                          border: "1px solid rgba(212,175,55,0.25)",
                          color: "#d4af37",
                        }}
                      >
                        {obra.tecnica.nombre}
                      </span>

                      {/* Estado Selector Rápido */}
                      <select
                        value={obra.estado}
                        onChange={(e) => handleQuickEstado(obra.id, e.target.value)}
                        className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-sm border cursor-pointer focus:outline-none ${estadoObj.color}`}
                        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                      >
                        {ESTADOS.map((est) => (
                          <option key={est.label} value={est.label} className="bg-zinc-900 text-white">
                            {est.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Título de la obra */}
                    <h2
                      className="text-2xl font-light text-white mb-2 leading-snug group-hover:text-amber-100 transition-colors"
                      style={{
                        fontFamily: "var(--font-cormorant)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {obra.titulo}
                    </h2>

                    {/* Dimensiones */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                      <Maximize2 size={12} className="text-zinc-600" />
                      {obra.anchoCm && obra.altoCm ? (
                        <span>
                          {obra.anchoCm} × {obra.altoCm} cm
                        </span>
                      ) : (
                        <span className="italic">Dimensiones sin definir</span>
                      )}
                    </div>

                    {/* Descripción Poética */}
                    {obra.descripcion && (
                      <p
                        className="text-xs leading-relaxed line-clamp-3 mb-3 italic"
                        style={{
                          color: "#8c8c8c",
                          fontFamily: "var(--font-cormorant)",
                          fontSize: "0.95rem",
                        }}
                      >
                        &ldquo;{obra.descripcion}&rdquo;
                      </p>
                    )}

                    {/* Bloque de Precios Oficiales de la Obra */}
                    {precioLocal && precioInt ? (
                      <div
                        className="my-3 p-2.5 rounded-sm flex items-center justify-between text-xs"
                        style={{
                          backgroundColor: "rgba(18,18,18,0.9)",
                          border: "1px solid rgba(212,175,55,0.25)",
                        }}
                      >
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-emerald-400">
                            🇻🇪 Local
                          </p>
                          <p className="text-white font-mono font-medium">${precioLocal} USD</p>
                        </div>
                        <div className="h-6 w-px bg-zinc-800" />
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider text-amber-300">
                            🌍 Web / Int.
                          </p>
                          <p className="text-white font-mono font-medium">${precioInt} USD</p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href="/finanzas"
                        className="my-3 py-1.5 px-2.5 block text-center text-[10px] uppercase tracking-wider text-zinc-500 hover:text-amber-300 border border-dashed border-zinc-800 hover:border-amber-500/30 rounded-sm transition-colors"
                      >
                        ✧ Fijar Precios en Simulador →
                      </Link>
                    )}

                    {/* Notas de taller */}
                    {notasLimpias && (
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-2 border-l border-zinc-800 pl-2">
                        {notasLimpias}
                      </p>
                    )}
                  </div>

                  {/* Pie de tarjeta con acciones */}
                  <div
                    className="px-6 py-3.5 border-t flex items-center justify-between"
                    style={{ borderColor: "rgba(212,175,55,0.08)" }}
                  >
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                      ID #{obra.id.toString().padStart(3, "0")}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditar(obra)}
                        className="p-1.5 text-zinc-500 hover:text-amber-300 transition-colors"
                        title="Editar obra"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(obra.id, obra.titulo)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Eliminar obra"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: REGISTRAR / EDITAR OBRA ───────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(212,175,55,0.35)",
              boxShadow: "0 0 60px rgba(212,175,55,0.15)",
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Encabezado Modal */}
            <div className="mb-6">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-2"
                style={{ color: "#d4af37" }}
              >
                ✧ {editingObra ? "Editar Pieza de Arte" : "Nuevo Ingreso a Galería"}
              </p>
              <h3
                className="text-3xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {editingObra ? editingObra.titulo : "Ficha Técnica de la Obra"}
              </h3>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Título */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Título de la obra <span style={{ color: "#d4af37" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: El Peso del Mundo"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{
                    borderColor: "rgba(212,175,55,0.25)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.7)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.25)")}
                />
              </div>

              {/* Técnica y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Técnica Artística <span style={{ color: "#d4af37" }}>*</span>
                  </label>
                  <select
                    value={formTecnicaId}
                    onChange={(e) => setFormTecnicaId(Number(e.target.value))}
                    className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  >
                    {tecnicas.map((t) => (
                      <option key={t.id} value={t.id} className="bg-zinc-900">
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Estado Actual
                  </label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  >
                    {ESTADOS.map((est) => (
                      <option key={est.label} value={est.label} className="bg-zinc-900">
                        {est.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dimensiones */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Ancho (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ej: 100"
                    value={formAncho}
                    onChange={(e) => setFormAncho(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Alto (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ej: 120"
                    value={formAlto}
                    onChange={(e) => setFormAlto(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  />
                </div>
              </div>

              {/* Descripción Poética / Curaduría */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Descripción Poética / Curatorial
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica el concepto, inspiración o atmósfera de la pieza..."
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none leading-relaxed"
                  style={{
                    borderColor: "rgba(212,175,55,0.25)",
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "1.05rem",
                  }}
                />
              </div>

              {/* Notas de taller */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Notas de Taller (Privadas)
                </label>
                <input
                  type="text"
                  placeholder="ej: Barniz aplicado el 12/03. Bastidor triple capa."
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.25)" }}
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium"
                  style={{
                    backgroundColor: "rgba(212,175,55,0.15)",
                    border: "1px solid rgba(212,175,55,0.5)",
                    color: "#d4af37",
                  }}
                >
                  {formSubmitting
                    ? "Guardando en galería..."
                    : editingObra
                    ? "Actualizar Obra"
                    : "Guardar Obra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
