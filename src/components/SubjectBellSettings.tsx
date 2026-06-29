import React, { useState } from 'react';
import { Music, Play, CheckCircle, HelpCircle, MessageSquare, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { audioSystem } from '../utils/audio';

interface SubjectBellSettingsProps {
  subjectBellType: string;
  onSelectBellType: (type: string) => void;
  customSubjectText: string;
  onCustomSubjectTextChange: (text: string) => void;
}

const DEFAULT_SPEECH_TEXT = "Assalamu'alaikum wr wb dan semangat pagi siswa/ siswi dan bapak ibu guru hebat smk tanjung priok 1. mari memulai kegiatan belajar & mengajar dengan penuh semagat kreativitas dan kolaborasi hebat";

export default function SubjectBellSettings({
  subjectBellType,
  onSelectBellType,
  customSubjectText,
  onCustomSubjectTextChange,
}: SubjectBellSettingsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const options = [
    {
      id: 'upbeat',
      title: 'Musik Penyemangat',
      description: 'Melodi pentatonis ceria disintesis dinamis (durasi penuh).',
      icon: '🎵',
      testFn: () => audioSystem.playUpbeatMusic(5),
    },
    {
      id: 'westminster',
      title: 'Westminster Chime',
      description: 'Nada bel klasik 4-nada khas sekolah / menara jam.',
      icon: '🏛️',
      testFn: () => audioSystem.playWestminster(),
    },
    {
      id: 'dingdong',
      title: 'Ding Dong Chime',
      description: 'Nada bel ganda klasik yang santun dan jernih.',
      icon: '🔔',
      testFn: () => audioSystem.playDingDong(),
    },
    {
      id: 'beeps',
      title: 'Isyarat Bip Elektronik',
      description: '4 kali bunyi bip cepat untuk perpindahan cepat.',
      icon: '⚡',
      testFn: () => audioSystem.playElectronicBeeps(4),
    },
    {
      id: 'siren',
      title: 'Sirene Darurat',
      description: 'Sirene naik-turun cepat untuk latihan evakuasi / darurat.',
      icon: '🚨',
      testFn: () => audioSystem.playSiren(3),
    },
  ];

  const handleTest = (e: React.MouseEvent, testFn: () => void) => {
    e.stopPropagation();
    audioSystem.stopAll();
    testFn();
  };

  const handleTestTTS = async () => {
    setIsSpeaking(true);
    audioSystem.stopAll();
    
    // Process placeholders with a demo value (e.g. Jam Pelajaran ke 2)
    const demoText = customSubjectText
      .replace(/{kegiatan}/gi, 'Jam Pelajaran ke 2')
      .replace(/{jam}/gi, '2');

    await audioSystem.speak(demoText);
    setIsSpeaking(false);
  };

  const handleResetText = () => {
    onCustomSubjectTextChange(DEFAULT_SPEECH_TEXT);
  };

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col gap-5" id="subject-bell-settings-card">
      
      {/* SECTION 1: NADA BEL */}
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4" id="settings-header">
          <Music className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800" id="settings-title">
              Pengaturan Nada Bel Mata Pelajaran
            </h3>
            <p className="text-xxs text-slate-400 font-medium">Pilih suara otomatis khusus perpindahan jam mata pelajaran</p>
          </div>
        </div>

        <div className="space-y-2.5" id="settings-options-list">
          {options.map((option) => {
            const isSelected = subjectBellType === option.id;
            return (
              <div
                key={option.id}
                onClick={() => onSelectBellType(option.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group relative ${
                  isSelected
                    ? 'bg-indigo-50/55 border-indigo-200 shadow-sm'
                    : 'bg-white hover:bg-slate-50/70 border-slate-100'
                }`}
                id={`bell-opt-${option.id}`}
              >
                <div className="flex items-start gap-3 select-none">
                  <span className="text-xl mt-0.5" id={`icon-${option.id}`}>{option.icon}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isSelected ? 'text-indigo-800 font-extrabold' : 'text-slate-700'}`}>
                        {option.title}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{option.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleTest(e, option.testFn)}
                  className={`ml-3 px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer text-xxs font-bold active:scale-90 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Dengarkan Contoh"
                  id={`btn-test-opt-${option.id}`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Coba</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: TEKS PENGUMUMAN TTS */}
      <div className="pt-4 border-t border-slate-100" id="announcement-text-section">
        <div className="flex items-center justify-between mb-3" id="announcement-header">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-800" id="announcement-title">
                Teks Pengumuman Mata Pelajaran (TTS)
              </h4>
              <p className="text-xxs text-slate-400 font-medium">Ubah ucapan otomatis robot saat bel mata pelajaran berbunyi</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleResetText}
            className="flex items-center gap-1 px-2 py-1 text-xxs font-semibold text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-lg bg-slate-50 hover:bg-indigo-50/30 transition-all cursor-pointer"
            title="Reset ke Teks Bawaan"
            id="btn-reset-tts"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="relative group" id="textarea-container">
          <textarea
            value={customSubjectText}
            onChange={(e) => onCustomSubjectTextChange(e.target.value)}
            className="w-full h-28 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all resize-none text-slate-700 font-medium leading-relaxed"
            placeholder="Ketik kalimat pengumuman jam mata pelajaran disini..."
            id="tts-text-editor"
          />
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5" id="textarea-controls">
            <span className="text-[9px] text-slate-400 mr-1.5 select-none font-mono">
              {customSubjectText.length} karakter
            </span>
            <button
              type="button"
              onClick={handleTestTTS}
              disabled={isSpeaking || !customSubjectText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xxs font-extrabold shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              id="btn-play-test-tts"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Berbicara...' : 'Uji Suara'}</span>
            </button>
          </div>
        </div>

        {/* Placeholder Guide Badge Row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5" id="placeholders-guide">
          <span className="text-[10px] font-bold text-slate-500 select-none mr-1">Gunakan Variabel:</span>
          <div className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded text-[9px] font-mono font-bold border border-slate-200 cursor-help transition-all" title='Contoh: "ke 2"' onClick={() => onCustomSubjectTextChange(customSubjectText + " jam ke {jam}")}>
            {`{jam}`}
          </div>
          <span className="text-[9px] text-slate-400 select-none">Angka Jam</span>
          <div className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded text-[9px] font-mono font-bold border border-slate-200 cursor-help transition-all" title='Contoh: "Jam Pelajaran ke 2"' onClick={() => onCustomSubjectTextChange(customSubjectText + " {kegiatan}")}>
            {`{kegiatan}`}
          </div>
          <span className="text-[9px] text-slate-400 select-none">Nama Kegiatan</span>
        </div>
      </div>

      <div className="p-2.5 bg-indigo-50/40 rounded-xl border border-indigo-100/20 flex gap-2 text-[10px] text-indigo-700 leading-normal" id="settings-footer-info">
        <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p>
          Bel masuk, istirahat, dan pulang sekolah tetap otomatis memutar lagu instrumen nasional MP3 sesuai jam aktif masing-masing. Pilihan di atas khusus untuk perpindahan <strong>Jam Mata Pelajaran</strong> (KBM normal).
        </p>
      </div>
    </div>
  );
}
