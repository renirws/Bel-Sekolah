export interface ScheduleItem {
  id: string;
  time: string; // "HH:MM" format
  activity: string; // e.g. "Upacara Bendera"
  bellType: 'classic' | 'speech' | 'both' | 'siren' | 'none';
  customSpeechText?: string;
  hour: number;
  minute: number;
}

export interface ScheduleProfile {
  id: string;
  name: string; // e.g. "Hari Senin - Kamis", "Hari Jumat", "Masa Ujian"
  rawText: string; // The raw line-by-line configuration
  items: ScheduleItem[];
}

export interface BellLog {
  id: string;
  timestamp: string; // Short readable time
  activityName: string;
  triggerType: 'Otomatis' | 'Manual';
  bellType: string;
  speechTextUsed?: string;
}

export type WebSpeechVoice = {
  name: string;
  lang: string;
  voiceURI: string;
};
