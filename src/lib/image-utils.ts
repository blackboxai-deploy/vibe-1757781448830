/**
 * Utility functions for image processing and management
 */

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style?: string;
  size: string;
  timestamp: number;
  generationTime?: number;
}

/**
 * Generate unique ID for images
 */
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Download image from URL to user's device
 */
export async function downloadImage(url: string, filename: string = 'ai-generated-image.png'): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

/**
 * Generate filename from prompt and metadata
 */
export function generateFilename(prompt: string, style?: string, size?: string): string {
  // Clean prompt for filename
  let cleanPrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  if (cleanPrompt.endsWith('-')) {
    cleanPrompt = cleanPrompt.slice(0, -1);
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const metadata = [];
  
  if (style) {
    metadata.push(style.toLowerCase().replace(/\s+/g, '-'));
  }
  
  if (size) {
    metadata.push(size.replace('×', 'x'));
  }
  
  const metadataString = metadata.length > 0 ? `_${metadata.join('_')}` : '';
  
  return `ai-image_${cleanPrompt}_${timestamp}${metadataString}.png`;
}

/**
 * Copy image URL to clipboard
 */
export async function copyImageUrl(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Validate image URL accessibility
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
  } catch (error) {
    return false;
  }
}

/**
 * Get image dimensions from URL
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = function() {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = function() {
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Format generation time for display
 */
export function formatGenerationTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Create shareable URL for generated image
 */
export function createShareUrl(image: GeneratedImage): string {
  const params = new URLSearchParams({
    prompt: image.prompt,
    style: image.style || '',
    size: image.size,
    imageId: image.id
  });
  
  return `${window.location.origin}/?share=${encodeURIComponent(params.toString())}`;
}

/**
 * Parse shared URL parameters
 */
export function parseShareUrl(searchParams: URLSearchParams): Partial<GeneratedImage> | null {
  const shareData = searchParams.get('share');
  if (!shareData) return null;
  
  try {
    const params = new URLSearchParams(decodeURIComponent(shareData));
    return {
      prompt: params.get('prompt') || '',
      style: params.get('style') || undefined,
      size: params.get('size') || '1024x1024',
      id: params.get('imageId') || generateImageId()
    };
  } catch (error) {
    return null;
  }
}