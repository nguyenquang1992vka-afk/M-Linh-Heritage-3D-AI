// Audio & Narration Controller for Mê Linh Smart Heritage
// Supports bilingual narration (Vietnamese MP3 / TTS and English TTS)

export const FIXED_NARRATION_AUDIO_URL = "/assets/audio/ai-thuyet-minh.mp3";

class SoundController {
  private narrationAudio: HTMLAudioElement | null = null;
  private customNarrationUrl: string = FIXED_NARRATION_AUDIO_URL;
  private onEndCallback: (() => void) | null = null;

  public getNarrationAudioUrl(): string {
    return this.customNarrationUrl;
  }

  public setNarrationAudioUrl(url: string) {
    this.customNarrationUrl = url;
    if (this.narrationAudio) {
      this.narrationAudio.pause();
      this.narrationAudio.src = url;
      this.narrationAudio.load();
    }
  }

  private getCurrentLanguage(): "vi" | "en" {
    if (typeof window === "undefined") return "vi";
    const saved =
      localStorage.getItem("selectedLanguage") || localStorage.getItem("app_language");
    return saved === "en" ? "en" : "vi";
  }

  // Phát thuyết minh theo ngôn ngữ hiện tại (vi hoặc en)
  public speakNarration(
    textVi: string,
    textEn: string,
    lang?: "vi" | "en",
    onEnd?: () => void,
    preferFixedMp3ForVi: boolean = false
  ) {
    const targetLang = lang || this.getCurrentLanguage();
    if (targetLang === "en") {
      this.speakTextByLang(textEn, "en-US", onEnd);
      return;
    }
    if (preferFixedMp3ForVi) {
      this.playNarrationAudio(onEnd);
    } else {
      this.speakTextByLang(textVi, "vi-VN", onEnd, true);
    }
  }

  public speakTextByLang(
    text: string,
    langCode: "vi-VN" | "en-US",
    onEnd?: () => void,
    fallbackToMp3: boolean = false
  ) {
    try {
      this.stopSpeech();
      this.onEndCallback = onEnd || null;

      if (typeof window !== "undefined" && "speechSynthesis" in window && text.trim()) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = langCode === "en-US" ? 0.98 : 1.0;

        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase())
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onend = () => {
          if (this.onEndCallback) {
            const cb = this.onEndCallback;
            this.onEndCallback = null;
            cb();
          }
        };
        utterance.onerror = () => {
          if (fallbackToMp3 && langCode === "vi-VN") {
            this.playNarrationAudio(onEnd);
          } else if (this.onEndCallback) {
            const cb = this.onEndCallback;
            this.onEndCallback = null;
            cb();
          }
        };

        window.speechSynthesis.speak(utterance);
        return;
      }

      if (langCode === "vi-VN") {
        this.playNarrationAudio(onEnd);
      } else if (onEnd) {
        onEnd();
      }
    } catch {
      if (langCode === "vi-VN") {
        this.playNarrationAudio(onEnd);
      } else if (onEnd) {
        onEnd();
      }
    }
  }

  // Phát file âm thanh thuyết minh khi bấm nút "Nghe AI thuyết minh"
  public speakVietnamese(text: string, onEnd?: () => void) {
    const currentLang = this.getCurrentLanguage();
    if (currentLang === "en" && text) {
      this.speakTextByLang(text, "en-US", onEnd);
      return;
    }
    this.playNarrationAudio(onEnd);
  }

  public playNarrationAudio(onEnd?: () => void, customEnglishText?: string) {
    const currentLang = this.getCurrentLanguage();
    if (currentLang === "en" && customEnglishText) {
      this.speakTextByLang(customEnglishText, "en-US", onEnd);
      return;
    }

    try {
      this.stopSpeech();
      this.onEndCallback = onEnd || null;

      if (typeof window === "undefined") {
        if (onEnd) onEnd();
        return;
      }

      const audio = new Audio(this.customNarrationUrl);
      audio.preload = "auto";
      audio.volume = 1.0;
      this.narrationAudio = audio;

      audio.onended = () => {
        this.narrationAudio = null;
        if (this.onEndCallback) {
          const cb = this.onEndCallback;
          this.onEndCallback = null;
          cb();
        }
      };

      audio.onerror = () => {
        this.narrationAudio = null;
        if (this.onEndCallback) {
          const cb = this.onEndCallback;
          this.onEndCallback = null;
          cb();
        }
      };

      audio.play().catch((err) => {
        console.warn("Narration audio playback error:", err);
        this.narrationAudio = null;
        if (this.onEndCallback) {
          const cb = this.onEndCallback;
          this.onEndCallback = null;
          cb();
        }
      });
    } catch (e) {
      console.warn("Cannot play narration audio:", e);
      if (onEnd) onEnd();
    }
  }

  public stopSpeech() {
    if (this.narrationAudio) {
      try {
        this.narrationAudio.pause();
        this.narrationAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.narrationAudio = null;
    }
    this.onEndCallback = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isPlayingNarration(): boolean {
    if (this.narrationAudio && !this.narrationAudio.paused) return true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }

  // Play celebratory sound effects using Web Audio API
  public playSuccessFanfare() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      console.warn("Audio Context not supported", e);
    }
  }

  public playCoinSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  }

  public playClick() {
    this.playCoinSound();
  }

  public playSuccess() {
    this.playSuccessFanfare();
  }
}

export const soundManager = new SoundController();
