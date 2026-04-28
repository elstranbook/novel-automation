'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
  variant?: 'primary' | 'secondary';
}

const categoryIcons: Record<string, string> = {
  all: '🎨',
  // Main categories
  tshirt: '👕',
  mug: '☕',
  phone: '📱',
  poster: '🖼️',
  novel: '📚',
  // Novel subcategories
  hardcover: '📕',
  paperback: '📗',
  stacked: '📚',
  open: '📖',
  bookshelf: '🗄️',
  // Custom
  custom: '📦',
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  variant = 'primary',
}: CategoryFilterProps) {
  const isSecondary = variant === 'secondary';
  
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelect(category.id)}
              className={cn(
                'rounded-full px-4 transition-all duration-200',
                isSecondary && 'text-sm',
                isSelected
                  ? isSecondary
                    ? 'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 shadow-md'
                    : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                  : isSecondary
                    ? 'bg-white/80 dark:bg-gray-800/80 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <span className="mr-2">{categoryIcons[category.id] || category.icon || '📦'}</span>
              {category.name}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
