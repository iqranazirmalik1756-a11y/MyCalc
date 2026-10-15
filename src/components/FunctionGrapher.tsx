import React, { useState, useMemo, useRef } from 'react';
import { evaluateExpression } from '../utils/mathEngine';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export const FunctionGrapher: React.FC = () => {
  const [expr, setExpr] = useState('sin(x)');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; pixelX: number; pixelY: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const width = 600;
  const height = 360;

  // Preset expressions for quick testing
  const presets = [
    { label: 'sin(x)', formula: 'sin(x)' },
    { label: 'cos(x)', formula: 'cos(x)' },
    { label: 'x² - 4', formula: 'x^2 - 4' },
    { label: 'x³ - 3x', formula: 'x^3 - 3*x' },
    { label: '1 / x', formula: '1 / x' },
    { label: 'eˣ', formula: 'exp(x)' },
    { label: 'ln(x)', formula: 'ln(x)' },
  ];

  // Map math coordinate (x, y) to SVG canvas coordinate
  const toPixelX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const toPixelY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  const toMathX = (px: number) => xMin + (px / width) * (xMax - xMin);

  // Generate SVG path points
  const { pathData, points } = useMemo(() => {
    const pts: { x: number; y: number; px: number; py: number }[] = [];
    let d = '';
    const steps = 300;
    const dx = (xMax - xMin) / steps;

    let isDrawing = false;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      // Substitute x in expression
      // We evaluate in radians for math functions
      const safeExpr = expr.replace(/\bx\b/g, `(${x})`);
      const res = evaluateExpression(safeExpr, 'RAD');

      if (res.success && res.value !== undefined && Number.isFinite(res.value)) {
        const y = res.value;
        const px = toPixelX(x);
        const py = toPixelY(y);

        // Clamp or discard if drastically out of bounds
        if (py >= -100 && py <= height + 100) {
          pts.push({ x, y, px, py });
          if (!isDrawing) {
            d += `M ${px.toFixed(1)} ${py.toFixed(1)} `;
            isDrawing = true;
          } else {
            d += `L ${px.toFixed(1)} ${py.toFixed(1)} `;
          }
        } else {
          isDrawing = false;
        }
      } else {
        isDrawing = false;
      }
    }

    return { pathData: d, points: pts };
  }, [expr, xMin, xMax, yMin, yMax]);

  // Handle canvas mouse move for coordinate hover HUD
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mousePx = ((e.clientX - rect.left) / rect.width) * width;
    const mouseX = toMathX(mousePx);

    const safeExpr = expr.replace(/\bx\b/g, `(${mouseX})`);
    const res = evaluateExpression(safeExpr, 'RAD');

    if (res.success && res.value !== undefined && Number.isFinite(res.value)) {
      setHoverPoint({
        x: mouseX,
        y: res.value,
        pixelX: mousePx,
        pixelY: toPixelY(res.value),
      });
    } else {
      setHoverPoint(null);
    }
  };

  const handleZoom = (factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xHalfSpan = ((xMax - xMin) / 2) * factor;
    const yHalfSpan = ((yMax - yMin) / 2) * factor;
    setXMin(xCenter - xHalfSpan);
    setXMax(xCenter + xHalfSpan);
    setYMin(yCenter - yHalfSpan);
    setYMax(yCenter + yHalfSpan);
  };

  const handleReset = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-5);
    setYMax(5);
  };

  // Generate grid ticks
  const xZeroPx = toPixelX(0);
  const yZeroPx = toPixelY(0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Top Header & Preset Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">2D Function Plotter</span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40">
            f(x)
          </span>
        </div>

        {/* Function Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.formula}
              onClick={() => setExpr(p.formula)}
              className={`px-2 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                expr === p.formula
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
        <span className="text-cyan-400 font-mono font-bold text-sm">f(x) =</span>
        <input
          type="text"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="e.g. sin(x), x^2 - 4, cos(2*x)"
          className="flex-1 bg-transparent text-slate-100 font-mono text-sm focus:outline-none"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom In"
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            title="Zoom Out"
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Graph SVG Canvas */}
      <div className="relative w-full aspect-[5/3] sm:aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 cursor-crosshair">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          {/* Coordinate Axes */}
          {/* X Axis */}
          {yZeroPx >= 0 && yZeroPx <= height && (
            <line
              x1="0"
              y1={yZeroPx}
              x2={width}
              y2={yZeroPx}
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="1.5"
            />
          )}

          {/* Y Axis */}
          {xZeroPx >= 0 && xZeroPx <= width && (
            <line
              x1={xZeroPx}
              y1="0"
              x2={xZeroPx}
              y2={height}
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="1.5"
            />
          )}

          {/* Plotted Function Curve */}
          <path
            d={pathData}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Point & Crosshair */}
          {hoverPoint && (
            <>
              {/* Hairline Crosshair */}
              <line
                x1={hoverPoint.pixelX}
                y1="0"
                x2={hoverPoint.pixelX}
                y2={height}
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1="0"
                y1={hoverPoint.pixelY}
                x2={width}
                y2={hoverPoint.pixelY}
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Dot */}
              <circle
                cx={hoverPoint.pixelX}
                cy={hoverPoint.pixelY}
                r="4.5"
                fill="#22d3ee"
                stroke="#082f49"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {/* Live Coordinate Probe HUD */}
        {hoverPoint && (
          <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 backdrop-blur-sm pointer-events-none shadow-md">
            x: {hoverPoint.x.toFixed(3)} · y: {hoverPoint.y.toFixed(3)}
          </div>
        )}

        {/* Range Bounds Watermark */}
        <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-500 pointer-events-none">
          [{xMin.toFixed(1)}, {xMax.toFixed(1)}] × [{yMin.toFixed(1)}, {yMax.toFixed(1)}]
        </div>
      </div>
    </div>
  );
};
