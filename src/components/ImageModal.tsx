'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useImageDownload } from '@/hooks/useImageDownload';
import { formatGenerationTime } from '@/lib/image-utils';
import type { GeneratedImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ImageModalProps {
  image: GeneratedImage;
  isOpen: boolean;
  onClose: () => void;
  images?: GeneratedImage[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export default function ImageModal({
  image,
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onNavigate
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const { downloadImage, copyUrl, state: downloadState } = useImageDownload();

  const hasMultipleImages = images.length > 1 && onNavigate;
  const canNavigateLeft = hasMultipleImages && currentIndex > 0;
  const canNavigateRight = hasMultipleImages && currentIndex < images.length - 1;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (canNavigateLeft && onNavigate) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (canNavigateRight && onNavigate) {
            onNavigate(currentIndex + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, canNavigateLeft, canNavigateRight, currentIndex, onNavigate]);

  // Reset states when image changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCopiedUrl(false);
  }, [image.id]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleDownload = useCallback(async () => {
    await downloadImage(image);
  }, [downloadImage, image]);

  const handleCopyUrl = useCallback(async () => {
    const success = await copyUrl(image.url);
    if (success) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }, [copyUrl, image.url]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800 pr-8">
            Generated Image {hasMultipleImages && `${currentIndex + 1} of ${images.length}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Main image display */}
          <div className="relative mx-6 mb-6">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              )}
              
              {hasError ? (
                <div className="aspect-square flex items-center justify-center bg-gray-100 text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <div>Failed to load image</div>
                  </div>
                </div>
              ) : (
                <img
                  src={image.url}
                  alt={`Generated: ${image.prompt}`}
                  className={cn(
                    'w-full h-auto max-h-[60vh] object-contain transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100'
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
              
              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  {canNavigateLeft && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/80 text-white border-0"
                      onClick={() => onNavigate!(currentIndex - 1)}
                    >
                      ←
                    </Button>
                  )}
                  {canNavigateRight && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/80 text-white border-0"
                      onClick={() => onNavigate!(currentIndex + 1)}
                    >
                      →
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Image details */}
          <div className="px-6 pb-6 space-y-4">
            {/* Prompt */}
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Prompt</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                {image.prompt}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="text-gray-800">{image.size}</span>
                </div>
                {image.style && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Style:</span>
                    <span className="text-gray-800 capitalize">{image.style.replace('-', ' ')}</span>
                  </div>
                )}
                {image.generationTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Generation Time:</span>
                    <span className="text-gray-800">{formatGenerationTime(image.generationTime)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-800">
                    {new Date(image.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="text-gray-800 font-mono text-xs">{image.id.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={handleDownload}
                disabled={downloadState.isDownloading}
                className="flex items-center gap-2"
              >
                {downloadState.isDownloading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span>📥</span>
                )}
                Download
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCopyUrl}
                className="flex items-center gap-2"
              >
                <span>{copiedUrl ? '✅' : '📋'}</span>
                {copiedUrl ? 'Copied!' : 'Copy URL'}
              </Button>
              
              {hasMultipleImages && (
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                  <span>Use arrow keys to navigate</span>
                  <div className="flex gap-1">
                    <span className="px-2 py-1 bg-gray-100 border rounded text-xs">←</span>
                    <span className="px-2 py-1 bg-gray-100 border rounded text-xs">→</span>
                  </div>
                </div>
              )}
            </div>

            {/* Download error */}
            {downloadState.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{downloadState.error}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}