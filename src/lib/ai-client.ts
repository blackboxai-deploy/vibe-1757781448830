import { AI_CONFIG, SYSTEM_PROMPTS } from './constants';

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  style?: string;
  systemPrompt?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  generationTime?: number;
}

export interface PromptEnhancementRequest {
  originalPrompt: string;
  style?: string;
  systemPrompt?: string;
}

export interface PromptEnhancementResponse {
  success: boolean;
  enhancedPrompt?: string;
  error?: string;
}

/**
 * AI Client for image generation and prompt enhancement
 */
export class AIClient {
  private static instance: AIClient;
  
  private constructor() {}
  
  static getInstance(): AIClient {
    if (!AIClient.instance) {
      AIClient.instance = new AIClient();
    }
    return AIClient.instance;
  }

  /**
   * Generate image using AI model
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    try {
      const fullPrompt = this.buildImagePrompt(request);
      
      const response = await fetch(AI_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: AI_CONFIG.HEADERS,
        body: JSON.stringify({
          model: AI_CONFIG.MODELS.IMAGE_GENERATION,
          messages: [
            {
              role: 'system',
              content: request.systemPrompt || SYSTEM_PROMPTS.IMAGE_GENERATION
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ]
        }),
        signal: AbortSignal.timeout(AI_CONFIG.TIMEOUTS.IMAGE_GENERATION)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generationTime = Date.now() - startTime;

      // Extract image URL from response
      let imageUrl = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        imageUrl = data.choices[0].message.content || '';
      }

      if (!imageUrl) {
        throw new Error('No image URL received from AI service');
      }

      return {
        success: true,
        imageUrl,
        generationTime
      };

    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        generationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Enhance user prompt for better image generation
   */
  async enhancePrompt(request: PromptEnhancementRequest): Promise<PromptEnhancementResponse> {
    try {
      const enhancementInstruction = this.buildEnhancementInstruction(request);

      const response = await fetch(AI_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: AI_CONFIG.HEADERS,
        body: JSON.stringify({
          model: AI_CONFIG.MODELS.TEXT_ENHANCEMENT,
          messages: [
            {
              role: 'system',
              content: request.systemPrompt || SYSTEM_PROMPTS.PROMPT_ENHANCEMENT
            },
            {
              role: 'user',
              content: enhancementInstruction
            }
          ]
        }),
        signal: AbortSignal.timeout(AI_CONFIG.TIMEOUTS.TEXT_PROCESSING)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let enhancedPrompt = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        enhancedPrompt = data.choices[0].message.content || '';
      }

      if (!enhancedPrompt) {
        throw new Error('No enhanced prompt received from AI service');
      }

      return {
        success: true,
        enhancedPrompt: enhancedPrompt.trim()
      };

    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enhance prompt'
      };
    }
  }

  /**
   * Build complete image generation prompt with style and size
   */
  private buildImagePrompt(request: ImageGenerationRequest): string {
    let prompt = request.prompt;
    
    if (request.style) {
      prompt += `, ${request.style}`;
    }
    
    if (request.size) {
      prompt += `, ${request.size} resolution`;
    }
    
    return prompt;
  }

  /**
   * Build prompt enhancement instruction
   */
  private buildEnhancementInstruction(request: PromptEnhancementRequest): string {
    let instruction = `Enhance this image generation prompt: "${request.originalPrompt}"\n\n`;
    
    if (request.style) {
      instruction += `Style context: ${request.style}\n`;
    }
    
    instruction += `Please provide an enhanced version that adds specific visual details, lighting, mood, and composition elements while maintaining the original creative intent. Return only the enhanced prompt, no explanations.`;
    
    return instruction;
  }
}