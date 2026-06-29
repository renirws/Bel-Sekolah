import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, Waves, HardDrive, Info, Check, BookOpen, VolumeX, Volume2 } from 'lucide-react';
import { ScheduleItem, ScheduleProfile, BellLog } from './types';
import { parseScheduleText, generateAnnouncementText } from './utils/parser';
import { audioSystem, CUSTOM_BELLS } from './utils/audio';

// Custom Components
import Logo from './components/Logo';
import ClockCard from './components/ClockCard';
import ManualTriggers from './components/ManualTriggers';
import ScheduleParser from './components/ScheduleParser';
import LogViewer from './components/LogViewer';
import TimeSimulator from './components/TimeSimulator';

// Default mock profiles so app works immediately
const DEFAULT_PROFILES: ScheduleProfile[] = [
  {
    id: 'selasa-kamis',
    name: 'Hari Selasa - Kamis (KBM Normal)',
    rawText: `# JADWAL HARI SELASA - KAMIS (KBM Normal)
06:30 - Jam Pelajaran ke-1 Dimulai [both]
07:15 - Jam Pelajaran ke-2 [both]
08:00 - Jam Pelajaran ke-3 [both]
08:45 - Jam Pelajaran ke-4 [both]
09:30 - Waktu Istirahat Pertama Dimulai [both]
09:45 - Waktu Istirahat Pertama Selesai - Masuk Jam Pelajaran ke-5 [both]
10:30 - Jam Pelajaran ke-6 [both]
11:15 - Jam Pelajaran ke-7 [both]
12:00 - Waktu Istirahat Kedua Dimulai [both]
12:30 - Waktu Istirahat Kedua Selesai - Masuk Jam Pelajaran ke-8 [both]
13:15 - Jam Pelajaran ke-9 [both]
14:00 - Jam Pelajaran ke-10 [both]
14:45 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`,
    items: [],
  },
  {
    id: 'senin-upacara',
    name: 'Hari Senin (Upacara)',
    rawText: `# JADWAL HARI SENIN (Upacara Bendera)
07:00 - Persiapan Upacara Bendera [both]
07:30 - Jam Pelajaran ke-1 Dimulai [both]
08:15 - Jam Pelajaran ke-2 [both]
09:00 - Jam Pelajaran ke-3 [both]
09:45 - Waktu Istirahat Pertama Dimulai [both]
10:00 - Waktu Istirahat Pertama Selesai - Masuk Jam Pelajaran ke-4 [both]
10:40 - Jam Pelajaran ke-5 [both]
11:10 - Jam Pelajaran ke-6 [both]
11:50 - Waktu Istirahat Kedua Dimulai [both]
12:30 - Waktu Istirahat Kedua Selesai - Masuk Jam Pelajaran ke-7 [both]
13:05 - Jam Pelajaran ke-8 [both]
13:40 - Jam Pelajaran ke-9 [both]
14:15 - Jam Pelajaran ke-10 [both]
14:45 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`,
    items: [],
  },
  {
    id: 'jumat-normal',
    name: 'Hari Jumat Normal',
    rawText: `# JADWAL HARI JUMAT (Jumat Normal)
06:30 - Jam Pelajaran ke-1 Dimulai [both]
07:15 - Jam Pelajaran ke-2 [both]
08:00 - Jam Pelajaran ke-3 [both]
08:45 - Jam Pelajaran ke-4 [both]
09:30 - Waktu Istirahat Pertama Dimulai [both]
09:45 - Waktu Istirahat Pertama Selesai - Masuk Jam Pelajaran ke-5 [both]
10:30 - Jam Pelajaran ke-6 [both]
11:15 - Istirahat Jumat & Persiapan Sholat Jumat [both]
13:00 - Kegiatan KBM Dilanjutkan - Masuk Jam Pelajaran ke-7 [both]
13:45 - Jam Pelajaran ke-8 [both]
14:30 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`,
    items: [],
  },
  {
    id: 'jumat-istigosah',
    name: 'Hari Jumat Khusus (Istigosah)',
    rawText: `# JADWAL HARI JUMAT KHUSUS (Kegiatan Istigosah)
06:30 - Kegiatan Istigosah Bersama Dimulai [both]
07:45 - Istigosah Selesai - Masuk Jam Pelajaran ke-1 [both]
08:20 - Jam Pelajaran ke-2 [both]
08:55 - Jam Pelajaran ke-3 [both]
09:30 - Waktu Istirahat Pertama Dimulai [both]
09:45 - Waktu Istirahat Pertama Selesai - Masuk Jam Pelajaran ke-4 [both]
10:20 - Jam Pelajaran ke-5 [both]
10:55 - Jam Pelajaran ke-6 [both]
11:30 - Istirahat Jumat & Persiapan Sholat Jumat [both]
13:20 - Kegiatan KBM Dilanjutkan - Masuk Jam Pelajaran ke-7 [both]
13:55 - Jam Pelajaran ke-8 [both]
14:30 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`,
    items: [],
  }
];

export default function App() {
  // Load and Parse Profiles
  const [profiles, setProfiles] = useState<ScheduleProfile[]>(() => {
    const saved = localStorage.getItem('school_bell_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ScheduleProfile[];
        // Filter out old legacy profiles if any, or merge. Let's ensure new official profiles exist or reset.
        // To make it super smooth for the user, if the saved profiles are old, we can identify them and force/provide a way to load new ones,
        // or simply merge. Let's return saved if they have one of our new keys, otherwise default.
        const hasNewProfile = parsed.some(p => p.id === 'selasa-kamis' || p.id === 'jumat-istigosah');
        if (hasNewProfile) {
          return parsed.map((p) => ({
            ...p,
            items: parseScheduleText(p.rawText),
          }));
        }
      } catch (err) {
        console.error('Failed to parse saved profiles, resetting to default', err);
      }
    }
    // Default fallback
    return DEFAULT_PROFILES.map((p) => ({
      ...p,
      items: parseScheduleText(p.rawText),
    }));
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const savedActive = localStorage.getItem('school_bell_active_profile_id');
    if (savedActive && ['selasa-kamis', 'senin-upacara', 'jumat-normal', 'jumat-istigosah'].includes(savedActive)) {
      return savedActive;
    }
    return 'selasa-kamis';
  });

  // Scheduling Enabled Master State
  const [statusEnabled, setStatusEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('school_bell_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Trigger Logs
  const [logs, setLogs] = useState<BellLog[]>(() => {
    const saved = localStorage.getItem('school_bell_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Time Simulation States
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(new Date());
  const [lastRungMinute, setLastRungMinute] = useState<string | null>(null);

  // Playing Bell State for custom duration upbeat bells
  const [playingBell, setPlayingBell] = useState<{
    activity: string;
    secondsRemaining: number;
    totalDuration: number;
  } | null>(null);

  const getBellDuration = (activity: string): number => {
    const act = activity.toLowerCase();
    // Awal KBM: masuk, gerbang, pelajaran pertama, upacara, istigosah, persiapan
    if (act.includes('masuk') || act.includes('gerbang') || act.includes('persiapan') || act.includes('upacara') || act.includes('pelajaran pertama') || act.includes('jam pertama') || act.includes('mulai') || act.includes('istigosah')) {
      return 180; // 3 minutes
    }
    // Akhir KBM: pulang, selesai, kbm selesai
    if (act.includes('pulang') || act.includes('selesai') || act.includes('berakhir') || act.includes('telah selesai')) {
      return 180; // 3 minutes
    }
    // Istirahat
    if (act.includes('istirahat') || act.includes('sholat jumat') || act.includes('recess')) {
      return 120; // 2 minutes
    }
    // Pergantian jam or other events
    return 60; // 1 minute
  };

  // Active Profile Object find
  const activeProfile = useMemo(() => {
    let prof = profiles.find((p) => p.id === activeProfileId);
    if (!prof && profiles.length > 0) prof = profiles[0];
    return prof || DEFAULT_PROFILES[0];
  }, [profiles, activeProfileId]);

  // Persist settings changes
  useEffect(() => {
    localStorage.setItem('school_bell_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('school_bell_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('school_bell_enabled', String(statusEnabled));
  }, [statusEnabled]);

  useEffect(() => {
    localStorage.setItem('school_bell_logs', JSON.stringify(logs));
  }, [logs]);

  // Real-world clock tick vs Simulation tick
  useEffect(() => {
    const timer = setInterval(() => {
      if (!simulationEnabled) {
        setSimulatedTime(new Date());
      } else {
        // Increment simulation state forward by exactly 1-second each real second
        setSimulatedTime((prev) => new Date(prev.getTime() + 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [simulationEnabled]);

  // Master Automatic Trigger Check Loop
  useEffect(() => {
    if (!statusEnabled) return;

    const currentHour = simulatedTime.getHours();
    const currentMinute = simulatedTime.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Look for matching trigger in active schedule list
    const matched = activeProfile.items.find(
      (item) => item.hour === currentHour && item.minute === currentMinute
    );

    if (matched && lastRungMinute !== currentTimeStr) {
      // Double trigger insurance - lock minute immediately
      setLastRungMinute(currentTimeStr);

      const ringAndExecute = async () => {
        try {
          const duration = getBellDuration(matched.activity);
          setPlayingBell({
            activity: matched.activity,
            secondsRemaining: duration,
            totalDuration: duration,
          });

          const lowercaseActivity = matched.activity.toLowerCase();
          const isMasuk = lowercaseActivity.includes('masuk') || lowercaseActivity.includes('gerbang') || lowercaseActivity.includes('pertama') || lowercaseActivity.includes('ke-1') || lowercaseActivity.includes('ke 1');
          const isIstirahat = lowercaseActivity.includes('istirahat') || lowercaseActivity.includes('break');
          const isPulang = lowercaseActivity.includes('pulang') || lowercaseActivity.includes('selesai kbm') || lowercaseActivity.includes('kbm selesai') || lowercaseActivity.includes('selesai belajar');

          const playTheme = async () => {
            if (isMasuk) {
              await audioSystem.playCustomAudio(CUSTOM_BELLS.MASUK, duration, (sec) => {
                setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
              });
            } else if (isIstirahat) {
              await audioSystem.playCustomAudio(CUSTOM_BELLS.ISTIRAHAT, duration, (sec) => {
                setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
              });
            } else if (isPulang) {
              await audioSystem.playCustomAudio(CUSTOM_BELLS.PULANG, duration, (sec) => {
                setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
              });
            } else {
              await audioSystem.playUpbeatMusic(duration, (sec) => {
                setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
              });
            }
          };

          if (matched.bellType === 'classic') {
            await playTheme();
          } else if (matched.bellType === 'siren') {
            await playTheme();
            await audioSystem.playSiren(5);
          } else if (matched.bellType === 'speech') {
            await playTheme();
            const announce = generateAnnouncementText(matched.activity);
            await audioSystem.speak(announce);
          } else if (matched.bellType === 'both') {
            await playTheme();
            const announce = generateAnnouncementText(matched.activity);
            await audioSystem.speak(announce);
          }

          // Build log entry
          const timeLabel = simulatedTime.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          const freshLog: BellLog = {
            id: `auto-log-${Date.now()}-${Math.random()}`,
            timestamp: timeLabel,
            activityName: matched.activity,
            triggerType: 'Otomatis',
            bellType: matched.bellType === 'both' ? 'Chime & TTS' : matched.bellType.toUpperCase(),
            speechTextUsed: matched.bellType === 'speech' || matched.bellType === 'both'
              ? generateAnnouncementText(matched.activity)
              : undefined,
          };

          setLogs((prev) => [freshLog, ...prev].slice(0, 50));
        } catch (err) {
          console.error('Error running automated bell:', err);
        } finally {
          setPlayingBell(null);
        }
      };

      ringAndExecute();
    }

    // Reset lock state when hour/minute drifts away from the scheduled event
    if (!matched && lastRungMinute === currentTimeStr) {
      setLastRungMinute(null);
    }
  }, [simulatedTime, statusEnabled, activeProfile, lastRungMinute]);

  // Profile management callbacks
  const handleSaveProfile = (id: string, name: string, rawText: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            name,
            rawText,
            items: parseScheduleText(rawText),
          };
        }
        return p;
      })
    );
  };

  const handleCreateProfile = (name: string, rawText: string) => {
    const newId = `profile-${Date.now()}`;
    const newProfile: ScheduleProfile = {
      id: newId,
      name,
      rawText,
      items: parseScheduleText(rawText),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newId);
  };

  const handleManualTriggerLog = (activityName: string, bellType: string, speechTextUsed?: string) => {
    const timeLabel = simulatedTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const manualLog: BellLog = {
      id: `manual-log-${Date.now()}-${Math.random()}`,
      timestamp: timeLabel,
      activityName,
      triggerType: 'Manual',
      bellType,
      speechTextUsed,
    };
    setLogs((prev) => [manualLog, ...prev].slice(0, 50));
  };

  const handlePlayUpbeatMusic = async (activity: string, durationSeconds: number) => {
    try {
      setPlayingBell({
        activity,
        secondsRemaining: durationSeconds,
        totalDuration: durationSeconds,
      });
      const lower = activity.toLowerCase();
      if (lower.includes('masuk')) {
        await audioSystem.playCustomAudio(CUSTOM_BELLS.MASUK, durationSeconds, (sec) => {
          setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
        });
      } else if (lower.includes('istirahat')) {
        await audioSystem.playCustomAudio(CUSTOM_BELLS.ISTIRAHAT, durationSeconds, (sec) => {
          setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
        });
      } else if (lower.includes('pulang')) {
        await audioSystem.playCustomAudio(CUSTOM_BELLS.PULANG, durationSeconds, (sec) => {
          setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
        });
      } else {
        await audioSystem.playUpbeatMusic(durationSeconds, (sec) => {
          setPlayingBell(prev => prev ? { ...prev, secondsRemaining: sec } : null);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPlayingBell(null);
    }
  };

  const handleStopAll = () => {
    audioSystem.stopAll();
    setPlayingBell(null);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-700 font-sans" id="app-root-container">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100" id="app-main-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="header-wrapper">
          <Logo />
          
          <div className="flex items-center gap-3.5" id="header-right-side">
            <div className="text-right hidden md:block" id="user-metadata-group">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">User / Operator</span>
              <p className="text-xs font-semibold text-slate-700">{localStorage.getItem('saved_operator') || 'Staff Kurikulum Piket'}</p>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            
            <span className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold leading-none select-none">
              <HardDrive className="w-3.5 h-3.5" />
              Mode Offline Stand-Alone
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6" id="dashboard-main-view">
        
        {playingBell && (
          <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 p-0.5 rounded-2xl shadow-lg shadow-indigo-100/50 animate-pulse" id="active-bell-banner">
            <div className="bg-white px-6 py-4 rounded-[14px] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 animate-bounce">
                  <Volume2 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">🔊 BEL AKTIF SEDANG BERBUNYI</span>
                  <h3 className="text-sm font-extrabold text-slate-800">{playingBell.activity}</h3>
                  <p className="text-xxs text-slate-400 mt-0.5">Musik Penyemangat SMK Tanjung Priok 1 Hebat</p>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                {/* Progress Circle or Bar */}
                <div className="flex flex-col items-center md:items-end">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Sisa Durasi</span>
                  <span className="text-xl font-black text-slate-800 font-mono tracking-tight">
                    {Math.floor(playingBell.secondsRemaining / 60)}:
                    {String(playingBell.secondsRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={handleStopAll}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-100 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  id="btn-abort-bell"
                >
                  <VolumeX className="w-4 h-4" />
                  HENTIKAN BEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. CLOCK & MASTER STATUS SEKTOR */}
        <ClockCard
          currentDate={simulatedTime}
          statusEnabled={statusEnabled}
          onToggleStatus={() => setStatusEnabled(!statusEnabled)}
          activeProfile={activeProfile}
          allProfiles={profiles}
          onSelectProfile={(id) => setActiveProfileId(id)}
        />

        {/* 2. DUA SEKTOR: ALARM MANUAL & PENYETEL SIMULASI */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="middle-tier-layouts">
          <div className="md:col-span-7" id="section-manual-panel">
            <ManualTriggers
              onAddLog={handleManualTriggerLog}
              playingBell={playingBell}
              onPlayUpbeatMusic={handlePlayUpbeatMusic}
              onStopAll={handleStopAll}
            />
          </div>
          <div className="md:col-span-5" id="section-simulation-panel">
            <TimeSimulator
              simulationEnabled={simulationEnabled}
              onToggleSimulation={setSimulationEnabled}
              simulatedTime={simulatedTime}
              onSetSimulatedTime={setSimulatedTime}
              activeProfile={activeProfile}
            />
          </div>
        </div>

        {/* 3. CORE EDITOR: PENJADWALAN BERBASIS TEKS & TABEL KOMPILASI */}
        <div id="section-schedule-editor">
          <ScheduleParser
            activeProfile={activeProfile}
            allProfiles={profiles}
            onSaveProfile={handleSaveProfile}
            onCreateProfile={handleCreateProfile}
          />
        </div>

        {/* 4. SEKTOR BAWAH: AUDIT LOGS & PHYSICAL AMPLIFIER INTEGRATION MANUAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="lower-tier-layouts">
          {/* Logs */}
          <div className="lg:col-span-6" id="section-log-viewer">
            <LogViewer logs={logs} onClearLogs={handleClearLogs} />
          </div>

          {/* Stand-Alone Hardware Setup Instructions */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between" id="hardware-help-card">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4" id="hw-header">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-800" id="hw-title">
                  Manual Integrasi Perangkat Keras (Hardware Amplifier)
                </h3>
              </div>
              
              <p className="text-xs text-slate-400 mb-4" id="hw-desc">
                Sebagai senior programmer, aplikasi ini didesain agar dapat berjalan di komputer sederhana (PC stand-alone) di ruang piket sekolah dan tersambung langsung ke pengeras suara kelas.
              </p>

              <div className="space-y-3" id="hw-steps">
                <div className="flex gap-3 items-start" id="hw-step-1">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold leading-none font-mono">1</span>
                  <div className="text-xs" id="hw-step-1-details">
                    <p className="font-semibold text-slate-700">Sambungkan Jack Audio PC</p>
                    <p className="text-slate-500 text-xxs mt-0.5">Colokkan kabel audio AUX (jack 3.5mm) dari lubang audio earphone komputer/laptop ke input "Aux" atau "CD/Line" pada mixer/amplifier sekolah.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start" id="hw-step-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold leading-none font-mono">2</span>
                  <div className="text-xs" id="hw-step-2-details">
                    <p className="font-semibold text-slate-700">Posisikan Volume PC di Angka 80%</p>
                    <p className="text-slate-500 text-xxs mt-0.5">Atur volume output di volume bar komputer ke 80% untuk mengurangi kliping audio dan sesuaikan volume utama di tombol fisik amplifier sekolah.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start" id="hw-step-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold leading-none font-mono">3</span>
                  <div className="text-xs" id="hw-step-3-details">
                    <p className="font-semibold text-slate-700">Aktifkan Layar Penuh (F11) & Nonaktifkan Power Sleep</p>
                    <p className="text-slate-500 text-xxs mt-0.5">Buka aplikasi ini, tekan tombol <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[9px] text-slate-600">F11</kbd> untuk tampilan penuh. Pastikan pengaturan "Power Sleep" di sistem operasi bernilai "Never Sleep" agar KBM tidak terganggu.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/30 flex items-center gap-2.5 text-xxs text-indigo-700" id="hw-safety-tip">
              <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 animate-pulse" />
              <p>
                <strong>Rekomendasi Keamanan:</strong> Jadwal bel otomatis disimpan otomatis ke penyimpanan memori browser lokal (<code className="font-mono bg-indigo-100/40 px-1 py-0.5 rounded text-indigo-600">localStorage</code>), menjamin data Anda aman bahkan setelah komputer direstart atau browser tidak terkoneksi internet.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Branding block */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center" id="app-footer">
        <p className="text-xxs text-slate-400 font-mono tracking-wide uppercase" id="colophon">
          Bel KBM Pintar © 2026 • Dirancang untuk Pengaplikasian Stand-Alone Mandiri di Sekolah Indonesia
        </p>
      </footer>
    </div>
  );
}
