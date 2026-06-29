import { ScheduleItem } from '../types';

/**
 * Parses school schedule raw lines.
 * Supported format:
 * HH:MM - Activity Description [bellType]
 * Example:
 * 07:00 - Upacara Bendera [classic]
 * 07.45 - Jam Pelajaran Pertama [both]
 */
export function parseScheduleText(text: string): ScheduleItem[] {
  const lines = text.split('\n');
  const items: ScheduleItem[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Ignore comments and empty lines
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      return;
    }

    // Capture time (HH:MM or H:MM or HH.MM) followed by space/separator (- or =) and text
    const regex = /^(\d{1,2})[:.](\d{2})\s*(?:-|=)\s*(.+)$/;
    const match = trimmed.match(regex);
    
    if (match) {
      const hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      let activityAndType = match[3].trim();

      // Ensure valid time
      if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
        let bellType: 'classic' | 'speech' | 'both' | 'siren' | 'none' = 'both';

        // Extract bracketed bell type e.g. [classic], [speech], [both], [siren], [none]
        const typeRegex = /\[(classic|speech|both|siren|none)\]$/i;
        const typeMatch = activityAndType.match(typeRegex);
        if (typeMatch) {
          bellType = typeMatch[1].toLowerCase() as any;
          activityAndType = activityAndType.replace(typeRegex, '').trim();
        }

        const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        items.push({
          id: `item-${index}-${formattedTime}`,
          time: formattedTime,
          activity: activityAndType,
          bellType,
          hour,
          minute
        });
      }
    }
  });

  // Chronological sort
  return items.sort((a, b) => {
    if (a.hour !== b.hour) return a.hour - b.hour;
    return a.minute - b.minute;
  });
}

/**
 * Converts a schedule item into a highly polite Indonesian sentence for TTS.
 */
export function generateAnnouncementText(activity: string): string {
  const lowercaseAct = activity.toLowerCase();
  let text = '';
  
  if (lowercaseAct.includes('kepala sekolah') || lowercaseAct.includes('piket')) {
    text = `Perhatian, mohon perhatian, ${activity}.`;
  } else if (lowercaseAct.includes('istigosah')) {
    text = `Ayo bersemangat! Kegiatan istigosah bersama akan segera dimulai. Bapak ibu guru dan seluruh siswa dipersilakan mempersiapkan diri dengan khidmat.`;
  } else if (lowercaseAct.includes('upacara bendera') || (lowercaseAct.includes('upacara') && lowercaseAct.includes('persiapan'))) {
    text = `Semangat luar biasa! Upacara bendera akan segera dimulai. Seluruh siswa dan siswi dipersilakan segera menuju ke lapangan upacara dengan tertib dan disiplin tinggi.`;
  } else if (lowercaseAct.includes('istirahat kedua selesai') || lowercaseAct.includes('istirahat selesai') || lowercaseAct.includes('istirahat pertama selesai')) {
    text = `Waktu istirahat telah selesai! Mari masuk ke kelas dengan penuh energi untuk melanjutkan kegiatan belajar mengajar. Tetap fokus!`;
  } else if (lowercaseAct.includes('istirahat kedua') || (lowercaseAct.includes('istirahat') && lowercaseAct.includes('kedua'))) {
    text = `Saatnya waktu istirahat kedua dimulai! Selamat beristirahat, silakan segarkan pikiran dan tetap menjaga ketertiban bersama.`;
  } else if (lowercaseAct.includes('istirahat jumat') || lowercaseAct.includes('sholat jumat')) {
    text = `Saatnya istirahat hari Jumat dan persiapan ibadah sholat Jumat bagi seluruh siswa muslim. Mari siapkan diri beribadah dengan khusyuk.`;
  } else if (lowercaseAct.includes('istirahat pertama') || lowercaseAct.includes('istirahat dimulai') || lowercaseAct.includes('waktu istirahat')) {
    text = `Saatnya waktu istirahat dimulai! Selamat menikmati istirahat untuk seluruh siswa-siswi tercinta, tetap jaga kebersihan lingkungan ya!`;
  } else if (lowercaseAct.includes('masuk gerbang') || lowercaseAct.includes('persiapan kelas') || lowercaseAct.includes('bel masuk')) {
    text = `Bel masuk gerbang telah berbunyi! Kepada seluruh siswa, mari segera masuk ke ruang kelas dan bersiap dengan penuh semangat untuk memulai petualangan ilmu hari ini!`;
  } else if (lowercaseAct.includes('pulang sekolah') || lowercaseAct.includes('bel pulang') || lowercaseAct.includes('pulang')) {
    text = `Luar biasa, perjuangan belajar mengajar hari ini telah selesai dengan sukses! Mari kita berdoa dan pulang ke rumah masing-masing dengan tertib. Hati-hati di jalan, titip salam untuk keluarga, dan sampai jumpa besok pagi dengan semangat baru!`;
  } else if (lowercaseAct.includes('pelajaran ke-') || lowercaseAct.includes('pelajaran ke ') || lowercaseAct.includes('jam pelajaran ke')) {
    const numMatch = activity.match(/\d+/);
    if (numMatch) {
      text = `Ayo, saatnya jam pelajaran ke ${numMatch[0]} dimulai! Tetap fokus dan tunjukkan potensi terbaik kalian!`;
    } else {
      text = `Ayo, saatnya jam pelajaran berikutnya dimulai! Jaga fokus dan terus bersemangat!`;
    }
  } else if (lowercaseAct.includes('pelajaran pertama') || lowercaseAct.includes('jam pertama')) {
    text = `Ayo, saatnya jam pelajaran pertama dimulai! Mari kita buka hari ini dengan senyuman dan fokus belajar yang tinggi!`;
  } else {
    // Fallback polite Indonesian school bell announcement
    text = `Perhatian semuanya! Saatnya ${activity} dimulai. Mari kita ikuti kegiatan ini dengan penuh antusias dan dedikasi!`;
  }

  // Append the inspiring school slogan proud for SMK Tanjung Priok 1 Hebat!
  return `${text} SMK Tanjung Priok 1 Hebat!`;
}
