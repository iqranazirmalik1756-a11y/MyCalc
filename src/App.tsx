/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  evaluateExpression,
  AngleMode,
  NumberFormatMode,
  formatStandard,
  formatScientific,
  formatEngineering,
  toFractionString,
  getParenthesesBalance,
  CONSTANTS,
} from './utils/mathEngine';
import { soundEngine } from './utils/audio';
import { Display } from './components/Display';
import { KeypadScientific } from './components/KeypadScientific';
import { KeypadBasic } from './components/KeypadBasic';
import { HistoryTape } from './components/HistoryTape';
import { FunctionGrapher } from './components/FunctionGrapher';
import { UnitConverter } from './components/UnitConverter';
import { ArithmeticTools } from './components/ArithmeticTools';
import { KeyboardGuide } from './components/KeyboardGuide';
import { HistoryItem, CalculatorMode } from './types/calculator';
import {
  Calculator as CalcIcon,
  Activity,
  ArrowRightLeft,
  Sliders,
  History,
  RotateCcw,
  Divide,
} from 'lucide-react';

export default function App() {
  // App state
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [livePreview, setLivePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fraction, setFraction] = useState<string | undefined>(undefined);
  const [steps, setSteps] = useState<string[]>([]);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [formatMode, setFormatMode] = useState<NumberFormatMode>('STD');
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);

  // App UI state
  const [activeMode, setActiveMode] = useState<CalculatorMode>('scientific');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Synchronize history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 100)));
    } catch {
      // Storage limit fallback
    }
  }, [history]);

  // Synchronize sound engine state
  useEffect(() => {
    soundEngine.enabled = soundEnabled;
  }, [soundEnabled]);

  // Calculate live preview whenever expression or angleMode changes
  useEffect(() => {
    if (!expression.trim() || isEvaluated) {
      setLivePreview(null);
      return;
    }

    // Try evaluating silently for live preview
    const evalRes = evaluateExpression(expression, angleMode);
    if (evalRes.success && evalRes.value !== undefined) {
      setError(null);
      let formattedPreview = formatStandard(evalRes.value);
      if (formatMode === 'SCI') formattedPreview = formatScientific(evalRes.value);
      else if (formatMode === 'ENG') formattedPreview = formatEngineering(evalRes.value);
      else if (formatMode === 'FRAC') formattedPreview = toFractionString(evalRes.value) || formattedPreview;

      setLivePreview(formattedPreview);
    } else {
      setLivePreview(null);
    }
  }, [expression, angleMode, formatMode, isEvaluated]);

  // Append characters to expression with operator replacement & chaining
  const handleInput = useCallback((val: string) => {
    setError(null);
    const isArithmeticOp = [' + ', ' − ', ' × ', ' ÷ ', '^', '%'].includes(val);

    setExpression((prev) => {
      // If we just calculated and user types an operator: continue from previous result
      if (isEvaluated) {
        setIsEvaluated(false);
        if (isArithmeticOp) {
          return `${result !== '0' ? result : '0'}${val}`;
        }
        // If user types a number, decimal, or paren: start fresh
        if (val === '.') return '0.';
        return val;
      }

      // Smart operator replacement: if expression ends with an operator and user clicks another operator
      if (isArithmeticOp) {
        if (prev.endsWith(' + ') || prev.endsWith(' − ') || prev.endsWith(' × ') || prev.endsWith(' ÷ ')) {
          return prev.slice(0, -3) + val;
        }
        if (prev === '') {
          return `0${val}`;
        }
      }

      // Smart decimal handling: avoid duplicate '.' in the current number segment
      if (val === '.') {
        if (!prev || prev.endsWith(' ') || prev.endsWith('(')) {
          return `${prev}0.`;
        }
        // Extract the current token after the last operator or space
        const lastToken = prev.split(/[\s()+\-*\/^%]+/).pop() || '';
        if (lastToken.includes('.')) {
          return prev; // Ignore duplicate dot
        }
      }

      return prev + val;
    });
  }, [isEvaluated, result]);

  // Append scientific function call e.g. sin(
  const handleFunction = useCallback((fn: string) => {
    setError(null);
    setExpression((prev) => {
      if (isEvaluated) {
        setIsEvaluated(false);
        return `${fn}(`;
      }
      return `${prev}${fn}(`;
    });
  }, [isEvaluated]);

  // Insert constant value or symbol
  const handleConstant = useCallback((name: string) => {
    setError(null);
    const constObj = CONSTANTS[name];
    if (constObj) {
      setExpression((prev) => {
        if (isEvaluated) {
          setIsEvaluated(false);
          return constObj.symbol;
        }
        return `${prev}${constObj.symbol}`;
      });
    }
  }, [isEvaluated]);

  // Clear current entry or all clear
  const handleClear = useCallback(() => {
    setExpression('');
    setResult('0');
    setLivePreview(null);
    setError(null);
    setFraction(undefined);
    setSteps([]);
    setIsEvaluated(false);
  }, []);

  // Backspace single character
  const handleDelete = useCallback(() => {
    setError(null);
    setIsEvaluated(false);
    setExpression((prev) => {
      if (!prev) return '';
      if (prev.endsWith(' + ') || prev.endsWith(' − ') || prev.endsWith(' × ') || prev.endsWith(' ÷ ')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  }, []);

  // Toggle negative/positive sign
  const handleNegate = useCallback(() => {
    setError(null);
    if (isEvaluated) {
      const num = parseFloat(result) || 0;
      const negated = (-num).toString();
      setResult(negated);
      setExpression(negated);
      setIsEvaluated(false);
      return;
    }

    setExpression((prev) => {
      if (!prev) return '-';
      if (prev === '-') return '';
      if (prev.startsWith('-') && !prev.includes(' ')) {
        return prev.slice(1);
      }
      // If ends with a number token, negate that token
      const match = prev.match(/(\s*)(-?\d+(\.\d+)?)$/);
      if (match) {
        const fullMatch = match[0];
        const numStr = match[2];
        const prefix = prev.slice(0, prev.length - fullMatch.length);
        if (numStr.startsWith('-')) {
          return `${prefix} ${numStr.slice(1)}`;
        } else {
          return `${prefix} (-${numStr})`;
        }
      }
      return `-(${prev})`;
    });
  }, [isEvaluated, result]);

  // Primary Equals / Calculate execution
  const handleEquals = useCallback(() => {
    if (!expression.trim()) return;

    const evalRes = evaluateExpression(expression, angleMode);
    if (evalRes.success && evalRes.value !== undefined) {
      let formattedResult = formatStandard(evalRes.value);
      if (formatMode === 'SCI') formattedResult = formatScientific(evalRes.value);
      else if (formatMode === 'ENG') formattedResult = formatEngineering(evalRes.value);
      else if (formatMode === 'FRAC') formattedResult = toFractionString(evalRes.value) || formattedResult;

      setResult(formattedResult);
      setError(null);
      setFraction(evalRes.fraction);
      setSteps(evalRes.steps || []);
      setIsEvaluated(true);

      // Add to history tape
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        expression,
        result: formattedResult,
        numericValue: evalRes.value,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev]);
    } else {
      setError(evalRes.error || 'Syntax Error');
      soundEngine.playError();
    }
  }, [expression, angleMode, formatMode]);

  // Memory Actions
  const handleMemoryAction = useCallback((action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const currentNum = parseFloat(result) || 0;

    switch (action) {
      case 'MC':
        setMemoryValue(0);
        break;
      case 'MR':
        if (memoryValue !== 0) {
          handleInput(memoryValue.toString());
        }
        break;
      case 'MS':
        setMemoryValue(currentNum);
        break;
      case 'M+':
        setMemoryValue((prev) => prev + currentNum);
        break;
      case 'M-':
        setMemoryValue((prev) => prev - currentNum);
        break;
    }
  }, [result, memoryValue, handleInput]);

  // Cycle angle mode (DEG -> RAD -> GRAD -> DEG)
  const toggleAngleMode = useCallback(() => {
    setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : prev === 'RAD' ? 'GRAD' : 'DEG'));
  }, []);

  // Keyboard navigation & hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a form input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        soundEngine.playClick('number');
        handleInput(key);
      } else if (key === '.') {
        e.preventDefault();
        soundEngine.playClick('number');
        handleInput('.');
      } else if (key === '+') {
        e.preventDefault();
        soundEngine.playClick('operator');
        handleInput(' + ');
      } else if (key === '-') {
        e.preventDefault();
        soundEngine.playClick('operator');
        handleInput(' − ');
      } else if (key === '*') {
        e.preventDefault();
        soundEngine.playClick('operator');
        handleInput(' × ');
      } else if (key === '/') {
        e.preventDefault();
        soundEngine.playClick('operator');
        handleInput(' ÷ ');
      } else if (key === '^') {
        e.preventDefault();
        soundEngine.playClick('operator');
        handleInput('^');
      } else if (key === '%') {
        e.preventDefault();
        soundEngine.playClick('operator');
        handleInput('%');
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        soundEngine.playClick('operator');
        handleInput(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        soundEngine.playClick('equals');
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        soundEngine.playClick('action');
        handleDelete();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        soundEngine.playClick('action');
        handleClear();
      } else if (key.toLowerCase() === 'p') {
        e.preventDefault();
        handleConstant('pi');
      } else if (key.toLowerCase() === 'e') {
        e.preventDefault();
        handleConstant('e');
      } else if (key === '!') {
        e.preventDefault();
        handleInput('!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleEquals, handleDelete, handleClear, handleConstant]);

  const openParensCount = getParenthesesBalance(expression);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract (Strict 3 Zones) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <CalcIcon size={16} />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 font-mono">
            Precision Calc
          </span>
        </div>

        {/* Zone 2: Navigation / Mode Switcher */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveMode('scientific')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'scientific'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders size={13} />
            Scientific
          </button>
          <button
            onClick={() => setActiveMode('standard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'standard'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CalcIcon size={13} />
            Standard
          </button>
          <button
            onClick={() => setActiveMode('arithmetic')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'arithmetic'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Divide size={13} />
            Arithmetic Tools
          </button>
          <button
            onClick={() => setActiveMode('grapher')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'grapher'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity size={13} />
            2D Grapher
          </button>
          <button
            onClick={() => setActiveMode('converter')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'converter'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ArrowRightLeft size={13} />
            Unit Matrix
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <History size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded text-[10px]">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Console */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Core Zone */}
        <div className={`space-y-4 ${showHistoryDrawer ? 'lg:col-span-8' : 'lg:col-span-8 lg:col-start-3 max-w-3xl mx-auto w-full'}`}>
          {/* Main Display Unit */}
          <Display
            expression={expression}
            result={result}
            livePreview={livePreview}
            error={error}
            fraction={fraction}
            steps={steps}
            angleMode={angleMode}
            onToggleAngleMode={toggleAngleMode}
            formatMode={formatMode}
            onChangeFormatMode={setFormatMode}
            hasMemory={memoryValue !== 0}
            memoryValue={memoryValue}
            openParensCount={openParensCount}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onToggleHistory={() => setShowHistoryDrawer(!showHistoryDrawer)}
            onToggleGuide={() => setShowGuide(true)}
            historyCount={history.length}
          />

          {/* Active Workstation Mode Body */}
          {activeMode === 'scientific' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
              <KeypadScientific
                onInput={handleInput}
                onClear={handleClear}
                onDelete={handleDelete}
                onEquals={handleEquals}
                onNegate={handleNegate}
                onMemoryAction={handleMemoryAction}
                onConstant={handleConstant}
                onFunction={handleFunction}
              />
            </div>
          )}

          {activeMode === 'standard' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm max-w-lg mx-auto">
              <KeypadBasic
                onInput={handleInput}
                onClear={handleClear}
                onDelete={handleDelete}
                onEquals={handleEquals}
                onNegate={handleNegate}
                onMemoryAction={handleMemoryAction}
                onFunction={handleFunction}
              />
            </div>
          )}

          {activeMode === 'arithmetic' && (
            <ArithmeticTools onInsertValue={(val) => handleInput(val)} />
          )}

          {activeMode === 'grapher' && <FunctionGrapher />}

          {activeMode === 'converter' && <UnitConverter />}

          {/* Quick Scientific Constants Quick Bar */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-mono text-slate-400 overflow-x-auto scrollbar-none">
            <span className="font-semibold text-slate-500 uppercase tracking-wider shrink-0">Constants:</span>
            <div className="flex items-center gap-2 shrink-0">
              {Object.entries(CONSTANTS).map(([k, c]) => (
                <button
                  key={k}
                  onClick={() => handleConstant(k)}
                  title={`${c.name}: ${c.value} ${c.unit || ''}`}
                  className="px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="font-bold text-cyan-400 mr-1">{c.symbol}</span>
                  <span className="text-[10px] text-slate-500">{k}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Calculation History Column / Drawer */}
        {showHistoryDrawer && (
          <div className="lg:col-span-4 h-[680px] sticky top-20">
            <HistoryTape
              history={history}
              onSelectExpression={(expr) => setExpression(expr)}
              onSelectResult={(res) => handleInput(res)}
              onTogglePin={(id) => {
                setHistory((prev) =>
                  prev.map((item) =>
                    item.id === id ? { ...item, isPinned: !item.isPinned } : item
                  )
                );
              }}
              onClearHistory={() => setHistory([])}
              onClose={() => setShowHistoryDrawer(false)}
            />
          </div>
        )}
      </main>

      {/* Keyboard Shortcuts Modal */}
      {showGuide && <KeyboardGuide onClose={() => setShowGuide(false)} />}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <span>Precision Scientific Engine</span>
          <span aria-hidden="true">·</span>
          <span>Shunting-Yard RPN Evaluator</span>
          <span aria-hidden="true">·</span>
          <span>IEEE 754 Floating-Point Precision</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuide(true)}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Keyboard Cheat Sheet
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={handleClear}
            className="hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={12} /> Reset Console
          </button>
        </div>
      </footer>
    </div>
  );
}
