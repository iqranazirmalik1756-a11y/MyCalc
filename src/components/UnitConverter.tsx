import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

type ConverterTab = 'units' | 'bases';

interface UnitDefinition {
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNIT_CATEGORIES: Record<string, { label: string; units: Record<string, UnitDefinition> }> = {
  length: {
    label: 'Length',
    units: {
      m: { name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      km: { name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      cm: { name: 'Centimeter', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (v) => v / 0.01 },
      mm: { name: 'Millimeter', symbol: 'mm', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      in: { name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      ft: { name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      yd: { name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      mi: { name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    },
  },
  mass: {
    label: 'Mass / Weight',
    units: {
      kg: { name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      g: { name: 'Gram', symbol: 'g', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      mg: { name: 'Milligram', symbol: 'mg', toBase: (v) => v * 1e-6, fromBase: (v) => v / 1e-6 },
      lb: { name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      oz: { name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (v) => v / 0.028349523 },
      t: { name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    },
  },
  temperature: {
    label: 'Temperature',
    units: {
      C: { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      F: { name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      K: { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    },
  },
  speed: {
    label: 'Speed',
    units: {
      mps: { name: 'Meters / sec', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      kmh: { name: 'Kilometers / hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      mph: { name: 'Miles / hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      knot: { name: 'Knot', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    },
  },
  data: {
    label: 'Digital Data',
    units: {
      B: { name: 'Byte', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      KB: { name: 'Kilobyte', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      MB: { name: 'Megabyte', symbol: 'MB', toBase: (v) => v * Math.pow(1024, 2), fromBase: (v) => v / Math.pow(1024, 2) },
      GB: { name: 'Gigabyte', symbol: 'GB', toBase: (v) => v * Math.pow(1024, 3), fromBase: (v) => v / Math.pow(1024, 3) },
      TB: { name: 'Terabyte', symbol: 'TB', toBase: (v) => v * Math.pow(1024, 4), fromBase: (v) => v / Math.pow(1024, 4) },
    },
  },
  pressure: {
    label: 'Pressure',
    units: {
      Pa: { name: 'Pascal', symbol: 'Pa', toBase: (v) => v, fromBase: (v) => v },
      kPa: { name: 'Kilopascal', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      bar: { name: 'Bar', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      atm: { name: 'Atmosphere', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      psi: { name: 'PSI', symbol: 'psi', toBase: (v) => v * 6894.757, fromBase: (v) => v / 6894.757 },
    },
  },
};

export const UnitConverter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConverterTab>('units');

  // Units tab state
  const [category, setCategory] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<string>('1');

  // Base programmer converter state
  const [decVal, setDecVal] = useState<string>('255');

  // Calculate unit conversion
  const currentCategory = UNIT_CATEGORIES[category];
  const numInput = parseFloat(inputValue);

  let convertedOutput = '0';
  if (!Number.isNaN(numInput) && currentCategory.units[fromUnit] && currentCategory.units[toUnit]) {
    const baseVal = currentCategory.units[fromUnit].toBase(numInput);
    const targetVal = currentCategory.units[toUnit].fromBase(baseVal);
    convertedOutput = Number(targetVal.toPrecision(8)).toString();
  }

  // Handle programmer base conversions
  const parsedDec = parseInt(decVal, 10);
  const isValidDec = !Number.isNaN(parsedDec);
  const hexVal = isValidDec ? (parsedDec >>> 0).toString(16).toUpperCase() : '0';
  const octVal = isValidDec ? (parsedDec >>> 0).toString(8) : '0';
  const binVal = isValidDec ? (parsedDec >>> 0).toString(2).padStart(8, '0') : '0';

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const unitKeys = Object.keys(UNIT_CATEGORIES[newCat].units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1] || unitKeys[0]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Header and Mode Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Scientific Conversion Matrix</span>
        </div>
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'units'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Physical Units
          </button>
          <button
            onClick={() => setActiveTab('bases')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'bases'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Base / Programmer
          </button>
        </div>
      </div>

      {activeTab === 'units' ? (
        <div className="flex flex-col gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.entries(UNIT_CATEGORIES).map(([catKey, catData]) => (
              <button
                key={catKey}
                onClick={() => handleCategoryChange(catKey)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  category === catKey
                    ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {catData.label}
              </button>
            ))}
          </div>

          {/* Conversion Input & Output */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* From Box */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">From</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-transparent text-xl font-mono font-semibold text-slate-100 focus:outline-none"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border border-slate-700"
              >
                {Object.entries(currentCategory.units).map(([uKey, uData]) => (
                  <option key={uKey} value={uKey}>
                    {uData.name} ({uData.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:col-span-1">
              <button
                onClick={swapUnits}
                title="Swap units"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-transform active:rotate-180"
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* To Box */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">To</label>
              <div className="text-xl font-mono font-bold text-cyan-300 truncate tabular-nums">
                {convertedOutput}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border border-slate-700"
              >
                {Object.entries(currentCategory.units).map(([uKey, uData]) => (
                  <option key={uKey} value={uKey}>
                    {uData.name} ({uData.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Programmer Bases Tab (HEX, DEC, OCT, BIN) */
        <div className="flex flex-col gap-3 font-mono">
          {/* Decimal Input */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-cyan-400">DEC (Decimal - Base 10)</span>
            </div>
            <input
              type="number"
              value={decVal}
              onChange={(e) => setDecVal(e.target.value)}
              placeholder="Enter integer..."
              className="w-full bg-transparent text-xl font-bold text-slate-100 focus:outline-none"
            />
          </div>

          {/* Hexadecimal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-0.5">HEX (Hexadecimal - Base 16)</div>
              <div className="text-lg font-bold text-amber-300 tracking-wider">0x{hexVal}</div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`0x${hexVal}`)}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded"
            >
              Copy
            </button>
          </div>

          {/* Octal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-0.5">OCT (Octal - Base 8)</div>
              <div className="text-lg font-bold text-emerald-300 tracking-wider">0o{octVal}</div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`0o${octVal}`)}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded"
            >
              Copy
            </button>
          </div>

          {/* Binary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="overflow-x-auto">
              <div className="text-xs text-slate-400 font-semibold mb-0.5">BIN (Binary - Base 2)</div>
              <div className="text-base font-bold text-cyan-400 tracking-widest break-all">
                {binVal}
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(binVal)}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded ml-2 shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
