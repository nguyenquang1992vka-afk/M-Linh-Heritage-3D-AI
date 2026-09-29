import React, { useState, useEffect } from "react";
import { HeritagePOI, MediaItem } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { soundManager } from "../utils/audioUtils";
import templeRealImg from "../assets/images/den_hai_ba_trung_real.jpg";
import nghiMonNgoaiRealImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import nghiMonNoiRealImg from "../assets/images/nha_khach_don_tiep_real.jpg";
import tamToaChinhDienRealImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import khuThoThanPhuRealImg from "../assets/images/khu_tho_than_phu_real.jpg";
import nhaTaHuuMacRealImg from "../assets/images/khu_tho_tuong_linh_real.jpg";
import leHoiRealImg from "../assets/images/le_hoi_real.jpg";
import {
  Landmark,
  MapPin,
  Volume2,
  Square,
  Sparkles,
  CheckCircle2,
  Compass,
  BookOpen,
  Gamepad2,
  Eye,
  ArrowRight,
  Calendar
} from "lucide-react";

interface DenHaiBaTrungDetailPageProps {
  pois: HeritagePOI[];
  completedPOIIds: string[];
  onSelectPOI: (poi: HeritagePOI) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAIChat: (prompt: string) => void;
  onAddXp: (amount: number) => void;
  mediaLibrary?: MediaItem[];
}

type RelicDetailTab = "history" | "architecture" | "audio-video" | "tour360" | "challenge";

const POI_EN_TRANSLATIONS: Record<string, { title: string; shortDesc: string }> = {
  "tam-quan": {
    title: "1. Outer Ceremonial Gate (Nghi Mon Ngoai)",
    shortDesc: "Majestic traditional four-pillar ceremonial gate facing the Red River."
  },
  "nha-khach": {
    title: "2. Reception Hall & Exhibition Space",
    shortDesc: "Solemn reception area for heritage introduction, archives, and student groups."
  },
  "chinh-dien": {
    title: "3. Main Shrine of Hai Ba Trung",
    shortDesc: "Sacred three-hall sanctuary worshipping Queens Trung Trac and Trung Nhi."
  },
  "khu-tho-than-phu-than-mau": {
    title: "4. Parents & Mentors Shrine",
    shortDesc: "Shrine honoring the parents, mentors of the Trung Sisters, and General Thi Sach."
  },
  "khu-tho-tuong-linh": {
    title: "5. Generals Shrine of the Trung Dynasty",
    shortDesc: "Dedicated to the heroic female and male generals of the 40 AD uprising."
  },
  "ho-ban-nguyet": {
    title: "6. Crescent Lake & Relic Landscape",
    shortDesc: "Scenic Crescent Lake and 13-hectare sacred landscape in Ha Loi Village."
  }
};

export const DenHaiBaTrungDetailPage: React.FC<DenHaiBaTrungDetailPageProps> = ({
  pois,
  completedPOIIds,
  onSelectPOI,
  onNavigateTab,
  onOpenAIChat,
  onAddXp
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<RelicDetailTab>("architecture");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [active360Zone, setActive360Zone] = useState<number>(0);
  const [isFull360ModalOpen, setIsFull360ModalOpen] = useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [narrationFileStatus, setNarrationFileStatus] = useState<string | null>(null);
  const narrationFileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      soundManager.stopSpeech();
    };
  }, []);

  const narrationScriptVi =
    "Kính chào quý vị! Chào mừng quý vị và các em học sinh đến với Khu di tích Quốc gia đặc biệt Đền Hai Bà Trưng tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội. Đây là nơi Hai Bà Trưng phất cờ khởi nghĩa vào mùa xuân năm 40 sau Công nguyên, đánh đuổi quân Đông Hán, giành lại nền độc lập tự chủ và lập kinh đô đầu tiên tại Mê Linh.";

  const narrationScriptEn =
    "Welcome to the Hai Ba Trung Temple Special National Relic Complex in Ha Loi Village, Me Linh Commune, Hanoi. This sacred land is where Queens Trung Trac and Trung Nhi raised the flag of uprising in Spring 40 AD, reclaiming national independence and establishing the royal capital at Me Linh.";

  const narrationScript = language === "vi" ? narrationScriptVi : narrationScriptEn;

  const handleToggleNarration = () => {
    if (isSpeaking) {
      soundManager.stopSpeech();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    onAddXp(15);
    if (language === "en") {
      soundManager.speakTextByLang(narrationScriptEn, "en-US", () => setIsSpeaking(false));
    } else {
      soundManager.playNarrationAudio(() => setIsSpeaking(false));
    }
  };

  const handleUploadNarrationMp3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result || "");
        const res = await fetch("/api/audio/ai-thuyet-minh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl })
        });
        const data = await res.json();
        if (data?.audioUrl) {
          soundManager.setNarrationAudioUrl(data.audioUrl);
          setNarrationFileStatus(
            language === "vi"
              ? `Đã lưu file "${file.name}" vào nút Nghe AI thuyết minh!`
              : `Saved "${file.name}" to AI Audio Narration!`
          );
          setIsSpeaking(true);
          soundManager.playNarrationAudio(() => setIsSpeaking(false));
        }
      } catch (err) {
        console.warn("Upload narration error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const zones360 = [
    {
      title:
        language === "vi"
          ? "Nghi Môn Ngoại & Cổng Đền"
          : "Outer Ceremonial Gate & Temple Entrance",
      subtitle:
        language === "vi"
          ? "Cổng tứ trụ uy nghiêm hướng ra dòng sông Hồng"
          : "Majestic four-pillar gate facing the Red River",
      image: nghiMonNgoaiRealImg,
      stationOrder: 1
    },
    {
      title:
        language === "vi"
          ? "Nghi Môn Nội & Sân Ngũ Phúc"
          : "Inner Gate & Ceremonial Courtyard",
      subtitle:
        language === "vi"
          ? "Không gian hành lễ trung tâm và tả hữu vu"
          : "Central ceremonial courtyard and side pavilions",
      image: nghiMonNoiRealImg,
      stationOrder: 2
    },
    {
      title:
        language === "vi"
          ? "Tam Tòa Chính Điện"
          : "Main Three-Hall Sanctuary",
      subtitle:
        language === "vi"
          ? "Tiền tế – Trung tế – Hậu cung thờ Nhị Vị Vua Bà"
          : "Front, Middle, and Rear Halls worshipping the Two Queens",
      image: tamToaChinhDienRealImg,
      stationOrder: 3
    },
    {
      title:
        language === "vi"
          ? "Khu Thờ Thân Phụ, Thân Mẫu & Danh Tướng"
          : "Parents, Mentors & Generals Shrines",
      subtitle:
        language === "vi"
          ? "Tôn vinh cội nguồn gia tộc Lạc tướng Mê Linh"
          : "Honoring the lineage of the Lac Lords of Me Linh",
      image: khuThoThanPhuRealImg,
      stationOrder: 4
    },
    {
      title:
        language === "vi"
          ? "Tả – Hữu Mạc & Bảo Tàng Hiện Vật"
          : "Side Galleries & Artifact Exhibition",
      subtitle:
        language === "vi"
          ? "Trưng bày Kiệu Bát Cống, voi đá và sắc phong cổ"
          : "Exhibiting Royal Palanquins, stone elephants, and royal edicts",
      image: nhaTaHuuMacRealImg,
      stationOrder: 5
    },
    {
      title:
        language === "vi"
          ? "Không Gian Lễ Hội Rước Kiệu"
          : "Traditional Palanquin Procession Space",
      subtitle:
        language === "vi"
          ? "Nghi lễ Giao Quân Mồng 6 tháng Giêng âm lịch"
          : "Military Oath Ceremony on the 6th day of the 1st Lunar Month",
      image: leHoiRealImg,
      stationOrder: 6
    }
  ];

  const timelineEvents = [
    {
      year: language === "vi" ? "Thế kỷ I SCN" : "1st Century AD",
      title:
        language === "vi" ? "Quê hương Hạ Lôi – Mê Linh" : "Homeland of Ha Loi – Me Linh",
      desc:
        language === "vi"
          ? "Nơi sinh thành và gắn bó tuổi thơ của hai chị em Trưng Trắc, Trưng Nhị trong gia đình Lạc tướng Mê Linh."
          : "Birthplace and childhood home of sisters Trung Trac and Trung Nhi in the family of the Lac Lord of Me Linh.",
      image: templeRealImg
    },
    {
      year: language === "vi" ? "Mùa xuân năm 40" : "Spring 40 AD",
      title:
        language === "vi"
          ? "Hội thề Sông Hát & Phất cờ khởi nghĩa"
          : "Hat River Oath & Uprising Banner",
      desc:
        language === "vi"
          ? "Hai Bà Trưng lập đàn thề bên dòng sông Hát, hiệu triệu hào kiệt khắp nơi đứng lên đánh đuổi thái thú Tô Định."
          : "The Trung Sisters took their sacred oath by the Hat River, rallying patriots nationwide to overthrow Governor Su Ding.",
      image: nghiMonNgoaiRealImg
    },
    {
      year: language === "vi" ? "Năm 40 – 43 SCN" : "40 – 43 AD",
      title:
        language === "vi"
          ? "Giải phóng 65 thành trì – Đóng đô tại Mê Linh"
          : "Liberating 65 Citadels – Royal Capital at Me Linh",
      desc:
        language === "vi"
          ? "Khởi nghĩa toàn thắng, Trưng Trắc lên ngôi Vua (Trưng Nữ Vương), định đô tại Mê Linh và xá thuế 2 năm cho dân."
          : "Following complete victory, Trung Trac ascended the throne as Queen, establishing the capital at Me Linh and exempting taxes for two years.",
      image: tamToaChinhDienRealImg
    },
    {
      year: language === "vi" ? "Năm 2013 – Nay" : "2013 – Present",
      title:
        language === "vi"
          ? "Di tích Quốc gia Đặc biệt"
          : "Special National Relic Complex",
      desc:
        language === "vi"
          ? "Quần thể Đền Hai Bà Trưng được xếp hạng Di tích Quốc gia Đặc biệt và Lễ hội được công nhận Di sản Văn hóa Phi vật thể Quốc gia."
          : "Hai Ba Trung Temple was ranked a Special National Relic and its festival recognized as National Intangible Cultural Heritage.",
      image: leHoiRealImg
    }
  ];

  const miniChallengeQuestions =
    language === "vi"
      ? [
          {
            question: "1. Cuộc khởi nghĩa Hai Bà Trưng bùng nổ vào thời gian nào?",
            options: ["Mùa xuân năm 40 SCN", "Năm 248 SCN", "Năm 938 SCN", "Năm 1010 SCN"],
            correctIndex: 0
          },
          {
            question: "2. Sau khi thu phục 65 thành trì, Trưng Nữ Vương đóng đô tại đâu?",
            options: ["Cổ Loa", "Mê Linh", "Hoa Lư", "Phong Châu"],
            correctIndex: 1
          },
          {
            question: "3. Lễ hội Đền Hai Bà Trưng hàng năm khai hội chính vào ngày nào?",
            options: [
              "Mồng 6 tháng Giêng âm lịch",
              "Mồng 10 tháng Ba âm lịch",
              "Rằm tháng Giêng",
              "Mồng 5 tháng Tết"
            ],
            correctIndex: 0
          }
        ]
      : [
          {
            question: "1. When did the Hai Ba Trung Uprising break out?",
            options: ["Spring 40 AD", "248 AD", "938 AD", "1010 AD"],
            correctIndex: 0
          },
          {
            question: "2. After liberating 65 citadels, where did Queen Trung establish her royal capital?",
            options: ["Co Loa", "Me Linh", "Hoa Lu", "Phong Chau"],
            correctIndex: 1
          },
          {
            question: "3. On which date does the annual Hai Ba Trung Temple Festival officially open?",
            options: [
              "6th day of the 1st Lunar Month",
              "10th day of the 3rd Lunar Month",
              "15th day of the 1st Lunar Month",
              "5th day of the 1st Lunar Month"
            ],
            correctIndex: 0
          }
        ];

  const correctCount = miniChallengeQuestions.reduce(
    (acc, q, i) => (selectedQuizAnswers[i] === q.correctIndex ? acc + 1 : acc),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* 1. HERO SHOWCASE */}
      <section className="bg-white rounded-[36px] overflow-hidden border-2 border-[#D4AF37] shadow-2xl">
        <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden bg-[#1A0D0E]">
          <img
            src={templeRealImg}
            alt={t("hai_ba_trung_temple")}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center hover:scale-103 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D0E] via-black/30 to-transparent" />

          <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B1E1E]/95 text-[#D4AF37] text-xs font-extrabold border border-[#D4AF37] shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              {language === "vi" ? "DI TÍCH QUỐC GIA ĐẶC BIỆT" : "SPECIAL NATIONAL RELIC"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/70 text-amber-100 text-xs font-bold border border-[#D4AF37]/40">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              {language === "vi"
                ? "Thôn Hạ Lôi, Xã Mê Linh, TP. Hà Nội"
                : "Ha Loi Village, Me Linh Commune, Hanoi"}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-gradient-to-b from-[#1A0D0E] to-[#261214] text-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-5xl font-extrabold font-cinzel text-[#F8F5EF] tracking-tight">
                {language === "vi"
                  ? "ĐỀN HAI BÀ TRƯNG – MÊ LINH"
                  : "HAI BA TRUNG TEMPLE – ME LINH"}
              </h1>
              <p className="text-base sm:text-xl font-medium text-[#D4AF37]">
                {language === "vi"
                  ? "Dấu ấn lịch sử dân tộc"
                  : "Sacred Landmark of National Independence"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("visitor-registration")}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37] text-amber-200 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>{t("book_tour")}</span>
            </button>
          </div>

          {/* 5 Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("tour360");
                setIsFull360ModalOpen(true);
              }}
              className={`px-4 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "tour360"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow-lg"
                  : "bg-[#8B1E1E] hover:bg-[#A32222] text-white border-[#D4AF37]"
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>{t("experience_3d")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("audio-video");
                handleToggleNarration();
              }}
              className={`px-4 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSpeaking || activeTab === "audio-video"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow-lg"
                  : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/70"
              }`}
            >
              {isSpeaking ? <Square className="w-4 h-4 shrink-0" /> : <Volume2 className="w-4 h-4 shrink-0" />}
              <span>{isSpeaking ? t("stop_ai_narration") : t("listen_ai_narration")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-4 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow-lg"
                  : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/70"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{language === "vi" ? "Xem lịch sử" : "Historical Timeline"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("architecture")}
              className={`px-4 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow-lg"
                  : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/70"
              }`}
            >
              <Landmark className="w-4 h-4 shrink-0" />
              <span>{language === "vi" ? "Xem kiến trúc" : "Architecture & Stations"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("challenge")}
              className={`col-span-2 sm:col-span-1 px-4 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "challenge"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow-lg"
                  : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/70"
              }`}
            >
              <Gamepad2 className="w-4 h-4 shrink-0" />
              <span>{t("learning_missions")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* TAB 1: ARCHITECTURE & 6 STATIONS */}
      {activeTab === "architecture" && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B1E1E]">
                {language === "vi"
                  ? "KIẾN TRÚC & KHÔNG GIAN DI TÍCH"
                  : "ARCHITECTURE & HERITAGE STATIONS"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#2C1A1D] mt-0.5">
                {language === "vi"
                  ? "6 Trạm Tham Quan Đền Hai Bà Trưng"
                  : "6 Heritage Stations at Hai Ba Trung Temple"}
              </h2>
            </div>
            <span className="px-4 py-2 rounded-2xl bg-amber-100 text-[#8B1E1E] text-xs font-extrabold border border-[#D4AF37]">
              {language === "vi"
                ? `Đã khám phá: ${completedPOIIds.length} / ${pois.length} trạm`
                : `Explored: ${completedPOIIds.length} / ${pois.length} stations`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pois.map((poi) => {
              const isCompleted = completedPOIIds.includes(poi.id);
              const translated = POI_EN_TRANSLATIONS[poi.id];
              const displayTitle =
                language === "en" && translated ? translated.title : poi.title;
              const displayShortDesc =
                language === "en" && translated ? translated.shortDesc : poi.shortDesc;

              return (
                <div
                  key={poi.id}
                  onClick={() => onSelectPOI(poi)}
                  className="bg-white rounded-3xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden bg-stone-900">
                      <img
                        src={poi.imageUrl}
                        alt={displayTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-[#8B1E1E] text-[#D4AF37] text-xs font-extrabold border border-[#D4AF37]">
                        {language === "vi" ? `Trạm ${poi.order}` : `Station ${poi.order}`}
                      </span>
                      {isCompleted && (
                        <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {language === "vi" ? "Đã đóng dấu" : "Completed"}
                        </span>
                      )}
                    </div>

                    <div className="p-6 space-y-1.5">
                      <h3 className="font-cinzel font-extrabold text-lg text-[#2C1A1D] group-hover:text-[#8B1E1E] transition-colors">
                        {displayTitle}
                      </h3>
                      <p className="text-sm text-stone-600 line-clamp-2">{displayShortDesc}</p>
                    </div>
                  </div>

                  <div className="px-6 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-extrabold text-[#8B1E1E]">
                    <span>
                      {language === "vi"
                        ? `Xem chi tiết & Đóng dấu (+${poi.quest?.xpReward || 50} Điểm XP)`
                        : `View Details & Claim (+${poi.quest?.xpReward || 50} XP Points)`}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: HISTORICAL TIMELINE */}
      {activeTab === "history" && (
        <section className="space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B1E1E]">
              {language === "vi" ? "DÒNG CHẢY LỊCH SỬ" : "HISTORICAL TIMELINE"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#2C1A1D] mt-0.5">
              {language === "vi"
                ? "Khởi Nghĩa Hai Bà Trưng & Kinh Đô Mê Linh"
                : "The Trung Sisters Uprising & Me Linh Royal Capital"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {timelineEvents.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-md flex flex-col justify-between"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#8B1E1E] text-[#D4AF37] text-xs font-extrabold border border-[#D4AF37]">
                    {item.year}
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-extrabold font-cinzel text-[#8B1E1E]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-700 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#8B1E1E] to-[#5E1111] text-white rounded-3xl p-8 border-2 border-[#D4AF37] shadow-xl text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37]">
              {language === "vi"
                ? "HỘI THỀ SÔNG HÁT NĂM 40 SCN"
                : "THE IMMORTAL HAT RIVER OATH (40 AD)"}
            </span>
            <p className="text-lg sm:text-2xl font-cinzel font-extrabold text-amber-100 max-w-3xl mx-auto leading-relaxed">
              {language === "vi"
                ? "“Một xin rửa sạch nước thù • Hai xin dựng lại nghiệp xưa họ Hùng • Ba kẻo oan ức lòng chồng • Bốn xin vẻn vẹn sở công lênh này.”"
                : "“First, to cleanse the nation of the enemy • Second, to restore the ancient lineage of the Hung Kings • Third, to avenge the injustice done to my husband • Fourth, to fulfill this sacred duty to the homeland.”"}
            </p>
          </div>
        </section>
      )}

      {/* TAB 3: 3D / 360 EXPERIENCE - BẢO TÀNG ĐỀN HAI BÀ TRƯNG */}
      {activeTab === "tour360" && (
        <section className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B1E1E]">
                BẢO TÀNG ĐỀN HAI BÀ TRƯNG • {t("experience_3d")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#2C1A1D]">
                {language === "vi"
                  ? "Tham Quan Bảo Tàng Số Đền Hai Bà Trưng"
                  : "Hai Ba Trung Temple Digital Museum Tour"}
              </h2>
              <p className="text-sm text-stone-600">
                {language === "vi"
                  ? "Phòng trưng bày ảo 360° Khu di tích Quốc gia đặc biệt Đền Hai Bà Trưng – Mê Linh"
                  : "360° Virtual Exhibition Room – Hai Ba Trung Temple Special National Relic"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFull360ModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#8B1E1E] hover:bg-[#A32222] text-white font-extrabold text-xs sm:text-sm border-2 border-[#D4AF37] shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Eye className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {language === "vi" ? "Mở Toàn Màn Hình Bảo Tàng Số" : "Open Fullscreen Museum"}
              </span>
            </button>
          </div>

          <div className="relative w-full h-[560px] sm:h-[680px] rounded-3xl overflow-hidden border-2 border-[#D4AF37] bg-[#0f172a] shadow-2xl m-0 p-0">
            {/* Phòng trưng bày. Muốn đổi sang phòng khác thì thay link trong src="..." */}
            <iframe
              src="https://giaoviendoimoi.com/share/panorama/room_1790428229108?embed=1"
              allowFullScreen
              title="Phòng trưng bày ảo"
              className="block w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            />
          </div>
        </section>
      )}

      {/* TAB 4: AI AUDIO NARRATION & DOCUMENTARY VIDEOS */}
      {activeTab === "audio-video" && (
        <section className="space-y-6">
          <div className="bg-gradient-to-r from-[#1A0D0E] via-[#2C1416] to-[#1A0D0E] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37] shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E1E] text-[#D4AF37] text-xs font-extrabold border border-[#D4AF37]">
                <Volume2 className="w-3.5 h-3.5" />
                {language === "vi"
                  ? "THUYẾT MINH TỰ ĐỘNG BẰNG AI (TIẾNG VIỆT)"
                  : "AI HERITAGE AUDIO NARRATION (ENGLISH)"}
              </span>
              <h3 className="text-2xl font-extrabold font-cinzel text-amber-100">
                {language === "vi"
                  ? "Thuyết minh Di sản: Đền Hai Bà Trưng – Mê Linh"
                  : "Audio Guide: Hai Ba Trung Temple – Me Linh"}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">{narrationScript}</p>
              {narrationFileStatus && (
                <p className="text-xs font-bold text-emerald-400">{narrationFileStatus}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <input
                ref={narrationFileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav"
                onChange={handleUploadNarrationMp3}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleToggleNarration}
                className="px-6 py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#E5BE38] text-[#1A0D0E] font-extrabold text-sm flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {isSpeaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? t("stop_ai_narration") : t("listen_ai_narration")}</span>
              </button>

              <button
                type="button"
                onClick={() => narrationFileInputRef.current?.click()}
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-xs sm:text-sm border border-[#D4AF37]/70 cursor-pointer"
              >
                {t("update_mp3")}
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpenAIChat(
                    language === "vi"
                      ? "Hãy thuyết minh chi tiết về kiến trúc Đền Hai Bà Trưng – Mê Linh"
                      : "Please explain the architecture and history of Hai Ba Trung Temple in Me Linh"
                  )
                }
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-[#D4AF37] cursor-pointer"
              >
                {t("ai_heritage_assistant")}
              </button>
            </div>
          </div>

          {/* 3 Featured Videos Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-md">
              <div className="aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/uS5bGu30nxU?rel=0"
                  title={
                    language === "vi"
                      ? "Di tích lịch sử Đền Hai Bà Trưng"
                      : "Hai Ba Trung Temple Historical Relic"
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5 space-y-1">
                <span className="text-[11px] font-extrabold text-[#8B1E1E] uppercase">
                  {language === "vi" ? "Phim tư liệu di tích" : "Historical Documentary"}
                </span>
                <h4 className="font-cinzel font-extrabold text-base text-stone-900">
                  {language === "vi"
                    ? "Di Tích Lịch Sử Đền Hai Bà Trưng"
                    : "Hai Ba Trung Temple Historical Relic"}
                </h4>
              </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-md">
              <div className="aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/xJ2Usaa1RWQ?rel=0"
                  title={
                    language === "vi"
                      ? "Lễ hội Rước Kiệu Đền Hai Bà Trưng"
                      : "Hai Ba Trung Temple Palanquin Procession Festival"
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5 space-y-1">
                <span className="text-[11px] font-extrabold text-[#8B1E1E] uppercase">
                  {language === "vi"
                    ? "Di sản văn hóa phi vật thể"
                    : "Intangible Cultural Heritage"}
                </span>
                <h4 className="font-cinzel font-extrabold text-base text-stone-900">
                  {language === "vi"
                    ? "Lễ Hội Rước Kiệu Đền Hai Bà Trưng"
                    : "Palanquin Procession Festival at Hai Ba Trung Temple"}
                </h4>
              </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-md">
              <div className="aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/lQuZY2uPs08?rel=0"
                  title={
                    language === "vi"
                      ? "Mê Linh Tôi Yêu – Hào Khí Lịch Sử"
                      : "Beloved Me Linh – Heroic Spirit & Aspiration"
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5 space-y-1">
                <span className="text-[11px] font-extrabold text-[#8B1E1E] uppercase">
                  {language === "vi" ? "Thước phim nghệ thuật" : "Heritage Musical Film"}
                </span>
                <h4 className="font-cinzel font-extrabold text-base text-stone-900">
                  {language === "vi"
                    ? "Mê Linh Tôi Yêu – Hào Khí Lịch Sử"
                    : "Beloved Me Linh – Heroic Spirit"}
                </h4>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: LEARNING MISSIONS / CHALLENGE */}
      {activeTab === "challenge" && (
        <section className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B1E1E]">
                {t("learning_missions")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#2C1A1D]">
                {language === "vi"
                  ? "Chinh Phục Ấn Tín Đền Hai Bà Trưng"
                  : "Conquer the Hai Ba Trung Temple Seal"}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("quiz")}
              className="px-5 py-3 rounded-2xl bg-[#8B1E1E] text-white font-extrabold text-xs sm:text-sm border border-[#D4AF37] flex items-center gap-2 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {language === "vi" ? "Mở Đấu Trường Quiz Đầy Đủ" : "Open Full Quiz Quest"}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            {miniChallengeQuestions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3"
              >
                <div className="font-extrabold text-sm sm:text-base text-stone-900">
                  {q.question}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedQuizAnswers[qIdx] === optIdx;
                    const isCorrect = quizSubmitted && optIdx === q.correctIndex;
                    const isWrong = quizSubmitted && isSelected && optIdx !== q.correctIndex;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          if (!quizSubmitted) {
                            setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                          }
                        }}
                        className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                            : isWrong
                            ? "bg-rose-50 border-rose-500 text-rose-900"
                            : isSelected
                            ? "bg-[#8B1E1E] text-white border-[#D4AF37]"
                            : "bg-white text-stone-800 border-stone-200 hover:border-[#8B1E1E]"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {!quizSubmitted ? (
              <button
                type="button"
                onClick={() => {
                  setQuizSubmitted(true);
                  onAddXp(correctCount * 20);
                  soundManager.playSuccessFanfare();
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] text-white font-extrabold text-sm border-2 border-[#D4AF37] shadow-lg cursor-pointer"
              >
                {language === "vi"
                  ? "Nộp bài & Nhận Điểm XP"
                  : "Submit Answers & Claim XP Points"}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-sm border border-emerald-400">
                  {language === "vi"
                    ? `🎉 Kết quả: Đúng ${correctCount}/${miniChallengeQuestions.length} câu (+${correctCount * 20} Điểm XP)`
                    : `🎉 Score: ${correctCount}/${miniChallengeQuestions.length} correct (+${correctCount * 20} XP Points)`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs cursor-pointer"
                >
                  {language === "vi" ? "Làm lại" : "Retry"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Interactive Fullscreen 360 Panorama Modal (BẢO TÀNG ĐỀN HAI BÀ TRƯNG) */}
      {isFull360ModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col overflow-hidden m-0 p-0">
          <div className="flex items-center justify-between gap-4 bg-[#1A0D0E] border-b border-[#D4AF37]/50 px-4 py-3 text-white shrink-0">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37]">
                BẢO TÀNG ĐỀN HAI BÀ TRƯNG
              </span>
              <h3 className="text-base sm:text-xl font-extrabold font-cinzel text-amber-100">
                {language === "vi"
                  ? "Tham Quan Bảo Tàng Số Đền Hai Bà Trưng – Phòng trưng bày ảo"
                  : "Hai Ba Trung Temple Digital Museum – Virtual Exhibition Room"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFull360ModalOpen(false);
                onAddXp(25);
              }}
              className="px-4 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#A32222] text-white font-extrabold text-xs border border-[#D4AF37] cursor-pointer shrink-0"
            >
              {language === "vi" ? "Đóng (+25 Điểm XP)" : "Close (+25 XP Points)"}
            </button>
          </div>

          <div className="flex-1 w-full h-full overflow-hidden bg-[#0f172a] m-0 p-0">
            {/* Phòng trưng bày. Muốn đổi sang phòng khác thì thay link trong src="..." */}
            <iframe
              src="https://giaoviendoimoi.com/share/panorama/room_1790428229108?embed=1"
              allowFullScreen
              title="Phòng trưng bày ảo"
              className="block w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            />
          </div>
        </div>
      )}
    </div>
  );
};
