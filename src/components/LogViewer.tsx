import React from 'react';
import { History, Trash2, ShieldAlert, BadgeInfo } from 'lucide-react';
import { BellLog } from '../types';

interface LogViewerProps {
  logs: BellLog[];
  onClearLogs: () => void;
}

export default function LogViewer({ logs, onClearLogs }: LogViewerProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="log-viewer-card">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4" id="log-header">
        <div className="flex items-center gap-2" id="log-title-group">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-800" id="log-title">
            Riwayat Aktivitas & Log Bel Sekolah
          </h2>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95"
            id="btn-clear-logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan Log
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-4" id="log-desc">
        Mencatat riwayat bunyi bel harian untuk pengawasan kelancaran KBM. Menyimpan 50 riwayat aktivitas terakhir di memori komputer lokal (stand-alone).
      </p>

      {logs.length === 0 ? (
        <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400" id="empty-logs">
          <BadgeInfo className="w-7 h-7 text-slate-300 mb-1.5" />
          <h4 className="text-xs font-semibold text-slate-500">Belum Ada Aktivitas Bunyi</h4>
          <p className="text-xxs text-slate-400 mt-0.5">Sistem bel otomatis stand-by menunggu pencapaian waktu jadwal.</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[280px] pr-1 space-y-2.5" id="logs-list-container">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/75 transition-colors rounded-xl border border-slate-100 flex items-start justify-between gap-4 text-xs"
              id={`log-item-${log.id}`}
            >
              <div className="space-y-1" id="log-item-details">
                <div className="flex items-center flex-wrap gap-2" id="log-item-badges">
                  <span className="font-mono font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded text-xxs">
                    {log.timestamp}
                  </span>
                  
                  {log.triggerType === 'Otomatis' ? (
                    <span className="px-2 py-0.5 rounded text-xxs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      🕒 Otomatis
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xxs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      🔧 Manual
                    </span>
                  )}

                  <span className="text-xxs text-slate-400 font-mono">
                    ({log.bellType})
                  </span>
                </div>
                
                <p className="font-semibold text-slate-800" id="log-activity-name">
                  {log.activityName}
                </p>

                {log.speechTextUsed && (
                  <p className="text-xxs text-slate-400 font-serif leading-relaxed" id="log-speech-used">
                    Anonsor: "{log.speechTextUsed}"
                  </p>
                )}
              </div>
              
              <div className="text-right text-xxs text-emerald-600 font-semibold flex items-center gap-1 self-start pt-0.5" id="log-status">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sukses Berdering
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
