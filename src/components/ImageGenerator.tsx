'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PromptInput from './PromptInput';
import StyleSelector from './StyleSelector';
import ImageGallery from './ImageGallery';
import { ImageGenerationLoader } from './LoadingSpinner';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { useUserSettings, useSystemPrompt } from '@/hooks/useLocalStorage';
import { IMAGE_SETTINGS, SYSTEM_PROMPTS } from '@/lib/constants';


export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [batchCount, setBatchCount] = useState(1);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const { state: generationState, generateImages, clearImages, clearError } = useImageGeneration();
  const [userSettings, setUserSettings] = useUserSettings();
  const [systemPrompt, setSystemPrompt] = useSystemPrompt();

  // Load user preferences
  useEffect(() => {
    if (userSettings.defaultSize) {
      setSelectedSize(userSettings.defaultSize);
    }
    if (userSettings.defaultStyle) {
      setSelectedStyle(userSettings.defaultStyle);
    }
  }, [userSettings]);

  const handlePromptEnhance = useCallback(async (originalPrompt: string) => {
    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPrompt,
          style: selectedStyle,
          systemPrompt: systemPrompt || undefined
        }),
      });

      const data = await response.json();
      
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      } else {
        console.error('Prompt enhancement failed:', data.error);
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [selectedStyle, systemPrompt]);

  const handleGenerate = useCallback(async (promptToUse: string) => {
    if (!promptToUse.trim()) return;

    await generateImages({
      prompt: promptToUse.trim(),
      size: selectedSize,
      style: selectedStyle,
      systemPrompt: systemPrompt || undefined,
      batchCount
    });
  }, [generateImages, selectedSize, selectedStyle, systemPrompt, batchCount]);

  const handleSizeChange = useCallback((size: string) => {
    setSelectedSize(size);
    setUserSettings(prev => ({ ...prev, defaultSize: size }));
  }, [setUserSettings]);

  const handleStyleChange = useCallback((style: string) => {
    setSelectedStyle(style);
    setUserSettings(prev => ({ ...prev, defaultStyle: style }));
  }, [setUserSettings]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Main Generation Interface */}
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Image Generator
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Create stunning AI-generated images with advanced prompts and style controls
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Images</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="space-y-6 mt-6">
              {/* Prompt Input */}
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onEnhance={handlePromptEnhance}
                onGenerate={handleGenerate}
                isGenerating={generationState.isGenerating}
                isEnhancing={isEnhancing}
              />

              {/* Style and Size Selection */}
              <div className="grid lg:grid-cols-2 gap-6">
                <StyleSelector
                  selectedStyle={selectedStyle}
                  onStyleChange={handleStyleChange}
                  disabled={generationState.isGenerating}
                />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Image Settings</h3>
                  
                  <div className="space-y-3">
                    {/* Size Selection */}
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Image Size</label>
                      <Select value={selectedSize} onValueChange={handleSizeChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select image size" />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_SETTINGS.SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label} ({size.width}×{size.height})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Batch Count */}
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Number of Images</label>
                      <Select value={batchCount.toString()} onValueChange={(v) => setBatchCount(parseInt(v))}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((count) => (
                            <SelectItem key={count} value={count.toString()}>
                              {count} {count === 1 ? 'Image' : 'Images'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generation Status and Loading */}
              {generationState.isGenerating && (
                <div className="flex justify-center py-8">
                  <ImageGenerationLoader 
                    currentBatch={generationState.currentBatch}
                    totalBatches={generationState.totalBatches}
                  />
                </div>
              )}

              {/* Error Display */}
              {generationState.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-red-700 text-sm">{generationState.error}</p>
                    <Button variant="ghost" size="sm" onClick={clearError}>
                      ✕
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6 mt-6">
              {/* System Prompt Customization */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">System Prompt Configuration</h3>
                <p className="text-sm text-gray-600">
                  Customize the AI's behavior by modifying the system prompt. Leave empty to use the default.
                </p>
                
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={SYSTEM_PROMPTS.IMAGE_GENERATION}
                  className="min-h-[120px] font-mono text-sm"
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSystemPrompt(SYSTEM_PROMPTS.IMAGE_GENERATION)}
                  >
                    Reset to Default
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSystemPrompt('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Images Gallery */}
      {generationState.images.length > 0 && (
        <ImageGallery
          images={generationState.images}
          onClear={clearImages}
          className="animate-in fade-in duration-500"
        />
      )}
    </div>
  );
}