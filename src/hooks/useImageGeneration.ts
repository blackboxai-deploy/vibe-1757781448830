'use client';

import { useState, useCallback } from 'react';
import { GeneratedImage, generateImageId } from '@/lib/image-utils';

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentBatch: number;
  totalBatches: number;
  error: string | null;
  images: GeneratedImage[];
}

export interface GenerationOptions {
  prompt: string;
  size?: string;
  style?: string;
  systemPrompt?: string;
  batchCount?: number;
}

export interface UseImageGenerationReturn {
  state: GenerationState;
  generateImages: (options: GenerationOptions) => Promise<void>;
  clearImages: () => void;
  clearError: () => void;
  retryGeneration: () => Promise<void>;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    error: null,
    images: []
  });

  const [lastOptions, setLastOptions] = useState<GenerationOptions | null>(null);

  const generateImages = useCallback(async (options: GenerationOptions) => {
    setLastOptions(options);
    
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      currentBatch: 0,
      totalBatches: options.batchCount || 1,
      error: null,
      images: []
    }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Image generation failed');
      }

      // Process successful results
      const generatedImages: GeneratedImage[] = data.results
        .filter((result: any) => result.success)
        .map((result: any) => ({
          id: generateImageId(),
          url: result.imageUrl,
          prompt: options.prompt,
          style: options.style,
          size: options.size || '1024x1024',
          timestamp: Date.now(),
          generationTime: result.generationTime
        }));

      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        images: generatedImages,
        error: data.hasErrors ? `Generated ${data.successCount}/${data.results.length} images successfully` : null
      }));

    } catch (error) {
      console.error('Image generation error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, []);

  const retryGeneration = useCallback(async () => {
    if (lastOptions) {
      await generateImages(lastOptions);
    }
  }, [lastOptions, generateImages]);

  const clearImages = useCallback(() => {
    setState(prev => ({
      ...prev,
      images: [],
      error: null,
      progress: 0
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    state,
    generateImages,
    clearImages,
    clearError,
    retryGeneration
  };
}

export default useImageGeneration;