'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserSettings, useSystemPrompt } from '@/hooks/useLocalStorage';
import { IMAGE_SETTINGS, SYSTEM_PROMPTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  className?: string;
}

export default function SettingsPanel({ className }: SettingsPanelProps) {
  const [userSettings, setUserSettings] = useUserSettings();
  const [systemPrompt, setSystemPrompt] = useSystemPrompt();

  const handleSettingChange = (key: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setUserSettings({
      defaultSize: '1024x1024',
      defaultStyle: 'realistic',
      theme: 'system',
      autoEnhancePrompts: false,
      saveHistory: true
    });
    setSystemPrompt('');
  };

  const exportSettings = () => {
    const settings = {
      userSettings,
      systemPrompt,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-image-generator-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        if (settings.userSettings) {
          setUserSettings(settings.userSettings);
        }
        if (settings.systemPrompt) {
          setSystemPrompt(settings.systemPrompt);
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Image Size */}
          <div className="space-y-2">
            <Label htmlFor="defaultSize" className="text-sm font-medium">
              Default Image Size
            </Label>
            <Select
              value={userSettings.defaultSize}
              onValueChange={(value) => handleSettingChange('defaultSize', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default size" />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_SETTINGS.SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Style */}
          <div className="space-y-2">
            <Label htmlFor="defaultStyle" className="text-sm font-medium">
              Default Style
            </Label>
            <Select
              value={userSettings.defaultStyle}
              onValueChange={(value) => handleSettingChange('defaultStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No default style</SelectItem>
                {IMAGE_SETTINGS.STYLES.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme" className="text-sm font-medium">
              Theme
            </Label>
            <Select
              value={userSettings.theme}
              onValueChange={(value) => handleSettingChange('theme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoEnhance" className="text-sm font-medium">
                Auto-enhance prompts
              </Label>
              <Switch
                id="autoEnhance"
                checked={userSettings.autoEnhancePrompts}
                onCheckedChange={(checked) => handleSettingChange('autoEnhancePrompts', checked)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Automatically enhance prompts before generation for better results
            </p>

            <div className="flex items-center justify-between">
              <Label htmlFor="saveHistory" className="text-sm font-medium">
                Save generation history
              </Label>
              <Switch
                id="saveHistory"
                checked={userSettings.saveHistory}
                onCheckedChange={(checked) => handleSettingChange('saveHistory', checked)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Keep a history of your generated images locally in your browser
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            System Prompt Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Customize the AI's behavior by modifying the system prompt. This affects how the AI interprets and generates images from your prompts.
          </p>
          
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder={SYSTEM_PROMPTS.IMAGE_GENERATION}
            className="min-h-[120px] font-mono text-sm"
          />
          
          <div className="flex flex-wrap gap-2">
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
        </CardContent>
      </Card>

      {/* Settings Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Settings Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Export your settings for backup or import previously saved configurations.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={exportSettings}
              className="flex items-center gap-2"
            >
              <span>📤</span>
              Export Settings
            </Button>
            
            <label className="relative cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                className="flex items-center gap-2 pointer-events-none"
                asChild
              >
                <div>
                  <span>📥</span>
                  Import Settings
                </div>
              </Button>
            </label>
            
            <Button
              variant="destructive"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <span>🔄</span>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Usage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Storage Usage:</span>
              <div className="text-gray-800">
                Settings and history stored locally in your browser
              </div>
            </div>
            <div>
              <span className="text-gray-500">Privacy:</span>
              <div className="text-gray-800">
                No data is sent to external servers except for AI generation
              </div>
            </div>
            <div>
              <span className="text-gray-500">Generation Model:</span>
              <div className="text-gray-800 font-mono text-xs">
                black-forest-labs/flux-1.1-pro
              </div>
            </div>
            <div>
              <span className="text-gray-500">API Endpoint:</span>
              <div className="text-gray-800 font-mono text-xs">
                Custom Gateway (No API Key Required)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}