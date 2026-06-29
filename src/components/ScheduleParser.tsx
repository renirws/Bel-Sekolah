import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, Save, FileText, CheckCircle, Volume2, Plus, AlertCircle, Copy, Play, Download, Upload } from 'lucide-react';
import { ScheduleItem, ScheduleProfile } from '../types';
import { parseScheduleText, generateAnnouncementText } from '../utils/parser';
import { audioSystem } from '../utils/audio';

interface ScheduleParserProps {
  activeProfile: ScheduleProfile;
  allProfiles: ScheduleProfile[];
  onSaveProfile: (profileId: string, name: string, rawText: string) => void;
  onCreateProfile: (name: string, rawText: string) => void;
}

export default function ScheduleParser({
  activeProfile,
  allProfiles,
  onSaveProfile,
  onCreateProfile,
}: ScheduleParserProps) {
  const [editorText, setEditorText] = useState(activeProfile.rawText);
  const [profileName, setProfileName] = useState(activeProfile.name);
  const [newProfileName, setNewProfileName] = useState('');
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [isSuccessSaved, setIsSuccessSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if activeProfile changes
  useEffect(() => {
    setEditorText(activeProfile.rawText);
    setProfileName(activeProfile.name);
  }, [activeProfile]);

  // Compute parsed items in real-time for validation & preview
  const parsedItems = useMemo(() => {
    return parseScheduleText(editorText);
  }, [editorText]);

  const handleSaveActive = () => {
    onSaveProfile(activeProfile.id, profileName, editorText);
    setIsSuccessSaved(true);
    setTimeout(() => setIsSuccessSaved(false), 3000);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    
    // Create new profile with current editor text
    onCreateProfile(newProfileName.trim(), editorText);
    setNewProfileName('');
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({
      version: '1.0',
      type: 'school_bell_profile',
      name: profileName,
      rawText: editorText
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${profileName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jadwal.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const resultText = event.target?.result as string;
        const parsed = JSON.parse(resultText);
        
        if (!parsed.rawText) {
          throw new Error('Format file JSON tidak memiliki teks jadwal (rawText) yang valid.');
        }
        
        const importedName = parsed.name || 'Jadwal Impor';
        const importedRawText = parsed.rawText;
        
        // Create new profile with the imported name and text
        onCreateProfile(importedName, importedRawText);
        
        setImportStatus({
          type: 'success',
          message: `Berhasil mengimpor "${importedName}" sebagai profil baru!`
        });
        
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        console.error(err);
        setImportStatus({
          type: 'error',
          message: 'Gagal mengimpor: Pastikan format file .json sesuai.'
        });
        setTimeout(() => setImportStatus(null), 5000);
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input to allow re-importing the same file
  };

  const loadPreset = (presetText: string) => {
    setEditorText(presetText);
  };

  const testPlayRow = async (item: ScheduleItem) => {
    try {
      if (item.bellType === 'classic') {
        await audioSystem.playDingDong();
      } else if (item.bellType === 'siren') {
        await audioSystem.playSiren(3);
      } else if (item.bellType === 'speech') {
        const text = generateAnnouncementText(item.activity);
        await audioSystem.speak(text);
      } else if (item.bellType === 'both') {
        // Play sweet Westminster or DingDong, then speak!
        await audioSystem.playDingDong();
        const text = generateAnnouncementText(item.activity);
        await audioSystem.speak(text);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Templates
  const templateSelasaKamis = `# JADWAL HARI SELASA - KAMIS (KBM Normal)
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
14:45 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`;

  const templateSeninUpacara = `# JADWAL HARI SENIN (Upacara Bendera)
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
14:45 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`;

  const templateJumatNormal = `# JADWAL HARI JUMAT (Jumat Normal)
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
14:30 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`;

  const templateJumatIstigosah = `# JADWAL HARI JUMAT KHUSUS (Kegiatan Istigosah)
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
14:30 - Kegiatan Belajar Mengajar Selesai dan Bel Pulang Sekolah [both]`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="schedule-parser-grid">
      
      {/* LEFT: Text Editor & Profile Configuration */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col" id="col-editor">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4" id="editor-header">
          <div className="flex items-center gap-2" id="editor-title-group">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-800" id="editor-title">
              Penjadwalan Otomatis Berbasis Teks
            </h2>
          </div>
          
          <button
            onClick={() => setShowConfigHelper(!showConfigHelper)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            id="btn-toggle-helper"
          >
            <HelpCircle className="w-4 h-4" />
            Petunjuk Format
          </button>
        </div>

        {/* Quick Help box */}
        {showConfigHelper && (
          <div className="bg-indigo-50/50 rounded-xl p-4 mb-4 border border-indigo-100 text-xs text-slate-600 space-y-2 leading-relaxed animate-fade-in" id="config-helper-box">
            <p className="font-semibold text-indigo-800">Aturan Pengisian Jadwal:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Masing-masing pemicu bel diletakkan pada baris baru.</li>
              <li>Wajib berformat: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-600 font-mono">JAM:MENIT - Deskripsi Kegiatan [tipe_suara]</code></li>
              <li>Tipe suara opsional di akhir (pilih salah satu di bawah kurung):</li>
              <ul className="list-circle pl-4 mt-1 font-mono text-xxs block space-y-0.5">
                <li><span className="font-bold">[both]</span> : Chime Ting-Dong + Suara TTS Indonesia (Bawaan)</li>
                <li><span className="font-bold">[classic]</span> : Bunyi Ding-Dong saja</li>
                <li><span className="font-bold">[speech]</span> : Pengumuman Suara saja</li>
                <li><span className="font-bold">[siren]</span> : Suara Sirene Bahaya</li>
                <li><span className="font-bold">[none]</span> : Tidak berbunyi (hanya log)</li>
              </ul>
              <li>Baris yang diawali dengan <code className="font-mono text-indigo-600">#</code> atau <code className="font-mono text-indigo-600">//</code> akan diabaikan (untuk catatan).</li>
            </ul>
          </div>
        )}

        {/* Preset Loaders */}
        <div className="mb-4" id="preset-buttons-container">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-2">Templat Jadwal Cepat:</span>
          <div className="flex flex-wrap gap-2" id="preset-triggers">
            <button
              onClick={() => loadPreset(templateSelasaKamis)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              id="btn-template-selasa"
            >
              Selasa - Kamis
            </button>
            <button
              onClick={() => loadPreset(templateSeninUpacara)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              id="btn-template-upacara"
            >
              Senin (Upacara)
            </button>
            <button
              onClick={() => loadPreset(templateJumatNormal)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              id="btn-template-jumat-norm"
            >
              Jumat Normal
            </button>
            <button
              onClick={() => loadPreset(templateJumatIstigosah)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              id="btn-template-jumat-isti"
            >
              Jumat Istigosah
            </button>
          </div>
        </div>

        {/* Text Area Editor */}
        <div className="flex-1 min-h-[320px] relative flex flex-col" id="editor-textarea-group">
          <label htmlFor="schedule-textarea" className="sr-only">Editor Jadwal Berbasis Teks</label>
          <textarea
            id="schedule-textarea"
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            className="w-full flex-1 p-4 font-mono text-xs text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 resize-none h-full leading-5"
            placeholder="# Ketik jadwal Anda di sini..."
          />
        </div>

        {/* Profile Saving & Creation bar */}
        <div className="mt-5 space-y-4 pt-4 border-t border-slate-100" id="editor-actions">
          {/* Active Profile rename & save */}
          <div className="flex items-end gap-3" id="save-active-form">
            <div className="flex-1" id="rename-profile-input-group">
              <label htmlFor="profile-name-input" className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nama Profil Terpilih
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button
              onClick={handleSaveActive}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-all w-fit cursor-pointer shadow-sm active:scale-95 ${
                isSuccessSaved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              id="btn-save-profile"
            >
              {isSuccessSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Disimpan!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Profil
                </>
              )}
            </button>
          </div>

          {/* Export & Import Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2" id="backup-actions">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
              Bagikan & Cadangkan Jadwal
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                id="btn-export-schedule"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                Ekspor (.json)
              </button>
              
              <label
                className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95 text-center"
                id="label-import-schedule"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                Impor (.json)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                  id="input-import-file"
                />
              </label>
            </div>
            {importStatus && (
              <p className={`text-xxs text-center font-medium mt-1 ${importStatus.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`} id="import-status-text">
                {importStatus.message}
              </p>
            )}
          </div>

          {/* Create new profile form */}
          <form onSubmit={handleCreateNew} className="pt-3 border-t border-slate-100 flex items-end gap-3" id="form-create-profile">
            <div className="flex-1" id="new-profile-group">
              <label htmlFor="new-profile-name-input" className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Duplikat Ke Profil Baru
              </label>
              <input
                id="new-profile-name-input"
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Nama profil baru, misal: Hari Sabtu"
                className="w-full px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={!newProfileName.trim()}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-slate-200/80 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
              id="btn-create-new-profile"
            >
              <Plus className="w-4 h-4" />
              Buat Profil
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Real-time Compiled Preview */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col" id="col-preview">
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between" id="preview-header">
          <div className="flex items-center gap-2" id="preview-title-group">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-slate-800" id="preview-title">
              Kompilasi & Pratinjau Jadwal
            </h2>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-100" id="badge-valid-count">
            {parsedItems.length} Terpeta
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4" id="preview-desc">
          Teks di sebelah kiri akan diparsing oleh sistem secara langsung. Di bawah ini adalah hasil urutan waktu serta nada yang akan berbunyi otomatis.
        </p>

        {parsedItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200" id="empty-preview">
            <AlertCircle className="w-8 h-8 text-amber-500 mb-2 animate-bounce-slow" />
            <h3 className="text-sm font-semibold text-slate-700">Tidak Ada Jadwal Valid</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Ketik jadwal pada teks editor berformat <code className="font-mono text-indigo-600">HH:MM - Aktivitas [jenis_nada]</code> untuk mengompilasi.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto min-h-[400px]" id="preview-table-container">
            <table className="w-full text-left" id="schedules-table">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xxs font-bold tracking-wider uppercase" id="table-head-row">
                  <th className="py-3 px-2 w-12 text-center">No</th>
                  <th className="py-3 px-3 w-20">Waktu</th>
                  <th className="py-3 px-3">Nama Sesi / Kegiatan</th>
                  <th className="py-3 px-3 w-28">Tipe Bunyi</th>
                  <th className="py-3 px-3 w-16 text-center">Tes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50" id="table-body">
                {parsedItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group text-xs text-slate-700" id={`row-${item.id}`}>
                    <td className="py-3.5 px-2 text-center text-slate-400 font-mono font-medium">{index + 1}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-900">{item.time}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800">{item.activity}</span>
                        {/* Show generated dynamic voice synthesis words on hover or small text */}
                        <span className="text-xxs text-slate-400 italic line-clamp-1 group-hover:line-clamp-none max-w-xs md:max-w-md">
                          "{generateAnnouncementText(item.activity)}"
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {item.bellType === 'both' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          🛎️ Chime & TTS
                        </span>
                      )}
                      {item.bellType === 'classic' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          🎵 Ding Dong
                        </span>
                      )}
                      {item.bellType === 'speech' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          🗣️ Suara Saja
                        </span>
                      )}
                      {item.bellType === 'siren' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-bold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                          🚨 Sirene
                        </span>
                      )}
                      {item.bellType === 'none' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-bold bg-slate-50 text-slate-400 border border-slate-100">
                          🔇 Tanpa Suara
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => testPlayRow(item)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer active:scale-90"
                        title="Tes dengar alarm item ini"
                        id={`btn-test-row-${index}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
