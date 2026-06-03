import { useMemo, useState } from 'react';
import {
  Copy,
  FileDown,
  MessageCircle,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminOrderStatusBadge } from '@/components/admin/AdminOrderStatusBadge';
import { ProformaEditDialog } from '@/components/admin/sales/proforma-edit-dialog';
import { SaleOrderActions } from '@/components/admin/sales/sale-order-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { formatOrderTotal, mapStoreOrderStatusToBadge } from '@/lib/admin-order-status';
import {
  buildProformaWhatsAppMessage,
  buildWhatsAppShareUrl,
} from '@/lib/proforma-whatsapp-message';
import { downloadProformaPdf } from '@/lib/regenerate-proforma-pdf';
import { formatTpvMoney } from '@/lib/tpv-pricing';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import { PRICE_ROLE_LABELS, isPriceRole } from '@/types/product';
import {
  PROFORMA_FOLLOW_UP_LABELS,
  type ProformaFollowUpStatus,
  type ProformaRecord,
  type UpdateProformaPayload,
} from '@/types/proforma';
import type { StoreOrder } from '@/types/store';

const ALL_STATUS = 'all' as const;
const ALL_SELLERS = 'all' as const;
const ALL_TYPES = 'all' as const;

type RowType = 'venta' | 'cotizacion';

type UnifiedRow =
  | { kind: 'venta'; id: string; sortDate: string; order: StoreOrder }
  | { kind: 'cotizacion'; id: string; sortDate: string; proforma: ProformaRecord };

const paymentLabels: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

const statusVariant: Record<
  ProformaFollowUpStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  contacted: 'outline',
  negotiating: 'default',
  won: 'default',
  lost: 'destructive',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function orderCustomerLabel(order: StoreOrder): string {
  const customer = order.customer;
  return (
    customer?.full_name?.trim() ||
    customer?.company_name?.trim() ||
    customer?.email ||
    'Cliente'
  );
}

function cotizacionClientTypeLabel(proforma: ProformaRecord): string {
  if (proforma.source === 'product') return 'Cotización web';
  if (proforma.priceList && isPriceRole(proforma.priceList)) {
    return PRICE_ROLE_LABELS[proforma.priceList];
  }
  return 'Mostrador';
}

function buildRows(orders: StoreOrder[], proformas: ProformaRecord[]): UnifiedRow[] {
  const ventas: UnifiedRow[] = orders.map((order) => ({
    kind: 'venta',
    id: order.id,
    sortDate: order.created_at,
    order,
  }));

  const cotizaciones: UnifiedRow[] = proformas.map((proforma) => ({
    kind: 'cotizacion',
    id: proforma.id,
    sortDate: proforma.createdAt,
    proforma,
  }));

  return [...ventas, ...cotizaciones].sort(
    (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
  );
}

interface SalesUnifiedListPanelProps {
  orders: StoreOrder[];
  proformas: ProformaRecord[];
  isLoading?: boolean;
}

export function SalesUnifiedListPanel({
  orders,
  proformas,
  isLoading = false,
}: SalesUnifiedListPanelProps) {
  const { data: companySettings } = useCompanySettings();
  const { updateProforma, deleteProforma } = useProformaMutations();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RowType | typeof ALL_TYPES>(ALL_TYPES);
  const [statusFilter, setStatusFilter] = useState<ProformaFollowUpStatus | typeof ALL_STATUS>(
    ALL_STATUS,
  );
  const [sellerFilter, setSellerFilter] = useState<string>(ALL_SELLERS);
  const [editing, setEditing] = useState<ProformaRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const rows = useMemo(() => buildRows(orders, proformas), [orders, proformas]);

  const sellers = useMemo(() => {
    const names = new Set(proformas.map((entry) => entry.sellerName).filter(Boolean));
    return [...names].sort((a, b) => a.localeCompare(b, 'es'));
  }, [proformas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (typeFilter !== ALL_TYPES && row.kind !== typeFilter) return false;

      if (row.kind === 'venta') {
        if (statusFilter !== ALL_STATUS) return false;
        if (sellerFilter !== ALL_SELLERS) return false;
        if (!q) return true;
        const order = row.order;
        const haystack = [
          order.order_number,
          orderCustomerLabel(order),
          order.customer?.email,
          order.customer?.phone,
          order.payment_method,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      }

      const proforma = row.proforma;
      if (statusFilter !== ALL_STATUS && proforma.followUpStatus !== statusFilter) {
        return false;
      }
      if (sellerFilter !== ALL_SELLERS && proforma.sellerName !== sellerFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        proforma.documentNumber,
        proforma.customer.razonSocial,
        proforma.customer.atencion,
        proforma.customer.celular,
        proforma.customer.documento,
        proforma.sellerName,
        proforma.sellerEmail,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, sellerFilter, statusFilter, typeFilter]);

  const handleSave = async (payload: UpdateProformaPayload) => {
    if (!editing) return;
    await updateProforma.mutateAsync({ id: editing.id, payload });
  };

  const handleDelete = async (proforma: ProformaRecord) => {
    if (!window.confirm(`¿Eliminar la cotización ${proforma.documentNumber}?`)) return;
    setBusyId(proforma.id);
    try {
      await deleteProforma.mutateAsync(proforma.id);
      toast.success('Cotización eliminada');
    } catch {
      toast.error('No se pudo eliminar la cotización');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (proforma: ProformaRecord) => {
    setBusyId(proforma.id);
    try {
      await downloadProformaPdf(proforma, company);
      toast.success('PDF descargado');
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setBusyId(null);
    }
  };

  const handleWhatsAppCopy = async (proforma: ProformaRecord) => {
    const message = buildProformaWhatsAppMessage(proforma, company);
    try {
      await navigator.clipboard.writeText(message);
      toast.success('Mensaje copiado. Pégalo en WhatsApp 📋', {
        description: proforma.customer.celular
          ? 'También puedes abrir WhatsApp Web si el número está registrado.'
          : undefined,
      });
    } catch {
      toast.error('No se pudo copiar al portapapeles');
    }
  };

  const handleWhatsAppOpen = (proforma: ProformaRecord) => {
    const message = buildProformaWhatsAppMessage(proforma, company);
    const url = buildWhatsAppShareUrl(proforma.customer.celular, message);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    void handleWhatsAppCopy(proforma);
  };

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
        <span className="sr-only">Cargando ventas y cotizaciones…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[12rem] flex-1 space-y-2">
          <Label htmlFor="sales-search" className="text-xs font-medium uppercase tracking-wide">
            Buscar
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="sales-search"
              type="search"
              placeholder="Nº, cliente, vendedor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-full space-y-2 sm:w-40">
          <Label htmlFor="sales-filter-type" className="text-xs font-medium uppercase tracking-wide">
            Tipo
          </Label>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as RowType | typeof ALL_TYPES)}
          >
            <SelectTrigger id="sales-filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TYPES}>Todos</SelectItem>
              <SelectItem value="venta">Ventas</SelectItem>
              <SelectItem value="cotizacion">Cotizaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2 sm:w-44">
          <Label htmlFor="sales-filter-status" className="text-xs font-medium uppercase tracking-wide">
            Seguimiento
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ProformaFollowUpStatus | typeof ALL_STATUS)}
          >
            <SelectTrigger id="sales-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS}>Todos</SelectItem>
              {(Object.keys(PROFORMA_FOLLOW_UP_LABELS) as ProformaFollowUpStatus[]).map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {PROFORMA_FOLLOW_UP_LABELS[status]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2 sm:w-44">
          <Label htmlFor="sales-filter-seller" className="text-xs font-medium uppercase tracking-wide">
            Vendedor
          </Label>
          <Select value={sellerFilter} onValueChange={setSellerFilter}>
            <SelectTrigger id="sales-filter-seller">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SELLERS}>Todos</SelectItem>
              {sellers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {rows.length === 0 ? (
        <AdminEmptyState
          title="Sin ventas ni cotizaciones"
          description="Las ventas de la tienda y las cotizaciones generadas desde el TPV o la ficha de producto aparecerán aquí."
        />
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Ningún registro coincide con los filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[11rem] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                if (row.kind === 'venta') {
                  const order = row.order;
                  return (
                    <TableRow key={`venta-${order.id}`}>
                      <TableCell>
                        <Badge variant="default" className="font-normal whitespace-nowrap">
                          Venta
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">{order.order_number}</TableCell>
                      <TableCell>
                        <p className="font-medium">{orderCustomerLabel(order)}</p>
                        {order.customer?.email ? (
                          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">Tienda en línea</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <AdminOrderStatusBadge status={mapStoreOrderStatusToBadge(order.status)} />
                          <span className="text-xs text-muted-foreground">
                            {paymentLabels[order.payment_status] ?? order.payment_status}
                            {order.payment_method ? ` · ${order.payment_method}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatOrderTotal(Number(order.total_usd), order.total_pen, order.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <SaleOrderActions order={order} />
                      </TableCell>
                    </TableRow>
                  );
                }

                const proforma = row.proforma;
                const busy = busyId === proforma.id;

                return (
                  <TableRow key={`cotizacion-${proforma.id}`}>
                    <TableCell>
                      <Badge variant="outline" className="font-normal whitespace-nowrap">
                        Cotización
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {proforma.documentNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{proforma.customer.razonSocial || '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {proforma.customer.atencion || proforma.customer.celular || '—'}
                        {' · '}
                        {cotizacionClientTypeLabel(proforma)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{proforma.sellerName}</p>
                      {proforma.sellerEmail ? (
                        <p className="text-xs text-muted-foreground">{proforma.sellerEmail}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[proforma.followUpStatus]}>
                        {PROFORMA_FOLLOW_UP_LABELS[proforma.followUpStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(proforma.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatTpvMoney(proforma.totalPen, proforma.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9"
                          disabled={busy}
                          aria-label="Editar cotización"
                          onClick={() => setEditing(proforma)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9"
                          disabled={busy}
                          aria-label="Descargar PDF"
                          onClick={() => void handleDownload(proforma)}
                        >
                          <FileDown className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9"
                          disabled={busy}
                          aria-label="Copiar mensaje para WhatsApp"
                          title="Copiar mensaje con emoticones"
                          onClick={() => void handleWhatsAppCopy(proforma)}
                        >
                          <Copy className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9 text-green-700 hover:bg-green-50 hover:text-green-800"
                          disabled={busy}
                          aria-label="Abrir WhatsApp"
                          title="Abrir WhatsApp (o copiar si no hay celular)"
                          onClick={() => handleWhatsAppOpen(proforma)}
                        >
                          <MessageCircle className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9 text-destructive hover:bg-destructive/10"
                          disabled={busy}
                          aria-label="Eliminar cotización"
                          onClick={() => void handleDelete(proforma)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length === 1 ? '' : 's'} mostrado
            {filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      <ProformaEditDialog
        proforma={editing}
        open={editing != null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSubmit={handleSave}
        isSaving={updateProforma.isPending}
      />
    </div>
  );
}
