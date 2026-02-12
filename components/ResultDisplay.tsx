
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Button } from './Button';

interface ResultDisplayProps {
  result: AnalysisResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const handleCopy = async (text: string, type: 'master' | 'negative') => {
    await navigator.clipboard.writeText(text);
    if (type === 'master') {
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    } else {
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="text-lg font-semibold tracking-tight uppercase text-zinc-100">1. Master Prompt</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleCopy(result.masterPrompt, 'master')}
            className="text-xs"
          >
            {copiedMaster ? 'Copied!' : 'Copy Blueprint'}
          </Button>
        </div>
        <div className="p-6">
          <p className="text-zinc-300 leading-relaxed first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-indigo-400">
            {result.masterPrompt}
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-semibold tracking-tight uppercase text-zinc-100">2. Negative Prompt</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleCopy(result.negativePrompt, 'negative')}
            className="text-xs"
          >
            {copiedNegative ? 'Copied!' : 'Copy Constraints'}
          </Button>
        </div>
        <div className="p-6">
          <code className="text-sm text-red-400/80 mono leading-loose block bg-red-950/20 p-4 rounded border border-red-900/30">
            {result.negativePrompt}
          </code>
        </div>
      </div>
    </div>
  );
};
