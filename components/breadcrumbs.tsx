import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbNavItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({
  items,
  className = '',
}: {
  items: BreadcrumbNavItem[];
  className?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="パンくずリスト"
      className={`text-xs sm:text-sm text-muted-foreground ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors truncate"
                >
                  {idx === 0 && <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="text-foreground/85 font-medium truncate max-w-[260px] sm:max-w-[460px]"
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
