
import React, { useState, useRef, useCallback } from 'react';
import { Button } from './components/Button';
import { ResultDisplay } from './components/ResultDisplay';
import { MediaFile, AnalysisResult } from './types';
import { analyzeMedia, fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError("Hanya mendukung format gambar atau video.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const base64 = await fileToBase64(file);

    setMedia({
      file,
      previewUrl,
      type: isImage ? 'image' : 'video',
      base64
    });
  }, []);

  const handleReset = () => {
    setMedia(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!media || !media.base64) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeMedia(media.base64, media.file.type);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#09090b] text-zinc-50 p-6 md:p-12 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900 rounded-full blur-[120px]"></div>
      </div>

      <header className="relative z-10 w-full max-w-5xl mb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-indigo-400 text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          SENIOR CINEMATIC ANALYST v2.5
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Prompt Architect
        </h1>
        <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed font-light">
          Transform your visual assets into high-precision technical blueprints for AI generation. 
          Analyze lighting, textures, and cinematic composition with surgical accuracy.
        </p>
      </header>

      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Media Upload/Preview */}
        <div className="space-y-6">
          <div 
            className={`
              relative group aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
              ${media ? 'border-zinc-700 bg-zinc-900/30' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/10 hover:bg-zinc-900/20'}
            `}
          >
            {media ? (
              <div className="relative w-full h-full">
                {media.type === 'image' ? (
                  <img src={media.previewUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <video src={media.previewUrl} className="w-full h-full object-contain" controls />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="secondary" onClick={handleReset} className="h-8 w-8 !p-0 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <div className="bg-zinc-800/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-zinc-400 text-sm font-medium">Unggah Foto atau Video</span>
                <span className="text-zinc-600 text-xs mt-1">Hanya format visual (JPG, PNG, MP4, etc)</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={handleFileChange} 
                />
              </label>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              className="w-full py-4 text-lg font-bold tracking-wider" 
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!media}
            >
              {isAnalyzing ? 'MENGANALISA PIKSEL...' : 'GENERATE CINEMATIC BLUEPRINT'}
            </Button>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 text-red-400 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Guidelines info */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20">
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-widest">Protocol Rules</h4>
            <ul className="space-y-2 text-xs text-zinc-500 font-mono">
              <li className="flex gap-2">
                <span className="text-indigo-500">01</span>
                <span>Length range: 180–220 technical words.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">02</span>
                <span>Zero summarization policy. Pure visual extraction.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">03</span>
                <span>Focus: Micro-expressions, fabric physics, light physics.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">04</span>
                <span>Negative space and constraint logic application.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="min-h-[400px]">
          {result ? (
            <ResultDisplay result={result} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-zinc-800/50 rounded-2xl border-dashed bg-zinc-900/10 p-12 text-center opacity-50">
              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-8 bg-indigo-500 animate-bounce delay-75"></div>
                    <div className="w-2 h-8 bg-indigo-500 animate-bounce delay-150"></div>
                    <div className="w-2 h-8 bg-indigo-500 animate-bounce delay-300"></div>
                  </div>
                  <p className="text-indigo-400 font-mono text-sm animate-pulse">ANALYZING CINEMATIC DATA LAYERS...</p>
                </div>
              ) : (
                <>
                  <svg className="w-16 h-16 text-zinc-800 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-zinc-600 font-medium">Output Blueprint akan muncul di sini setelah analisa selesai.</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-5xl mt-24 py-12 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-300">CP</div>
          <span>&copy; 2024 Cinematic Prompt Architect</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">API Keys</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
