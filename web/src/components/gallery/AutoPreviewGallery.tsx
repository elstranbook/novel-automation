'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CanvasEngine } from '../editor/CanvasEngine';
import type { Template, DesignState } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';

interface AutoPreviewGalleryProps {
  userImage: string | null;
  onSelectTemplate: (template: Template) => void;
}

/**
 * Lazy-rendered preview item. Only renders the CanvasEngine when
 * the card scrolls into the viewport (IntersectionObserver).
 * This prevents creating 20+ WebGL contexts simultaneously.
 */
function LazyPreviewCard({
  template,
  userImage,
  onSelect,
}: {
  template: Template;
  userImage: string | null;
  onSelect: (template: Template) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Default design state for previews
  const defaultDesign: DesignState = {
    x: 0.5,
    y: 0.5,
    scale: 1.0,
    rotation: 0,
  };

  // Observe when the card enters the viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, keep it visible (don't un-observe to avoid re-mounting)
        } else {
          // When leaving viewport, unload the CanvasEngine to free GPU memory
          if (isRendered) {
            setIsRendered(false);
          }
        }
      },
      { rootMargin: '200px' } // Start loading slightly before card enters viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isRendered]);

  // When visible and userImage exists, render the CanvasEngine after a small delay
  useEffect(() => {
    if (!isVisible || !userImage) return;
    
    // Stagger rendering to avoid creating multiple WebGL contexts simultaneously
    const timer = setTimeout(() => {
      setIsRendered(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible, userImage]);

  return (
    <Card
      ref={cardRef}
      className="group relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900"
      onClick={() => onSelect(template)}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {userImage && isRendered ? (
          <CanvasEngine
            template={template}
            userImage={userImage}
            design={defaultDesign}
            colorSelections={{}}
            engine="canvas"
          />
        ) : (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            View Large
          </Button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {template.name}
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
          {template.category}
        </p>
      </div>
    </Card>
  );
}

export function AutoPreviewGallery({ userImage, onSelectTemplate }: AutoPreviewGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        if (data.templates) {
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Preview</h2>
          <p className="text-gray-500">Your design across all our book mockups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <LazyPreviewCard
            key={template.id}
            template={template}
            userImage={userImage}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <Loader2 className="w-10 h-10 mx-auto text-gray-300 animate-spin mb-4" />
          <p className="text-gray-500">Initializing mockup engine...</p>
        </div>
      )}
    </div>
  );
}
