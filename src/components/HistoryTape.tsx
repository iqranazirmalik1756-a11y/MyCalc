import React from 'react';
import { Trash2, Download, X, Bookmark, BookmarkCheck } from 'lucide-react';
import { HistoryItem } from '../types/calculator';

interface HistoryTapeProps {
  history: HistoryItem[];
  onSelectExpression: (expr: string) => void;
  onSelectResult: (res: string) => void;
  onTogglePin: (id: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({
  history,
  onSelectExpression,
  onSelectResult,
  onTogglePin,
  onClearHistory,
  onClose,
}) => {
  const exportHistory = () => {
    if (!history.length) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Expression,Result']
        .concat(
          history.map(
            (item) =>
              `"${new Date(item.timestamp).toISOString()}","${item.expression.replace(/"/g, '""')}","${item.result}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calculator_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Calculation History</span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40">
            {history.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {history.length > 0 && (
            <>
              <button
                onClick={exportHistory}
                title="Export history as CSV"
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              >
                <Download size={15} />
              </button>
              <button
                onClick={onClearHistory}
                title="Clear all history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            title="Close tape"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-sm">
            <p>No calculations recorded yet.</p>
            <p className="text-xs mt-1 text-slate-600">Calculations will be saved automatically as you press =</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className={`group p-3 rounded-xl border transition-all text-right font-mono ${
                item.isPinned
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <button
                  onClick={() => onTogglePin(item.id)}
                  title={item.isPinned ? 'Unpin calculation' : 'Pin calculation'}
                  className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  {item.isPinned ? (
                    <BookmarkCheck size={13} className="text-amber-400" />
                  ) : (
                    <Bookmark size={13} />
                  )}
                </button>
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              {/* Expression */}
              <div
                onClick={() => onSelectExpression(item.expression)}
                title="Click to restore expression into editor"
                className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer truncate transition-colors"
              >
                {item.expression}
              </div>

              {/* Result */}
              <div
                onClick={() => onSelectResult(item.result)}
                title="Click to insert result into calculation"
                className="text-cyan-300 font-bold text-lg mt-1 cursor-pointer hover:text-cyan-200 transition-colors"
              >
                = {item.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
