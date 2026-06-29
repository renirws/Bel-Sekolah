import React, { useState, useEffect } from 'react';
import { Volume2, AlertTriangle, Play, HelpCircle, VolumeX, MessageSquare, Megaphone, Sliders, Music } from 'lucide-react';
import { audioSystem, CUSTOM_BELLS } from '../utils/audio';
import { BellLog } from '../types';

interface ManualTriggersProps {
  onAddLog: (activityName: string, bellType: string, speechTextUsed?: string) => void;
  playingBell?: { activity: string; secondsRemaining: number } | null;
  onPlayUpbeatMusic?: (activity: string, durationSeconds: number) => void;
  onStopAll?: () => void;
}

export default function ManualTriggers({ onAddLog, playingBell, onPlayUpbeatMusic, onStopAll }: ManualTriggersProps) {
  const [customText, setCustomText] = useState('');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [speechPitch, setSpeechPitch] = useState<number>(0.82);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = audioSystem.getAvailableVoices();
      setVoices(allVoices);
      // Try to find default Indonesian voice (prefer male)
      const indonesians = allVoices.filter(v => v.lang.includes('id') || v.lang.includes('ID'));
      const maleIndo = indonesians.find(v => {
        const nameLower = v.name.toLowerCase();
        return nameLower.includes('ihsan') || nameLower.includes('wira') || nameLower.includes('male') || nameLower.includes('pria') || nameLower.includes('david') || nameLower.includes('mas');
      });
      const targetIndo = maleIndo || indonesians[0];
      if (targetIndo) {
        setSelectedVoice(targetIndo.name);
      } else if (allVoices.length > 0) {
        setSelectedVoice(allVoices[0].name);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTrigger = async (type: string, playFn: () => Promise<void>, label: string) => {
    setIsPlaying(type);
    try {
      await playFn();
      onAddLog(label, type);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlaying(null);
    }
  };

  const handleSpeakCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsPlaying('custom-tts');
    try {
      await audioSystem.speak(customText, selectedVoice, speechRate, speechPitch);
      onAddLog('Pengumuman Suara Manual', 'Speech (TTS)', customText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlaying(null);
    }
  };

  const handleSpeakPreset = async (text: string, label: string) => {
    setIsPlaying('preset-tts');
    try {
      await audioSystem.speak(text, selectedVoice, speechRate, speechPitch);
      onAddLog(label, 'Speech (TTS)', text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlaying(null);
    }
  };

  const stopAllSounds = () => {
    if (onStopAll) {
      onStopAll();
    } else {
      audioSystem.stopAll();
    }
    setIsPlaying(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="manual-triggers-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100" id="manual-header">
        <div className="flex items-center gap-2" id="manual-title-group">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-800" id="manual-title">
            Pemicu Bel Manual (Master Control)
          </h2>
        </div>
        
        {isPlaying && (
          <button
            onClick={stopAllSounds}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-medium border border-rose-100 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            id="btn-stop-all"
            title="Hentikan semua suara dan pengumuman"
          >
            <VolumeX className="w-3.5 h-3.5" />
            Hentikan Suara
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-6" id="manual-desc">
        Klik tombol di bawah ini untuk membunyikan bel sekolah secara langsung di luar jadwal otomatis. Berguna untuk uji coba atau situasi mendesak.
      </p>

      {/* Upbeat Music Section with durations */}
      <div className="mb-6 space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50" id="manual-upbeat-section">
        <div className="flex items-center gap-1.5" id="upbeat-header">
          <Music className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
            Bel Musik Penyemangat (SMK Tanjung Priok 1)
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Bel musik energik stand-alone untuk memacu motivasi belajar mengajar siswa dan guru di koridor sekolah.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="upbeat-button-group">
          <button
            type="button"
            onClick={() => {
              if (onPlayUpbeatMusic) {
                onPlayUpbeatMusic('Bel Masuk Sekolah (Lagu Utama)', 180);
                onAddLog('Bel Masuk Manual', 'Lagu Utama (3 Menit)');
              } else {
                handleTrigger('upbeat-3min', () => audioSystem.playCustomAudio(CUSTOM_BELLS.MASUK, 180), 'Bel Masuk Sekolah (Lagu Utama)');
              }
            }}
            disabled={isPlaying !== null || !!playingBell}
            className="p-3 bg-white hover:bg-emerald-50/50 border border-emerald-100 text-left rounded-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer flex flex-col justify-between group h-20 shadow-sm"
            id="btn-upbeat-3min"
          >
            <span className="text-xxs font-bold text-emerald-500 block uppercase">3 Menit</span>
            <span className="text-xs font-extrabold text-slate-700 leading-tight block mt-1 group-hover:text-emerald-700">Bel Masuk (Lagu)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onPlayUpbeatMusic) {
                onPlayUpbeatMusic('Bel Pulang Sekolah (Lagu Utama)', 180);
                onAddLog('Bel Pulang Manual', 'Lagu Utama (3 Menit)');
              } else {
                handleTrigger('upbeat-pulang', () => audioSystem.playCustomAudio(CUSTOM_BELLS.PULANG, 180), 'Bel Pulang Sekolah (Lagu Utama)');
              }
            }}
            disabled={isPlaying !== null || !!playingBell}
            className="p-3 bg-white hover:bg-rose-50/50 border border-rose-100 text-left rounded-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer flex flex-col justify-between group h-20 shadow-sm"
            id="btn-upbeat-pulang"
          >
            <span className="text-xxs font-bold text-rose-500 block uppercase">3 Menit</span>
            <span className="text-xs font-extrabold text-slate-700 leading-tight block mt-1 group-hover:text-rose-700">Bel Pulang (Lagu)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onPlayUpbeatMusic) {
                onPlayUpbeatMusic('Bel Istirahat KBM (Lagu Utama)', 120);
                onAddLog('Bel Istirahat Manual', 'Lagu Utama (2 Menit)');
              } else {
                handleTrigger('upbeat-2min', () => audioSystem.playCustomAudio(CUSTOM_BELLS.ISTIRAHAT, 120), 'Bel Istirahat KBM (Lagu Utama)');
              }
            }}
            disabled={isPlaying !== null || !!playingBell}
            className="p-3 bg-white hover:bg-amber-50/50 border border-amber-100 text-left rounded-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer flex flex-col justify-between group h-20 shadow-sm"
            id="btn-upbeat-2min"
          >
            <span className="text-xxs font-bold text-amber-500 block uppercase">2 Menit</span>
            <span className="text-xs font-extrabold text-slate-700 leading-tight block mt-1 group-hover:text-amber-700">Bel Istirahat (Lagu)</span>
          </button>
        </div>
      </div>

      {/* Grid of standard quick ring buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6" id="manual-bell-grid">
        <button
          onClick={() => handleTrigger('classic-westminster', () => audioSystem.playWestminster(), 'Suara Bel Klasik (Westminster)')}
          disabled={isPlaying !== null}
          className={`flex items-center justify-between p-3.5 rounded-xl border border-slate-100 text-left transition-all group cursor-pointer ${
            isPlaying === 'classic-westminster'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
              : 'hover:bg-slate-50 text-slate-700 hover:border-slate-200 hover:shadow-sm'
          }`}
          id="btn-manual-westminster"
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Melodi Westminster</span>
            <span className="text-xxs text-slate-400">Bel KBM Klasik 4-nada</span>
          </div>
          <Play className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors ${isPlaying === 'classic-westminster' ? 'text-indigo-600' : ''}`} />
        </button>

        <button
          onClick={() => handleTrigger('classic-dingdong', () => audioSystem.playDingDong(), 'Nada Ding Dong')}
          disabled={isPlaying !== null}
          className={`flex items-center justify-between p-3.5 rounded-xl border border-slate-100 text-left transition-all group cursor-pointer ${
            isPlaying === 'classic-dingdong'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
              : 'hover:bg-slate-50 text-slate-700 hover:border-slate-200 hover:shadow-sm'
          }`}
          id="btn-manual-dingdong"
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Nada Ding Dong</span>
            <span className="text-xxs text-slate-400">2-nada modern berseri</span>
          </div>
          <Play className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors ${isPlaying === 'classic-dingdong' ? 'text-indigo-600' : ''}`} />
        </button>

        <button
          onClick={() => handleTrigger('short-beeps', () => audioSystem.playElectronicBeeps(4), 'Isyarat Pendek (Bip)')}
          disabled={isPlaying !== null}
          className={`flex items-center justify-between p-3.5 rounded-xl border border-slate-100 text-left transition-all group cursor-pointer ${
            isPlaying === 'short-beeps'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
              : 'hover:bg-slate-50 text-slate-700 hover:border-slate-200 hover:shadow-sm'
          }`}
          id="btn-manual-beeps"
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Isyarat Bip Elektronik</span>
            <span className="text-xxs text-slate-400">4x bip untuk pergantian kecil</span>
          </div>
          <Play className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors ${isPlaying === 'short-beeps' ? 'text-indigo-600' : ''}`} />
        </button>

        <button
          onClick={() => handleTrigger('siren-danger', () => audioSystem.playSiren(6), 'Sirene Darurat / Alarm Bahaya')}
          disabled={isPlaying !== null}
          className={`flex items-center justify-between p-3.5 rounded-xl border border-rose-100 text-left transition-all group cursor-pointer ${
            isPlaying === 'siren-danger'
              ? 'bg-rose-50 border-rose-300 text-rose-700 font-medium'
              : 'hover:bg-rose-50/55 text-slate-700 hover:border-rose-200 hover:shadow-sm'
          }`}
          id="btn-manual-siren"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="text-sm font-semibold">Sirene Evakuasi</span>
            </div>
            <span className="text-xxs text-rose-500">Bunyi menyapu terus menerus</span>
          </div>
          <Play className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
        </button>
      </div>

      {/* Voice Tuning & Preset Test Section */}
      <div className="border-t border-slate-100 pt-5 mb-5 space-y-4" id="voice-test-calibration">
        <div className="flex items-center gap-2 mb-1" id="calibration-title">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Kalibrasi & Tes Suara Pengumuman
          </span>
        </div>

        {/* Voice Selection & Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100" id="calibration-controls">
          {/* Voice Select */}
          <div className="flex flex-col gap-1.5" id="voice-select-group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilihan Suara (Voice)</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
              id="select-voice"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option value="">Default System Voice</option>}
            </select>
          </div>

          {/* Speed slider */}
          <div className="flex flex-col gap-1.5" id="speed-slider-group">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kecepatan Suara</label>
              <span className="text-xxs font-mono font-bold text-indigo-600">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              id="slider-speed"
            />
          </div>

          {/* Pitch slider */}
          <div className="flex flex-col gap-1.5" id="pitch-slider-group">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nada Suara (Pitch)</label>
              <span className="text-xxs font-mono font-bold text-indigo-600">{speechPitch}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              id="slider-pitch"
            />
          </div>
        </div>

        {/* Quick voice preset tests */}
        <div className="space-y-2" id="quick-presets">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Music className="w-3 h-3 text-indigo-400" />
            Uji Suara Pengumuman Harian
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="quick-presets-buttons">
            <button
              type="button"
              onClick={() => handleSpeakPreset('Bel masuk gerbang telah berbunyi! Kepada seluruh siswa, mari segera masuk ke ruang kelas dan bersiap dengan penuh semangat untuk memulai petualangan ilmu hari ini! SMK Tanjung Priok 1 Hebat!', 'Tes Bel Masuk')}
              disabled={isPlaying !== null}
              className="px-2.5 py-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 text-xxs font-semibold text-indigo-700 rounded-xl text-left flex items-center justify-between group transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              id="btn-test-masuk"
            >
              <span>1. Pengumuman Masuk Kelas</span>
              <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 text-indigo-600 shrink-0 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => handleSpeakPreset('Saatnya waktu istirahat dimulai! Selamat menikmati istirahat untuk seluruh siswa-siswi tercinta, tetap jaga kebersihan lingkungan ya! SMK Tanjung Priok 1 Hebat!', 'Tes Bel Istirahat')}
              disabled={isPlaying !== null}
              className="px-2.5 py-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 text-xxs font-semibold text-indigo-700 rounded-xl text-left flex items-center justify-between group transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              id="btn-test-istirahat"
            >
              <span>2. Pengumuman Istirahat</span>
              <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 text-indigo-600 shrink-0 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => handleSpeakPreset('Semangat luar biasa! Upacara bendera akan segera dimulai. Seluruh siswa dan siswi dipersilakan segera menuju ke lapangan upacara dengan tertib dan disiplin tinggi! SMK Tanjung Priok 1 Hebat!', 'Tes Bel Upacara')}
              disabled={isPlaying !== null}
              className="px-2.5 py-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 text-xxs font-semibold text-indigo-700 rounded-xl text-left flex items-center justify-between group transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              id="btn-test-upacara"
            >
              <span>3. Pengumuman Upacara</span>
              <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 text-indigo-600 shrink-0 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => handleSpeakPreset('Luar biasa, perjuangan belajar mengajar hari ini telah selesai dengan sukses! Mari kita berdoa dan pulang ke rumah masing-masing dengan tertib. Hati-hati di jalan, dan sampai jumpa besok pagi dengan semangat baru! SMK Tanjung Priok 1 Hebat!', 'Tes Bel Pulang')}
              disabled={isPlaying !== null}
              className="px-2.5 py-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 text-xxs font-semibold text-indigo-700 rounded-xl text-left flex items-center justify-between group transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              id="btn-test-pulang"
            >
              <span>4. Pengumuman Pulang</span>
              <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 text-indigo-600 shrink-0 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Text to Speech form */}
      <form onSubmit={handleSpeakCustom} className="border-t border-slate-100 pt-5" id="manual-tts-form">
        <label htmlFor="custom-announcement" className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5" id="label-tts">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Ketik Pengumuman Suara (TTS) Instan
        </label>
        
        <div className="flex gap-2" id="input-tts-group">
          <input
            id="custom-announcement"
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            disabled={isPlaying !== null}
            placeholder="Ketik pengumuman, misal: Kepada Bapak Guru piket ditunggu di ruang kepala sekolah..."
            className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={isPlaying !== null || !customText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 disabled:shadow-none text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            id="btn-submit-tts"
          >
            <Volume2 className="w-4 h-4" />
            Lafalkan
          </button>
        </div>
        <p className="text-xxs text-slate-400 mt-2" id="tts-helper">
          *Suara dibacakan otomatis dengan artikulasi bahasa Indonesia formal menggunakan driver suara browser.
        </p>
      </form>
    </div>
  );
}
