import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from 'react';

import { Input } from '@/components/ui/input';
import { penCharmToUsd, roundPenCharm99, usdToPenCharm, usdToPenPrecise } from '@/lib/pen-pricing';
import { cn } from '@/lib/utils';

const SAVE_DEBOUNCE_MS = 350;

interface InventoryInlinePriceEditProps {
  usd: number;
  exchangeRate: number;
  ariaLabel: string;
  onSave: (usd: number) => void | Promise<void>;
  onClose?: () => void;
  className?: string;
  /** Precio de compra: sin redondeo comercial en soles. */
  useCharm?: boolean;
}

export function InventoryInlinePriceEdit({
  usd,
  exchangeRate,
  ariaLabel,
  onSave,
  onClose,
  className,
  useCharm = true,
}: InventoryInlinePriceEditProps) {
  const usdId = useId();
  const penId = useId();
  const penFromUsd = useCharm
    ? usdToPenCharm(usd, exchangeRate)
    : usdToPenPrecise(usd, exchangeRate);
  const [usdDraft, setUsdDraft] = useState(usd > 0 ? String(usd) : '');
  const [penDraft, setPenDraft] = useState(penFromUsd > 0 ? String(penFromUsd) : '');
  const [isSaving, setIsSaving] = useState(false);

  const usdDraftRef = useRef(usdDraft);
  const isDirtyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const savingRef = useRef(false);
  const pendingCloseRef = useRef(false);
  const lastCommittedUsdRef = useRef(usd);

  useEffect(() => {
    usdDraftRef.current = usdDraft;
  }, [usdDraft]);

  useEffect(() => {
    if (isDirtyRef.current) return;
    if (Math.abs(usd - lastCommittedUsdRef.current) > 0.0001) {
      lastCommittedUsdRef.current = usd;
    }
    setUsdDraft(usd > 0 ? String(usd) : '');
    const pen = useCharm
      ? usdToPenCharm(usd, exchangeRate)
      : usdToPenPrecise(usd, exchangeRate);
    setPenDraft(pen > 0 ? String(pen) : '');
  }, [usd, exchangeRate, useCharm]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    },
    [],
  );

  const readUsdValue = () => Math.max(0, Number(usdDraftRef.current) || 0);

  const persist = async (closeAfter = false) => {
    if (closeAfter) pendingCloseRef.current = true;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const nextUsd = readUsdValue();
    if (!isDirtyRef.current && Math.abs(nextUsd - lastCommittedUsdRef.current) < 0.0001) {
      if (closeAfter) {
        pendingCloseRef.current = false;
        onClose?.();
      }
      return;
    }

    if (savingRef.current) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      await onSave(nextUsd);
      isDirtyRef.current = false;
      lastCommittedUsdRef.current = nextUsd;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
      const shouldClose = pendingCloseRef.current;
      pendingCloseRef.current = false;
      if (shouldClose) onClose?.();

      if (isDirtyRef.current || Math.abs(readUsdValue() - lastCommittedUsdRef.current) > 0.0001) {
        void persist(false);
      }
    }
  };

  const scheduleSave = () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      void persist(false);
    }, SAVE_DEBOUNCE_MS);
  };

  const handleUsdChange = (raw: string) => {
    isDirtyRef.current = true;
    setUsdDraft(raw);
    const parsed = Number(raw);
    if (!raw.trim() || !Number.isFinite(parsed) || parsed < 0) {
      if (!raw.trim()) setPenDraft('');
      scheduleSave();
      return;
    }
    const pen = useCharm
      ? usdToPenCharm(parsed, exchangeRate)
      : usdToPenPrecise(parsed, exchangeRate);
    setPenDraft(pen > 0 ? String(pen) : '');
    scheduleSave();
  };

  const handlePenChange = (raw: string) => {
    isDirtyRef.current = true;
    setPenDraft(raw);
    if (!raw.trim()) {
      setUsdDraft('');
      scheduleSave();
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      scheduleSave();
      return;
    }
    const nextUsd = penCharmToUsd(parsed, exchangeRate);
    setUsdDraft(nextUsd > 0 ? String(nextUsd) : '');
    scheduleSave();
  };

  const handlePenBlur = () => {
    if (!penDraft.trim()) return;
    const parsed = Number(penDraft);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    const pen = useCharm ? roundPenCharm99(parsed) : Math.round(parsed * 100) / 100;
    const nextUsd = penCharmToUsd(pen, exchangeRate);
    isDirtyRef.current = true;
    setPenDraft(String(pen));
    setUsdDraft(nextUsd > 0 ? String(nextUsd) : '');
    usdDraftRef.current = nextUsd > 0 ? String(nextUsd) : '';
    void persist(true);
  };

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const next = event.relatedTarget;
    if (next && event.currentTarget.contains(next)) return;
    void persist(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void persist(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className={cn('inline-flex flex-col items-end gap-1', className)}
      aria-label={ariaLabel}
    >
      <div className="relative w-full min-w-[4.75rem]">
        <span
          className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-[0.6rem] font-medium text-muted-foreground"
          aria-hidden="true"
        >
          $
        </span>
        <Input
          id={usdId}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={usdDraft}
          onChange={(event) => handleUsdChange(event.target.value)}
          className="h-8 w-full pl-4 pr-1 text-right text-xs tabular-nums"
          autoFocus
          aria-label={`${ariaLabel} en dólares`}
          aria-busy={isSaving}
        />
      </div>
      <div className="relative w-full min-w-[4.75rem]">
        <span
          className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-[0.6rem] font-medium text-muted-foreground"
          aria-hidden="true"
        >
          S/
        </span>
        <Input
          id={penId}
          type="number"
          min={0}
          step={0.01}
          inputMode="decimal"
          value={penDraft}
          onChange={(event) => handlePenChange(event.target.value)}
          onBlur={handlePenBlur}
          className="h-8 w-full pl-6 pr-1 text-right text-xs tabular-nums"
          aria-label={`${ariaLabel} en soles`}
          aria-busy={isSaving}
        />
      </div>
    </form>
  );
}
