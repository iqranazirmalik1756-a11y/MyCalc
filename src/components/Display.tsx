import React, { useRef, useEffect } from 'react';
import { Copy, Check, Volume2, VolumeX, History, HelpCircle } from 'lucide-react';
import { AngleMode, NumberFormatMode } from '../utils/mathEngine';

interface DisplayProps {
  expression: string;
  result: string;
  livePreview: string | null;
  error: string | null;
  fraction?: string;
  steps?: string[];
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  formatMode: NumberFormatMode;
  onChangeFormatMode: (mode: NumberFormatMode) => void;
  hasMemory: boolean;
  memoryValue: number;
  openParensCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleHistory: () => void;
  onToggleGuide: () => void;
  historyCount: number;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  livePreview,
  error,
  fraction,
  steps,
  angleMode,
  onToggleAngleMode,
  formatMode,
  onChangeFormatMode,
  hasMemory,
  memoryValue,
  openParensCount,
  soundEnabled,
  onToggleSound,
  onToggleHistory,
  onToggleGuide,
  historyCount,
}) => {
  const [copied, setCopied] = React.useState(false);
  const exprScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression line to right when length changes
  useEffect(() => {
    if (exprScrollRef.current) {
      exprScrollRef.current.scrollLeft = exprScrollRef.current.scrollWidth;
    }
  }, [expression]);

  const handleCopy = () => {
    const textToCopy = error ? expression : (result || expression || '0');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between select-none">
      {/* Top telemetry & status ribbon */}
      <div className="flex items-center justify-between text-xs font-mono mb-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Angle Mode Selector */}
          <button
            onClick={onToggleAngleMode}
            title="Click to cycle angle mode (DEG / RAD / GRAD)"
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold transition-colors cursor-pointer"
          >
            {angleMode}
          </button>

          {/* Number Representation Mode Selector */}
          <div className="flex items-center bg-slate-800/70 rounded p-0.5">
            {(['STD', 'SCI', 'ENG', 'FRAC'] as NumberFormatMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onChangeFormatMode(mode)}
                className={`px-1.5 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
                  formatMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Display format: ${mode}`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Parentheses nesting depth */}
          {openParensCount > 0 && (
            <span
              className="text-[11px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono"
              title={`${openParensCount} unclosed parenthesis`}
            >
              ( ) × {openParensCount}
            </span>
          )}

          {/* Memory Flag */}
          {hasMemory && (
            <span
              className="text-[11px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded font-mono"
              title={`Memory active: ${memoryValue}`}
            >
              M = {Number(memoryValue.toPrecision(6))}
            </span>
          )}
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute key clicks' : 'Enable key clicks'}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-slate-500" />}
          </button>

          <button
            onClick={onToggleHistory}
            title="Toggle calculation history tape"
            className="relative p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <History size={15} />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleGuide}
            title="Keyboard shortcuts & functions cheat sheet"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle size={15} />
          </button>

          <button
            onClick={handleCopy}
            title="Copy result to clipboard"
            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      {/* Expression Formula Line (Input) */}
      <div
        ref={exprScrollRef}
        className="overflow-x-auto whitespace-nowrap text-right py-1 min-h-[30px] scrollbar-none text-slate-300 font-mono text-base sm:text-lg tracking-wide select-text"
      >
        {expression || <span className="text-slate-600">0</span>}
      </div>

      {/* Main Result & Live Preview */}
      <div className="flex flex-col items-end justify-end mt-2 min-h-[52px]">
        {error ? (
          <div className="text-rose-400 font-mono text-lg sm:text-xl font-medium tracking-tight animate-pulse select-text">
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-end w-full">
            {/* Live real-time preview (shown if live preview is different from the currently evaluated result) */}
            {livePreview && livePreview !== result && (
              <div className="text-xs sm:text-sm font-mono text-slate-400 mb-0.5 tabular-nums">
                ≈ {livePreview}
              </div>
            )}
            <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-cyan-300 tracking-tight tabular-nums select-text break-all text-right">
              {result || '0'}
            </div>
            {/* Fraction & Arithmetic Details row */}
            {fraction && fraction !== result && formatMode !== 'FRAC' && (
              <div className="mt-1 text-xs font-mono text-slate-400 flex items-center gap-2">
                <span>Exact fraction:</span>
                <button
                  onClick={() => onChangeFormatMode('FRAC')}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                  title="Switch to fraction view"
                >
                  {fraction}
                </button>
              </div>
            )}
            {steps && steps.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex flex-wrap justify-end gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400">
                {steps.map((st, i) => (
                  <span key={i} className="text-slate-400">
                    {st}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
