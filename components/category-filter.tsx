'use client';

import { Monitor, Smartphone, Lamp, FileText, GitCompare, LayoutGrid } from 'lucide-react';

const allCategories = [
  { name: 'すべて', icon: LayoutGrid },
  { name: 'PC', icon: Monitor },
  { name: 'スマホ', icon: Smartphone },
  { name: 'デスク環境', icon: Lamp },
  { name: 'レビュー', icon: FileText },
  { name: '比較', icon: GitCompare },
];

export default function CategoryFilter({
  selected,
  onChange,
  counts,
}: {
  selected: string;
  onChange: (c: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map(({ name, icon: Icon }) => {
        const isActive = selected === name;
        const count = counts?.[name];
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-fast border ${
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{name}</span>
            {typeof count === 'number' && (
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-primary-foreground/15 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
