'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageModal from './ImageModal';
import { useImageDownload } from '@/hooks/useImageDownload';
import { formatGenerationTime } from '@/lib/image-utils';
import type { GeneratedImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onClear?: () => void;
  className?: string;
}

export default function ImageGallery({ images, onClear, className }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  
  const { downloadMultiple, state: downloadState } = useImageDownload();

  const handleDownloadAll = async () => {
    await downloadMultiple(images);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Card className={cn('shadow-xl bg-white/80 backdrop-blur-sm border-0', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Generated Images ({images.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                disabled={downloadState.isDownloading}
                className="flex items-center gap-2"
              >
                {downloadState.isDownloading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                ) : (
                  <span>📥</span>
                )}
                Download All
              </Button>
              {onClear && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Download progress */}
          {downloadState.isDownloading && downloadState.downloadProgress > 0 && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Downloading images...</span>
                <span>{Math.round(downloadState.downloadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadState.downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Download error */}
          {downloadState.error && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">{downloadState.error}</p>
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredImageId(image.id)}
                onMouseLeave={() => setHoveredImageId(null)}
                onClick={() => setSelectedImage(image)}
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Generated: ${image.prompt.substring(0, 50)}...`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Hover overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200',
                    hoveredImageId === image.id ? 'opacity-100' : 'opacity-0'
                  )}>
                    <div className="text-white text-center space-y-2">
                      <div className="text-lg font-medium">View Full Size</div>
                      <div className="text-sm opacity-80">Click to open</div>
                    </div>
                  </div>
                  
                  {/* Image number badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>
                  
                  {/* Size badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {image.size}
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-3 space-y-2">
                  <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                    {image.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {image.style && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full capitalize">
                        {image.style.replace('-', ' ')}
                      </span>
                    )}
                    {image.generationTime && (
                      <span title="Generation time">
                        ⏱️ {formatGenerationTime(image.generationTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          images={images}
          currentIndex={images.findIndex(img => img.id === selectedImage.id)}
          onNavigate={(index) => setSelectedImage(images[index])}
        />
      )}
    </>
  );
}