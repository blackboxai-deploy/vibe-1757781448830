import ImageGenerator from '@/components/ImageGenerator';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl transform -translate-x-32 translate-y-32" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            AI Image Generator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your imagination into stunning visuals with cutting-edge AI technology. 
            Create, customize, and download professional-quality images in seconds.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
        <ImageGenerator />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Lightning Fast Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎨</span>
                <span>Multiple Art Styles</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>Mobile Responsive</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Privacy Focused</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <p>
                Powered by advanced AI models for professional image generation.
              </p>
              <p className="mt-2">
                © 2024 AI Image Generator. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}