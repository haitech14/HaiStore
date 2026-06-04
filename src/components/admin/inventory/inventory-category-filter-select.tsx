import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buildCategorySelectGroups,
  collectOrphanCategoryLabels,
} from '@/lib/inventory-category-options';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export const ALL_INVENTORY_CATEGORIES = 'all';

interface InventoryCategoryFilterSelectProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  categoryTree: StoreCategoryTreeNode[];
  productCategoryLabels: string[];
  className?: string;
}

export function InventoryCategoryFilterSelect({
  id,
  value,
  onValueChange,
  categoryTree,
  productCategoryLabels,
  className,
}: InventoryCategoryFilterSelectProps) {
  const orphans = collectOrphanCategoryLabels(categoryTree, productCategoryLabels);
  const groups = buildCategorySelectGroups(categoryTree, orphans);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Todas las categorías" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_INVENTORY_CATEGORIES}>Todas las categorías</SelectItem>
        {groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((option) => (
              <SelectItem key={`${group.label}-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
