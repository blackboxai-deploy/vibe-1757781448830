'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatGenerationTime } from '@/lib/image-utils';
import type { GeneratedImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface GenerationHistoryProps {
  className?: string;
  onSelectImage?: (image: GeneratedImage) => void;
  maxItems?: number;
}

export default function GenerationHistory({ 
  className, 
  onSelectImage,
  maxItems = 20
}: GenerationHistoryProps) {
  const [history, setHistory] = useLocalStorage<GeneratedImage[]>('ai-image-generator-history', []);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState<GeneratedImage | null>(null);

  const recentHistory = history.slice(0, maxItems);

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSelectImage = (image: GeneratedImage) => {
    if (onSelectImage) {
      onSelectImage(image);
    } else {
      setSelectedHistoryImage(image);
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setHistory(prev => prev.filter(img => img.id !== imageId));
  };

  if (history.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-8 text-center text-gray-500">
          <div className="text-4xl mb-2">📱</div>
          <p>No generation history yet</p>
          <p className="text-sm mt-1">Your generated images will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn('', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Recent Generations ({history.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
              >
                View All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="text-gray-600 hover:text-red-600"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentHistory.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all"
                onClick={() => handleSelectImage(image)}
              >
                <img
                  src={image.url}
                  alt={`${image.prompt.substring(0, 30)}...`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="truncate">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full History Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Generation History ({history.length} images)</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
              {history.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={image.url}
                    alt={`${image.prompt.substring(0, 30)}...`}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                    loading="lazy"
                    onClick={() => {
                      handleSelectImage(image);
                      setIsOpen(false);
                    }}
                  />
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.id);
                    }}
                  >
                    <span>×</span>
                  </Button>
                  
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {image.prompt}
                    </p>
                    <div className="text-white/70 text-xs flex justify-between items-center mt-1">
                      <span>{image.size}</span>
                      {image.generationTime && (
                        <span>{formatGenerationTime(image.generationTime)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Image Modal */}
      {selectedHistoryImage && !onSelectImage && (
        <Dialog open={!!selectedHistoryImage} onOpenChange={() => setSelectedHistoryImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Historical Generation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <img
                src={selectedHistoryImage.url}
                alt={selectedHistoryImage.prompt}
                className="w-full h-auto max-h-96 object-contain bg-gray-100 rounded-lg"
              />
              
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Prompt:</span>
                  <p className="text-gray-600 mt-1">{selectedHistoryImage.prompt}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Size:</span>
                    <span className="ml-2 text-gray-600">{selectedHistoryImage.size}</span>
                  </div>
                  {selectedHistoryImage.style && (
                    <div>
                      <span className="font-medium text-gray-700">Style:</span>
                      <span className="ml-2 text-gray-600 capitalize">
                        {selectedHistoryImage.style.replace('-', ' ')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(selectedHistoryImage.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {selectedHistoryImage.generationTime && (
                    <div>
                      <span className="font-medium text-gray-700">Generation Time:</span>
                      <span className="ml-2 text-gray-600">
                        {formatGenerationTime(selectedHistoryImage.generationTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}