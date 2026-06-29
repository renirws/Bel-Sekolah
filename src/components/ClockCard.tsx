import React, { useMemo } from 'react';
import { Clock, Play, Pause, Calendar, ArrowRight, ShieldCheck, ListMusic, Layers } from 'lucide-react';
import { ScheduleItem, ScheduleProfile } from '../types';
import SmkTanjungPriokLogo from './SmkTanjungPriokLogo';

interface ClockCardProps {
  currentDate: Date;
  statusEnabled: boolean;
  onToggleStatus: () => void;
  activeProfile: ScheduleProfile;
  allProfiles: ScheduleProfile[];
  onSelectProfile: (id: string) => void;
}

export default function ClockCard({
  currentDate,
  statusEnabled,
  onToggleStatus,
  activeProfile,
  allProfiles,
  onSelectProfile,
}: ClockCardProps) {
  
  // Format Indian & Indonesian languages
  const formattedTime = useMemo(() => {
    return currentDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [currentDate]);

  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate]);

  // Convert Date to minutes from midnight
  const currentMinutes = useMemo(() => {
    return currentDate.getHours() * 60 + currentDate.getMinutes();
  }, [currentDate]);

  // Find next bell and current active session
  const { currentSession, nextBell, minutesRemaining, secondsRemaining, countdownStr } = useMemo(() => {
    const list = [...activeProfile.items].sort((a, b) => {
      const minA = a.hour * 60 + a.minute;
      const minB = b.hour * 60 + b.minute;
      return minA - minB;
    });

    if (list.length === 0) {
      return {
        currentSession: null,
        nextBell: null,
        minutesRemaining: 0,
        secondsRemaining: 0,
        countdownStr: 'Tidak ada jadwal hari ini.'
      };
    }

    let current: ScheduleItem | null = null;
    let next: ScheduleItem | null = null;

    for (let i = 0; i < list.length; i++) {
      const itemMins = list[i].hour * 60 + list[i].minute;
      if (itemMins <= currentMinutes) {
        current = list[i];
      }
      if (itemMins > currentMinutes) {
        next = list[i];
        break;
      }
    }

    let cdStr = '';
    let minsRem = 0;
    let secsRem = 0;

    if (next) {
      const nextMins = next.hour * 60 + next.minute;
      
      // Exact time difference in seconds
      const nextTimeDate = new Date(currentDate);
      nextTimeDate.setHours(next.hour, next.minute, 0, 0);
      
      const diffMs = nextTimeDate.getTime() - currentDate.getTime();
      const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
      
      minsRem = Math.floor(diffSecs / 60);
      secsRem = diffSecs % 60;

      if (minsRem > 60) {
        const hours = Math.floor(minsRem / 60);
        const mins = minsRem % 60;
        cdStr = `${hours} jam ${mins} menit ${secsRem} detik`;
      } else if (minsRem > 0) {
        cdStr = `${minsRem} menit ${secsRem} detik`;
      } else {
        cdStr = `${secsRem} detik`;
      }
    } else {
      cdStr = 'Jadwal hari ini telah selesai.';
    }

    return {
      currentSession: current,
      nextBell: next,
      minutesRemaining: minsRem,
      secondsRemaining: secsRem,
      countdownStr: cdStr
    };
  }, [currentMinutes, activeProfile, currentDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="clock-card-grid">
      
      {/* 1. Large Classic Digital Clock */}
      <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden" id="clock-main-banner">
        {/* Subtle decorative background effect */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute left-10 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[190px]" id="clock-inner">
          <div className="flex justify-between items-start" id="clock-meta">
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/45 px-3.5 py-1.5 rounded-full border border-slate-700/50 text-xs font-semibold backdrop-blur" id="clock-date-group">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{formattedDate}</span>
            </div>

            {/* Active/Inactive Status Badge */}
            <button
              onClick={onToggleStatus}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.03] active:scale-95 ${
                statusEnabled
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/20'
              }`}
              id="status-toggle-badge"
              title={statusEnabled ? "Klik untuk menonaktifkan penjadwalan otomatis" : "Klik untuk mengaktifkan penjadwalan otomatis"}
            >
              {statusEnabled ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>SISTEM AKTIF</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>SISTEM NONAKTIF</span>
                </>
              )}
            </button>
          </div>

          {/* Big Time Display */}
          <div className="my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="digital-clock-face">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-mono tracking-wider tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-emerald-200" id="clock-digital-digits">
              {formattedTime}
            </h1>
            <div className="bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl flex items-center gap-3 self-stretch sm:self-auto shadow-inner" id="clock-badge-priok">
              <SmkTanjungPriokLogo size={40} className="drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" />
              <div className="text-left">
                <span className="text-[9px] font-extrabold text-indigo-300 tracking-wider block uppercase">IDENTITAS KBM</span>
                <p className="text-xs font-black text-white leading-tight">SMK Tanjung Priok 1</p>
                <p className="text-[10px] text-emerald-400 font-extrabold mt-0.5 tracking-wide">SMK Bisa Hebat!</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-slate-800/70 pt-4 text-xs text-slate-400" id="clock-footer">
            <p className="flex items-center gap-1.5" id="running-on-tag">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tersambung ke Speaker Kelas (Stand Alone)
            </p>
            <p className="font-mono text-emerald-400 font-semibold" id="bell-count-alert">
              {activeProfile.items.length} Pemicu Bel dalam Profile ini
            </p>
          </div>
        </div>
      </div>

      {/* 2. Today's Summary & Countdowns */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between" id="today-summary-card">
        <div>
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Keadaan KBM Sekarang
          </h2>
          
          <div className="space-y-4 mb-5" id="current-sessions-display">
            {/* Session Berjalan */}
            <div className="p-3 bg-slate-50 rounded-xl" id="current-session-box">
              <span className="text-xxs text-slate-400 uppercase font-bold tracking-wider">Sesi Sedang Berjalan:</span>
              <p className="text-sm font-bold text-slate-700 mt-1" id="val-current-session">
                {currentSession ? currentSession.activity : 'Belum pelajaran / Belum dimulai'}
              </p>
              {currentSession && (
                <span className="text-xxs text-slate-400 font-mono" id="time-current-session">
                  Dimulai pada pukul {currentSession.time}
                </span>
              )}
            </div>

            {/* Bel Berikutnya */}
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-50" id="next-session-box">
              <div className="flex justify-between items-center" id="next-session-header">
                <span className="text-xxs text-indigo-500 uppercase font-bold tracking-wider">Bel Berikutnya:</span>
                {nextBell && (
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md" id="badge-next-bell-time">
                    {nextBell.time}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-700 mt-1 flex items-center gap-1" id="val-next-session">
                {nextBell ? nextBell.activity : 'Selesai untuk hari ini'}
              </p>
              
              {/* Countdown Tracker */}
              <div className="mt-2 pt-2 border-t border-indigo-100/30 text-xxs text-indigo-600 flex items-center gap-1.5" id="countdown-area">
                <Clock className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
                <span className="font-semibold">{countdownStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Switcher */}
        <div className="border-t border-slate-100 pt-4" id="banner-active-profile">
          <label htmlFor="profile-select-combobox" className="text-xxs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1.5" id="label-profile-select">
            <ListMusic className="w-3 h-3 text-indigo-500" />
            Pilih Profil Jadwal Hari Ini:
          </label>
          <select
            id="profile-select-combobox"
            value={activeProfile.id}
            onChange={(e) => onSelectProfile(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.items.length} Pemicu Bel)
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
