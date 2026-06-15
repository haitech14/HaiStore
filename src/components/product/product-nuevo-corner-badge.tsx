export function ProductNuevoCornerBadge({ variant = 'catalog' }: { variant?: 'catalog' | 'highlight' }) {
  if (variant === 'highlight') {
    return (
      <span className="inline-flex rounded-md bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">
        NUEVO
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-md bg-green-600 px-2 py-0.5 text-[0.7rem] font-bold text-white shadow-sm">
      Nuevo
    </span>
  );
}
