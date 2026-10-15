import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardGuideProps {
  onClose: () => void;
}

export const KeyboardGuide: React.FC<KeyboardGuideProps> = ({ onClose }) => {
  const shortcuts = [
    { key: '0 - 9', desc: 'Numbers & digits' },
    { key: '+  -  *  /', desc: 'Basic arithmetic operations (Add, Subtract, Multiply, Divide)' },
    { key: 'Enter or =', desc: 'Calculate expression result' },
    { key: 'Backspace', desc: 'Delete last entered character' },
    { key: 'Escape / C', desc: 'Clear current entry / All Clear' },
    { key: '(  )', desc: 'Parentheses for operation order' },
    { key: '^', desc: 'Exponentiation / Power (e.g., 2^8)' },
    { key: '%', desc: 'Percent operator (e.g., 50%)' },
    { key: 's / c / t', desc: 'Type sin, cos, tan functions' },
    { key: 'p', desc: 'Constant Pi (π)' },
    { key: 'e', desc: 'Euler\'s number (e)' },
    { key: '!', desc: 'Factorial (e.g., 5!)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Keyboard size={18} className="text-cyan-400" />
            <span>Keyboard Shortcuts & Math Input</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 text-xs font-mono max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60"
            >
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-semibold">
                {s.key}
              </kbd>
              <span className="text-slate-400 font-sans text-right">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
