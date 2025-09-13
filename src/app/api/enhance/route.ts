import { NextRequest, NextResponse } from 'next/server';
import { AIClient } from '@/lib/ai-client';
import { IMAGE_SETTINGS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalPrompt, style, systemPrompt } = body;

    // Validation
    if (!originalPrompt || typeof originalPrompt !== 'string' || originalPrompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Original prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (originalPrompt.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Original prompt must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Find style configuration if provided
    let styleContext = '';
    if (style) {
      const styleConfig = IMAGE_SETTINGS.STYLES.find(s => s.id === style);
      if (styleConfig) {
        styleContext = `${styleConfig.name} style: ${styleConfig.description}`;
      }
    }

    const aiClient = AIClient.getInstance();
    const result = await aiClient.enhancePrompt({
      originalPrompt,
      style: styleContext,
      systemPrompt
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to enhance prompt' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      originalPrompt,
      enhancedPrompt: result.enhancedPrompt,
      style,
      metadata: {
        timestamp: new Date().toISOString(),
        styleUsed: style || null,
        enhancementLength: result.enhancedPrompt?.length || 0
      }
    });

  } catch (error) {
    console.error('Prompt Enhancement API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'An unexpected error occurred during prompt enhancement'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Prompt Enhancement API',
    description: 'Enhance user prompts for better AI image generation results',
    supportedStyles: IMAGE_SETTINGS.STYLES.map(s => ({ 
      id: s.id, 
      name: s.name, 
      description: s.description 
    })),
    usage: {
      method: 'POST',
      requiredFields: ['originalPrompt'],
      optionalFields: ['style', 'systemPrompt'],
      limits: {
        maxPromptLength: 500,
        timeout: '30 seconds'
      }
    },
    examples: [
      {
        input: { originalPrompt: 'a cat', style: 'realistic' },
        description: 'Enhance a simple prompt with realistic style context'
      },
      {
        input: { originalPrompt: 'sunset over mountains' },
        description: 'Enhance a prompt without specific style'
      }
    ]
  });
}