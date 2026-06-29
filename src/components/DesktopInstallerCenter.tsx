import React, { useState } from 'react';
import { Download, Laptop, FileText, Settings, ShieldCheck, CheckCircle2, Copy, Sparkles, Terminal } from 'lucide-react';

export default function DesktopInstallerCenter() {
  const [downloadedBat, setDownloadedBat] = useState(false);
  const [downloadedTxt, setDownloadedTxt] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-ijzud7ppxzliuvpblgery7-441986179843.asia-southeast1.run.app';

  // Function to download the .bat file
  const downloadBatFile = () => {
    const batContent = `@echo off
title BEL SEKOLAH OTOMATIS - SMK TANJUNG PRIOK 1 HEBAT
color 0B
cls
echo =======================================================================
echo   MENJALANKAN APLIKASI BEL SEKOLAH PINTAR - SMK TANJUNG PRIOK 1 HEBAT
echo =======================================================================
echo.
echo [INFO] Menyiapkan peluncuran aplikasi bel sekolah...
echo [INFO] Membuka dalam mode aplikasi mandiri (Kiosk Desktop)...
echo.
echo Jangan tutup jendela terminal ini jika ingin memantau, atau 
echo Anda bisa menutupnya setelah aplikasi browser mandiri terbuka.
echo.
echo Membuka URL: ${currentUrl}
echo.

:: Menjalankan menggunakan Edge dalam mode mandiri (App Mode) yang menyerupai .exe
start msedge --app="${currentUrl}" --start-maximized

:: Jika Edge tidak tersedia, coba dengan Google Chrome
if %ERRORLEVEL% NEQ 0 (
    start chrome --app="${currentUrl}" --start-maximized
)

echo.
echo [SUKSES] Aplikasi Bel Sekolah berhasil diluncurkan!
echo Selamat bertugas untuk seluruh Guru Hebat SMK Tanjung Priok 1.
echo =======================================================================
timeout /t 5
exit
`;
    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = 'Jalankan_Bel_Sekolah.bat';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloadedBat(true);
    setTimeout(() => setDownloadedBat(false), 3000);
  };

  // Function to download the installation instructions guide
  const downloadGuideFile = () => {
    const guideContent = `===================================================================
 PANDUAN INSTALASI & PENGOPRASIAN BEL SEKOLAH DI PC/LAPTOP PIKET
                    SMK TANJUNG PRIOK 1 HEBAT
===================================================================

Aplikasi ini dirancang menggunakan arsitektur Web Stand-Alone Modern. 
Meskipun berjalan menggunakan teknologi web, aplikasi ini bisa diinstal 
dan berjalan layaknya aplikasi desktop .EXE biasa dengan performa cepat.

Berikut adalah 3 langkah praktis untuk menginstalnya di PC sekolah lain:

Langkah 1: Instalasi via Mode PWA (Aplikasi Mandiri - SANGAT DIREKOMENDASIKAN)
-------------------------------------------------------------------------
1. Buka browser Google Chrome atau Microsoft Edge di PC tujuan.
2. Akses alamat web aplikasi ini:
   ${currentUrl}
3. Di sebelah kanan kolom alamat URL browser (address bar), cari ikon
   berbentuk komputer dengan tanda panah ke bawah (bertuliskan "Install App" / "Instal Aplikasi").
4. Klik tombol tersebut dan pilih "Install".
5. Aplikasi akan langsung terinstal di komputer. Pintasan (Shortcut) ikon 
   "Bel Sekolah Otomatis" akan otomatis muncul di Desktop & Start Menu PC Anda.
6. Saat diklik, aplikasi akan terbuka dalam jendela khusus tanpa navigasi browser, 
   terlihat 100% seperti program desktop bawaan (.EXE).

Langkah 2: Menggunakan File Launcher "Jalankan_Bel_Sekolah.bat"
--------------------------------------------------------------
Jika Anda ingin meluncurkannya secara instan dengan klik ganda (double-click):
1. Salin file "Jalankan_Bel_Sekolah.bat" yang telah diunduh ke PC tujuan.
2. Klik ganda pada file tersebut.
3. PC Windows akan otomatis membuka browser Microsoft Edge atau Google Chrome
   dalam mode "App View" (Tampilan Tanpa Bingkai Browser) yang sangat rapi.

Langkah 3: Konfigurasi Auto-Start (Berjalan Otomatis saat Windows Menyala)
--------------------------------------------------------------------------
Agar operator piket sekolah tidak perlu membuka manual setiap pagi:
1. Tekan tombol Windows + R di keyboard Anda untuk membuka menu "Run".
2. Ketik perintah berikut lalu tekan Enter:
   shell:startup
3. Jendela folder "Startup" Windows akan terbuka.
4. Salin file "Jalankan_Bel_Sekolah.bat" ATAU shortcut PWA yang sudah dibuat, 
   lalu "PASTE" (tempel) ke dalam folder Startup tersebut.
5. Selesai! Kini, setiap kali komputer piket dinyalakan di pagi hari, 
   aplikasi Bel Sekolah akan otomatis terbuka sendiri tanpa perlu diklik manual.

Langkah Tambahan yang Penting: Nonaktifkan Fitur Sleep / Layar Mati
------------------------------------------------------------------
Agar suara bel otomatis tidak berhenti karena PC masuk ke mode tidur (Sleep):
1. Buka "Control Panel" -> "Power Options".
2. Pilih "Change plan settings" pada rencana daya yang aktif.
3. Ubah pilihan "Put the computer to sleep" menjadi "NEVER" (Jangan Pernah).
4. Klik "Save Changes".

===================================================================
Aplikasi ini mendukung penyimpanan lokal offline (localStorage), sehingga 
seluruh pengaturan jadwal pelajaran dan suara yang diinput oleh guru 
akan tersimpan aman di dalam memori internal komputer tersebut.
===================================================================
`;
    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = 'Panduan_Instalasi_PC.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloadedTxt(true);
    setTimeout(() => setDownloadedTxt(false), 3000);
  };

  const copyStartupPath = () => {
    navigator.clipboard.writeText('shell:startup');
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 text-white relative overflow-hidden" id="desktop-installer-center">
      {/* Absolute decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-5" id="installer-header">
        <div className="p-1.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
          <Laptop className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5" id="installer-title">
            <span>Desktop App Installer & Portable PC Launcher</span>
            <span className="px-1.5 py-0.5 bg-indigo-600/60 border border-indigo-500/50 rounded text-[9px] font-extrabold uppercase tracking-wide text-indigo-200">PC & Laptop</span>
          </h3>
          <p className="text-xxs text-slate-400">Panduan & generator file instaler mandiri agar bisa dijalankan di komputer piket sekolah lain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="installer-grid">
        {/* Left Side: Actions */}
        <div className="space-y-4" id="installer-left-col">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800" id="installer-download-block">
            <h4 className="text-xs font-extrabold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              1. Download File Executable Launcher (.BAT)
            </h4>
            <p className="text-xxs text-slate-400 leading-normal mb-3">
              Jalankan aplikasi ini layaknya software desktop dengan satu kali klik. Mengaktifkan <strong>"App-Mode"</strong> Chromium sehingga jendela terlihat bersih tanpa toolbar browser.
            </p>
            <button
              type="button"
              onClick={downloadBatFile}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xxs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 border border-indigo-500"
              id="btn-download-bat-launcher"
            >
              {downloadedBat ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Berhasil Diunduh!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Launcher (Jalankan_Bel_Sekolah.bat)</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800" id="installer-guide-block">
            <h4 className="text-xs font-extrabold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              2. Panduan & Buku Manual Penggunaan PC
            </h4>
            <p className="text-xxs text-slate-400 leading-normal mb-3">
              Dapatkan petunjuk instalasi lengkap berformat teks (.txt) mengenai cara memasang PWA, setting sleep-mode komputer, dan instalasi suara TTS.
            </p>
            <button
              type="button"
              onClick={downloadGuideFile}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-extrabold text-xxs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-600 active:scale-95"
              id="btn-download-guide-txt"
            >
              {downloadedTxt ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                  <span>Petunjuk Berhasil Diunduh!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Unduh Buku Panduan (Panduan_Instalasi_PC.txt)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Setup Instructions list */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800 flex flex-col justify-between" id="installer-right-col">
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 mb-3 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              Cara Memasang di Komputer Piket Lain (Auto-Start)
            </h4>
            
            <div className="space-y-3" id="mini-steps-list">
              <div className="flex gap-2.5 items-start text-xxs" id="mini-step-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400 font-mono mt-0.5">1</span>
                <p className="text-slate-300">
                  Unduh file <strong>.bat</strong> di atas lalu salin ke PC tujuan bersama Buku Panduan.
                </p>
              </div>

              <div className="flex gap-2.5 items-start text-xxs" id="mini-step-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400 font-mono mt-0.5">2</span>
                <div className="text-slate-300 w-full">
                  <p className="mb-1">Buka folder Startup Windows dengan menekan <strong>Win + R</strong> lalu ketik:</p>
                  <div className="flex items-center justify-between gap-2 p-1 px-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono font-bold text-indigo-300 max-w-max">
                    <span>shell:startup</span>
                    <button
                      type="button"
                      onClick={copyStartupPath}
                      className="hover:text-white p-0.5 active:scale-90 transition-all cursor-pointer"
                      title="Salin Perintah"
                    >
                      {copiedPath ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start text-xxs" id="mini-step-3">
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400 font-mono mt-0.5">3</span>
                <p className="text-slate-300">
                  Letakkan file launcher <strong>.bat</strong> tersebut ke dalam folder Startup. Bel otomatis akan langsung menyala sendiri ketika komputer dihidupkan!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex gap-2 text-[10px] text-indigo-300 leading-relaxed" id="installer-tip">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Keunggulan PWA Standalone:</strong> Lebih ringan dari installer exe biasa karena menggunakan kernel browser modern bawaan komputer, menjamin bebas virus, aman, dan memori RAM komputer sangat hemat!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
