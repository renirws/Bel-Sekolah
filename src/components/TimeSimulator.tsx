import React, { useMemo } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, FastForward, Clock, Lightbulb } from 'lucide-react';
import { ScheduleProfile } from '../types';

interface TimeSimulatorProps {
  simulationEnabled: boolean;
  onToggleSimulation: (enabled: boolean) => void;
  simulatedTime: Date;
  onSetSimulatedTime: (time: Date) => void;
  activeProfile: ScheduleProfile;
}

export default function TimeSimulator({
  simulationEnabled,
  onToggleSimulation,
  simulatedTime,
  onSetSimulatedTime,
  activeProfile,
}: TimeSimulatorProps) {
  
  // Format current simulated time
  const currentHour = simulatedTime.getHours();
  const currentMinute = simulatedTime.getMinutes();

  // Handle slider changes
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const newHour = Math.floor(value / 60);
    const newMinute = value % 60;
    
    const newTime = new Date(simulatedTime);
    newTime.setHours(newHour, newMinute, 0, 0);
    onSetSimulatedTime(newTime);
  };

  // Convert current simulated hour & minute to total minutes for slider value
  const sliderValue = currentHour * 60 + currentMinute;

  // Make mock jump times (1 minute before the main school bells of current profile)
  const jumpButtons = useMemo(() => {
    return activeProfile.items.map((item) => {
      // Create minutes: 1 minute before item.hour & item.minute
      let targetHour = item.hour;
      let targetMin = item.minute - 1;
      
      if (targetMin < 0) {
        targetMin = 59;
        targetHour = (targetHour - 1 + 24) % 24;
      }
      
      return {
        label: `${String(targetHour).padStart(2, '0')}:${String(targetMin).padStart(2, '0')}`,
        targetText: `${String(item.hour).padStart(2, '0')}:${String(item.minute).padStart(2, '0')}`,
        hour: targetHour,
        minute: targetMin,
        activity: item.activity,
      };
    }).slice(0, 5); // Limit to top 5 bells to keep layout pristine
  }, [activeProfile]);

  const jumpTo = (hour: number, minute: number) => {
    // Make sure simulation is active
    if (!simulationEnabled) {
      onToggleSimulation(true);
    }
    const newTime = new Date(simulatedTime);
    newTime.setHours(hour, minute, 0, 0);
    onSetSimulatedTime(newTime);
  };

  // Quick preset hour shortcuts
  const hourPresets = [
    { label: 'Pagi (06:40)', h: 6, m: 40 },
    { label: 'KBM Dimulai (06:59)', h: 6, m: 59 },
    { label: 'Siang Istirahat (10:14)', h: 10, m: 14 },
    { label: 'Selesai KBM (13:44)', h: 13, m: 44 },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6" id="time-simulator-card">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-3 text-slate-800" id="sim-header">
        <div className="flex items-center gap-2" id="sim-title-group">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-semibold" id="sim-title">
              Alat Simulasi Waktu Uji Coba (Inspektur Bel)
            </h3>
            <p className="text-xxs text-slate-400">Gunakan ini untuk mempercepat waktu uji coba bel otomatis tanpa menunggu seharian.</p>
          </div>
        </div>

        {/* Big On/Off Toggle */}
        <button
          onClick={() => onToggleSimulation(!simulationEnabled)}
          className="flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all text-sm font-semibold"
          id="btn-toggle-simulation"
        >
          {simulationEnabled ? (
            <span className="flex items-center gap-1 text-indigo-600">
              <ToggleRight className="w-8 h-8" />
              Simulasi Jalan
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <ToggleLeft className="w-8 h-8" />
              Sesuai Jam PC
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="sim-body">
        {/* SLIDER BLOCK */}
        <div className="md:col-span-8 space-y-4" id="sim-slider-block">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1" id="slider-labels">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Geser Jam Simulasi:
              </span>
              <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold border border-indigo-100">
                {String(currentHour).padStart(2, '0')}:{String(currentMinute).padStart(2, '0')}
              </span>
            </div>

            <label htmlFor="sim-time-slider" className="sr-only">Geser Jam Simulasi</label>
            <input
              id="sim-time-slider"
              type="range"
              min="0"
              max="1439" // 24 * 60 - 1
              value={sliderValue}
              onChange={handleSliderChange}
              disabled={!simulationEnabled}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1" id="slider-ticks">
              <span>00:00 (Tengah Malam)</span>
              <span>12:00 (Siang)</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-2">Lompat Cepat ke Jam KBM:</span>
            <div className="flex flex-wrap gap-2" id="sim-quick-presets">
              {hourPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => jumpTo(preset.h, preset.m)}
                  className={`px-2.5 py-1 text-xxs font-medium rounded-lg border transition-colors cursor-pointer ${
                    simulationEnabled && currentHour === preset.h && currentMinute === preset.m
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SMART ACTION JUMPS */}
        <div className="md:col-span-4 bg-white/70 border border-slate-200/50 rounded-xl p-4 flex flex-col justify-between" id="sim-smart-banner">
          <div id="sim-instructions">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Lompat 1 Menit Sebelum Bel:
            </span>
            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              Klik salah satu pemicu dari jadwal Anda agar bel langsung berbunyi dalam 60 detik simulasi:
            </p>
          </div>

          <div className="space-y-1.5" id="sim-jump-buttons">
            {jumpButtons.length === 0 ? (
              <span className="text-xxs text-slate-400 italic">Tambahkan isi jadwal terlebih dahulu...</span>
            ) : (
              jumpButtons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => jumpTo(btn.hour, btn.minute)}
                  className="w-full text-left bg-white hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 px-3 py-1.5 rounded-lg flex items-center justify-between text-xxs font-medium text-slate-600 hover:text-indigo-700 transition-all cursor-pointer group shadow-xxs"
                >
                  <span className="truncate max-w-[130px]" title={btn.activity}>{btn.activity}</span>
                  <span className="font-mono text-indigo-600 flex items-center gap-1">
                    {btn.label}
                    <FastForward className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
