import React, { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Cấu hình cố định DUY NHẤT 1 Music Player toàn ứng dụng:
 * - Tên bài hát: "Mê Linh Tôi Yêu"
 * - Đường dẫn cố định: /assets/audio/me-linh-toi-yeu.mp3
 * - Đặt tại góc phải phía dưới màn hình, hiển thị trên mọi trang.
 * - Sử dụng singleton Audio instance để đảm bảo tuyệt đối chỉ có 1 nguồn nhạc duy nhất.
 */
export const FIXED_SONG_TITLE = "Mê Linh Tôi Yêu";
export const FIXED_AUDIO_FILE = "/assets/audio/me-linh-toi-yeu.mp3";

let sharedAudioInstance: HTMLAudioElement | null = null;
let userManuallyPaused = false;

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudioInstance && typeof window !== "undefined") {
    const audio = new Audio(FIXED_AUDIO_FILE);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.8;
    audio.setAttribute("playsinline", "true");
    sharedAudioInstance = audio;
  }
  return sharedAudioInstance!;
}

/**
 * Hàm gọi Music Player chung từ các module (Video, Bảo tàng 3D, Quiz, Khám phá di sản)
 */
export function controlGlobalMusicPlayer(action: "play" | "pause" | "toggle") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("global-music-player-control", { detail: { action } })
  );
}

interface HeritageMusicPlayerProps {
  onAddXp?: (xp: number) => void;
}

export const HeritageMusicPlayer: React.FC<HeritageMusicPlayerProps> = ({
  onAddXp
}) => {
  const claimedXpRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    const audio = typeof window !== "undefined" ? getSharedAudio() : null;
    return audio ? !audio.paused : false;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const audio = typeof window !== "undefined" ? getSharedAudio() : null;
    return audio ? audio.muted : false;
  });
  const [volume, setVolume] = useState<number>(() => {
    const audio = typeof window !== "undefined" ? getSharedAudio() : null;
    return audio ? audio.volume : 0.8;
  });
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

  const startPlayback = useCallback(async () => {
    const audio = getSharedAudio();
    if (!audio) return false;

    try {
      audio.volume = volume;
      audio.muted = isMuted;
      await audio.play();
      setIsPlaying(true);
      if (!claimedXpRef.current && onAddXp) {
        claimedXpRef.current = true;
        onAddXp(30);
      }
      return true;
    } catch {
      setIsPlaying(false);
      return false;
    }
  }, [volume, isMuted, onAddXp]);

  const pausePlayback = useCallback(() => {
    const audio = getSharedAudio();
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  // Đồng bộ trạng thái với singleton Audio & tự động phát khi mở ứng dụng
  useEffect(() => {
    const audio = getSharedAudio();
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeUpdate = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("volumechange", handleVolumeUpdate);

    let unlocked = !audio.paused;

    const tryAutoPlay = async () => {
      if (userManuallyPaused || !audio.paused) return;
      const started = await startPlayback();
      if (started) {
        unlocked = true;
        removeInteractionListeners();
      }
    };

    const handleFirstUserInteraction = () => {
      if (unlocked || userManuallyPaused) {
        removeInteractionListeners();
        return;
      }
      void tryAutoPlay();
    };

    const removeInteractionListeners = () => {
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchstart", handleFirstUserInteraction);
      window.removeEventListener("keydown", handleFirstUserInteraction);
    };

    if (!unlocked && !userManuallyPaused) {
      void tryAutoPlay();
      window.addEventListener("click", handleFirstUserInteraction, { passive: true });
      window.addEventListener("touchstart", handleFirstUserInteraction, { passive: true });
      window.addEventListener("keydown", handleFirstUserInteraction, { passive: true });
    }

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("volumechange", handleVolumeUpdate);
      removeInteractionListeners();
    };
  }, [startPlayback]);

  // Lắng nghe sự kiện từ các module (Video, Bảo tàng 3D, Quiz, Khám phá di sản)
  useEffect(() => {
    const handlePlayEvent = () => {
      userManuallyPaused = false;
      void startPlayback();
    };

    const handlePauseEvent = () => {
      userManuallyPaused = true;
      pausePlayback();
    };

    const handleControlEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: "play" | "pause" | "toggle" }>;
      const action = customEvent.detail?.action;
      const audio = getSharedAudio();
      if (!audio) return;

      if (action === "play") {
        userManuallyPaused = false;
        void startPlayback();
      } else if (action === "pause") {
        userManuallyPaused = true;
        pausePlayback();
      } else if (action === "toggle") {
        if (audio.paused) {
          userManuallyPaused = false;
          void startPlayback();
        } else {
          userManuallyPaused = true;
          pausePlayback();
        }
      }
    };

    window.addEventListener("play-me-linh-song", handlePlayEvent);
    window.addEventListener("pause-me-linh-song", handlePauseEvent);
    window.addEventListener("global-music-player-control", handleControlEvent);

    return () => {
      window.removeEventListener("play-me-linh-song", handlePlayEvent);
      window.removeEventListener("pause-me-linh-song", handlePauseEvent);
      window.removeEventListener("global-music-player-control", handleControlEvent);
    };
  }, [startPlayback, pausePlayback]);

  // Nút ▶ Phát / ⏸ Dừng
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = getSharedAudio();
    if (!audio) return;

    if (!audio.paused) {
      userManuallyPaused = true;
      pausePlayback();
    } else {
      userManuallyPaused = false;
      if (audio.muted) {
        audio.muted = false;
        setIsMuted(false);
      }
      void startPlayback();
    }
  };

  // Điều chỉnh âm lượng (0% -> 100%)
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const nextVolume = Number(e.target.value);
    const audio = getSharedAudio();
    if (!audio) return;

    audio.volume = nextVolume;
    setVolume(nextVolume);

    if (nextVolume === 0) {
      audio.muted = true;
      setIsMuted(true);
    } else if (audio.muted) {
      audio.muted = false;
      setIsMuted(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = getSharedAudio();
    if (!audio) return;

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && audio.volume === 0) {
      audio.volume = 0.7;
      setVolume(0.7);
    }
  };

  return (
    <div
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 pointer-events-auto select-none max-w-[calc(100vw-1.5rem)]"
      role="region"
      aria-label="Trình phát nhạc nền Mê Linh Tôi Yêu"
    >
      {/* Popup Thanh trượt Âm lượng (hiển thị khi bấm nút 🔊 Âm lượng) */}
      {showVolumeSlider && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-2 bg-[#1A0D0E]/95 backdrop-blur-md text-white rounded-2xl border-2 border-[#D4AF37] shadow-2xl p-3 w-64 sm:w-72 ml-auto space-y-2"
        >
          <div className="flex items-center justify-between text-xs border-b border-[#D4AF37]/25 pb-1.5">
            <span className="font-extrabold text-[#D4AF37] flex items-center gap-1.5">
              <span>🔊 Âm lượng</span>
            </span>
            <span className="font-mono font-bold text-amber-200">
              {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-[#D4AF37] hover:text-amber-200 transition-colors cursor-pointer shrink-0"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Thanh trượt âm lượng"
              className="flex-1 accent-[#D4AF37] h-1.5 bg-stone-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* DUY NHẤT 1 Music Player ở góc phải phía dưới màn hình */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-r from-[#1A0D0E]/95 via-[#2C1416]/95 to-[#1A0D0E]/95 backdrop-blur-md text-white rounded-full border-2 border-[#D4AF37] shadow-[0_8px_28px_rgba(0,0,0,0.55)] px-3 py-1.5 flex items-center gap-2 sm:gap-2.5"
      >
        {/* Tên bài nhạc cố định: 🎵 Mê Linh Tôi Yêu */}
        <div className="flex items-center gap-1.5 min-w-0 pl-1">
          <span className="text-sm leading-none shrink-0">🎵</span>
          <span className="font-cinzel font-extrabold text-xs sm:text-sm text-amber-100 truncate">
            {FIXED_SONG_TITLE}
          </span>
        </div>

        {/* Nút ▶ Phát / ⏸ Dừng */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`h-8 sm:h-9 px-3 sm:px-3.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer ${
            isPlaying
              ? "bg-gradient-to-r from-[#D4AF37] to-[#E5BE38] text-[#1A0D0E]"
              : "bg-[#8B1E1E] hover:bg-[#A32222] text-amber-100 border border-[#D4AF37]"
          }`}
          title={isPlaying ? "Dừng nhạc Mê Linh Tôi Yêu" : "Phát nhạc Mê Linh Tôi Yêu"}
        >
          {isPlaying ? (
            <span>⏸ Dừng</span>
          ) : (
            <span>▶ Phát</span>
          )}
        </button>

        {/* Nút 🔊 Âm lượng */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowVolumeSlider((prev) => !prev);
          }}
          className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full text-xs font-extrabold border flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
            showVolumeSlider
              ? "bg-[#D4AF37]/25 text-[#D4AF37] border-[#D4AF37]"
              : "bg-white/10 hover:bg-white/20 text-amber-100 border-[#D4AF37]/50"
          }`}
          title="Điều chỉnh âm lượng"
          aria-label="Âm lượng"
        >
          <span>{isMuted || volume === 0 ? "🔇" : "🔊"}</span>
          <span className="hidden sm:inline">Âm lượng</span>
        </button>
      </div>
    </div>
  );
};
