import React, { useState } from 'react';
import { Percent, Divide, Layers, Hash } from 'lucide-react';
import { gcd, lcm, toFractionString } from '../utils/mathEngine';

interface ArithmeticToolsProps {
  onInsertValue: (val: string) => void;
}

export const ArithmeticTools: React.FC<ArithmeticToolsProps> = ({ onInsertValue }) => {
  const [activeTab, setActiveTab] = useState<'percent' | 'division' | 'fraction' | 'gcd_lcm'>('division');

  // Division with Remainder state
  const [dividend, setDividend] = useState('255');
  const [divisor, setDivisor] = useState('12');

  // Percentage calculator state
  const [percentX, setPercentX] = useState('15');
  const [percentOfY, setPercentOfY] = useState('240');

  // Fraction simplifier state
  const [fracNum, setFracNum] = useState('36');
  const [fracDen, setFracDen] = useState('48');

  // GCD & LCM state
  const [numA, setNumA] = useState('48');
  const [numB, setNumB] = useState('64');

  // Compute Division with Remainder
  const dVal = parseFloat(dividend);
  const divVal = parseFloat(divisor);
  let divQuotient: number | null = null;
  let divRemainder: number | null = null;
  let divDecimal: string | null = null;

  if (!Number.isNaN(dVal) && !Number.isNaN(divVal) && divVal !== 0) {
    divQuotient = Math.trunc(dVal / divVal);
    divRemainder = dVal % divVal;
    divDecimal = (dVal / divVal).toFixed(4);
  }

  // Compute Percentage
  const pX = parseFloat(percentX);
  const pY = parseFloat(percentOfY);
  const percentResult = !Number.isNaN(pX) && !Number.isNaN(pY) ? ((pX / 100) * pY).toString() : '0';
  const percentAdded = !Number.isNaN(pX) && !Number.isNaN(pY) ? (pY * (1 + pX / 100)).toString() : '0';
  const percentSubtracted = !Number.isNaN(pX) && !Number.isNaN(pY) ? (pY * (1 - pX / 100)).toString() : '0';

  // Compute Fraction simplification
  const fN = parseInt(fracNum, 10);
  const fD = parseInt(fracDen, 10);
  let simplifiedFrac = '';
  let fracDecimalVal = '';
  if (!Number.isNaN(fN) && !Number.isNaN(fD) && fD !== 0) {
    const common = gcd(fN, fD);
    simplifiedFrac = `${fN / common} / ${fD / common}`;
    fracDecimalVal = (fN / fD).toString();
  }

  // Compute GCD & LCM
  const gA = parseInt(numA, 10);
  const gB = parseInt(numB, 10);
  let computedGcd: number | null = null;
  let computedLcm: number | null = null;
  if (!Number.isNaN(gA) && !Number.isNaN(gB) && gA !== 0 && gB !== 0) {
    computedGcd = gcd(gA, gB);
    computedLcm = lcm(gA, gB);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Specialized Arithmetic Solvers</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('division')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'division' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Divide size={13} /> Division & Remainder
          </button>
          <button
            onClick={() => setActiveTab('percent')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'percent' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent size={13} /> Percentage
          </button>
          <button
            onClick={() => setActiveTab('fraction')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'fraction' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={13} /> Fractions
          </button>
          <button
            onClick={() => setActiveTab('gcd_lcm')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'gcd_lcm' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash size={13} /> GCD / LCM
          </button>
        </div>
      </div>

      {/* Tab: Division with Remainder */}
      {activeTab === 'division' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">Long Division Inputs</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Dividend</label>
                <input
                  type="number"
                  value={dividend}
                  onChange={(e) => setDividend(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-slate-500 font-mono mt-4">÷</span>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Divisor</label>
                <input
                  type="number"
                  value={divisor}
                  onChange={(e) => setDivisor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono">
            <div className="text-xs text-slate-400 mb-2">Arithmetic Breakdown</div>
            {divQuotient !== null && divRemainder !== null ? (
              <div className="space-y-2">
                <div className="text-lg font-bold text-cyan-300">
                  {divQuotient} <span className="text-amber-400 text-sm font-normal">R {divRemainder}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Exact Decimal: <span className="text-slate-200">{divDecimal}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Verification: {divisor} × {divQuotient} + {divRemainder} = {dividend}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onInsertValue(divQuotient!.toString())}
                    className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded cursor-pointer"
                  >
                    Use Quotient ({divQuotient})
                  </button>
                  <button
                    onClick={() => onInsertValue(divRemainder!.toString())}
                    className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded cursor-pointer"
                  >
                    Use Remainder ({divRemainder})
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-400">Division by zero or invalid inputs</div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Percentage Calculations */}
      {activeTab === 'percent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">Percentage Inputs</div>
            <div className="flex items-center gap-2 font-mono">
              <div className="w-24">
                <label className="text-[10px] text-slate-500 uppercase">Percent (%)</label>
                <input
                  type="number"
                  value={percentX}
                  onChange={(e) => setPercentX(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none"
                />
              </div>
              <span className="text-slate-500 mt-4">% of</span>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase">Base Number</label>
                <input
                  type="number"
                  value={percentOfY}
                  onChange={(e) => setPercentOfY(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{percentX}% of {percentOfY}:</span>
              <button
                onClick={() => onInsertValue(percentResult)}
                className="text-cyan-300 font-bold hover:underline cursor-pointer"
              >
                {percentResult}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{percentOfY} + {percentX}% (Add/Tax/Tip):</span>
              <button
                onClick={() => onInsertValue(percentAdded)}
                className="text-emerald-300 font-bold hover:underline cursor-pointer"
              >
                {percentAdded}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{percentOfY} − {percentX}% (Discount):</span>
              <button
                onClick={() => onInsertValue(percentSubtracted)}
                className="text-amber-300 font-bold hover:underline cursor-pointer"
              >
                {percentSubtracted}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Fraction Simplifier */}
      {activeTab === 'fraction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="text-xs text-slate-400">Fraction Inputs</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase">Numerator</label>
                <input
                  type="number"
                  value={fracNum}
                  onChange={(e) => setFracNum(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none"
                />
              </div>
              <span className="text-slate-500 mt-4 text-lg">/</span>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase">Denominator</label>
                <input
                  type="number"
                  value={fracDen}
                  onChange={(e) => setFracDen(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-xs text-slate-400">Reduced Form:</div>
            <div className="text-2xl font-bold text-cyan-300">{simplifiedFrac || '—'}</div>
            <div className="text-xs text-slate-400">Decimal Value: {fracDecimalVal}</div>
            <button
              onClick={() => onInsertValue(fracDecimalVal)}
              className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded self-start cursor-pointer mt-1"
            >
              Send Decimal to Calculator ({fracDecimalVal})
            </button>
          </div>
        </div>
      )}

      {/* Tab: GCD & LCM */}
      {activeTab === 'gcd_lcm' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="text-xs text-slate-400">Integer Inputs</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase">Number A</label>
                <input
                  type="number"
                  value={numA}
                  onChange={(e) => setNumA(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none"
                />
              </div>
              <span className="text-slate-500 mt-4">&</span>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase">Number B</label>
                <input
                  type="number"
                  value={numB}
                  onChange={(e) => setNumB(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Greatest Common Divisor (GCD):</span>
              <button
                onClick={() => onInsertValue(computedGcd?.toString() || '0')}
                className="text-cyan-300 font-bold hover:underline cursor-pointer"
              >
                {computedGcd ?? '—'}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Least Common Multiple (LCM):</span>
              <button
                onClick={() => onInsertValue(computedLcm?.toString() || '0')}
                className="text-amber-300 font-bold hover:underline cursor-pointer"
              >
                {computedLcm ?? '—'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
