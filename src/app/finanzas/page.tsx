"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sliders,
  Scale,
  Calendar,
  X,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2,
  User,
  Tag,
  Globe2,
  MapPin,
  ShieldAlert,
  Save,
} from "lucide-react";
import { parsePreciosDeNotas, formatNotasConPrecios } from "@/lib/precios";

interface Obra {
  id: number;
  titulo: string;
  estado: string;
  anchoCm: number | null;
  altoCm: number | null;
  notas: string | null;
  tecnica: { nombre: string };
}

interface Venta {
  id: number;
  precioVenta: number;
  fechaVenta: string;
  comprador: string | null;
  comisionGaleria: number;
  notas: string | null;
  obra: Obra;
}

interface Gasto {
  id: number;
  concepto: string;
  categoria: string;
  monto: number;
  fecha: string;
  notas: string | null;
}

export default function FinanzasPage() {
  const [balance, setBalance] = useState({
    totalVentas: 0,
    totalGastosTaller: 0,
    totalRetirosGanancia: 0,
    fondoTrabajoDisponible: 0,
    ventasRecientes: [] as Venta[],
    gastosRecientes: [] as Gasto[],
    retirosRecientes: [] as Gasto[],
  });

  const [todasLasObras, setTodasLasObras] = useState<Obra[]>([]);
  const [obrasDisponibles, setObrasDisponibles] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  // Pestañas
  const [activeTab, setActiveTab] = useState<"ventas" | "gastos" | "retiros" | "simulador">(
    "simulador"
  );

  // Modales
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalRetiroOpen, setModalRetiroOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Formulario Venta
  const [ventaObraId, setVentaObraId] = useState<number | "">("");
  const [ventaPrecio, setVentaPrecio] = useState("");
  const [ventaComprador, setVentaComprador] = useState("");
  const [ventaComision, setVentaComision] = useState("0");
  const [ventaNotas, setVentaNotas] = useState("");

  // Formulario Gasto
  const [gastoConcepto, setGastoConcepto] = useState("");
  const [gastoCategoria, setGastoCategoria] = useState("Estudio");
  const [gastoMonto, setGastoMonto] = useState("");
  const [gastoNotas, setGastoNotas] = useState("");

  // Formulario Retiro de Ganancia
  const [retiroMonto, setRetiroMonto] = useState("");
  const [retiroMotivo, setRetiroMotivo] = useState("Retiro de utilidades Avril");
  const [retiroNotas, setRetiroNotas] = useState("");

  // ── ESTADO DEL SIMULADOR ESTRATÉGICO DE PRECIOS ──
  const [simObraSeleccionadaId, setSimObraSeleccionadaId] = useState<number | "">("");
  const [simAncho, setSimAncho] = useState(80);
  const [simAlto, setSimAlto] = useState(100);
  const [simCostoMateriales, setSimCostoMateriales] = useState(45);
  const [simHorasTrabajo, setSimHorasTrabajo] = useState(18);
  const [simTarifaHoraLocal, setSimTarifaHoraLocal] = useState(8);
  const [simMargenDeseadoLocal, setSimMargenDeseadoLocal] = useState(60);
  const [simCoeficienteLocal, setSimCoeficienteLocal] = useState(2.2);
  const [simCoeficienteInternacional, setSimCoeficienteInternacional] = useState(8);
  const [simComisionGaleria, setSimComisionGaleria] = useState(0);
  const [precioLocalManual, setPrecioLocalManual] = useState("");
  const [precioIntManual, setPrecioIntManual] = useState("");
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState("");

  // Carga de datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resBalance, resTodas, resDisp] = await Promise.all([
        fetch("/api/finanzas/balance"),
        fetch("/api/obras"),
        fetch("/api/obras?estado=Disponible"),
      ]);

      if (resBalance.ok) {
        const dataB = await resBalance.json();
        setBalance(dataB);
      }
      if (resTodas.ok) {
        const dataT = await resTodas.json();
        setTodasLasObras(dataT);
        if (dataT.length > 0 && !simObraSeleccionadaId) {
          setSimObraSeleccionadaId(dataT[0].id);
          if (dataT[0].anchoCm) setSimAncho(dataT[0].anchoCm);
          if (dataT[0].altoCm) setSimAlto(dataT[0].altoCm);
        }
      }
      if (resDisp.ok) {
        const dataD = await resDisp.json();
        setObrasDisponibles(dataD);
        if (dataD.length > 0 && !ventaObraId) {
          setVentaObraId(dataD[0].id);
          const { precioLocal } = parsePreciosDeNotas(dataD[0].notas);
          if (precioLocal) setVentaPrecio(String(precioLocal));
        }
      }
    } catch (err) {
      console.error("Error al cargar finanzas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Al cambiar la obra seleccionada en el simulador
  const handleSeleccionarObraSimulador = (id: number | "") => {
    setSimObraSeleccionadaId(id);
    setMensajeGuardado("");
    if (!id) {
      setPrecioLocalManual("");
      setPrecioIntManual("");
      return;
    }

    const obra = todasLasObras.find((o) => o.id === Number(id));
    if (obra) {
      if (obra.anchoCm) setSimAncho(obra.anchoCm);
      if (obra.altoCm) setSimAlto(obra.altoCm);
      const { precioLocal, precioInt } = parsePreciosDeNotas(obra.notas);
      setPrecioLocalManual(precioLocal ? String(precioLocal) : "");
      setPrecioIntManual(precioInt ? String(precioInt) : "");
    }
  };

  // Al cambiar obra en el modal de venta, autocompletar precio sugerido si existe
  const handleCambiarObraVenta = (id: number) => {
    setVentaObraId(id);
    const obra = obrasDisponibles.find((o) => o.id === id);
    if (obra) {
      const { precioLocal } = parsePreciosDeNotas(obra.notas);
      if (precioLocal) {
        setVentaPrecio(String(precioLocal));
      } else {
        setVentaPrecio("");
      }
    }
  };

  // Registrar Venta
  const handleSubmitVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventaObraId) {
      setErrorMessage("Selecciona una obra para registrar la venta.");
      return;
    }
    const precioNum = parseFloat(ventaPrecio);
    if (!precioNum || precioNum <= 0) {
      setErrorMessage("Ingresa el precio de venta acordado.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const res = await fetch("/api/finanzas/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          obraId: Number(ventaObraId),
          precioVenta: precioNum,
          comprador: ventaComprador,
          comisionGaleria: parseFloat(ventaComision) || 0,
          notas: ventaNotas,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "No se pudo registrar la venta.");
      }

      setModalVentaOpen(false);
      setVentaPrecio("");
      setVentaComprador("");
      setVentaComision("0");
      setVentaNotas("");
      await cargarDatos();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar la venta.");
    } finally {
      setSubmitting(false);
    }
  };

  // Registrar Gasto Operativo
  const handleSubmitGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoConcepto.trim()) {
      setErrorMessage("Indica el concepto del gasto.");
      return;
    }
    const montoNum = parseFloat(gastoMonto);
    if (!montoNum || montoNum <= 0) {
      setErrorMessage("El monto debe ser mayor a 0.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const res = await fetch("/api/finanzas/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepto: gastoConcepto,
          categoria: gastoCategoria,
          monto: montoNum,
          notas: gastoNotas,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "No se pudo registrar el gasto.");
      }

      setModalGastoOpen(false);
      setGastoConcepto("");
      setGastoMonto("");
      setGastoNotas("");
      await cargarDatos();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el gasto.");
    } finally {
      setSubmitting(false);
    }
  };

  // Registrar Retiro de Ganancia
  const handleSubmitRetiro = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(retiroMonto);
    if (!montoNum || montoNum <= 0) {
      setErrorMessage("El monto a retirar debe ser mayor a 0.");
      return;
    }
    if (montoNum > balance.fondoTrabajoDisponible && balance.fondoTrabajoDisponible > 0) {
      if (
        !confirm(
          `Atención: El retiro solicitado ($${montoNum}) supera el Fondo de Trabajo disponible ($${balance.fondoTrabajoDisponible}). ¿Deseas continuar igualmente?`
        )
      ) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const res = await fetch("/api/finanzas/retiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monto: montoNum,
          motivo: retiroMotivo,
          notas: retiroNotas,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "No se pudo registrar el retiro.");
      }

      setModalRetiroOpen(false);
      setRetiroMonto("");
      setRetiroNotas("");
      await cargarDatos();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el retiro.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── CÁLCULOS ESTRATÉGICOS DEL SIMULADOR ──────────
  const calculosEstrategicos = useMemo(() => {
    const ancho = Number(simAncho) || 0;
    const alto = Number(simAlto) || 0;
    const perimetroSuma = ancho + alto;

    const costoMateriales = Number(simCostoMateriales) || 0;
    const horas = Number(simHorasTrabajo) || 0;
    const tarifaHora = Number(simTarifaHoraLocal) || 0;
    const valorTiempo = horas * tarifaHora;
    const costoTotalProduccion = costoMateriales + valorTiempo;

    // Piso mínimo
    const precioPisoSeguridad = Number((costoMateriales + valorTiempo * 0.5).toFixed(2));

    // Precio Local Sugerido
    const precioPorCostoLocal = costoTotalProduccion * (1 + simMargenDeseadoLocal / 100);
    const precioPorCoeficienteLocal = perimetroSuma * simCoeficienteLocal;
    const precioLocalSugerido = Math.round(
      Math.max(precioPisoSeguridad, (precioPorCostoLocal + precioPorCoeficienteLocal) / 2)
    );
    const gananciaLimpiaLocal = precioLocalSugerido - costoMateriales;

    // Precio Internacional
    const precioInternacionalSugerido = Math.round(perimetroSuma * simCoeficienteInternacional);
    const comisionDeducidaInt = (precioInternacionalSugerido * simComisionGaleria) / 100;
    const ingresoNetoInternacional = precioInternacionalSugerido - comisionDeducidaInt;
    const gananciaLimpiaInternacional = ingresoNetoInternacional - costoMateriales;

    return {
      costoMateriales,
      valorTiempo,
      costoTotalProduccion,
      precioPisoSeguridad,
      precioLocalSugerido,
      gananciaLimpiaLocal,
      precioInternacionalSugerido,
      comisionDeducidaInt,
      ingresoNetoInternacional,
      gananciaLimpiaInternacional,
      perimetroSuma,
    };
  }, [
    simAncho,
    simAlto,
    simCostoMateriales,
    simHorasTrabajo,
    simTarifaHoraLocal,
    simMargenDeseadoLocal,
    simCoeficienteLocal,
    simCoeficienteInternacional,
    simComisionGaleria,
  ]);

  // ── GUARDAR PRECIOS EN LA OBRA ───────────────────
  const handleGuardarPreciosEnObra = async () => {
    if (!simObraSeleccionadaId) {
      alert("Selecciona una obra de tu catálogo para asignarle estos precios.");
      return;
    }

    const obra = todasLasObras.find((o) => o.id === Number(simObraSeleccionadaId));
    if (!obra) return;

    try {
      setGuardandoPrecio(true);
      setMensajeGuardado("");

      const precioLocalDefinitivo =
        precioLocalManual !== ""
          ? parseFloat(precioLocalManual)
          : calculosEstrategicos.precioLocalSugerido;

      const precioIntDefinitivo =
        precioIntManual !== ""
          ? parseFloat(precioIntManual)
          : calculosEstrategicos.precioInternacionalSugerido;

      const nuevasNotas = formatNotasConPrecios(
        precioLocalDefinitivo,
        precioIntDefinitivo,
        obra.notas
      );

      const res = await fetch(`/api/obras/${obra.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchoCm: simAncho,
          altoCm: simAlto,
          notas: nuevasNotas,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudieron guardar los precios.");
      }

      setMensajeGuardado(
        `✓ Precios fijados para "${obra.titulo}": Local $${precioLocalDefinitivo} USD · Int. $${precioIntDefinitivo} USD`
      );

      // Actualizar listas locales
      await cargarDatos();
    } catch (e: any) {
      alert(e.message || "Error al guardar precios.");
    } finally {
      setGuardandoPrecio(false);
    }
  };

  return (
    <div className="min-h-full pb-24" style={{ backgroundColor: "#000000" }}>
      {/* ── HEADER TESORERÍA & FONDO DE TRABAJO ──────── */}
      <div
        className="relative px-10 py-12 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 45% 70% at 90% 40%, rgba(212,175,55,0.08) 0%, transparent 75%)",
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "#d4af37" }}
            >
              ◉ Tesorería, Fondo de Trabajo & Cotización de Obras · L&apos;Art d&apos;Avril
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
              Control Financiero & Cotización
            </h1>
            <p className="mt-2 text-sm max-w-xl" style={{ color: "#8c8c8c" }}>
              Simula, fija y guarda los precios oficiales de cada obra en su ficha técnica.
              El dinero de cada venta ingresa completo al fondo de trabajo del taller.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setErrorMessage("");
                setModalVentaOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.18em] font-medium transition-all"
              style={{
                backgroundColor: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.4)",
                color: "#34d399",
                boxShadow: "0 0 20px rgba(16,185,129,0.1)",
              }}
            >
              <ArrowUpRight size={15} />
              + Registrar Venta
            </button>

            <button
              onClick={() => {
                setErrorMessage("");
                setModalGastoOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.18em] font-medium text-zinc-300 transition-all border border-zinc-800 hover:border-zinc-700 bg-zinc-950"
            >
              <Receipt size={14} className="text-zinc-500" />
              - Gasto Taller
            </button>

            <button
              onClick={() => {
                setErrorMessage("");
                setModalRetiroOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.18em] font-medium transition-all"
              style={{
                backgroundColor: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.35)",
                color: "#d4af37",
              }}
            >
              <Wallet size={14} />
              Retirar Ganancia
            </button>
          </div>
        </div>

        {/* ── LAS 4 CINTAS DE TESORERÍA ─────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <div
            className="p-5 rounded-sm relative overflow-hidden"
            style={{
              backgroundColor: "rgba(18,18,18,0.85)",
              border: "1px solid rgba(212,175,55,0.35)",
              boxShadow: "0 0 35px rgba(212,175,55,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p
                className="text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "#d4af37" }}
              >
                🏛️ Fondo de Trabajo Actual
              </p>
              <span className="text-[10px] text-zinc-500 font-mono">Caja Taller</span>
            </div>
            <p
              className="text-3xl font-light mt-1"
              style={{ fontFamily: "var(--font-cormorant)", color: "#ffffff" }}
            >
              ${balance.fondoTrabajoDisponible.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-500">USD</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">
              Capital líquido libre para operar y comprar lienzos.
            </p>
          </div>

          <div
            className="p-5 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 mb-1">
              📈 Recaudación Total Ventas
            </p>
            <p
              className="text-3xl font-light mt-1 text-emerald-300"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              ${balance.totalVentas.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-500">USD</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">
              Ingresos brutos cobrados por obras vendidas.
            </p>
          </div>

          <div
            className="p-5 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-rose-400/80 mb-1">
              🧾 Gastos & Insumos Pagados
            </p>
            <p
              className="text-3xl font-light mt-1 text-rose-300"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              ${balance.totalGastosTaller.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-500">USD</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">
              Materiales importados, marcos y taller.
            </p>
          </div>

          <div
            className="p-5 rounded-sm"
            style={{
              backgroundColor: "rgba(18,18,18,0.7)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80 mb-1">
              💎 Ganancias Retiradas
            </p>
            <p
              className="text-3xl font-light mt-1 text-amber-300"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              ${balance.totalRetirosGanancia.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-500">USD</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">
              Utilidades cobradas libres por la artista.
            </p>
          </div>
        </div>
      </div>

      {/* ── SELECTOR DE PESTAÑAS ─────────────────────── */}
      <div
        className="px-10 border-b flex items-center gap-6"
        style={{ borderColor: "rgba(212,175,55,0.12)" }}
      >
        <button
          onClick={() => setActiveTab("simulador")}
          className={`py-4 text-xs uppercase tracking-[0.2em] transition-colors relative flex items-center gap-1.5 ${
            activeTab === "simulador"
              ? "text-amber-300 font-medium"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Sparkles size={13} className="text-amber-400" />
          Simulador & Fijación de Precios de Obras
          {activeTab === "simulador" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("ventas")}
          className={`py-4 text-xs uppercase tracking-[0.2em] transition-colors relative ${
            activeTab === "ventas" ? "text-emerald-400 font-medium" : "text-zinc-500 hover:text-white"
          }`}
        >
          Obras Vendidas ({balance.ventasRecientes.length})
          {activeTab === "ventas" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("gastos")}
          className={`py-4 text-xs uppercase tracking-[0.2em] transition-colors relative ${
            activeTab === "gastos" ? "text-rose-400 font-medium" : "text-zinc-500 hover:text-white"
          }`}
        >
          Gastos del Taller ({balance.gastosRecientes.length})
          {activeTab === "gastos" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("retiros")}
          className={`py-4 text-xs uppercase tracking-[0.2em] transition-colors relative ${
            activeTab === "retiros" ? "text-amber-400 font-medium" : "text-zinc-500 hover:text-white"
          }`}
        >
          Retiros de Ganancia ({balance.retirosRecientes.length})
          {activeTab === "retiros" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>
      </div>

      {/* ── CONTENIDO PRINCIPAL POR PESTAÑA ─────────── */}
      <div className="px-10 py-10">
        {/* PESTAÑA PRINCIPAL: SIMULADOR & GUARDADO DE PRECIOS */}
        {activeTab === "simulador" && (
          <div className="max-w-5xl mx-auto">
            {/* SELECCIONAR OBRA PARA ASIGNAR PRECIO */}
            <div
              className="p-5 rounded-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                backgroundColor: "rgba(18,18,18,0.9)",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-medium block mb-1">
                  ✧ Seleccionar Obra del Catálogo para Cotizar y Fijar Precio:
                </span>
                <select
                  value={simObraSeleccionadaId}
                  onChange={(e) => handleSeleccionarObraSimulador(Number(e.target.value))}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.4)" }}
                >
                  {todasLasObras.map((o) => (
                    <option key={o.id} value={o.id} className="bg-zinc-900">
                      {o.titulo} ({o.tecnica?.nombre} · {o.anchoCm || "?"}×{o.altoCm || "?"} cm) · [{o.estado}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Guardar Precios */}
              <button
                onClick={handleGuardarPreciosEnObra}
                disabled={guardandoPrecio || !simObraSeleccionadaId}
                className="flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-all shrink-0"
                style={{
                  backgroundColor: "rgba(212,175,55,0.18)",
                  border: "1px solid rgba(212,175,55,0.6)",
                  color: "#d4af37",
                  boxShadow: "0 0 25px rgba(212,175,55,0.15)",
                }}
              >
                <Save size={15} />
                {guardandoPrecio ? "Fijando..." : "💾 Guardar Precios en la Obra"}
              </button>
            </div>

            {mensajeGuardado && (
              <div className="p-3.5 mb-6 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                {mensajeGuardado}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* COLUMNA IZQUIERDA: PARÁMETROS REALES (5 COLS) */}
              <div
                className="lg:col-span-5 p-6 rounded-sm space-y-5"
                style={{
                  backgroundColor: "#0c0c0c",
                  border: "1px solid rgba(212,175,55,0.2)",
                }}
              >
                <div className="border-b pb-3" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                  <h4
                    className="text-lg font-light text-white"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    1. Dimensiones & Materiales Reales
                  </h4>
                  <p className="text-[10px] text-zinc-500">
                    Afecta tanto a tus costos como a la cotización final.
                  </p>
                </div>

                {/* Medidas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                      Ancho (cm)
                    </label>
                    <input
                      type="number"
                      value={simAncho}
                      onChange={(e) => setSimAncho(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                      style={{ borderColor: "rgba(212,175,55,0.3)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                      Alto (cm)
                    </label>
                    <input
                      type="number"
                      value={simAlto}
                      onChange={(e) => setSimAlto(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                      style={{ borderColor: "rgba(212,175,55,0.3)" }}
                    />
                  </div>
                </div>

                {/* Costo Materiales Importados */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Costo Materiales Usados ($ USD)
                    </label>
                    <span className="text-xs font-mono text-rose-300 font-medium">
                      ${simCostoMateriales} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="5"
                    value={simCostoMateriales}
                    onChange={(e) => setSimCostoMateriales(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Lienzo/bastidor importado + acrílicos/óleos + barniz protector.
                  </p>
                </div>

                {/* Horas y Tarifa */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                      Horas de Taller
                    </label>
                    <input
                      type="number"
                      value={simHorasTrabajo}
                      onChange={(e) => setSimHorasTrabajo(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                      style={{ borderColor: "rgba(212,175,55,0.3)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                      Tarifa Avril ($/h)
                    </label>
                    <input
                      type="number"
                      value={simTarifaHoraLocal}
                      onChange={(e) => setSimTarifaHoraLocal(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-zinc-950 border rounded-sm text-white focus:outline-none"
                      style={{ borderColor: "rgba(212,175,55,0.3)" }}
                    />
                  </div>
                </div>

                {/* Desglose de Costos Base */}
                <div className="p-3 bg-zinc-950 rounded-sm border border-zinc-900 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Gasto en materiales importados:</span>
                    <span className="font-mono text-white">${calculosEstrategicos.costoMateriales}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Valor del tiempo de Avril:</span>
                    <span className="font-mono text-white">${calculosEstrategicos.valorTiempo}</span>
                  </div>
                  <div className="flex justify-between text-amber-300 font-medium pt-1 border-t border-zinc-900">
                    <span>Costo Total de Producción:</span>
                    <span className="font-mono">${calculosEstrategicos.costoTotalProduccion} USD</span>
                  </div>
                </div>

                {/* Ajuste de Coeficientes */}
                <div className="pt-3 border-t border-zinc-900 space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                        Coeficiente Local (Venezuela):
                      </span>
                      <span className="font-mono text-emerald-400">Punto {simCoeficienteLocal}</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="5.0"
                      step="0.1"
                      value={simCoeficienteLocal}
                      onChange={(e) => setSimCoeficienteLocal(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      Permite bajar a puntos como 0.5 o 0.8 para cuadros pequeños o promociones iniciales.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                        Coeficiente Exterior (Diáspora / Web):
                      </span>
                      <span className="font-mono text-amber-300">Punto {simCoeficienteInternacional}</span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="15.0"
                      step="0.5"
                      value={simCoeficienteInternacional}
                      onChange={(e) => setSimCoeficienteInternacional(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: LOS 2 PRECIOS RECOMENDADOS (7 COLS) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. PRECIO MERCADO LOCAL (VENEZUELA) */}
                <div
                  className="p-6 rounded-sm relative overflow-hidden"
                  style={{
                    backgroundColor: "rgba(18,18,18,0.9)",
                    border: "1px solid rgba(16,185,129,0.35)",
                    boxShadow: "0 0 35px rgba(16,185,129,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-medium">
                      <MapPin size={13} /> Precio Recomendado Mercado Local (Venezuela)
                    </span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Venta Factible
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 my-2">
                    <p
                      className="text-4xl font-light text-white"
                      style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.02em" }}
                    >
                      ${calculosEstrategicos.precioLocalSugerido}{" "}
                      <span className="text-xs font-sans text-zinc-500">USD</span>
                    </p>
                    <span className="text-xs text-zinc-400">
                      (o su equivalente en Bs a tasa del día)
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-3">
                    Un precio pagable para un hogar o amante del arte en Venezuela. Permite rotación,
                    reputación y comprar los materiales de la siguiente obra.
                  </p>

                  <div className="p-3 bg-zinc-950 rounded-sm border border-zinc-900 flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Ganancia limpia que le queda a Avril:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      +${(precioLocalManual !== "" ? parseFloat(precioLocalManual) - calculosEstrategicos.costoMateriales : calculosEstrategicos.gananciaLimpiaLocal).toFixed(2)} USD
                    </span>
                  </div>

                  {/* AJUSTE MANUAL LIBRE PRECIO LOCAL */}
                  <div className="mt-4 pt-3 border-t border-zinc-900">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-400 text-[11px]">
                        ✍️ ¿Deseas fijar un precio menor o personalizado a mano?
                      </span>
                      {precioLocalManual !== "" && (
                        <button
                          onClick={() => setPrecioLocalManual("")}
                          className="text-[10px] text-zinc-500 hover:text-emerald-400 underline"
                        >
                          Usar sugerido ($ {calculosEstrategicos.precioLocalSugerido})
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500 font-mono">$</span>
                      <input
                        type="number"
                        step="1"
                        placeholder={`Sugerido: ${calculosEstrategicos.precioLocalSugerido}`}
                        value={precioLocalManual}
                        onChange={(e) => setPrecioLocalManual(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-zinc-950 border rounded-sm text-emerald-300 font-mono focus:outline-none"
                        style={{ borderColor: "rgba(16,185,129,0.35)" }}
                      />
                      <span className="text-xs text-zinc-500 font-sans">USD</span>
                    </div>
                  </div>
                </div>

                {/* 2. PRECIO MERCADO INTERNACIONAL (VÍA WEB O DIÁSPORA) */}
                <div
                  className="p-6 rounded-sm relative overflow-hidden"
                  style={{
                    backgroundColor: "rgba(18,18,18,0.9)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    boxShadow: "0 0 35px rgba(212,175,55,0.1)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-amber-300 font-medium">
                      <Globe2 size={13} /> Precio Sugerido en la Web / Internacional
                    </span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Coleccionistas Exterior
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 my-2">
                    <p
                      className="text-4xl font-light text-white"
                      style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.02em" }}
                    >
                      ${precioIntManual !== "" ? precioIntManual : calculosEstrategicos.precioInternacionalSugerido}{" "}
                      <span className="text-xs font-sans text-zinc-500">USD</span>
                    </p>
                    <span className="text-xs text-zinc-400">
                      (Para envíos a EE.UU., Europa o Latinoamérica)
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-3">
                    El valor de galería que merece una obra de arte original de {simAncho}×{simAlto} cm
                    ante el ojo de un comprador internacional.
                  </p>

                  <div className="p-3 bg-zinc-950 rounded-sm border border-zinc-900 flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Ganancia limpia al venderse en el exterior:</span>
                    <span className="font-mono text-amber-300 font-medium">
                      +${(precioIntManual !== "" ? parseFloat(precioIntManual) - calculosEstrategicos.costoMateriales : calculosEstrategicos.gananciaLimpiaInternacional).toFixed(2)} USD
                    </span>
                  </div>

                  {/* AJUSTE MANUAL LIBRE PRECIO INTERNACIONAL */}
                  <div className="mt-4 pt-3 border-t border-zinc-900">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-400 text-[11px]">
                        ✍️ ¿Deseas fijar otro precio internacional a mano?
                      </span>
                      {precioIntManual !== "" && (
                        <button
                          onClick={() => setPrecioIntManual("")}
                          className="text-[10px] text-zinc-500 hover:text-amber-300 underline"
                        >
                          Usar sugerido ($ {calculosEstrategicos.precioInternacionalSugerido})
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500 font-mono">$</span>
                      <input
                        type="number"
                        step="1"
                        placeholder={`Sugerido: ${calculosEstrategicos.precioInternacionalSugerido}`}
                        value={precioIntManual}
                        onChange={(e) => setPrecioIntManual(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-zinc-950 border rounded-sm text-amber-300 font-mono focus:outline-none"
                        style={{ borderColor: "rgba(212,175,55,0.35)" }}
                      />
                      <span className="text-xs text-zinc-500 font-sans">USD</span>
                    </div>
                  </div>
                </div>

                {/* 3. LÍNEA ROJA DE SEGURIDAD (PROTECCIÓN DE QUIEBRA) */}
                <div
                  className="p-4 rounded-sm flex items-start gap-3 text-xs"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <ShieldAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-zinc-400">
                    <p className="text-rose-300 font-medium mb-0.5">
                      Línea Roja de Protección: Jamás aceptar menos de ${calculosEstrategicos.precioPisoSeguridad} USD
                    </p>
                    <p>
                      Si alguien te pide una rebaja en Venezuela, ese es tu límite estricto.
                      Por debajo de ese valor estarías perdiendo dinero de materiales importados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: OBRAS VENDIDAS */}
        {activeTab === "ventas" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3
                  className="text-2xl font-light text-white"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Bitácora de Ventas & Coleccionistas
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Cada venta registrada ingresa los fondos completos a la caja del taller.
                </p>
              </div>

              <button
                onClick={() => setModalVentaOpen(true)}
                className="px-4 py-2 text-xs uppercase tracking-widest text-emerald-400 border border-emerald-500/40 rounded-sm hover:bg-emerald-500/10 transition-colors"
              >
                + Registrar Nueva Venta
              </button>
            </div>

            {balance.ventasRecientes.length === 0 ? (
              <div
                className="p-16 text-center rounded-sm max-w-xl mx-auto"
                style={{
                  border: "1px dashed rgba(212,175,55,0.2)",
                  backgroundColor: "rgba(12,12,12,0.5)",
                }}
              >
                <DollarSign size={40} className="mx-auto text-zinc-600 mb-3" />
                <h4
                  className="text-xl font-light text-white mb-2"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Aún no has registrado ventas
                </h4>
                <p className="text-xs text-zinc-500 mb-6">
                  Cuando un coleccionista adquiera una obra de L&apos;Art d&apos;Avril, regístrala aquí
                  para ingresar los fondos completos a tu caja de trabajo.
                </p>
                <button
                  onClick={() => setModalVentaOpen(true)}
                  className="px-5 py-2.5 text-xs uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.4)",
                    color: "#34d399",
                  }}
                >
                  Registrar Primera Venta
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {balance.ventasRecientes.map((v) => (
                  <div
                    key={v.id}
                    className="p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{
                      backgroundColor: "#0c0c0c",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: "rgba(212,175,55,0.08)",
                            color: "#d4af37",
                          }}
                        >
                          {v.obra?.tecnica?.nombre || "Arte"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(v.fechaVenta).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h4
                        className="text-xl font-light text-white leading-snug"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {v.obra?.titulo}
                      </h4>
                      {v.comprador && (
                        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <User size={12} className="text-zinc-500" />
                          Coleccionista / Galería: <span className="text-white">{v.comprador}</span>
                        </p>
                      )}
                      {v.notas && (
                        <p className="text-[11px] text-zinc-500 mt-1 italic">&ldquo;{v.notas}&rdquo;</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xl font-light text-emerald-300" style={{ fontFamily: "var(--font-cormorant)" }}>
                        +${v.precioVenta.toFixed(2)}{" "}
                        <span className="text-xs font-sans text-zinc-500">USD</span>
                      </p>
                      {v.comisionGaleria > 0 && (
                        <p className="text-[10px] text-zinc-500">
                          Comisión intermediario: {v.comisionGaleria}%
                        </p>
                      )}
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                        Ingresado a Fondo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: GASTOS DEL TALLER */}
        {activeTab === "gastos" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3
                  className="text-2xl font-light text-white"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Gastos Operativos & Taller
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Arriendo, embalaje, transporte, servicios y herramientas del estudio.
                </p>
              </div>

              <button
                onClick={() => setModalGastoOpen(true)}
                className="px-4 py-2 text-xs uppercase tracking-widest text-rose-400 border border-rose-500/40 rounded-sm hover:bg-rose-500/10 transition-colors"
              >
                - Registrar Gasto Taller
              </button>
            </div>

            {balance.gastosRecientes.length === 0 ? (
              <div
                className="p-16 text-center rounded-sm max-w-xl mx-auto"
                style={{
                  border: "1px dashed rgba(212,175,55,0.2)",
                  backgroundColor: "rgba(12,12,12,0.5)",
                }}
              >
                <Receipt size={40} className="mx-auto text-zinc-600 mb-3" />
                <h4
                  className="text-xl font-light text-white mb-2"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  No hay gastos registrados
                </h4>
                <p className="text-xs text-zinc-500 mb-6">
                  Registra los costos fijos u operativos del taller para mantener la caja en orden.
                </p>
                <button
                  onClick={() => setModalGastoOpen(true)}
                  className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-rose-400 border border-rose-500/40"
                >
                  Registrar Primer Gasto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {balance.gastosRecientes.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-sm flex items-center justify-between"
                    style={{
                      backgroundColor: "#0c0c0c",
                      border: "1px solid rgba(239,68,68,0.15)",
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-rose-500/10 text-rose-400">
                          {g.categoria}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(g.fecha).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">{g.concepto}</p>
                      {g.notas && <p className="text-xs text-zinc-500 mt-0.5">{g.notas}</p>}
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-light text-rose-400" style={{ fontFamily: "var(--font-cormorant)" }}>
                        -${g.monto.toFixed(2)} <span className="text-xs font-sans text-zinc-500">USD</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: RETIROS DE GANANCIA */}
        {activeTab === "retiros" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3
                  className="text-2xl font-light text-white"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Retiros de Ganancia & Utilidades
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Extracciones libres del fondo de trabajo para los honorarios y disfrute de la artista.
                </p>
              </div>

              <button
                onClick={() => setModalRetiroOpen(true)}
                className="px-4 py-2 text-xs uppercase tracking-widest text-amber-300 border border-amber-500/40 rounded-sm hover:bg-amber-500/10 transition-colors"
              >
                + Efectuar Retiro de Ganancia
              </button>
            </div>

            {balance.retirosRecientes.length === 0 ? (
              <div
                className="p-16 text-center rounded-sm max-w-xl mx-auto"
                style={{
                  border: "1px dashed rgba(212,175,55,0.2)",
                  backgroundColor: "rgba(12,12,12,0.5)",
                }}
              >
                <Wallet size={40} className="mx-auto text-zinc-600 mb-3" />
                <h4
                  className="text-xl font-light text-white mb-2"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Aún no se han efectuado retiros
                </h4>
                <p className="text-xs text-zinc-500 mb-6">
                  El 100% de las ventas permanece trabajando dentro del fondo del estudio.
                  Cuando desees transferirte una ganancia, haz clic abajo.
                </p>
                <button
                  onClick={() => setModalRetiroOpen(true)}
                  className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-amber-300 border border-amber-500/40"
                >
                  Efectuar Retiro de Ganancia
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {balance.retirosRecientes.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-sm flex items-center justify-between"
                    style={{
                      backgroundColor: "#0c0c0c",
                      border: "1px solid rgba(212,175,55,0.2)",
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-300">
                          Retiro Artista
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(r.fecha).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">{r.concepto}</p>
                      {r.notas && <p className="text-xs text-zinc-500 mt-0.5">{r.notas}</p>}
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-light text-amber-300" style={{ fontFamily: "var(--font-cormorant)" }}>
                        -${r.monto.toFixed(2)} <span className="text-xs font-sans text-zinc-500">USD</span>
                      </p>
                      <span className="text-[10px] text-zinc-500">Cobrado</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODALES ─────────────────────────────────── */}
      {/* MODAL REGISTRAR VENTA */}
      {modalVentaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-lg rounded-sm p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(16,185,129,0.4)",
              boxShadow: "0 0 60px rgba(16,185,129,0.15)",
            }}
          >
            <button
              onClick={() => setModalVentaOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] mb-1 text-emerald-400">
                ✧ Ingreso a Fondo de Trabajo
              </p>
              <h3
                className="text-2xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Registrar Venta de Obra
              </h3>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitVenta} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Selecciona la Obra Vendida <span className="text-emerald-400">*</span>
                </label>
                {obrasDisponibles.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-3 bg-zinc-950 border border-zinc-800">
                    No tienes obras en estado &ldquo;Disponible&rdquo;. Registra o cambia el estado de una obra primero.
                  </p>
                ) : (
                  <select
                    value={ventaObraId}
                    onChange={(e) => handleCambiarObraVenta(Number(e.target.value))}
                    className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(16,185,129,0.3)" }}
                  >
                    {obrasDisponibles.map((o) => {
                      const { precioLocal } = parsePreciosDeNotas(o.notas);
                      return (
                        <option key={o.id} value={o.id} className="bg-zinc-900">
                          {o.titulo} ({o.tecnica?.nombre} {o.anchoCm && o.altoCm ? `· ${o.anchoCm}x${o.altoCm} cm` : ""})
                          {precioLocal ? ` [Sugerido: $${precioLocal} USD]` : ""}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Precio de Venta Cobrado ($ USD) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="ej: 280.00"
                  value={ventaPrecio}
                  onChange={(e) => setVentaPrecio(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(16,185,129,0.3)" }}
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Este monto entrará 100% íntegro a tu Fondo de Trabajo del Taller.
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Nombre del Comprador / Coleccionista
                </label>
                <input
                  type="text"
                  placeholder="ej: Coleccionista Particular (Caracas) o Venta por Web"
                  value={ventaComprador}
                  onChange={(e) => setVentaComprador(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(16,185,129,0.3)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Comisión de Intermediario / Galería (%)
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  value={ventaComision}
                  onChange={(e) => setVentaComision(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(16,185,129,0.3)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Notas de Entrega / Certificado
                </label>
                <input
                  type="text"
                  placeholder="ej: Entrega personal en taller con certificado firmado."
                  value={ventaNotas}
                  onChange={(e) => setVentaNotas(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(16,185,129,0.3)" }}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalVentaOpen(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || obrasDisponibles.length === 0}
                  className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.18)",
                    border: "1px solid rgba(16,185,129,0.5)",
                    color: "#34d399",
                  }}
                >
                  {submitting ? "Registrando..." : "Confirmar Venta (+ Entrar a Caja)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GASTO */}
      {modalGastoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-lg rounded-sm p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(239,68,68,0.4)",
              boxShadow: "0 0 60px rgba(239,68,68,0.15)",
            }}
          >
            <button
              onClick={() => setModalGastoOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] mb-1 text-rose-400">
                - Salida de Caja / Taller
              </p>
              <h3
                className="text-2xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Registrar Gasto de Estudio
              </h3>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitGasto} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Concepto del Gasto <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Embalaje especial para envío o Marcos a medida"
                  value={gastoConcepto}
                  onChange={(e) => setGastoConcepto(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(239,68,68,0.3)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Categoría
                  </label>
                  <select
                    value={gastoCategoria}
                    onChange={(e) => setGastoCategoria(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(239,68,68,0.3)" }}
                  >
                    <option value="Estudio">Estudio / Taller</option>
                    <option value="Marketing">Marketing / Web</option>
                    <option value="Transporte">Transporte / Envíos</option>
                    <option value="Herramientas">Herramientas / Equipo</option>
                    <option value="Servicios">Servicios</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                    Monto ($ USD) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={gastoMonto}
                    onChange={(e) => setGastoMonto(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                    style={{ borderColor: "rgba(239,68,68,0.3)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Notas / Proveedor
                </label>
                <input
                  type="text"
                  placeholder="ej: Factura #2819 - Tienda de Enmarcado"
                  value={gastoNotas}
                  onChange={(e) => setGastoNotas(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(239,68,68,0.3)" }}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalGastoOpen(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.18)",
                    border: "1px solid rgba(239,68,68,0.5)",
                    color: "#f87171",
                  }}
                >
                  {submitting ? "Registrando..." : "Guardar Gasto (- Descontar de Caja)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RETIRO */}
      {modalRetiroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-lg rounded-sm p-8"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(212,175,55,0.4)",
              boxShadow: "0 0 60px rgba(212,175,55,0.15)",
            }}
          >
            <button
              onClick={() => setModalRetiroOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-1"
                style={{ color: "#d4af37" }}
              >
                💎 Retiro de Utilidades / Artista
              </p>
              <h3
                className="text-2xl font-light text-white"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Retirar Ganancia del Fondo
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Fondo disponible actual:{" "}
                <span className="text-white font-mono font-medium">
                  ${balance.fondoTrabajoDisponible.toFixed(2)} USD
                </span>
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitRetiro} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Monto a Retirar ($ USD) <span style={{ color: "#d4af37" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="ej: 150.00"
                  value={retiroMonto}
                  onChange={(e) => setRetiroMonto(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.3)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Motivo / Concepto del Retiro
                </label>
                <input
                  type="text"
                  placeholder="ej: Retiro personal Avril / Utilidades mes"
                  value={retiroMotivo}
                  onChange={(e) => setRetiroMotivo(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.3)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] mb-2 text-zinc-400">
                  Notas de Transferencia
                </label>
                <input
                  type="text"
                  placeholder="ej: Transferencia en Zelle / Efectivo entregado"
                  value={retiroNotas}
                  onChange={(e) => setRetiroNotas(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-white bg-zinc-950 border rounded-sm focus:outline-none"
                  style={{ borderColor: "rgba(212,175,55,0.3)" }}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalRetiroOpen(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium"
                  style={{
                    backgroundColor: "rgba(212,175,55,0.18)",
                    border: "1px solid rgba(212,175,55,0.5)",
                    color: "#d4af37",
                  }}
                >
                  {submitting ? "Procesando..." : "Confirmar Retiro (- Restar del Fondo)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
