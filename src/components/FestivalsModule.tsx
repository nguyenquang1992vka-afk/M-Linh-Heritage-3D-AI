import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { soundManager } from "../utils/audioUtils";
import festivalBannerImg from "../assets/images/le_hoi_real.jpg";
import kieuBatCongImg from "../assets/images/kieu_bat_cong_real.jpg";
import sanNghiLeImg from "../assets/images/san_nghi_le_real.jpg";
import {
  Sparkles,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Compass,
  Flame,
  Users,
  BookOpen,
  Bot,
  ArrowRight,
  Video,
  ExternalLink
} from "lucide-react";

const FESTIVAL_YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=xJ2Usaa1RWQ";
const FESTIVAL_YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/xJ2Usaa1RWQ?rel=0";

interface FestivalsModuleProps {
  onAddXp: (amount: number) => void;
  onOpenAIChat: (prompt: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const FestivalsModule: React.FC<FestivalsModuleProps> = ({
  onAddXp,
  onOpenAIChat,
  onNavigateTab
}) => {
  const { language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [xpClaimed, setXpClaimed] = useState<boolean>(false);
  const [videoXpClaimed, setVideoXpClaimed] = useState<boolean>(false);

  const handleClaimVideoXp = () => {
    if (!videoXpClaimed) {
      setVideoXpClaimed(true);
      soundManager.playSuccessFanfare();
      onAddXp(40);
    }
  };

  const festivalTimeline = [
    {
      day: language === "vi" ? "Mồng 4 Tháng Giêng" : "4th Day of 1st Lunar Month",
      title: language === "vi" ? "Lễ Mộc Dục & Rước Kiệu Tập Kết" : "Purification & Palanquin Gathering Ritual",
      desc:
        language === "vi"
          ? "Dân làng Hạ Lôi thực hiện nghi lễ Mộc Dục (tắm tượng thần) trang nghiêm và chuẩn bị cỗ kiệu Bát Cống sơn son thếp vàng cùng đội hình cờ hội, lọng vàng, voi chiến."
          : "Ha Loi villagers perform the sacred purification ritual and prepare the gilded Eight-Bearer Palanquins, festival flags, golden parasols, and ceremonial elephants.",
      highlight: language === "vi" ? "Chuẩn bị nghi trượng truyền thống ngàn năm" : "Millennium-old ceremonial preparation",
      image: kieuBatCongImg
    },
    {
      day: language === "vi" ? "Mồng 6 Tháng Giêng (Chính Hội)" : "6th Day of 1st Lunar Month (Main Festival)",
      title: language === "vi" ? "Nghi Lễ Rước Kiệu Giao Quân Độc Đáo Nhất Việt Nam" : "Unique Palanquin Procession & Sisterly Courtesy Ritual",
      desc:
        language === "vi"
          ? "Ngày kỷ niệm Hai Bà Trưng tế cờ khởi nghĩa năm 40 SCN. Khi ra khỏi cổng đền, kiệu Bà Trưng Trắc đi trước; nhưng khi ra khỏi cổng làng Hạ Lôi, kiệu Bà Trưng Trắc dừng lại nhường kiệu em là Bà Trưng Nhị đi trước – thể hiện đạo lý 'Trong nhà có phép nước, ngoài làng có tình chị nhường em'."
          : "Commemorating the 40 AD Uprising. Inside the temple gate, Trung Trac's palanquin leads as Queen; outside the village gate, she yields to her younger sister Trung Nhi, symbolizing sisterly harmony.",
      highlight: language === "vi" ? "Di sản Văn hóa Phi vật thể Quốc gia" : "National Intangible Cultural Heritage",
      image: festivalBannerImg
    },
    {
      day: language === "vi" ? "Mồng 7 – Mồng 10 Tháng Giêng" : "7th – 10th Day of 1st Lunar Month",
      title: language === "vi" ? "Hội Xuân Dân Gian & Diễn Xướng Lịch Sử" : "Spring Folk Games & Historical Reenactments",
      desc:
        language === "vi"
          ? "Tổ chức các hoạt động văn hóa dân gian sôi nổi tại Quảng trường Đền Hai Bà Trưng: đấu vật cổ truyền, múa lân sư rồng, hát quan họ trên hồ mắt voi, cờ người và hội thi tìm hiểu lịch sử cho học sinh Mê Linh."
          : "Vibrant cultural activities at the Temple Plaza: traditional wrestling, dragon dances, folk singing on the lake, human chess, and student heritage competitions.",
      highlight: language === "vi" ? "Gắn kết cộng đồng & Giáo dục thế hệ trẻ" : "Community bonding & Youth heritage education",
      image: sanNghiLeImg
    }
  ];

  const culturalHighlights = [
    {
      icon: "🏮",
      title: language === "vi" ? "Nghi thức Kiệu Quay Đầu" : "Turning Palanquin Ritual",
      desc:
        language === "vi"
          ? "Đội phù giá xoay kiệu uyển chuyển như vũ điệu giao quân, tái hiện cảnh nghĩa quân Mê Linh hợp sức xuất trận."
          : "Bearers spin the palanquins in rhythmic harmony, reenacting the gathering of Me Linh troops."
    },
    {
      icon: "🐘",
      title: language === "vi" ? "Đoàn Voi Chiến & Nữ Tướng" : "War Elephants & Female Generals",
      desc:
        language === "vi"
          ? "Tái hiện hào khí Hai Bà Trưng cưỡi voi vàng cùng 36 vị Nữ tướng phất cờ khởi nghĩa giải phóng 65 thành trì."
          : "Reenacting the heroic spirit of the Trung Sisters on golden elephants with 36 female generals."
    },
    {
      icon: "🥁",
      title: language === "vi" ? "Tiếng Trống Đồng Mê Linh" : "Sound of Me Linh Bronze Drums",
      desc:
        language === "vi"
          ? "Hồi trống hội vang rền thúc giục lòng yêu nước và niềm tự hào dân tộc của các thế hệ học sinh."
          : "Resounding festival drums inspiring patriotism and national pride in young students."
    },
    {
      icon: "🎋",
      title: language === "vi" ? "Trò Chơi Dân Gian Đầu Xuân" : "Spring Traditional Games",
      desc:
        language === "vi"
          ? "Đấu vật truyền thống, kéo co, cờ tướng, ném còn và hội thi Sứ giả Di sản Nhí."
          : "Traditional wrestling, tug-of-war, human chess, and Young Heritage Ambassador contests."
    }
  ];

  const handleQuizSubmit = () => {
    if (quizSelected === null) return;
    setQuizSubmitted(true);
    if (quizSelected === 1 && !xpClaimed) {
      soundManager.playSuccessFanfare();
      onAddXp(40);
      setXpClaimed(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* 1. HERO BANNER */}
      <section className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl min-h-[360px] flex items-end p-6 sm:p-10 text-white">
        <img
          src={festivalBannerImg}
          alt="Lễ hội Đền Hai Bà Trưng Mê Linh"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D0E] via-[#1A0D0E]/65 to-transparent"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B1E1E]/90 border border-[#D4AF37] text-[#D4AF37] text-xs font-bold shadow">
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {language === "vi"
                ? "DI SẢN VĂN HÓA PHI VẬT THỂ QUỐC GIA • MỒNG 6 THÁNG GIÊNG"
                : "NATIONAL INTANGIBLE CULTURAL HERITAGE • 6TH LUNAR JANUARY"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-cinzel text-[#F8F5EF] leading-tight">
            {language === "vi"
              ? "LỄ HỘI ĐỀN HAI BÀ TRƯNG MÊ LINH"
              : "HAI BA TRUNG TEMPLE FESTIVAL IN ME LINH"}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/95 leading-relaxed max-w-2xl">
            {language === "vi"
              ? "Khám phá lễ hội mùa xuân linh thiêng bậc nhất vùng đất Mê Linh – nơi tái hiện hào khí tế cờ khởi nghĩa năm 40 Sau Công Nguyên và nghi thức Rước Kiệu Giao Quân độc đáo truyền đời."
              : "Explore the sacred spring festival of Me Linh — reenacting the heroic 40 AD Uprising flag ceremony and the unique centuries-old Palanquin Procession."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() =>
                onOpenAIChat(
                  "Cô Mê Linh AI ơi, hãy kể cho em nghe sự tích nghi thức Rước Kiệu Giao Quân nhường nhau của Hai Bà Trưng tại lễ hội Mê Linh nhé!"
                )
              }
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] hover:brightness-110 text-white font-bold text-xs sm:text-sm border border-[#D4AF37] shadow-lg flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {language === "vi"
                  ? "Hỏi Cô Mê Linh AI về Lễ hội"
                  : "Ask Co Me Linh AI about the Festival"}
              </span>
            </button>

            <button
              onClick={() => onNavigateTab("map")}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-[#D4AF37]/60 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {language === "vi" ? "Xem Lộ trình Rước Kiệu trên Bản đồ" : "View Procession Route on Map"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 1.5. EMBEDDED PALANQUIN PROCESSION FESTIVAL VIDEO (YOUTUBE) */}
      <section className="bg-gradient-to-r from-[#1A0D0E] via-[#2C1A1D] to-[#1A0D0E] rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-2xl text-white space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E1E] border border-[#D4AF37] text-amber-200 text-xs font-extrabold uppercase">
              <Video className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>VIDEO TƯ LIỆU THỰC TẾ • DI SẢN VĂN HÓA PHI VẬT THỂ QUỐC GIA</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold font-cinzel text-amber-100">
              {language === "vi"
                ? "Video: Lễ Hội Rước Kiệu Đền Hai Bà Trưng – Mê Linh"
                : "Video: Hai Ba Trung Temple Palanquin Procession Festival"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              {language === "vi"
                ? "Thưởng thức toàn cảnh nghi lễ Rước Kiệu Bát Cống và nghi thức 'Giao kiệu – Kiệu quay đầu' (Kiệu chị nhường kiệu em) độc đáo bậc nhất Việt Nam tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội."
                : "Watch the traditional Eight-Bearer Palanquin Procession and the unique 'Turning Palanquins' sisterly courtesy ritual in Ha Loi village, Me Linh, Hanoi."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleClaimVideoXp}
              disabled={videoXpClaimed}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E5BE38] text-[#1A0D0E] font-extrabold text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-75 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#8B1E1E]" />
              <span>
                {videoXpClaimed
                  ? "Đã nhận +40 XP Xem Video Lễ hội"
                  : "Hoàn thành Xem Video (+40 XP)"}
              </span>
            </button>

            <a
              href={FESTIVAL_YOUTUBE_WATCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-[#8B1E1E] hover:bg-[#A32222] text-white border border-[#D4AF37] text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Xem trên YouTube</span>
            </a>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-black">
          <iframe
            src={FESTIVAL_YOUTUBE_EMBED_URL}
            title="Video Lễ hội Rước Kiệu Đền Hai Bà Trưng - Mê Linh"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/5 p-3.5 rounded-xl border border-[#D4AF37]/30">
            <div className="font-bold text-[#D4AF37]">🏮 Đội hình Rước Kiệu Bát Cống</div>
            <p className="text-stone-300 mt-1 leading-relaxed">
              Hai cỗ kiệu Bát Cống sơn son thếp vàng cùng cờ ngũ hành, cờ tứ linh, voi trắng, ngựa hồng uy nghiêm xuất phát từ Chính điện qua Nghi môn ngoại.
            </p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-xl border border-[#D4AF37]/30">
            <div className="font-bold text-[#D4AF37]">🔄 Nghi thức Giao Kiệu (Kiệu Quay Đầu)</div>
            <p className="text-stone-300 mt-1 leading-relaxed">
              Đội phù giá thực hiện động tác đổi vai nâng kiệu qua đầu nhịp nhàng như rồng uốn lượn giữa tiếng trống đồng Mê Linh vang dội.
            </p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-xl border border-[#D4AF37]/30">
            <div className="font-bold text-[#D4AF37]">💛 Đạo lý “Phép nước – Tình nhà”</div>
            <p className="text-stone-300 mt-1 leading-relaxed">
              Trong đền kiệu Vua chị Trưng Trắc đi trước; ra khỏi cổng làng Hạ Lôi, kiệu chị dừng lại nhường kiệu em Trưng Nhị đi lên trước.
            </p>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE FESTIVAL TIMELINE */}
      <section className="bg-white rounded-3xl border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#8B1E1E] uppercase tracking-wider font-cinzel flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              {language === "vi" ? "LỊCH TRÌNH NGHI LỄ TRUYỀN THỐNG" : "TRADITIONAL FESTIVAL SCHEDULE"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1A1D] font-cinzel mt-1">
              {language === "vi" ? "Hành Trình Mùa Lễ Hội Tháng Giêng" : "First Lunar Month Festival Timeline"}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F5EF] p-1.5 rounded-2xl border border-[#D4AF37]/40">
            {festivalTimeline.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDay === idx
                    ? "bg-[#8B1E1E] text-white shadow-xs"
                    : "text-[#5A4032] hover:text-[#8B1E1E]"
                }`}
              >
                {item.day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/40">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border-2 border-[#D4AF37] h-64 sm:h-72 relative shadow">
            <img
              src={festivalTimeline[selectedDay].image}
              alt={festivalTimeline[selectedDay].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-[#1A0D0E]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#D4AF37]/50 text-xs font-bold text-[#D4AF37]">
              ✨ {festivalTimeline[selectedDay].highlight}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-bold text-[#8B1E1E] uppercase tracking-wider">
              {festivalTimeline[selectedDay].day} • Thôn Hạ Lôi, Mê Linh, Hà Nội
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2C1A1D] font-cinzel">
              {festivalTimeline[selectedDay].title}
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              {festivalTimeline[selectedDay].desc}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#5A4032]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8B1E1E]" />
                Quảng trường & Cổng Tam Quan Đền Hai Bà Trưng
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2F6F68]" />
                Nhân dân & Học sinh Mê Linh tham gia
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4 CULTURAL HIGHLIGHTS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[#8B1E1E] font-cinzel flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          <span>
            {language === "vi"
              ? "4 NÉT ĐẶC SẮC CỦA LỄ HỘI ĐỀN MÊ LINH"
              : "4 CULTURAL HIGHLIGHTS OF ME LINH FESTIVAL"}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {culturalHighlights.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/40 shadow-sm hover:shadow-md transition-all space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#8B1E1E]/10 border border-[#D4AF37]/50 flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <h3 className="font-bold text-base text-[#2C1A1D] font-cinzel">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MINI CHALLENGE FOR STUDENTS (+40 XP) */}
      <section className="bg-gradient-to-br from-[#2C1A1D] to-[#3E2723] p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37] text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] text-[#1A0D0E] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-cinzel text-amber-100">
                {language === "vi"
                  ? "THỬ THÁCH KHÁM PHÁ LỄ HỘI MÊ LINH"
                  : "ME LINH FESTIVAL DISCOVERY CHALLENGE"}
              </h3>
              <p className="text-xs text-stone-300">
                {language === "vi"
                  ? "Trả lời đúng câu hỏi văn hóa lễ hội để nhận ngay +40 Điểm Linh Khí (XP)!"
                  : "Answer the festival culture question correctly to earn +40 XP!"}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-[#D4AF37] text-[#D4AF37] text-xs font-bold self-start sm:self-auto">
            +40 XP
          </span>
        </div>

        <p className="font-bold text-sm sm:text-base text-white mb-4">
          {language === "vi"
            ? "Câu hỏi: Trong lễ rước kiệu ngày Mồng 6 tháng Giêng tại Đền Hai Bà Trưng Mê Linh, nghi thức kiệu Bà Trưng Trắc dừng lại nhường kiệu Bà Trưng Nhị đi trước khi ra khỏi cổng làng thể hiện truyền thống quý báu nào?"
            : "Question: During the 6th Lunar January palanquin procession at Me Linh Temple, what noble tradition does Trung Trac's palanquin yielding to Trung Nhi's outside the village gate represent?"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            language === "vi"
              ? "A. Thi xem đội kiệu nào chạy nhanh hơn"
              : "A. Racing between palanquin teams",
            language === "vi"
              ? "B. Đạo lý 'Trong nhà có phép nước, ngoài làng có tình chị nhường em'"
              : "B. Royal law inside the court, loving sisterly courtesy in the village",
            language === "vi"
              ? "C. Thay đổi lộ trình đi qua sông Hồng"
              : "C. Changing the route across the Red River",
            language === "vi"
              ? "D. Nghỉ giải lao trước khi đánh trống"
              : "D. Taking a break before drumming"
          ].map((opt, idx) => {
            const isSelected = quizSelected === idx;
            const isCorrect = idx === 1;
            let style = "bg-white/10 border-white/20 text-stone-100 hover:border-[#D4AF37]";
            if (isSelected) style = "bg-[#D4AF37]/25 border-[#D4AF37] text-white font-bold";
            if (quizSubmitted) {
              if (isCorrect) style = "bg-emerald-600/40 border-emerald-400 text-white font-bold";
              else if (isSelected) style = "bg-rose-600/40 border-rose-400 text-white";
            }

            return (
              <button
                key={idx}
                onClick={() => !quizSubmitted && setQuizSelected(idx)}
                className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
              >
                <span>{opt}</span>
                {quizSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
              </button>
            );
          })}
        </div>

        {!quizSubmitted ? (
          <button
            onClick={handleQuizSubmit}
            disabled={quizSelected === null}
            className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#E5BE38] text-[#1A0D0E] font-extrabold text-xs sm:text-sm disabled:opacity-50 transition-all"
          >
            {language === "vi" ? "Kiểm tra đáp án & Nhận +40 XP" : "Submit Answer & Claim +40 XP"}
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-white/10 border border-[#D4AF37]/50 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[#D4AF37]">
                {quizSelected === 1
                  ? language === "vi"
                    ? "🎉 Chính xác! Em đã nhận được +40 XP vào Hộ chiếu Di sản!"
                    : "🎉 Correct! You earned +40 XP for your Heritage Passport!"
                  : language === "vi"
                  ? "💡 Đáp án đúng là B: Thể hiện phép nước và tình cảm chị em gắn bó của Hai Bà Trưng!"
                  : "💡 The correct answer is B: Showing both royal order and sisterly affection!"}
              </p>
            </div>
            {quizSelected !== 1 && (
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizSelected(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A0D0E] font-bold text-xs shrink-0"
              >
                {language === "vi" ? "Thử lại" : "Try Again"}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
