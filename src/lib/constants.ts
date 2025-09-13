// AI API Configuration
export const AI_CONFIG = {
  ENDPOINT: 'https://oi-server.onrender.com/chat/completions',
  HEADERS: {
    'customerId': 'cus_SseMaCcI3xAQCS',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  MODELS: {
    IMAGE_GENERATION: 'replicate/black-forest-labs/flux-1.1-pro',
    TEXT_ENHANCEMENT: 'openrouter/claude-sonnet-4'
  },
  TIMEOUTS: {
    IMAGE_GENERATION: 300000, // 5 minutes
    TEXT_PROCESSING: 30000    // 30 seconds
  }
} as const;

// Image Generation Settings
export const IMAGE_SETTINGS = {
  SIZES: [
    { label: '512×512', value: '512x512', width: 512, height: 512 },
    { label: '768×768', value: '768x768', width: 768, height: 768 },
    { label: '1024×1024', value: '1024x1024', width: 1024, height: 1024 },
    { label: '1536×1024', value: '1536x1024', width: 1536, height: 1024 },
    { label: '1024×1536', value: '1024x1536', width: 1024, height: 1536 }
  ],
  STYLES: [
    { 
      id: 'realistic', 
      name: 'Realistic', 
      prompt: 'photorealistic, high quality, detailed',
      description: 'Lifelike and natural appearance'
    },
    { 
      id: 'artistic', 
      name: 'Artistic', 
      prompt: 'artistic, creative, expressive style',
      description: 'Creative and expressive artwork'
    },
    { 
      id: 'digital-art', 
      name: 'Digital Art', 
      prompt: 'digital art, vibrant colors, modern style',
      description: 'Modern digital illustration'
    },
    { 
      id: 'fantasy', 
      name: 'Fantasy', 
      prompt: 'fantasy art, magical, ethereal, mystical',
      description: 'Magical and mystical themes'
    },
    { 
      id: 'abstract', 
      name: 'Abstract', 
      prompt: 'abstract art, geometric, contemporary',
      description: 'Non-representational art forms'
    },
    { 
      id: 'vintage', 
      name: 'Vintage', 
      prompt: 'vintage style, retro, classic aesthetic',
      description: 'Nostalgic and classic appearance'
    }
  ]
} as const;

// System Prompt Templates
export const SYSTEM_PROMPTS = {
  IMAGE_GENERATION: `You are an expert AI image generator. Create high-quality, detailed images based on user prompts. Focus on:
- Visual clarity and composition
- Appropriate lighting and atmosphere  
- Rich detail and texture
- Professional quality output
- Safe, appropriate content only`,
  
  PROMPT_ENHANCEMENT: `You are a creative prompt enhancement assistant. Improve user prompts for AI image generation by:
- Adding specific visual details
- Including lighting and mood descriptions
- Specifying artistic techniques or styles
- Enhancing composition elements
- Maintaining the original creative intent
- Keeping prompts concise but descriptive`
} as const;

// Application Settings
export const APP_SETTINGS = {
  MAX_HISTORY_ITEMS: 50,
  STORAGE_KEYS: {
    GENERATION_HISTORY: 'ai-image-generator-history',
    USER_SETTINGS: 'ai-image-generator-settings',
    SYSTEM_PROMPT: 'ai-image-generator-system-prompt'
  },
  DEBOUNCE_DELAY: 500,
  MAX_PROMPT_LENGTH: 500,
  DEFAULT_BATCH_SIZE: 4
} as const;