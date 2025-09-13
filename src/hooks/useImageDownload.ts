'use client';

import { useState, useCallback } from 'react';
import { downloadImage, copyImageUrl, generateFilename } from '@/lib/image-utils';
import type { GeneratedImage } from '@/lib/image-utils';

export interface DownloadState {
  isDownloading: boolean;
  downloadProgress: number;
  error: string | null;
  lastDownloadedId: string | null;
}

export interface UseImageDownloadReturn {
  state: DownloadState;
  downloadImage: (image: GeneratedImage, customFilename?: string) => Promise<boolean>;
  copyUrl: (url: string) => Promise<boolean>;
  downloadMultiple: (images: GeneratedImage[]) => Promise<void>;
  clearError: () => void;
}

export function useImageDownload(): UseImageDownloadReturn {
  const [state, setState] = useState<DownloadState>({
    isDownloading: false,
    downloadProgress: 0,
    error: null,
    lastDownloadedId: null
  });

  const handleDownload = useCallback(async (
    image: GeneratedImage, 
    customFilename?: string
  ): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      isDownloading: true,
      downloadProgress: 0,
      error: null
    }));

    try {
      const filename = customFilename || generateFilename(image.prompt, image.style, image.size);
      
      setState(prev => ({ ...prev, downloadProgress: 50 }));
      
      const success = await downloadImage(image.url, filename);
      
      if (success) {
        setState(prev => ({
          ...prev,
          isDownloading: false,
          downloadProgress: 100,
          lastDownloadedId: image.id,
          error: null
        }));
        
        // Reset progress after a short delay
        setTimeout(() => {
          setState(prev => ({ ...prev, downloadProgress: 0 }));
        }, 2000);
        
        return true;
      } else {
        throw new Error('Download failed - unable to save image');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setState(prev => ({
        ...prev,
        isDownloading: false,
        downloadProgress: 0,
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const handleCopyUrl = useCallback(async (url: string): Promise<boolean> => {
    try {
      const success = await copyImageUrl(url);
      if (!success) {
        throw new Error('Failed to copy URL to clipboard');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Copy failed';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const downloadMultiple = useCallback(async (images: GeneratedImage[]): Promise<void> => {
    if (images.length === 0) return;

    setState(prev => ({
      ...prev,
      isDownloading: true,
      downloadProgress: 0,
      error: null
    }));

    let successCount = 0;
    const totalImages = images.length;

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const progress = ((i + 1) / totalImages) * 100;
        
        setState(prev => ({ ...prev, downloadProgress: progress }));
        
        const filename = generateFilename(
          image.prompt, 
          image.style, 
          image.size
        ).replace('.png', `_${i + 1}.png`);
        
        const success = await downloadImage(image.url, filename);
        if (success) {
          successCount++;
        }
        
        // Small delay between downloads to prevent browser issues
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const hasErrors = successCount < totalImages;
      setState(prev => ({
        ...prev,
        isDownloading: false,
        downloadProgress: 100,
        error: hasErrors ? `Downloaded ${successCount}/${totalImages} images successfully` : null
      }));

      // Reset progress after delay
      setTimeout(() => {
        setState(prev => ({ ...prev, downloadProgress: 0 }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch download failed';
      setState(prev => ({
        ...prev,
        isDownloading: false,
        downloadProgress: 0,
        error: `${errorMessage} (Downloaded ${successCount}/${totalImages})`
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    state,
    downloadImage: handleDownload,
    copyUrl: handleCopyUrl,
    downloadMultiple,
    clearError
  };
}

export default useImageDownload;