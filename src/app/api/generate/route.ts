import { NextRequest, NextResponse } from 'next/server';
import { AIClient } from '@/lib/ai-client';
import { IMAGE_SETTINGS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = '1024x1024', style, systemPrompt, batchCount = 1 } = body;

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Prompt must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Validate size
    const validSizes = IMAGE_SETTINGS.SIZES.map(s => s.value);
    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { success: false, error: `Invalid size. Must be one of: ${validSizes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate batch count
    if (batchCount < 1 || batchCount > 4) {
      return NextResponse.json(
        { success: false, error: 'Batch count must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Find style prompt enhancement
    let stylePrompt = '';
    if (style) {
      const styleConfig = IMAGE_SETTINGS.STYLES.find(s => s.id === style);
      if (styleConfig) {
        stylePrompt = styleConfig.prompt;
      }
    }

    const aiClient = AIClient.getInstance();
    const results = [];

    // Generate images (batch processing)
    for (let i = 0; i < batchCount; i++) {
      const result = await aiClient.generateImage({
        prompt,
        size,
        style: stylePrompt,
        systemPrompt
      });

      results.push({
        index: i + 1,
        ...result
      });

      // If first generation fails, stop batch processing
      if (!result.success && i === 0) {
        break;
      }
    }

    // Check if any generations succeeded
    const successfulResults = results.filter(r => r.success);
    const hasErrors = results.some(r => !r.success);

    if (successfulResults.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: results[0]?.error || 'Image generation failed',
          results 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results,
      successCount: successfulResults.length,
      errorCount: results.length - successfulResults.length,
      hasErrors,
      metadata: {
        prompt,
        size,
        style,
        batchCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'An unexpected error occurred during image generation'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Image Generation API',
    endpoints: {
      generate: 'POST /api/generate - Generate AI images',
      enhance: 'POST /api/enhance - Enhance prompts'
    },
    supportedSizes: IMAGE_SETTINGS.SIZES.map(s => s.value),
    supportedStyles: IMAGE_SETTINGS.STYLES.map(s => ({ id: s.id, name: s.name })),
    limits: {
      maxPromptLength: 500,
      maxBatchSize: 4,
      timeout: '5 minutes'
    }
  });
}