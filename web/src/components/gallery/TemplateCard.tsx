'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import type { Template } from '@/types';

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
  onDelete?: (template: Template) => void;
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

export function TemplateCard({ template, onClick, onDelete, priority = false }: TemplateCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Only use actual image URLs - skip PSD files, non-images, etc.
  const rawThumbnail = template.thumbnail || '';
  const isPSD = rawThumbnail.toLowerCase().includes('.psd') || 
    rawThumbnail.toLowerCase().includes('.psb');
  const hasImageExtension = /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(rawThumbnail);
  const isHttpUrl = rawThumbnail.startsWith('http://') || rawThumbnail.startsWith('https://');
  const isLocalPath = rawThumbnail.startsWith('/');
  const isDataUrl = rawThumbnail.startsWith('data:');
  const hasValidThumbnail = !isPSD && rawThumbnail.length > 0 && 
    (hasImageExtension || isDataUrl) && (isHttpUrl || isLocalPath || isDataUrl);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete template');
      }
      onDelete?.(template);
    } catch (err) {
      console.error('Failed to delete template:', err);
      alert('Failed to delete template. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

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
          {hasValidThumbnail && (isHttpUrl || isDataUrl) ? (
            <Image
              src={template.thumbnail}
              alt={template.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : hasValidThumbnail && isLocalPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

          {/* Delete button — top-right corner, visible on hover */}
          {onDelete && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong>&ldquo;{template.name}&rdquo;</strong>? This action cannot be undone.
                      All associated layers, color options, and render history will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Template'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
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
