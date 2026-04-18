'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/types';

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
  priority?: boolean;
}

const categoryColors: Record<string, string> = {
  tshirt: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  mug: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  phone: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  poster: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

const categoryNames: Record<string, string> = {
  tshirt: 'T-Shirt',
  mug: 'Mug',
  phone: 'Phone Case',
  poster: 'Poster',
};

export function TemplateCard({ template, onClick, priority = false }: TemplateCardProps) {
  // Only show thumbnail for actual image files (not PSDs)
  const rawThumbnail = template.thumbnail;
  const isImageFile = rawThumbnail && (
    rawThumbnail.endsWith('.png') || 
    rawThumbnail.endsWith('.jpg') || 
    rawThumbnail.endsWith('.jpeg') ||
    rawThumbnail.endsWith('.webp') ||
    rawThumbnail.endsWith('.gif')
  );
  const hasValidThumbnail = isImageFile && 
    rawThumbnail.length > 0 && 
    (rawThumbnail.startsWith('http') || rawThumbnail.startsWith('https') || rawThumbnail.startsWith('//'));

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300"
        onClick={() => onClick(template)}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          {hasValidThumbnail ? (
            <Image
              src={template.thumbnail}
              alt={template.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
              <span className="text-4xl">📚</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-sm line-clamp-2">{template.description}</p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {template.name}
              </h3>
              <Badge
                variant="secondary"
                className={`mt-2 ${categoryColors[template.category] || 'bg-gray-500/10 text-gray-600'}`}
              >
                {categoryNames[template.category] || template.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
