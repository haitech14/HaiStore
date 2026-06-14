import { NavLink } from 'react-router-dom';

import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';

function categoryLinkClass(isActive: boolean) {
  return cn(
    'relative inline-flex h-10 shrink-0 items-center whitespace-nowrap px-3 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
    isActive &&
      'font-semibold text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-white',
  );
}

export function HeaderCategoryNav() {
  return (
    <nav aria-label="Categorías de productos" className="bg-red-600">
      <div className="container flex h-10 items-stretch">
        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories
            .filter((category) => category.slug !== 'servicio-tecnico')
            .map((category) => (
            <li key={category.slug} className="shrink-0">
              <NavLink
                to={`/categoria/${category.slug}`}
                className={({ isActive }) => categoryLinkClass(isActive)}
              >
                {category.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
