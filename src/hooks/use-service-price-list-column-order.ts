import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER,
  loadServicePriceListColumnOrder,
  reorderServicePriceListColumns,
  saveServicePriceListColumnOrder,
  type ServicePriceListColumnId,
} from '@/lib/service-price-list-columns';

function readColumnOrder(): ServicePriceListColumnId[] {
  if (typeof window === 'undefined') {
    return [...DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER];
  }
  try {
    return loadServicePriceListColumnOrder();
  } catch {
    return [...DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER];
  }
}

export function useServicePriceListColumnOrder() {
  const [columnOrder, setColumnOrder] = useState<ServicePriceListColumnId[]>(readColumnOrder);

  useEffect(() => {
    saveServicePriceListColumnOrder(columnOrder);
  }, [columnOrder]);

  const reorder = useCallback(
    (draggedId: ServicePriceListColumnId, targetId: ServicePriceListColumnId) => {
      setColumnOrder((prev) => reorderServicePriceListColumns(prev, draggedId, targetId));
    },
    [],
  );

  const resetOrder = useCallback(() => {
    setColumnOrder([...DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER]);
  }, []);

  const isDefaultOrder =
    columnOrder.length === DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER.length &&
    columnOrder.every((id, index) => id === DEFAULT_SERVICE_PRICE_LIST_COLUMN_ORDER[index]);

  return { columnOrder, reorder, resetOrder, isDefaultOrder };
}
