import { useState } from 'react';

import {
  isServicePriceListPriceColumn,
  type ServicePriceListColumnId,
} from '@/lib/service-price-list-columns';
import { cn } from '@/lib/utils';
import { PRICE_ROLE_LABELS } from '@/types/product';

const COLUMN_LABELS: Record<'code' | 'name' | 'category', string> = {
  code: 'Código',
  name: 'Servicio',
  category: 'Categoría',
};

function getColumnLabel(columnId: ServicePriceListColumnId): string {
  if (isServicePriceListPriceColumn(columnId)) {
    return PRICE_ROLE_LABELS[columnId];
  }
  return COLUMN_LABELS[columnId];
}

interface ServicePriceDraggableHeaderProps {
  columnId: ServicePriceListColumnId;
  onReorder: (draggedId: ServicePriceListColumnId, targetId: ServicePriceListColumnId) => void;
}

export function ServicePriceDraggableHeader({
  columnId,
  onReorder,
}: ServicePriceDraggableHeaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const isPrice = isServicePriceListPriceColumn(columnId);

  return (
    <th
      scope="col"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('application/x-service-price-column', columnId);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => setDragOver(false)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const draggedId = event.dataTransfer.getData(
          'application/x-service-price-column',
        ) as ServicePriceListColumnId;
        if (draggedId && draggedId !== columnId) {
          onReorder(draggedId, columnId);
        }
      }}
      className={cn(
        'select-none px-3 py-3 align-middle font-medium',
        'cursor-grab active:cursor-grabbing',
        isPrice ? 'text-right' : 'text-left',
        dragOver && 'bg-muted/80 ring-2 ring-inset ring-primary/30',
      )}
      title="Arrastra para reordenar esta columna"
    >
      {getColumnLabel(columnId)}
    </th>
  );
}
