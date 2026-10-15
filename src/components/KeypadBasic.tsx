import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface KeypadBasicProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onEquals: () => void;
  onNegate: () => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  onFunction: (fn: string) => void;
}

export const KeypadBasic: React.FC<KeypadBasicProps> = ({
  onInput,
  onClear,
  onDelete,
  onEquals,
  onNegate,
  onMemoryAction,
  onFunction,
}) => {
  const handleKeyClick = (
    action: () => void,
    type: 'number' | 'operator' | 'action' | 'equals' = 'number'
  ) => {
    soundEngine.playClick(type);
    action();
  };

  return (
    <div className="flex flex-col gap-2.5 mt-3 select-none">
      {/* Memory Bar */}
      <div className="grid grid-cols-5 gap-2 text-xs font-mono">
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('MC'), 'action')}
          className="py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
        >
          MC
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('MR'), 'action')}
          className="py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
        >
          MR
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('M+'), 'action')}
          className="py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
        >
          M+
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('M-'), 'action')}
          className="py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
        >
          M-
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('MS'), 'action')}
          className="py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
        >
          MS
        </button>
      </div>

      {/* Basic Keypad Grid (4 Columns) */}
      <div className="grid grid-cols-4 gap-2.5 text-base font-mono">
        {/* Row 1 */}
        <button
          onClick={() => handleKeyClick(onClear, 'action')}
          className="py-3.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={15} /> AC
        </button>
        <button
          onClick={() => handleKeyClick(onDelete, 'action')}
          className="py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-center"
        >
          <Delete size={18} />
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('%'), 'operator')}
          className="py-3.5 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 rounded-xl font-semibold transition-colors cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput(' ÷ '), 'operator')}
          className="py-3.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-xl transition-colors cursor-pointer"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleKeyClick(() => onFunction('sqrt'), 'operator')}
          className="py-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-sm"
        >
          √x
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('^2'), 'operator')}
          className="py-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-sm"
        >
          x²
        </button>
        <button
          onClick={() => handleKeyClick(() => onFunction('inv'), 'operator')}
          className="py-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-sm"
        >
          1/x
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput(' × '), 'operator')}
          className="py-3.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-xl transition-colors cursor-pointer"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleKeyClick(() => onInput('7'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          7
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('8'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          8
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('9'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          9
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput(' − '), 'operator')}
          className="py-4 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-xl transition-colors cursor-pointer"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleKeyClick(() => onInput('4'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          4
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('5'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          5
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('6'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          6
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput(' + '), 'operator')}
          className="py-4 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-xl transition-colors cursor-pointer"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleKeyClick(() => onInput('1'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          1
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('2'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          2
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('3'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          3
        </button>
        <button
          onClick={() => handleKeyClick(onEquals, 'equals')}
          className="row-span-2 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-2xl rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center justify-center"
        >
          =
        </button>

        {/* Row 6 */}
        <button
          onClick={() => handleKeyClick(onNegate, 'operator')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-lg transition-colors cursor-pointer"
        >
          ±
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('0'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          0
        </button>
        <button
          onClick={() => handleKeyClick(() => onInput('.'), 'number')}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold text-xl transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          .
        </button>
      </div>
    </div>
  );
};
