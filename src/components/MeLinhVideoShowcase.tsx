import React, { useState } from "react";
import {
  Video,
  ExternalLink,
  Award,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Play
} from "lucide-react";
import { soundManager } from "../utils/audioUtils";
import { recordProgressEventInDb } from "../services/heritageDatabase";

export const MELINH_YOUTUBE_SHORT_URL = "https://youtu.be/lQuZY2uPs08";
export const MELINH_YOUTUBE_VIDEO_ID = "lQuZY2uPs08";
export const MELINH_YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${MELINH_YOUTUBE_VIDEO_ID}?rel=0`;

interface MeLinhVideoShowcaseProps {
  onAddXp?: (amount: number) => void;
}

export const MeLinhVideoShowcase: React.FC<MeLinhVideoShowcaseProps> = ({ onAddXp }) => {
  const [videoIframeKey, setVideoIframeKey] = useState<number>(0);
  const [claimedVideoXp, setClaimedVideoXp] = useState<boolean>(false);

  const handleClaimVideoXp = () => {
    if (!claimedVideoXp) {
      setClaimedVideoXp(true);
      soundManager.playSuccessFanfare();
      if (onAddXp) onAddXp(40);
      recordProgressEventInDb({
        eventType: "watch_video",
        poiTitle: "Video Mê Linh Tôi Yêu – Hào Khí Lịch Sử",
        xpEarned: 40
      });
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#1A0D0E] via-[#2B1416] to-[#122624] rounded-3xl border-2 border-[#D4AF37] p-5 sm:p-8 shadow-2xl text-white space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E1E] border border-[#D4AF37] text-amber-200 text-xs font-extrabold uppercase">
            <Video className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>VIDEO TƯ LIỆU & NGHỆ THUẬT DI SẢN SỐ • YOUTUBE HD</span>
          </div>
          <h3 className="font-cinzel font-extrabold text-xl sm:text-3xl text-[#F8F4E8] leading-tight">
            Mê Linh Tôi Yêu – Hào Khí Lịch Sử, Khát Vọng Vươn Xa
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Thước phim nghệ thuật kết nối dòng chảy lịch sử hào hùng từ cuộc khởi nghĩa Hai Bà Trưng năm 40 SCN tại Đền Hai Bà Trưng (thôn Hạ Lôi) đến diện mạo đổi mới, hiện đại và khát vọng vươn xa của quê hương Xã Mê Linh, Thành phố Hà Nội hôm nay.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleClaimVideoXp}
            disabled={claimedVideoXp}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E5BE38] text-[#1A0D0E] font-extrabold text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-75 cursor-pointer"
          >
            <Award className="w-4 h-4 text-[#8B1E1E]" />
            <span>{claimedVideoXp ? "Đã nhận +40 XP Xem Video" : "Hoàn thành Xem Video (+40 XP)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setVideoIframeKey((prev) => prev + 1)}
            className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-100 border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Tải lại trình phát video"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Làm mới</span>
          </button>

          <a
            href={MELINH_YOUTUBE_SHORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-[#8B1E1E] hover:bg-[#A32222] text-white border border-[#D4AF37] text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Xem trên YouTube</span>
          </a>
        </div>
      </div>

      {/* Main Embedded YouTube Video Player (16:9 Widescreen) */}
      <div className="space-y-3">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-[0_15px_40px_rgba(0,0,0,0.65)] bg-black">
          <iframe
            key={videoIframeKey}
            src={MELINH_YOUTUBE_EMBED_URL}
            title="Mê Linh Tôi Yêu – Hào Khí Lịch Sử, Khát Vọng Vươn Xa"
            className="w-full h-full border-0 block"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300 bg-black/35 px-4 py-2.5 rounded-xl border border-[#D4AF37]/30">
          <a
            href={MELINH_YOUTUBE_SHORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:underline font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Link YouTube chính thức: {MELINH_YOUTUBE_SHORT_URL}</span>
          </a>
          <span className="text-amber-200/90 font-semibold">
            🎬 Mê Linh Tôi Yêu – Hào Khí Lịch Sử, Khát Vọng Vươn Xa
          </span>
        </div>
      </div>

      {/* Bottom Grid: Thematic Breakdown & Lyrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Thematic Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-black/35 rounded-2xl border border-[#D4AF37]/40 p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                THÔNG ĐIỆP TRỌNG TÂM CỦA VIDEO DI SẢN
              </span>
              <span className="text-[11px] font-mono text-amber-200/80">
                ID: {MELINH_YOUTUBE_VIDEO_ID}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <div className="text-xs font-extrabold text-[#D4AF37]">
                  1. Hào Khí Lịch Sử Cội Nguồn
                </div>
                <p className="text-xs text-stone-200 leading-relaxed">
                  Tái hiện niềm tự hào về vùng đất cố đô Mê Linh, nơi Hai Bà Trưng phất cờ khởi nghĩa mùa xuân năm 40 SCN và Di tích Quốc gia đặc biệt Đền Hai Bà Trưng tại thôn Hạ Lôi.
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <div className="text-xs font-extrabold text-[#D4AF37]">
                  2. Nhịp Sống Đổi Mới Từng Ngày
                </div>
                <p className="text-xs text-stone-200 leading-relaxed">
                  Những con đường mới mở nối tương lai, diện mạo quê hương Xã Mê Linh (TP. Hà Nội) vươn mình mạnh mẽ về kinh tế, văn hóa và hạ tầng đô thị.
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <div className="text-xs font-extrabold text-[#D4AF37]">
                  3. Công Nghệ & Tri Thức Lan Xa
                </div>
                <p className="text-xs text-stone-200 leading-relaxed">
                  “Công nghệ về trong từng mái nhà, tri thức lan xa khắp mọi miền” – tinh thần chuyển đổi số giáo dục và bảo tồn di sản bằng công nghệ AI.
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <div className="text-xs font-extrabold text-[#D4AF37]">
                  4. Khát Vọng Vươn Xa Muôn Đời
                </div>
                <p className="text-xs text-stone-200 leading-relaxed">
                  Thế hệ trẻ và học sinh Mê Linh tiếp bước cha ông, giữ trọn ngọn lửa truyền thống ngàn năm, tự tin vững bước vào kỷ nguyên mới.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Lyric Verses accompanying the Video (6 cols) */}
        <div className="lg:col-span-6 bg-black/40 rounded-2xl border border-[#D4AF37]/30 p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel font-extrabold text-sm sm:text-base text-amber-100">
                📜 Lời Ca Khúc Trong Video: “Mê Linh Tôi Yêu”
              </h4>
              <span className="text-[11px] text-[#D4AF37] font-bold">
                Hào khí lịch sử • Khát vọng vươn xa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-3.5 rounded-xl border border-[#D4AF37]/25 space-y-1.5 text-stone-200 leading-relaxed">
                <div className="text-[11px] font-extrabold text-[#D4AF37] uppercase">
                  Đoạn 1 & Điệp Khúc
                </div>
                <p>
                  “Mê Linh hôm nay đang đổi thay
                  <br />
                  Con đường mới mở nối tương lai
                  <br />
                  Nhịp sống âm thầm mà vươn xa
                  <br />
                  Quê hương lớn lên theo tháng ngày.
                  <br />
                  Trang sử xưa còn vang tên Người
                  <br />
                  Hai Bà Trưng đó sáng muôn đời...”
                </p>
                <p className="text-amber-200 font-bold pt-1">
                  “Mê Linh tôi yêu, yêu từ cội nguồn
                  <br />
                  Truyền thống ngàn năm vẫn trong tim
                  <br />
                  Mê Linh tôi yêu, đi cùng thời đại
                  <br />
                  Đổi mới từng ngày vững niềm tin!”
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-[#D4AF37]/25 space-y-1.5 text-stone-200 leading-relaxed">
                <div className="text-[11px] font-extrabold text-[#D4AF37] uppercase">
                  Đoạn 2 & Kết Bài
                </div>
                <p>
                  “Công nghệ về trong từng mái nhà
                  <br />
                  Tri thức lan xa khắp mọi miền
                  <br />
                  Giáo dục kinh tế cùng đi lên
                  <br />
                  Cuộc sống an lành sáng niềm tin.
                  <br />
                  Dẫu mai này thời gian đổi thay
                  <br />
                  Tên Người vẫn sáng giữa đất này...”
                </p>
                <p className="text-amber-200 font-bold pt-1">
                  “Mê Linh ơi niềm tin còn đó
                  <br />
                  Truyền thống hòa cùng bước thời gian
                  <br />
                  Quê hương tôi yêu sâu lắng mãi
                  <br />
                  Một khúc ca chung... đến muôn đời.”
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
            <span className="text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Tích hợp phục vụ học tập Lịch sử địa phương & Tham quan Bảo tàng số Mê Linh
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
