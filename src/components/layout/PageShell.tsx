function PageHeader({
  glyph,
  eyebrow,
  title,
  subtitle,
  cta,
}: {
  glyph: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta?: { label: string };
}) {
  return (
    <div
      className="relative px-10 py-12 overflow-hidden"
      style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 80% at 90% 50%, rgba(212,175,55,0.05) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex items-end justify-between">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.3em] mb-4"
            style={{ color: "#d4af37" }}
          >
            {glyph} {eyebrow}
          </p>
          <h1
            className="font-light"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "2.8rem",
              color: "#ffffff",
              letterSpacing: "0.02em",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8c8c8c" }}>
            {subtitle}
          </p>
        </div>
        {cta && (
          <button
            className="flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.18em] rounded-sm"
            style={{
              border: "1px solid rgba(212,175,55,0.35)",
              color: "#d4af37",
              backgroundColor: "transparent",
            }}
          >
            + {cta.label}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div
      className="mx-10 my-10 p-16 rounded-sm text-center"
      style={{ border: "1px dashed rgba(212,175,55,0.2)" }}
    >
      <p
        className="text-5xl mb-4"
        style={{ color: "rgba(212,175,55,0.2)", fontFamily: "var(--font-cormorant)" }}
      >
        ✧
      </p>
      <p
        className="font-light mb-1"
        style={{ fontFamily: "var(--font-cormorant)", color: "#8c8c8c", fontSize: "1.3rem" }}
      >
        {message}
      </p>
      <p className="text-xs" style={{ color: "#555" }}>
        {sub}
      </p>
    </div>
  );
}

export { PageHeader, EmptyState };
