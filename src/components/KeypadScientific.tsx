import React, { useState } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface KeypadScientificProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onEquals: () => void;
  onNegate: () => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  onConstant: (name: string) => void;
  onFunction: (fn: string) => void;
}

export const KeypadScientific: React.FC<KeypadScientificProps> = ({
  onInput,
  onClear,
  onDelete,
  onEquals,
  onNegate,
  onMemoryAction,
  onConstant,
  onFunction,
}) => {
  const [isSecond, setIsSecond] = useState(false);
  const [isHyperbolic, setIsHyperbolic] = useState(false);

  const handleKeyClick = (
    action: () => void,
    type: 'number' | 'operator' | 'action' | 'equals' = 'number'
  ) => {
    soundEngine.playClick(type);
    action();
  };

  return (
    <div className="flex flex-col gap-2.5 mt-3 select-none">
      {/* Memory & Quick Actions Bar */}
      <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('MC'), 'action')}
          className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
          title="Memory Clear"
        >
          MC
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('MR'), 'action')}
          className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
          title="Memory Recall"
        >
          MR
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('M+'), 'action')}
          className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
          title="Memory Add"
        >
          M+
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('M-'), 'action')}
          className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
          title="Memory Subtract"
        >
          M-
        </button>
        <button
          onClick={() => handleKeyClick(() => onMemoryAction('MS'), 'action')}
          className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
          title="Memory Store"
        >
          MS
        </button>
        <button
          onClick={() => {
            soundEngine.playClick('action');
            setIsSecond(!isSecond);
          }}
          className={`py-1.5 px-2 rounded-lg font-semibold transition-colors cursor-pointer text-center ${
            isSecond
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-400'
          }`}
          title="2nd / Inverse Functions"
        >
          2ⁿᵈ
        </button>
      </div>

      {/* Main Scientific Keys Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-6 gap-1.5 text-sm font-mono">
        {/* Row 1 */}
        <button
          onClick={() => handleKeyClick(() => setIsHyperbolic(!isHyperbolic), 'action')}
          className={`py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
            isHyperbolic
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40'
              : 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-300'
          }`}
        >
          hyp
        </button>

        {/* Sin / Asin or Sinh / Asinh */}
        <button
          onClick={() =>
            handleKeyClick(
              () =>
                onFunction(
                  isHyperbolic
                    ? isSecond
                      ? 'asinh'
                      : 'sinh'
                    : isSecond
                    ? 'asin'
                    : 'sin'
                ),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isHyperbolic
            ? isSecond
              ? 'sinh⁻¹'
              : 'sinh'
            : isSecond
            ? 'sin⁻¹'
            : 'sin'}
        </button>

        {/* Cos / Acos or Cosh / Acosh */}
        <button
          onClick={() =>
            handleKeyClick(
              () =>
                onFunction(
                  isHyperbolic
                    ? isSecond
                      ? 'acosh'
                      : 'cosh'
                    : isSecond
                    ? 'acos'
                    : 'cos'
                ),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isHyperbolic
            ? isSecond
              ? 'cosh⁻¹'
              : 'cosh'
            : isSecond
            ? 'cos⁻¹'
            : 'cos'}
        </button>

        {/* Tan / Atan or Tanh / Atanh */}
        <button
          onClick={() =>
            handleKeyClick(
              () =>
                onFunction(
                  isHyperbolic
                    ? isSecond
                      ? 'atanh'
                      : 'tanh'
                    : isSecond
                    ? 'atan'
                    : 'tan'
                ),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isHyperbolic
            ? isSecond
              ? 'tanh⁻¹'
              : 'tanh'
            : isSecond
            ? 'tan⁻¹'
            : 'tan'}
        </button>

        {/* Clear Entry / All Clear */}
        <button
          onClick={() => handleKeyClick(onClear, 'action')}
          className="py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
          title="All Clear (AC)"
        >
          <RotateCcw size={14} /> AC
        </button>

        {/* Backspace Delete */}
        <button
          onClick={() => handleKeyClick(onDelete, 'action')}
          className="py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-center"
          title="Backspace"
        >
          <Delete size={17} />
        </button>

        {/* Row 2 */}
        {/* Ln or e^x */}
        <button
          onClick={() =>
            handleKeyClick(
              () => (isSecond ? onFunction('exp') : onFunction('ln')),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isSecond ? 'eˣ' : 'ln'}
        </button>

        {/* Log10 or 10^x */}
        <button
          onClick={() =>
            handleKeyClick(
              () => (isSecond ? onInput('10^') : onFunction('log')),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isSecond ? '10ˣ' : 'log'}
        </button>

        {/* Square root or x² */}
        <button
          onClick={() =>
            handleKeyClick(
              () => (isSecond ? onInput('^2') : onFunction('sqrt')),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isSecond ? 'x²' : '√x'}
        </button>

        {/* Power x^y or Root */}
        <button
          onClick={() =>
            handleKeyClick(
              () => (isSecond ? onFunction('cbrt') : onInput('^')),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isSecond ? '∛x' : 'xʸ'}
        </button>

        {/* Parentheses ( */}
        <button
          onClick={() => handleKeyClick(() => onInput('('), 'operator')}
          className="py-2.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
        >
          (
        </button>

        {/* Parentheses ) */}
        <button
          onClick={() => handleKeyClick(() => onInput(')'), 'operator')}
          className="py-2.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
        >
          )
        </button>

        {/* Row 3 */}
        {/* Reciprocal 1/x */}
        <button
          onClick={() => handleKeyClick(() => onFunction('inv'), 'operator')}
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          1/x
        </button>

        {/* Absolute value |x| */}
        <button
          onClick={() => handleKeyClick(() => onFunction('abs'), 'operator')}
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          |x|
        </button>

        {/* Digit 7 */}
        <button
          onClick={() => handleKeyClick(() => onInput('7'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          7
        </button>

        {/* Digit 8 */}
        <button
          onClick={() => handleKeyClick(() => onInput('8'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          8
        </button>

        {/* Digit 9 */}
        <button
          onClick={() => handleKeyClick(() => onInput('9'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          9
        </button>

        {/* Division ÷ */}
        <button
          onClick={() => handleKeyClick(() => onInput(' ÷ '), 'operator')}
          className="py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-lg transition-colors cursor-pointer"
        >
          ÷
        </button>

        {/* Row 4 */}
        {/* Factorial n! */}
        <button
          onClick={() => handleKeyClick(() => onInput('!'), 'operator')}
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          n!
        </button>

        {/* Combinatorics nCr / nPr */}
        <button
          onClick={() =>
            handleKeyClick(
              () => (isSecond ? onFunction('npr') : onFunction('ncr')),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isSecond ? 'nPr' : 'nCr'}
        </button>

        {/* Digit 4 */}
        <button
          onClick={() => handleKeyClick(() => onInput('4'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          4
        </button>

        {/* Digit 5 */}
        <button
          onClick={() => handleKeyClick(() => onInput('5'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          5
        </button>

        {/* Digit 6 */}
        <button
          onClick={() => handleKeyClick(() => onInput('6'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          6
        </button>

        {/* Multiplication × */}
        <button
          onClick={() => handleKeyClick(() => onInput(' × '), 'operator')}
          className="py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-lg transition-colors cursor-pointer"
        >
          ×
        </button>

        {/* Row 5 */}
        {/* Constant Pi π */}
        <button
          onClick={() => handleKeyClick(() => onConstant('pi'), 'number')}
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
        >
          π
        </button>

        {/* Constant e or Phi */}
        <button
          onClick={() =>
            handleKeyClick(
              () => (isSecond ? onConstant('phi') : onConstant('e')),
              'number'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
        >
          {isSecond ? 'φ' : 'e'}
        </button>

        {/* Digit 1 */}
        <button
          onClick={() => handleKeyClick(() => onInput('1'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          1
        </button>

        {/* Digit 2 */}
        <button
          onClick={() => handleKeyClick(() => onInput('2'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          2
        </button>

        {/* Digit 3 */}
        <button
          onClick={() => handleKeyClick(() => onInput('3'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          3
        </button>

        {/* Subtraction − */}
        <button
          onClick={() => handleKeyClick(() => onInput(' − '), 'operator')}
          className="py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-lg transition-colors cursor-pointer"
        >
          −
        </button>

        {/* Row 6 */}
        {/* Percent % or Modulo */}
        <button
          onClick={() =>
            handleKeyClick(
              () => (isSecond ? onInput(' % ') : onInput('%')),
              'operator'
            )
          }
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-xs"
        >
          {isSecond ? 'mod' : '%'}
        </button>

        {/* Negate ± */}
        <button
          onClick={() => handleKeyClick(onNegate, 'operator')}
          className="py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer text-sm"
        >
          ±
        </button>

        {/* Digit 0 */}
        <button
          onClick={() => handleKeyClick(() => onInput('0'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          0
        </button>

        {/* Decimal point . */}
        <button
          onClick={() => handleKeyClick(() => onInput('.'), 'number')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold text-lg transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          .
        </button>

        {/* Equals = (Span 1) */}
        <button
          onClick={() => handleKeyClick(onEquals, 'equals')}
          className="py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xl rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
          title="Calculate (Enter / =)"
        >
          =
        </button>

        {/* Addition + */}
        <button
          onClick={() => handleKeyClick(() => onInput(' + '), 'operator')}
          className="py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 rounded-xl font-bold text-lg transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
};
