/**
 * Utility for local sound synthesis and text-to-speech
 * Designed to work fully offline on standalone school computers
 */

class SchoolAudioSystem {
  private ctx: AudioContext | null = null;
  private currentSpeech: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a clean, warm chime tone with soft decay
   */
  private playTone(frequency: number, startTime: number, duration: number, type: OscillatorType = 'sine', volumeValue: number = 0.5) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    // Add mild harmonics for acoustic richness
    if (type === 'sine') {
      osc.frequency.exponentialRampToValueAtTime(frequency + 4, startTime + duration);
    }

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volumeValue, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  /**
   * Play classic 2-tone "Ding Dong" chime
   */
  public playDingDong(): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // Note C5
      this.playTone(523.25, now, 1.2, 'sine', 0.4);
      this.playTone(1046.5, now, 1.0, 'sine', 0.05); // high harmonic
      
      // Note G4, plays slightly delayed
      this.playTone(392.00, now + 0.6, 1.5, 'sine', 0.4);
      this.playTone(784.00, now + 0.6, 1.2, 'sine', 0.05);

      setTimeout(() => {
        resolve();
      }, 2200);
    });
  }

  /**
   * Play Westminster Chimes melody (the 4-note classic school chime)
   */
  public playWestminster(): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const beat = 0.6; // duration of each note in seconds

      // Westminster notes: E5, C5, D5, G4
      // Timestamps:
      const notes = [
        { freq: 659.25, delay: 0 },       // E5
        { freq: 523.25, delay: beat },    // C5
        { freq: 587.33, delay: beat * 2 },// D5
        { freq: 392.00, delay: beat * 3 } // G4
      ];

      notes.forEach((note) => {
        // Core sinusoid
        this.playTone(note.freq, now + note.delay, beat * 1.5, 'sine', 0.4);
        // Soft warmth third harmonic
        this.playTone(note.freq * 1.5, now + note.delay, beat * 1.0, 'sine', 0.08);
      });

      setTimeout(() => {
        resolve();
      }, (beat * 4 + 1.2) * 1000);
    });
  }

  /**
   * Play rapid electronic beeps
   */
  public playElectronicBeeps(repeats: number = 3): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      let now = ctx.currentTime;

      for (let i = 0; i < repeats; i++) {
        this.playTone(880, now, 0.15, 'triangle', 0.3);
        now += 0.3;
      }

      setTimeout(() => {
        resolve();
      }, repeats * 300 + 300);
    });
  }

  /**
   * Play loud emergency siren sweeping up and down
   */
  public playSiren(durationSeconds: number = 5): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      
      // Sweep frequency up and down
      for (let time = 0; time < durationSeconds; time += 1) {
        osc.frequency.linearRampToValueAtTime(800, now + time + 0.5);
        osc.frequency.linearRampToValueAtTime(300, now + time + 1.0);
      }

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      setTimeout(() => {
        resolve();
      }, durationSeconds * 1000);
    });
  }

  /**
   * Speak school announcement text using Speech Synthesis API
   * Automatically targets Indonesian voice if available
   */
  public speak(text: string, voiceName?: string, rate: number = 0.95, pitch: number = 0.82): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser');
        resolve();
        return;
      }

      // Cancel current speaking before starting new
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentSpeech = utterance;

      // Select Indonesian voice if possible
      const voices = window.speechSynthesis.getVoices();
      
      if (voiceName) {
        const selected = voices.find(v => v.name === voiceName);
        if (selected) utterance.voice = selected;
      } else {
        // Try searching for Indonesian (id-ID)
        const indonesianVoices = voices.filter(
          (v) => v.lang.includes('id') || v.lang.includes('ID')
        );
        
        if (indonesianVoices.length > 0) {
          // Look for any Indonesian voice with a male name keyword
          const maleVoice = indonesianVoices.find(v => {
            const nameLower = v.name.toLowerCase();
            return nameLower.includes('ihsan') || nameLower.includes('wira') || nameLower.includes('male') || nameLower.includes('pria') || nameLower.includes('david') || nameLower.includes('mas');
          });
          utterance.voice = maleVoice || indonesianVoices[0];
        }
      }

      utterance.pitch = pitch;
      utterance.rate = rate; // Slightly slower, highly formal clear articulation

      utterance.onend = () => {
        this.currentSpeech = null;
        resolve();
      };

      utterance.onerror = (e) => {
        // Interrupted or canceled errors are part of normal playback control flow
        if (e && e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis notice:', e.error || e);
        }
        this.currentSpeech = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopAll() {
    this.stopMusicOnly();
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = '';
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if ((this as any)._musicResolve) {
      (this as any)._musicResolve();
      (this as any)._musicResolve = null;
    }
  }

  private musicInterval: any = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isMusicPlaying = false;

  private stopMusicOnly() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if ((this as any)._countdownInterval) {
      clearInterval((this as any)._countdownInterval);
      (this as any)._countdownInterval = null;
    }
    this.activeOscillators.forEach(item => {
      try {
        item.osc.stop();
      } catch (err) {
        // Already stopped or inactive
      }
    });
    this.activeOscillators = [];
  }

  /**
   * Play dynamic, highly motivating, upbeat synthesized music
   * using Web Audio API for a specific duration in seconds.
   */
  public playUpbeatMusic(durationSeconds: number, onSecondsRemaining?: (sec: number) => void): Promise<void> {
    return new Promise((resolve) => {
      this.stopAll(); // Clear any running audio/speech
      
      this.isMusicPlaying = true;
      const ctx = this.getContext();
      let secondsLeft = durationSeconds;
      
      if (onSecondsRemaining) {
        onSecondsRemaining(secondsLeft);
      }

      // Step duration is 0.22 seconds (rapid upbeat pace of ~136 BPM eighth notes)
      const stepDuration = 0.22; 
      let step = 0;
      
      const triggerStep = () => {
        if (!this.isMusicPlaying) return;
        
        const now = ctx.currentTime;
        
        // Upbeat, motivating chord progression: C Major -> G Major -> A Minor -> F Major
        const progressionIndex = Math.floor(step / 8) % 4;
        
        let rootFreq = 130.81; // C3
        let melodyScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C Major pentatonic (cheerful)
        
        if (progressionIndex === 0) { // C Major
          rootFreq = 130.81; // C3
          melodyScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        } else if (progressionIndex === 1) { // G Major
          rootFreq = 98.00; // G2
          melodyScale = [293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99]; // G Major pentatonic
        } else if (progressionIndex === 2) { // A Minor
          rootFreq = 110.00; // A2
          melodyScale = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33]; // A Minor pentatonic
        } else if (progressionIndex === 3) { // F Major
          rootFreq = 87.31; // F2
          melodyScale = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46]; // F Major pentatonic
        }

        const localStep = step % 8;
        
        // 1. Kick Drum (Four-on-the-floor driving beat on steps 0, 4)
        if (localStep === 0 || localStep === 4) {
          try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
            
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.15);
            this.activeOscillators.push({ osc, gain: gainNode });
          } catch (e) {}
        }

        // 2. Bright Snare/Clap on steps 2, 6 for energetic groove
        if (localStep === 2 || localStep === 6) {
          try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(90, now + 0.08);
            
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.1);
            this.activeOscillators.push({ osc, gain: gainNode });
          } catch (e) {}
        }

        // 3. Synth Bass (Rhythmic offbeats on steps 1, 3, 5, 7)
        if (localStep % 2 === 1) {
          try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(rootFreq, now);
            
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.19);
            this.activeOscillators.push({ osc, gain: gainNode });
          } catch (e) {}
        }

        // 4. Cheerful, energetic arpeggiated pentatonic melody
        const melodyPattern = [0, 4, 2, 5, 1, 6, 3, 7];
        const melodyNoteFreq = melodyScale[melodyPattern[localStep]];
        
        if (localStep !== 3 && localStep !== 7) {
          try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(melodyNoteFreq, now);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.28);
            this.activeOscillators.push({ osc, gain: gainNode });
          } catch (e) {}
        }

        step++;
      };

      // Set up the interval for the music sequencer
      const intervalMs = stepDuration * 1000;
      this.musicInterval = setInterval(triggerStep, intervalMs);
      
      // Countdown timer to decrement secondsLeft
      const countdownInterval = setInterval(() => {
        secondsLeft--;
        if (onSecondsRemaining) {
          onSecondsRemaining(secondsLeft);
        }
        
        if (secondsLeft <= 0) {
          clearInterval(countdownInterval);
          this.stopMusicOnly();
          resolve();
        }
      }, 1000);

      (this as any)._countdownInterval = countdownInterval;
      (this as any)._musicResolve = resolve;
    });
  }

  /**
   * Get list of Indonesian voices or all available voices
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  /**
   * Play standard custom audio files from a direct stream URL (e.g. Google Drive download links)
   */
  public playCustomAudio(url: string, durationSeconds: number, onSecondsRemaining?: (sec: number) => void): Promise<void> {
    return new Promise((resolve) => {
      this.stopAll(); // Clear any running audio/speech
      
      this.isMusicPlaying = true;
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      this.currentAudioElement = audio;
      
      let countdownInterval: any = null;
      let duration = durationSeconds;
      
      const cleanUp = () => {
        this.isMusicPlaying = false;
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        if (audio === this.currentAudioElement) {
          this.currentAudioElement = null;
        }
        resolve();
      };

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && audio.duration > 0) {
          // Use the minimum of user-specified duration and actual file duration
          duration = Math.min(durationSeconds, Math.ceil(audio.duration));
        }
        if (onSecondsRemaining) {
          onSecondsRemaining(duration);
        }
      });

      audio.addEventListener('ended', () => {
        cleanUp();
      });

      audio.addEventListener('error', (e) => {
        console.warn('Custom audio load failed, playing procedural synthesized music instead:', e);
        this.playUpbeatMusic(durationSeconds, onSecondsRemaining).then(resolve);
      });

      audio.play().then(() => {
        let secondsLeft = duration;
        if (onSecondsRemaining) {
          onSecondsRemaining(secondsLeft);
        }
        
        countdownInterval = setInterval(() => {
          secondsLeft--;
          if (onSecondsRemaining) {
            onSecondsRemaining(secondsLeft);
          }
          if (secondsLeft <= 0) {
            audio.pause();
            cleanUp();
          }
        }, 1000);
      }).catch((err) => {
        console.warn('Failed to start playing custom audio, using procedural backup:', err);
        this.playUpbeatMusic(durationSeconds, onSecondsRemaining).then(resolve);
      });

      (this as any)._countdownInterval = countdownInterval;
      (this as any)._musicResolve = resolve;
    });
  }
}

export const CUSTOM_BELLS = {
  MASUK: 'https://docs.google.com/uc?export=download&id=1hY6jbG9xZ-QFoPmpUVfoWxvuSzzD13IZ',
  PULANG: 'https://docs.google.com/uc?export=download&id=1uwkEr0sVfXSlelBdO-ul75byMbrecWqD',
  ISTIRAHAT: 'https://docs.google.com/uc?export=download&id=1et-fARJB4wTMEv6NWg6gAcuV77G3iLg0'
};

export const audioSystem = new SchoolAudioSystem();
