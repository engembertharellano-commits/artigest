"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  X,
  AlertTriangle,
  Boxes,
  DollarSign,
  Edit3,
  Trash2,
  AlertCircle,
  History,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Calendar,
  Sparkles,
  Maximize2,
  Layers,
  Ruler,
  Paintbrush,
} from "lucide-react";
import {
  parseEspecificacionesMaterial,
  formatNotasConSoporte,
  formatNotasConHerramienta,
  TipoRecursoMaterial,
} from "@/lib/materiales";

interface Categoria {
  id: number;
  nombre: string;
}

interface Movimiento {
  id: number;
  tipo: "entrada" | "salida";
  cantidad: number;
  motivo: string | null;
  fecha: string;
}

interface Material {
  id: number;
  nombre: string;
  categoriaId: number;
  categoria: Categoria;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
  proveedor: string | null;
  notas: string | null;
}

const UNIDADES_FLUIDOS = [
  { value: "tubo", label: "Tubos (óleo/acrílico)" },
  { value: "frasco", label: "Frascos / Botes" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "gr", label: "Gramos (gr)" },
];

const UNIDADES_SOPORTES = [
  { value: "unidad", label: "Lienzos / Bastidores / Piezas" },
  { value: "pliego", label: "Pliegos (papel)" },
  { value: "metro", label: "Metros lineales" },
];

const UNIDADES_HERRAMIENTAS = [
  { value: "estuche", label: "Estuche / Set de pinceles" },
  { value: "kit", label: "Kit de taller" },
  { value: "unidad", label: "Pincel / Herramienta individual" },
];

export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  // Modal Crear / Editar Material
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Formulario Material
  const [formNombre, setFormNombre] = useState("");
  const [formCategoriaId, setFormCategoriaId] = useState<number | "">("");
  const [formUnidad, setFormUnidad] = useState("unidad");
  const [formStockActual, setFormStockActual] = useState("1");
  const [formStockMinimo, setFormStockMinimo] = useState("1");
  const [formCostoUnitario, setFormCostoUnitario] = useState("");
  const [formProveedor, setFormProveedor] = useState("");
  const [formNotas, setFormNotas] = useState("");

  // Naturaleza del Recurso
  const [formTipoRecurso, setFormTipoRecurso] = useState<TipoRecursoMaterial>("soporte");

  // Campos específicos si es SOPORTE FÍSICO CON MEDIDAS (Lienzo, bastidor, marco)
  const [formAnchoCm, setFormAnchoCm] = useState("");
  const [formAltoCm, setFormAltoCm] = useState("");
  const [formTipoTela, setFormTipoTela] = useState("Lino profesional belga");
  const [formPerfilCm, setFormPerfilCm] = useState("2");

  // Campos específicos si es HERRAMIENTA / ESTUCHE (Pinceles, espátulas)
  const [formEsSet, setFormEsSet] = useState(true);
  const [formPiezasSet, setFormPiezasSet] = useState("12");
  const [formTipoCerda, setFormTipoCerda] = useState("Sintética suave Toray");

  // Modal Movimiento (Entrada / Salida con Trazabilidad)
  const [modalMovimientoOpen, setModalMovimientoOpen] = useState(false);
  const [materialParaMovimiento, setMaterialParaMovimiento] = useState<Material | null>(null);
  const [movTipo, setMovTipo] = useState<"entrada" | "salida">("entrada");
  const [movCantidad, setMovCantidad] = useState("1");
  const [movMotivo, setMovMotivo] = useState("");
  const [movNuevoCosto, setMovNuevoCosto] = useState("");
  const [movRegistrarGasto, setMovRegistrarGasto] = useState(true);
  const [submittingMov, setSubmittingMov] = useState(false);
  const [errorMov, setErrorMov] = useState("");

  // Modal Historial / Kárdex
  const [modalHistorialOpen, setModalHistorialOpen] = useState(false);
  const [materialHistorial, setMaterialHistorial] = useState<Material | null>(null);
  const [historialItems, setHistorialItems] = useState<Movimiento[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resMat, resCat] = await Promise.all([
        fetch("/api/materiales"),
        fetch("/api/categorias-materiales"),
      ]);

      if (resMat.ok) {
        const dataMat = await resMat.json();
        setMateriales(dataMat);
      }
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategorias(dataCat);
      }
    } catch (err) {
      console.error("Error al cargar materiales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Al cambiar categoría en el formulario
  const handleCambiarCategoriaForm = (catId: number) => {
    setFormCategoriaId(catId);
    const cat = categorias.find((c) => c.id === catId);
    if (cat) {
      const catLower = cat.nombre.toLowerCase();
      if (catLower.includes("soporte") || catLower.includes("lienzo") || catLower.includes("marco")) {
        setFormTipoRecurso("soporte");
        setFormUnidad("unidad");
      } else if (catLower.includes("pincel") || catLower.includes("herramienta")) {
        setFormTipoRecurso("herramienta");
        setFormUnidad("estuche");
      } else {
        setFormTipoRecurso("consumible");
        setFormUnidad("tubo");
      }
    }
  };

  // Abrir modal crear
  const handleOpenCrear = () => {
    setEditingMaterial(null);
    setFormNombre("");
    const catDefecto = categorias[0]?.id || "";
    setFormCategoriaId(catDefecto);
    const catNombre = (categorias[0]?.nombre || "").toLowerCase();
    if (catNombre.includes("pincel") || catNombre.includes("herramienta")) {
      setFormTipoRecurso("herramienta");
      setFormUnidad("estuche");
    } else if (catNombre.includes("soporte") || catNombre.includes("lienzo") || catNombre.includes("marco")) {
      setFormTipoRecurso("soporte");
      setFormUnidad("unidad");
    } else {
      setFormTipoRecurso("consumible");
      setFormUnidad("tubo");
    }
    setFormAnchoCm("");
    setFormAltoCm("");
    setFormTipoTela("Lino profesional");
    setFormPerfilCm("2");
    setFormEsSet(true);
    setFormPiezasSet("12");
    setFormTipoCerda("Sintética suave para óleo y acrílico");
    setFormStockActual("1");
    setFormStockMinimo("1");
    setFormCostoUnitario("");
    setFormProveedor("");
    setFormNotas("");
    setErrorMessage("");
    setModalOpen(true);
  };

  // Abrir modal editar
  const handleOpenEditar = (m: Material) => {
    setEditingMaterial(m);
    setFormNombre(m.nombre);
    setFormCategoriaId(m.categoriaId);
    setFormUnidad(m.unidad);
    setFormStockActual(String(m.stockActual));
    setFormStockMinimo(String(m.stockMinimo));
    setFormCostoUnitario(String(m.costoUnitario));
    setFormProveedor(m.proveedor || "");

    const specs = parseEspecificacionesMaterial(m.categoria.nombre, m.notas);
    setFormTipoRecurso(specs.tipoRecurso);
    setFormAnchoCm(specs.anchoCm ? String(specs.anchoCm) : "");
    setFormAltoCm(specs.altoCm ? String(specs.altoCm) : "");
    setFormTipoTela(specs.tipoMaterial || "Lino profesional");
    setFormPerfilCm(specs.perfilCm ? String(specs.perfilCm) : "2");
    setFormEsSet(specs.esSet);
    setFormPiezasSet(specs.piezasSet ? String(specs.piezasSet) : "12");
    setFormTipoCerda(specs.tipoCerda || "Sintética suave para óleo y acrílico");
    setFormNotas(specs.notasLimpias);

    setErrorMessage("");
    setModalOpen(true);
  };

  // Guardar ficha material
  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      setErrorMessage("El nombre del material es obligatorio.");
      return;
    }
    if (!formCategoriaId) {
      setErrorMessage("Selecciona una categoría.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      let notasFinales = formNotas;
      if (formTipoRecurso === "soporte" && formAnchoCm && formAltoCm) {
        notasFinales = formatNotasConSoporte(
          formAnchoCm,
          formAltoCm,
          formTipoTela,
          formPerfilCm,
          formNotas
        );
      } else if (formTipoRecurso === "herramienta") {
        notasFinales = formatNotasConHerramienta(
          formEsSet,
          formEsSet ? formPiezasSet : null,
          formTipoCerda,
          formNotas
        );
      }

      const payload = {
        nombre: formNombre,
        categoriaId: Number(formCategoriaId),
        unidad: formUnidad,
        stockActual: formStockActual || 0,
        stockMinimo: formStockMinimo || 0,
        costoUnitario: formCostoUnitario || 0,
        proveedor: formProveedor,
        notas: notasFinales,
      };

      const url = editingMaterial
        ? `/api/materiales/${editingMaterial.id}`
        : "/api/materiales";
      const method = editingMaterial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Ocurrió un error.");
      }

      setModalOpen(false);
      await cargarDatos();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  // Abrir modal Entrada
  const handleOpenEntrada = (mat: Material) => {
    setMaterialParaMovimiento(mat);
    setMovTipo("entrada");
    setMovCantidad("1");
    setMovMotivo(`Compra de reposición - ${mat.proveedor || "Taller"}`);
    setMovNuevoCosto(String(mat.costoUnitario));
    setMovRegistrarGasto(true);
    setErrorMov("");
    setModalMovimientoOpen(true);
  };

  // Abrir modal Salida
  const handleOpenSalida = (mat: Material) => {
    const specs = parseEspecificacionesMaterial(mat.categoria.nombre, mat.notas);
    setMaterialParaMovimiento(mat);
    setMovTipo("salida");
    setMovCantidad("1");
    setMovMotivo(
      specs.esHerramienta
        ? specs.esSet
          ? "Estuche de pinceles desgastado / Fin de vida útil"
          : "Pincel o herramienta desgastada / Reemplazo"
        : specs.esSoporte
        ? "Lienzo / Bastidor utilizado en nueva obra"
        : "Frasco / Tubo terminado en taller"
    );
    setMovNuevoCosto("");
    setMovRegistrarGasto(false);
    setErrorMov("");
    setModalMovimientoOpen(true);
  };

  // Salida rápida: 1 unidad usada o consumida
  const handleSalidaRapida = async (mat: Material) => {
    if (mat.stockActual <= 0) {
      alert("Este material ya tiene stock en 0.");
      return;
    }

    const specs = parseEspecificacionesMaterial(mat.categoria.nombre, mat.notas);
    const mensajeConfirm = specs.esHerramienta
      ? `¿Confirmas la baja o reemplazo de 1 ${specs.esSet ? "estuche" : "pincel/herramienta"} de "${mat.nombre}" por desgaste o fin de ciclo?\n\nSe registrará la salida en el kárdex del taller.`
      : specs.esSoporte
      ? `¿Confirmas que se utilizó 1 lienzo/bastidor de "${mat.nombre}" en una nueva obra?\n\nSe descontará 1 unidad del inventario físico.`
      : `¿Confirmas que se terminó 1 ${mat.unidad} de "${mat.nombre}"?\n\nSe registrará en el historial de consumo del taller.`;

    if (!confirm(mensajeConfirm)) return;

    try {
      const res = await fetch(`/api/materiales/${mat.id}/movimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "salida",
          cantidad: 1,
          motivo: specs.esHerramienta
            ? specs.esSet
              ? "Estuche de pinceles desgastado / Fin de vida útil"
              : "Pincel o herramienta desgastada / Reemplazo"
            : specs.esSoporte
            ? "Lienzo / Bastidor utilizado en nueva obra"
            : "Frasco / Tubo terminado en taller",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMateriales((prev) =>
          prev.map((m) => (m.id === mat.id ? data.material : m))
        );
      } else {
        const err = await res.json();
        alert(err.error || "No se pudo registrar la salida.");
      }
    } catch (e) {
      console.error(e);
      alert("Error al registrar movimiento.");
    }
  };

  // Guardar Movimiento
  const handleSubmitMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialParaMovimiento) return;

    const cantNum = parseFloat(movCantidad);
    if (!cantNum || cantNum <= 0) {
      setErrorMov("La cantidad debe ser mayor a 0.");
      return;
    }

    try {
      setSubmittingMov(true);
      setErrorMov("");

      const res = await fetch(
        `/api/materiales/${materialParaMovimiento.id}/movimientos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: movTipo,
            cantidad: cantNum,
            motivo: movMotivo,
            nuevoCostoUnitario: movNuevoCosto || undefined,
            registrarComoGasto: movTipo === "entrada" ? movRegistrarGasto : false,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al registrar movimiento.");
      }

      const data = await res.json();
      setMateriales((prev) =>
        prev.map((m) => (m.id === materialParaMovimiento.id ? data.material : m))
      );
      setModalMovimientoOpen(false);
    } catch (err: any) {
      setErrorMov(err.message || "Error al procesar movimiento.");
    } finally {
      setSubmittingMov(false);
    }
  };

  // Historial
  const handleOpenHistorial = async (mat: Material) => {
    setMaterialHistorial(mat);
    setModalHistorialOpen(true);
    setLoadingHistorial(true);
    try {
      const res = await fetch(`/api/materiales/${mat.id}/movimientos`);
      if (res.ok) {
        const data = await res.json();
        setHistorialItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Eliminar
  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}" del catálogo de insumos?`)) return;

    try {
      const res = await fetch(`/api/materiales/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMateriales((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar material:", err);
    }
  };

  // Filtrados
  const materialesFiltrados = useMemo(() => {
    return materiales.filter((m) => {
      const matchSearch =
        m.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (m.proveedor && m.proveedor.toLowerCase().includes(search.toLowerCase())) ||
        (m.notas && m.notas.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        selectedCategoria === "todas" || m.categoriaId === Number(selectedCategoria);

      const matchStockBajo = soloStockBajo ? m.stockActual <= m.stockMinimo : true;

      return matchSearch && matchCat && matchStockBajo;
    });
  }, [materiales, search, selectedCategoria, soloStockBajo]);

  // Métricas
  const totalInsumos = materiales.length;
  const stockBajoCount = materiales.filter((m) => m.stockActual <= m.stockMinimo).length;
  const valorInventario = materiales.reduce(
    (acc, m) => acc + m.stockActual * m.costoUnitario,
    0
  );

  return (
    <div className="min-h-full pb-20" style={{ backgroundColor: "#000000" }}>
      {/* ── HEADER MUSEO / TALLER ───────────────────── */}
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
              ◇ Inventario Diferenciado · L&apos;Art d&apos;Avril
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
              Soportes, Lienzos & Fluidos
            </h1>
            <p className="mt-2 text-sm max-w-2xl" style={{ color: "#8c8c8c" }}>
              Control adaptado a cada tipo de material: los lienzos se gestionan como{" "}
              <span className="text-white">piezas enteras con medidas ($100\times120$ cm)</span>{" "}
              y las pinturas por <span className="text-white">tubos y volumen de taller</span>.
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
          >
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
            Nuevo Insumo
          </button>
        </div>

        {/* Métricas del Inventario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div
            className="p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#8c8c8c" }}>
              Variedad de Insumos
            </p>
            <p
              className="text-2xl font-light mt-1"
              style={{ fontFamily: "var(--font-cormorant)", color: "#ffffff" }}
            >
              {totalInsumos} <span className="text-xs text-zinc-500 font-sans">referencias</span>
            </p>
          </div>

          <div
            className="p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border:
                stockBajoCount > 0
                  ? "1px solid rgba(239,68,68,0.3)"
                  : "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-[10px] uppercase tracking-[0.2em] ${
                  stockBajoCount > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                Alertas de Stock Bajo
              </p>
              {stockBajoCount > 0 && <AlertTriangle size={14} className="text-rose-400" />}
            </div>
            <p
              className={`text-2xl font-light mt-1 ${
                stockBajoCount > 0 ? "text-rose-300" : "text-emerald-300"
              }`}
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {stockBajoCount}{" "}
              <span className="text-xs font-sans text-zinc-500">
                {stockBajoCount === 1 ? "por agotarse" : "por agotarse"}
              </span>
            </p>
          </div>

          <div
            className="p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#8c8c8c" }}>
              Valor Total en Stock
            </p>
            <p
              className="text-2xl font-light mt-1"
              style={{ fontFamily: "var(--font-cormorant)", color: "#d4af37" }}
            >
              ${valorInventario.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-500">USD</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── BARRA DE BÚSQUEDA Y FILTROS ──────────────── */}
      <div className="px-10 py-6 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
              placeholder="Buscar por medidas, nombre o marca..."
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

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#555" }}>
                Categoría:
              </span>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="px-3 py-2 text-xs uppercase tracking-wider rounded-sm focus:outline-none"
                style={{
                  backgroundColor: "#0c0c0c",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: "#d4af37",
                }}
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSoloStockBajo(!soloStockBajo)}
              className="px-3.5 py-2 text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: soloStockBajo ? "rgba(239,68,68,0.15)" : "#0c0c0c",
                border: soloStockBajo
                  ? "1px solid rgba(239,68,68,0.5)"
                  : "1px solid rgba(212,175,55,0.2)",
                color: soloStockBajo ? "#fca5a5" : "#8c8c8c",
              }}
            >
              <AlertTriangle size={13} className={soloStockBajo ? "text-rose-400" : "text-zinc-500"} />
              Solo Stock Bajo
            </button>
          </div>
        </div>
      </div>

      {/* ── GRID DE MATERIALES DIFERENCIADOS ─────────── */}
      <div className="px-10 py-10">
        {loading ? (
          <div className="py-24 text-center">
            <p
              className="text-4xl animate-pulse"
              style={{ color: "#d4af37", fontFamily: "var(--font-cormorant)" }}
            >
              ◇
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mt-3">
              Consultando almacén de taller...
            </p>
          </div>
        ) : materialesFiltrados.length === 0 ? (
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
              ◇
            </p>
            <h3
              className="text-xl font-light text-white mb-2"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              No se encontraron insumos
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Ajusta los filtros o registra un nuevo soporte o pintura para tu taller.
            </p>
            <button
              onClick={handleOpenCrear}
              className="px-5 py-2.5 text-xs uppercase tracking-[0.2em]"
              style={{
                border: "1px solid rgba(212,175,55,0.4)",
                color: "#d4af37",
              }}
            >
              + Nuevo Insumo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materialesFiltrados.map((mat) => {
              const esStockBajo = mat.stockActual <= mat.stockMinimo;
              const ratioStock =
                mat.stockMinimo > 0
                  ? Math.min(100, (mat.stockActual / (mat.stockMinimo * 2)) * 100)
                  : 100;

              const specs = parseEspecificacionesMaterial(mat.categoria.nombre, mat.notas);

              return (
                <div
                  key={mat.id}
                  className="group relative flex flex-col justify-between rounded-sm overflow-hidden"
                  style={{
                    backgroundColor: "#0c0c0c",
                    border: esStockBajo
                      ? "1px solid rgba(239,68,68,0.3)"
                      : specs.esSoporte
                      ? "1px solid rgba(212,175,55,0.22)"
                      : "1px solid rgba(212,175,55,0.14)",
                    transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = esStockBajo
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(212,175,55,0.45)";
                    e.currentTarget.style.boxShadow =
                      "0 15px 40px -10px rgba(212,175,55,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = esStockBajo
                      ? "rgba(239,68,68,0.3)"
                      : specs.esSoporte
                      ? "1px solid rgba(212,175,55,0.22)"
                      : "1px solid rgba(212,175,55,0.14)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="p-6 pb-4">
                    {/* Categoría y Tipo */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-sm"
                          style={{
                            backgroundColor: "rgba(212,175,55,0.08)",
                            border: "1px solid rgba(212,175,55,0.25)",
                            color: "#d4af37",
                          }}
                        >
                          {mat.categoria.nombre}
                        </span>

                        {specs.esSoporte && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-300 border border-zinc-700">
                            Pieza con Medida
                          </span>
                        )}

                        {specs.esHerramienta && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {specs.esSet ? `Estuche (${specs.piezasSet || "?"} piezas)` : "Herramienta Taller"}
                          </span>
                        )}
                      </div>

                      {esStockBajo && (
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-sm">
                          <AlertTriangle size={11} /> Stock Crítico
                        </span>
                      )}
                    </div>

                    {/* Nombre del insumo */}
                    <h2
                      className="text-xl font-light text-white mb-2 leading-snug group-hover:text-amber-100 transition-colors"
                      style={{
                        fontFamily: "var(--font-cormorant)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {mat.nombre}
                    </h2>

                    {/* SELLO DE MEDIDAS (SI ES LIENZO / SOPORTE) */}
                    {specs.esSoporte && (specs.anchoCm || specs.tipoMaterial) && (
                      <div
                        className="my-3 p-3 rounded-sm flex items-center gap-2.5 text-xs"
                        style={{
                          backgroundColor: "rgba(18,18,18,0.9)",
                          border: "1px solid rgba(212,175,55,0.3)",
                        }}
                      >
                        <Ruler size={16} className="text-amber-400 shrink-0" />
                        <div className="leading-snug">
                          {specs.anchoCm && specs.altoCm && (
                            <p className="text-white font-mono font-medium">
                              {specs.anchoCm} × {specs.altoCm} cm
                              {specs.perfilCm ? ` · Perfil ${specs.perfilCm} cm` : ""}
                            </p>
                          )}
                          {specs.tipoMaterial && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {specs.tipoMaterial}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SELLO DE HERRAMIENTA / ESTUCHE DE PINCELES */}
                    {specs.esHerramienta && (
                      <div
                        className="my-3 p-3 rounded-sm flex items-center gap-2.5 text-xs"
                        style={{
                          backgroundColor: "rgba(18,18,18,0.9)",
                          border: "1px solid rgba(212,175,55,0.25)",
                        }}
                      >
                        <Paintbrush size={16} className="text-amber-400 shrink-0" />
                        <div className="leading-snug">
                          <p className="text-white font-medium">
                            {specs.esSet
                              ? `Estuche (${specs.piezasSet ? `${specs.piezasSet} pinceles` : "Set variado"})`
                              : "Herramienta individual reutilizable"}
                          </p>
                          {specs.tipoCerda ? (
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              Cerda / Material: <span className="text-zinc-300">{specs.tipoCerda}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-zinc-500 mt-0.5 italic">
                              Activo duradero del taller
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Proveedor */}
                    {mat.proveedor && (
                      <p className="text-xs text-zinc-500 mb-4">
                        Proveedor: <span className="text-zinc-400">{mat.proveedor}</span>
                      </p>
                    )}

                    {/* Barra de progreso de stock */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-zinc-400 font-light">
                          {specs.esSoporte
                            ? "Piezas listas en Taller:"
                            : specs.esHerramienta
                            ? specs.esSet
                              ? "Estuches en Taller:"
                              : "Herramientas en Taller:"
                            : "Disponibilidad en Taller:"}
                        </span>
                        <span
                          className={`font-mono font-medium ${
                            esStockBajo ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {mat.stockActual}{" "}
                          {specs.esSoporte
                            ? "piezas"
                            : specs.esHerramienta
                            ? specs.esSet
                              ? "estuche(s)"
                              : "herramienta(s)"
                            : mat.unidad}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            esStockBajo
                              ? "bg-rose-500"
                              : "bg-gradient-to-r from-amber-600 to-emerald-500"
                          }`}
                          style={{ width: `${Math.max(5, ratioStock)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1 flex justify-between">
                        <span>
                          Mínimo requerido: {mat.stockMinimo}{" "}
                          {specs.esSoporte
                            ? "piezas"
                            : specs.esHerramienta
                            ? specs.esSet
                              ? "estuche(s)"
                              : "herramienta(s)"
                            : mat.unidad}
                        </span>
                        <span>{mat.stockActual > mat.stockMinimo ? "Abastecido" : "Reponer"}</span>
                      </p>
                    </div>

                    {/* Métricas de costos */}
                    <div
                      className="p-3 rounded-sm flex items-center justify-between mb-4"
                      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                    >
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                          Costo por{" "}
                          {specs.esSoporte
                            ? "Lienzo"
                            : specs.esHerramienta
                            ? specs.esSet
                              ? "Estuche"
                              : "Herramienta"
                            : "Unidad"}
                        </p>
                        <p className="text-sm font-light text-white mt-0.5">
                          ${mat.costoUnitario.toFixed(2)}{" "}
                          <span className="text-[10px] text-zinc-500 font-sans">
                            /{specs.esSoporte ? "pieza" : specs.esHerramienta ? (specs.esSet ? "estuche" : "herramienta") : mat.unidad}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                          Total en Almacén
                        </p>
                        <p
                          className="text-sm font-light text-amber-300 mt-0.5"
                          style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}
                        >
                          ${(mat.stockActual * mat.costoUnitario).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* ACCIONES DE TRAZABILIDAD INTELIGENTE */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900">
                      <button
                        onClick={() => handleOpenEntrada(mat)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-[10px] uppercase tracking-wider rounded-sm transition-all"
                        style={{
                          backgroundColor: "rgba(16,185,129,0.08)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          color: "#34d399",
                        }}
                      >
                        <ArrowUpRight size={13} />
                        + {specs.esSoporte ? "Comprar Lienzos" : "Registrar Compra"}
                      </button>

                      <button
                        onClick={() => handleOpenSalida(mat)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-[10px] uppercase tracking-wider rounded-sm transition-all"
                        style={{
                          backgroundColor: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171",
                        }}
                      >
                        <ArrowDownRight size={13} />
                        - Registrar Salida
                      </button>
                    </div>

                    {/* Botón de Salida Rápida Personalizado */}
                    <button
                      onClick={() => handleSalidaRapida(mat)}
                      className="w-full mt-2 py-1.5 px-2 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-amber-200 border border-zinc-800 hover:border-amber-500/40 rounded-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={11} className="text-amber-400" />
                      {specs.esSoporte
                        ? `Asignar 1 ${specs.anchoCm ? `(${specs.anchoCm}×${specs.altoCm})` : "pieza"} a Cuadro Nuevo`
                        : `Marcar 1 ${mat.unidad} como Terminado`}
                    </button>
                  </div>

                  {/* Pie de tarjeta con Historial y Edición */}
                  <div
                    className="px-6 py-3 border-t flex items-center justify-between"
                    style={{ borderColor: "rgba(212,175,55,0.08)" }}
                  >
                    <button
                      onClick={() => handleOpenHistorial(mat)}
                      className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-amber-300 transition-colors"
                    >
                      <History size={13} />
                      <span>Ver Bitácora</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditar(mat)}
                        className="p-1.5 text-zinc-500 hover:text-amber-300 transition-colors"
                        title="Editar ficha"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id, mat.nombre)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Eliminar insumo"
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

      {/* ── MODAL: CREAR / EDITAR FICHA MATERIAL ────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-sm p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(212,175,55,0.35)",
              boxShadow: "0 0 60px rgba(212,175,55,0.15)",
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-2"
                style={{ color: "#d4af37" }}
              >
                ✧ {editingMaterial ? "Modificar Insumo" : "Ingreso al Almacén / Taller"}
              </p>
              <h3
                className="text-3xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {editingMaterial ? editingMaterial.nombre : "Ficha de Material o Soporte"}
              </h3>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitMaterial} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Nombre del Insumo <span style={{ color: "#d4af37" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formTipoRecurso === "soporte"
                      ? "ej: Bastidor con Lienzo de Lino 100x120 cm"
                      : formTipoRecurso === "herramienta"
                      ? "ej: Estuche de Pinceles Profesionales (Set 12 uds)"
                      : "ej: Tubo Acrílico Golden 150ml (Azul Cobalto)"
                  }
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.25)" }}
                />
              </div>

              {/* Selector de Categoría */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Categoría del Taller <span style={{ color: "#d4af37" }}>*</span>
                </label>
                <select
                  value={formCategoriaId}
                  onChange={(e) => handleCambiarCategoriaForm(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.25)" }}
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Naturaleza / Tipo de Recurso */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Naturaleza del Recurso <span style={{ color: "#d4af37" }}>*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormTipoRecurso("soporte");
                      if (formUnidad === "estuche" || formUnidad === "tubo" || formUnidad === "ml") {
                        setFormUnidad("unidad");
                      }
                    }}
                    className={`p-3 text-left rounded-sm border transition-all ${
                      formTipoRecurso === "soporte"
                        ? "bg-amber-500/10 border-amber-500/60 text-white"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs text-amber-300">
                      <Ruler size={13} />
                      Soporte / Lienzo
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                      Pieza física con medidas ($Ancho \times Alto$)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTipoRecurso("herramienta");
                      if (formUnidad === "ml" || formUnidad === "gr" || formUnidad === "pliego") {
                        setFormUnidad("estuche");
                      }
                    }}
                    className={`p-3 text-left rounded-sm border transition-all ${
                      formTipoRecurso === "herramienta"
                        ? "bg-amber-500/10 border-amber-500/60 text-white"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs text-amber-300">
                      <Paintbrush size={13} />
                      Pinceles / Estuche
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                      Herramienta duradera o set reutilizable
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTipoRecurso("consumible");
                      if (formUnidad === "estuche" || formUnidad === "pliego") {
                        setFormUnidad("tubo");
                      }
                    }}
                    className={`p-3 text-left rounded-sm border transition-all ${
                      formTipoRecurso === "consumible"
                        ? "bg-amber-500/10 border-amber-500/60 text-white"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs text-amber-300">
                      <Boxes size={13} />
                      Consumible Gradual
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                      Pinturas, pigmentos, óleos y barnices
                    </p>
                  </button>
                </div>
              </div>

              {/* SI ES SOPORTE: CAMPOS DE DIMENSIONES Y TELA */}
              {formTipoRecurso === "soporte" && (
                <div
                  className="p-4 rounded-sm space-y-3"
                  style={{
                    backgroundColor: "rgba(18,18,18,0.9)",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-amber-300 font-medium flex items-center gap-1.5">
                    <Ruler size={13} /> Dimensiones Físicas & Especificación de Soporte:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        Ancho (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="ej: 100"
                        value={formAnchoCm}
                        onChange={(e) => setFormAnchoCm(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                        style={{ borderColor: "rgba(212,175,55,0.25)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        Alto (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="ej: 120"
                        value={formAltoCm}
                        onChange={(e) => setFormAltoCm(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                        style={{ borderColor: "rgba(212,175,55,0.25)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        Grosor Bastidor
                      </label>
                      <select
                        value={formPerfilCm}
                        onChange={(e) => setFormPerfilCm(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                        style={{ borderColor: "rgba(212,175,55,0.25)" }}
                      >
                        <option value="2">2 cm (Estándar)</option>
                        <option value="3.5">3.5 cm (Museo)</option>
                        <option value="4">4 cm (Galería 3D)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        Tela / Composición
                      </label>
                      <input
                        type="text"
                        placeholder="Lino, Algodón, Madera"
                        value={formTipoTela}
                        onChange={(e) => setFormTipoTela(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                        style={{ borderColor: "rgba(212,175,55,0.25)" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SI ES HERRAMIENTA / ESTUCHE DE PINCELES */}
              {formTipoRecurso === "herramienta" && (
                <div
                  className="p-4 rounded-sm space-y-3"
                  style={{
                    backgroundColor: "rgba(18,18,18,0.9)",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-amber-300 font-medium flex items-center gap-1.5">
                      <Paintbrush size={13} /> Especificación de Herramienta / Estuche:
                    </p>
                    <span className="text-[10px] text-zinc-400 italic">
                      Activo reutilizable en el taller
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                        ¿Formato de compra?
                      </label>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="radio"
                            name="esSetRadio"
                            checked={formEsSet}
                            onChange={() => {
                              setFormEsSet(true);
                              setFormUnidad("estuche");
                            }}
                            className="text-amber-500"
                          />
                          Estuche / Set
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="radio"
                            name="esSetRadio"
                            checked={!formEsSet}
                            onChange={() => {
                              setFormEsSet(false);
                              setFormUnidad("unidad");
                            }}
                            className="text-amber-500"
                          />
                          Pincel suelto
                        </label>
                      </div>
                    </div>

                    {formEsSet && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                          Piezas del Estuche
                        </label>
                        <input
                          type="number"
                          placeholder="ej: 12"
                          value={formPiezasSet}
                          onChange={(e) => setFormPiezasSet(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                          style={{ borderColor: "rgba(212,175,55,0.25)" }}
                        />
                      </div>
                    )}

                    <div className={formEsSet ? "" : "sm:col-span-2"}>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                        Tipo de Cerda / Material
                      </label>
                      <input
                        type="text"
                        placeholder="ej: Sintética suave Toray, Pelo de marta, Cerda de cerdo"
                        value={formTipoCerda}
                        onChange={(e) => setFormTipoCerda(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                        style={{ borderColor: "rgba(212,175,55,0.25)" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Unidad y Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Unidad
                  </label>
                  <select
                    value={formUnidad}
                    onChange={(e) => setFormUnidad(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  >
                    {formTipoRecurso === "soporte" &&
                      UNIDADES_SOPORTES.map((u) => (
                        <option key={u.value} value={u.value} className="bg-zinc-900">
                          {u.label}
                        </option>
                      ))}
                    {formTipoRecurso === "herramienta" &&
                      UNIDADES_HERRAMIENTAS.map((u) => (
                        <option key={u.value} value={u.value} className="bg-zinc-900">
                          {u.label}
                        </option>
                      ))}
                    {formTipoRecurso === "consumible" &&
                      UNIDADES_FLUIDOS.map((u) => (
                        <option key={u.value} value={u.value} className="bg-zinc-900">
                          {u.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    {formTipoRecurso === "soporte"
                      ? "Lienzos en Taller"
                      : formTipoRecurso === "herramienta"
                      ? formEsSet
                        ? "Estuches en Taller"
                        : "Pinceles en Taller"
                      : "Stock Actual"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formStockActual}
                    onChange={(e) => setFormStockActual(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Mínimo Alerta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formStockMinimo}
                    onChange={(e) => setFormStockMinimo(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Costo Unit. ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formCostoUnitario}
                    onChange={(e) => setFormCostoUnitario(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Proveedor / Tienda de Arte
                </label>
                <input
                  type="text"
                  placeholder="ej: Tienda Bellas Artes / Importadora"
                  value={formProveedor}
                  onChange={(e) => setFormProveedor(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.25)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Notas de Taller (Privadas)
                </label>
                <input
                  type="text"
                  placeholder="ej: Bastidor reforzado en cruz para evitar torsión."
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.25)" }}
                />
              </div>

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
                  disabled={submitting}
                  className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium"
                  style={{
                    backgroundColor: "rgba(212,175,55,0.15)",
                    border: "1px solid rgba(212,175,55,0.5)",
                    color: "#d4af37",
                  }}
                >
                  {submitting
                    ? "Guardando..."
                    : editingMaterial
                    ? "Actualizar Ficha"
                    : "Guardar en Almacén"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRAR MOVIMIENTO (ENTRADA / SALIDA) ── */}
      {modalMovimientoOpen && materialParaMovimiento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-lg rounded-sm p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border:
                movTipo === "entrada"
                  ? "1px solid rgba(16,185,129,0.4)"
                  : "1px solid rgba(239,68,68,0.4)",
              boxShadow: "0 0 60px rgba(0,0,0,0.8)",
            }}
          >
            <button
              onClick={() => setModalMovimientoOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p
                className={`text-[10px] uppercase tracking-[0.3em] mb-1 ${
                  movTipo === "entrada" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {movTipo === "entrada"
                  ? "↑ Ingreso por Compra / Reposición"
                  : "↓ Descuento de Stock Justificado"}
              </p>
              <h3
                className="text-2xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {materialParaMovimiento.nombre}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Stock actual:{" "}
                <span className="text-white font-mono font-medium">
                  {materialParaMovimiento.stockActual} {materialParaMovimiento.unidad}
                </span>
              </p>
            </div>

            {errorMov && (
              <div className="mb-4 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                {errorMov}
              </div>
            )}

            <form onSubmit={handleSubmitMovimiento} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Cantidad a {movTipo === "entrada" ? "ingresar" : "descontar"} ({materialParaMovimiento.unidad})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={movCantidad}
                  onChange={(e) => setMovCantidad(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.25)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  {movTipo === "entrada" ? "Detalle o Procedencia de Compra" : "Motivo de la Salida"}
                </label>
                <input
                  type="text"
                  placeholder={
                    movTipo === "entrada"
                      ? "ej: Compra en Bellas Artes / Factura #492"
                      : "ej: Usado en nuevo cuadro de 100x120 cm o tela rasgada"
                  }
                  value={movMotivo}
                  onChange={(e) => setMovMotivo(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.25)" }}
                />
              </div>

              {movTipo === "entrada" && (
                <>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                      Costo Unitario de esta compra ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={movNuevoCosto}
                      onChange={(e) => setMovNuevoCosto(e.target.value)}
                      placeholder={String(materialParaMovimiento.costoUnitario)}
                      className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                      style={{ borderColor: "rgba(212,175,55,0.25)" }}
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="checkGasto"
                      checked={movRegistrarGasto}
                      onChange={(e) => setMovRegistrarGasto(e.target.checked)}
                      className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="checkGasto" className="text-xs text-zinc-300 cursor-pointer">
                      Registrar automáticamente como gasto en{" "}
                      <span style={{ color: "#d4af37" }}>Finanzas</span>
                    </label>
                  </div>
                </>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalMovimientoOpen(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingMov}
                  className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium"
                  style={{
                    backgroundColor:
                      movTipo === "entrada"
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(239,68,68,0.2)",
                    border:
                      movTipo === "entrada"
                        ? "1px solid rgba(16,185,129,0.5)"
                        : "1px solid rgba(239,68,68,0.5)",
                    color: movTipo === "entrada" ? "#34d399" : "#f87171",
                  }}
                >
                  {submittingMov
                    ? "Registrando..."
                    : movTipo === "entrada"
                    ? "Confirmar Entrada"
                    : "Confirmar Salida"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: HISTORIAL / BITÁCORA DE MOVIMIENTOS ── */}
      {modalHistorialOpen && materialHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-sm p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(212,175,55,0.35)",
              boxShadow: "0 0 60px rgba(212,175,55,0.15)",
            }}
          >
            <button
              onClick={() => setModalHistorialOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-1"
                style={{ color: "#d4af37" }}
              >
                ✧ Bitácora de Taller / Kárdex
              </p>
              <h3
                className="text-2xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {materialHistorial.nombre}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {loadingHistorial ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Cargando bitácora...
                </div>
              ) : historialItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 p-6">
                  Aún no se han registrado movimientos para este material.
                </div>
              ) : (
                historialItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-sm flex items-center justify-between border"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderColor:
                        item.tipo === "entrada"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-sm ${
                          item.tipo === "entrada"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {item.tipo === "entrada" ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">
                          {item.motivo || (item.tipo === "entrada" ? "Entrada" : "Salida")}
                        </p>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {new Date(item.fecha).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-mono font-medium ${
                          item.tipo === "entrada"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {item.tipo === "entrada" ? "+" : "-"}
                        {item.cantidad} {materialHistorial.unidad}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-zinc-900 mt-4 flex justify-end">
              <button
                onClick={() => setModalHistorialOpen(false)}
                className="px-5 py-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
              >
                Cerrar Bitácora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
