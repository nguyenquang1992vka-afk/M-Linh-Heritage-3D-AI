import React, { useState } from "react";
import { HeritagePOI } from "../types";
import { useLanguage } from "../context/LanguageContext";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";
import { 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Layers, 
  Info,
  ChevronRight,
  Headphones,
  Lock,
  Unlock,
  Award,
  Footprints,
  Compass,
  Map as MapIcon,
  List,
  ArrowRight,
  Flag,
  BookOpen,
  Trophy,
  ShieldCheck,
  QrCode
} from "lucide-react";

interface InteractiveMapProps {
  pois: HeritagePOI[];
  completedPoiIds: string[];
  onSelectPOI: (poi: HeritagePOI) => void;
  onOpenAIChat: (query?: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pois,
  completedPoiIds,
  onSelectPOI,
  onOpenAIChat
}) => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allowFreeExplore, setAllowFreeExplore] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [lockedNotification, setLockedNotification] = useState<string | null>(null);

  const categories = ["Tất cả", "Historical Heritage Photo", "Kiến trúc", "Di vật & Thờ phụng", "Cảnh quan & Lễ hội", "Danh nhân"];

  // Sort POIs by order
  const sortedPois = [...pois].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Calculate total possible map XP and current earned map XP
  const totalPossibleMapXp = pois.reduce((acc, poi) => acc + poi.quest.xpReward, 0);
  const currentEarnedMapXp = pois
    .filter((poi) => completedPoiIds.includes(poi.id))
    .reduce((acc, poi) => acc + poi.quest.xpReward, 0);

  const completionPercentage = Math.round((completedPoiIds.length / pois.length) * 100);

  // 5-Step Timeline Journey definition (Official Digi Museum Stations)
  const timelineSteps = [
    {
      step: "01",
      title: "TRẠM 1: NGHI MÔN",
      desc: "Khám phá 1. Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng tại thôn Hạ Lôi, xã Mê Linh.",
      xp: "+30 XP",
      icon: Flag,
      unlocked: true,
      completed: completedPoiIds.includes("tam-quan")
    },
    {
      step: "02",
      title: "TRẠM 2: NHÀ KHÁCH",
      desc: "Tìm hiểu 2. Nhà khách và không gian đón tiếp tại Di tích Quốc gia đặc biệt Đền Hạ Lôi.",
      xp: "+40 XP",
      icon: Compass,
      unlocked: completedPoiIds.length >= 1,
      completed: completedPoiIds.includes("nha-khach")
    },
    {
      step: "03",
      title: "TRẠM 3: CHÍNH ĐIỆN",
      desc: "Chiêm bái 3. Chính điện thờ Hai Bà Trưng (Trưng Trắc và Trưng Nhị).",
      xp: "+50 XP",
      icon: BookOpen,
      unlocked: completedPoiIds.length >= 2,
      completed: completedPoiIds.includes("chinh-dien")
    },
    {
      step: "04",
      title: "TRẠM 4 & 5: PHỐI THỜ",
      desc: "Khám phá 4. Khu thờ thân phụ, thân mẫu Hai Bà Trưng & 5. Khu thờ các tướng lĩnh Hai Bà Trưng.",
      xp: "+85 XP",
      icon: Trophy,
      unlocked: completedPoiIds.length >= 3,
      completed:
        completedPoiIds.includes("khu-tho-than-phu-than-mau") &&
        completedPoiIds.includes("khu-tho-tuong-linh")
    },
    {
      step: "05",
      title: "TRẠM 6: CẢNH QUAN",
      desc: "Hoàn thành 6. Hồ Bán Nguyệt - Không gian cảnh quan di tích, mở khóa Huy hiệu Sứ Giả!",
      xp: "+50 XP",
      icon: ShieldCheck,
      unlocked: completedPoiIds.length >= 5,
      completed: completedPoiIds.includes("ho-ban-nguyet") || completedPoiIds.length >= 6
    }
  ];

  // Helper to determine POI lock/unlock status
  const getPoiStatus = (poi: HeritagePOI) => {
    const isCompleted = completedPoiIds.includes(poi.id);
    if (isCompleted) {
      return { status: "completed", isLocked: false };
    }

    if (allowFreeExplore) {
      return { status: "unlocked", isLocked: false };
    }

    // Sequential mode logic
    if (!poi.requiredPrevPoiId) {
      return { status: "unlocked", isLocked: false };
    }

    const prevPoi = pois.find((p) => p.id === poi.requiredPrevPoiId);
    const isPrevCompleted = prevPoi ? completedPoiIds.includes(prevPoi.id) : true;

    if (isPrevCompleted) {
      return { status: "unlocked", isLocked: false };
    }

    return { 
      status: "locked", 
      isLocked: true, 
      requiredPoiTitle: prevPoi ? prevPoi.title : "Trạm trước" 
    };
  };

  const handlePoiClick = (poi: HeritagePOI) => {
    const { isLocked, requiredPoiTitle } = getPoiStatus(poi);

    if (isLocked) {
      setLockedNotification(`🔒 Trạm "${poi.title}" chưa mở khóa! Bạn cần hoàn thành trạm "${requiredPoiTitle}" trước, hoặc bật chế độ "Tự do khám phá".`);
      setTimeout(() => setLockedNotification(null), 5000);
      return;
    }

    onSelectPOI(poi);
  };

  const filteredPois = sortedPois.filter((poi) => {
    const matchesCategory = selectedCategory === "Tất cả" || poi.category === selectedCategory;
    const matchesSearch = poi.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          poi.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO SECTION (Mandate #7) */}
      <section className="bg-[#F8F4E8] rounded-3xl border-2 border-[#C9A227] p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-[#9E2A2B] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>HỆ SINH THÁI HỌC TẬP SỐ DI SẢN AI • LỚP 4 & LỚP 5</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#9E2A2B] leading-tight">
              MÊ LINH SMART HERITAGE
            </h1>

            <p className="text-lg sm:text-xl font-semibold text-[#5A4032] italic">
              “Khám phá di sản bằng công nghệ. Học lịch sử bằng trải nghiệm.”
            </p>

            <p className="text-sm text-[#242424] leading-relaxed">
              Chào mừng các bạn nhỏ đến với quần thể Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng tại Hạ Lôi, Mê Linh, Hà Nội. Hãy bắt đầu hành trình tương tác 2D, giải đáp câu hỏi và tích lũy Điểm Linh Khí ngay hôm nay!
            </p>

            {/* CTA Buttons (Mandate #7 & #20) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById("digital-map-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 rounded-xl bg-[#9E2A2B] hover:bg-[#7A1F20] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>BẮT ĐẦU HÀNH TRÌNH</span>
                <ArrowRight className="w-4 h-4 text-[#C9A227]" />
              </button>

              <button
                onClick={() => setViewMode("map")}
                className="px-6 py-3 rounded-xl bg-[#F8F4E8] hover:bg-[#C9A227]/20 text-[#9E2A2B] border-2 border-[#9E2A2B] font-bold text-sm transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#9E2A2B]" />
                <span>KHÁM PHÁ BẢN ĐỒ</span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic & Official Heritage Photo Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#C9A227] shadow-lg bg-white group">
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <img 
                  src={templeBgImage} 
                  alt="Đền Hai Bà Trưng - Mê Linh"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#9E2A2B] text-[#C9A227] text-[10px] font-bold border border-[#C9A227] shadow">
                  Historical Heritage Photo
                </span>
              </div>
              <div className="p-4 bg-[#F8F4E8] border-t border-[#C9A227] space-y-1.5">
                <div className="text-[11px] font-bold text-[#9E2A2B] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội</span>
                </div>
                <div className="font-bold text-sm text-[#242424]">
                  ĐỀN HAI BÀ TRƯNG – MÊ LINH (Tên gọi khác: Đền Hạ Lôi)
                </div>
                <div className="text-xs font-semibold text-[#9E2A2B]">
                  “Di tích lịch sử Quốc gia đặc biệt, nơi thờ Hai Bà Trưng - hai nữ anh hùng dân tộc.”
                </div>
                <div className="text-[11px] text-[#242424] bg-white/80 p-2 rounded-xl border border-[#C9A227]/40 space-y-0.5">
                  <div><strong>Đối tượng thờ:</strong> Hai Bà Trưng (Trưng Trắc và Trưng Nhị).</div>
                  <div><strong>Loại hình:</strong> Di tích lịch sử văn hóa • <strong>Xếp hạng:</strong> Di tích Quốc gia đặc biệt.</div>
                </div>
                <p className="text-[11px] text-[#5A4032] leading-snug">
                  Không gian phía trước Đền Hai Bà Trưng với kiến trúc truyền thống, bia đá và khuôn viên tưởng niệm gắn với cuộc khởi nghĩa Hai Bà Trưng năm 40.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: HÀNH TRÌNH KHÁM PHÁ (5 STEPS TIMELINE - Mandate #8) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2">
              <Footprints className="w-6 h-6 text-[#C9A227]" />
              <span>HÀNH TRÌNH KHÁM PHÁ 5 BƯỚC</span>
            </h2>
            <p className="text-xs text-[#5A4032] font-semibold mt-1">
              Hoàn thành từng chặng hành trình để chinh phục danh hiệu Sứ Giả Di Sản Mê Linh
            </p>
          </div>
          <span className="text-xs font-bold text-[#2F6F68] bg-[#2F6F68]/15 px-3 py-1 rounded-full border border-[#2F6F68]/30">
            Tiến độ: {completedPoiIds.length}/6 trạm
          </span>
        </div>

        {/* 5 Step Timeline Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {timelineSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.step}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                  s.completed 
                    ? "bg-[#2F6F68]/10 border-[#2F6F68] text-[#242424]"
                    : s.unlocked
                    ? "bg-white border-[#C9A227] shadow-xs"
                    : "bg-stone-100 border-stone-300 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-[#9E2A2B] font-mono">{s.step}</span>
                    <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/15 px-2 py-0.5 rounded-md">
                      {s.xp}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#242424] mb-1 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-[#9E2A2B]" />
                    <span>{s.title}</span>
                  </h3>

                  <p className="text-xs text-[#5A4032] leading-snug">{s.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200 text-xs font-bold flex items-center justify-between">
                  {s.completed ? (
                    <span className="text-[#2F6F68] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã mở
                    </span>
                  ) : s.unlocked ? (
                    <span className="text-[#9E2A2B]">Sẵn sàng</span>
                  ) : (
                    <span className="text-stone-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Khóa
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DIGITAL MAP SECTION Header & Controls (Mandate #9) */}
      <section id="digital-map-section" className="bg-[#F8F4E8] p-6 rounded-3xl border-2 border-[#C9A227] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-[#9E2A2B] text-xs font-bold mb-1">
              <Compass className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>BẢN ĐỒ SỐ TƯƠNG TÁC HERITAGE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#9E2A2B]">
              BẢN ĐỒ KHÁM PHÁ MÊ LINH
            </h2>
            <p className="text-xs text-[#5A4032] font-semibold mt-1">
              Nhấp chọn các node trạm di tích để xem thông tin lịch sử, khám phá tư liệu và thực hiện câu hỏi thử thách.
            </p>
          </div>

          {/* Quick Mode Switchers & Explorer Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "map"
                  ? "bg-[#9E2A2B] text-white shadow-xs border border-[#C9A227]"
                  : "bg-white text-[#242424] border border-[#C9A227]/40"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Bản Đồ Node 2D</span>
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-[#9E2A2B] text-white shadow-xs border border-[#C9A227]"
                  : "bg-white text-[#242424] border border-[#C9A227]/40"
              }`}
            >
              <List className="w-4 h-4" />
              <span>Danh Sách Trạm</span>
            </button>

            <button
              onClick={() => setAllowFreeExplore(!allowFreeExplore)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                allowFreeExplore
                  ? "bg-[#C9A227]/20 text-[#5A4032] border-[#C9A227]"
                  : "bg-[#2F6F68]/20 text-[#2F6F68] border-[#2F6F68]"
              }`}
            >
              {allowFreeExplore ? <Unlock className="w-4 h-4 text-[#C9A227]" /> : <Footprints className="w-4 h-4 text-[#2F6F68]" />}
              <span>{allowFreeExplore ? "Khám Phá Tự Do" : "Lộ Trình Tuần Tự"}</span>
            </button>
          </div>
        </div>

        {/* Progress & Category Filters Bar */}
        <div className="pt-3 border-t border-[#C9A227]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <Layers className="w-4 h-4 text-[#C9A227] shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#9E2A2B] text-white shadow-xs"
                    : "bg-white text-[#5A4032] border border-[#C9A227]/30 hover:bg-[#C9A227]/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#C9A227] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trạm di tích..."
              className="w-full bg-white text-xs text-[#242424] placeholder-stone-400 pl-9 pr-3 py-2 rounded-xl border border-[#C9A227]/50 focus:outline-none focus:border-[#9E2A2B]"
            />
          </div>
        </div>
      </section>

      {/* Locked Alert Notification Banner */}
      {lockedNotification && (
        <div className="bg-[#9E2A2B] text-white p-4 rounded-2xl border-2 border-[#C9A227] shadow-lg text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-shake">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#C9A227] shrink-0" />
            <span>{lockedNotification}</span>
          </div>
          <button 
            onClick={() => setAllowFreeExplore(true)}
            className="px-3 py-1 rounded-xl bg-[#C9A227] text-[#242424] font-bold hover:bg-white text-xs shrink-0 transition-colors"
          >
            Mở khóa ngay
          </button>
        </div>
      )}

      {/* Map Interactive View Mode */}
      {viewMode === "map" && (
        <div className="relative rounded-3xl overflow-hidden border-4 border-[#C9A227] shadow-xl bg-[#242424] min-h-[500px] sm:min-h-[600px] flex items-center justify-center">
          {/* Map Image Backdrop */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter brightness-90 contrast-105"
            style={{
              backgroundImage: `url(${templeBgImage})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#242424]/75 via-[#3A261D]/65 to-[#242424]/80"></div>
            <div className="absolute inset-0 bronze-drum-pattern opacity-30"></div>
          </div>

          {/* Map Header Overlay Label */}
          <div className="absolute top-4 left-4 bg-[#F8F4E8]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#C9A227] text-[#242424] text-xs shadow-md flex items-center gap-2.5 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F6F68] animate-ping"></span>
            <div>
              <div className="font-bold text-[#9E2A2B] text-xs sm:text-sm">
                {language === "vi" ? "SƠ ĐỒ ĐỀN HAI BÀ TRƯNG – MÊ LINH (ĐỀN HẠ LÔI)" : "HAI BA TRUNG TEMPLE AI MAP"}
              </div>
              <div className="text-[10px] text-[#5A4032]">
                {language === "vi" ? "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội" : "Ha Loi Village, Me Linh Commune, Hanoi"}
              </div>
            </div>
          </div>

          {/* AI Helper Quick Button */}
          <button
            onClick={() => onOpenAIChat("Hãy hướng dẫn chi tiết sơ đồ tham quan 6 trạm tại Đền Hai Bà Trưng Mê Linh!")}
            className="absolute top-4 right-4 bg-[#9E2A2B] hover:bg-[#7A1F20] text-white px-3.5 py-2 rounded-2xl border border-[#C9A227] text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2 z-10"
          >
            <Sparkles className="w-4 h-4 text-[#C9A227]" />
            <span className="hidden sm:inline">Hỏi Trợ lý AI Cô Quang</span>
          </button>

          {/* SVG Connection Trail Lines connecting the 6 stations */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A227" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2F6F68" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            <line x1="22%" y1="78%" x2="45%" y2="62%" stroke="url(#routeGradient)" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
            <line x1="45%" y1="62%" x2="50%" y2="35%" stroke="url(#routeGradient)" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
            <line x1="50%" y1="35%" x2="75%" y2="70%" stroke="url(#routeGradient)" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
            <line x1="75%" y1="70%" x2="80%" y2="30%" stroke="url(#routeGradient)" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
            <line x1="50%" y1="35%" x2="30%" y2="22%" stroke="url(#routeGradient)" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
          </svg>

          {/* POI Station Pin Markers */}
          {filteredPois.map((poi) => {
            const { status, isLocked, requiredPoiTitle } = getPoiStatus(poi);
            const isCompleted = status === "completed";

            return (
              <div
                key={poi.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                style={{
                  left: `${poi.mapCoords.x}%`,
                  top: `${poi.mapCoords.y}%`
                }}
              >
                {/* Station Order Badge Header */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#F8F4E8] text-[#9E2A2B] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#C9A227] shadow-sm whitespace-nowrap">
                  Trạm #{poi.order}
                </div>

                {/* Marker Pulsing Halo */}
                {!isLocked && (
                  <div className={`absolute -inset-3 rounded-full opacity-75 animate-ping pointer-events-none ${
                    isCompleted ? "bg-[#2F6F68]/50" : "bg-[#C9A227]/50"
                  }`}></div>
                )}

                {/* Main Interactive Button */}
                <button
                  id={`poi-pin-${poi.id}`}
                  onClick={() => handlePoiClick(poi)}
                  className={`relative px-3.5 py-2 rounded-2xl border-2 flex items-center gap-2 shadow-lg transition-all duration-300 group-hover:scale-110 ${
                    isCompleted
                      ? "bg-[#2F6F68] border-[#C9A227] text-white"
                      : isLocked
                      ? "bg-stone-800 border-stone-600 text-stone-400 opacity-80 cursor-not-allowed"
                      : "bg-[#9E2A2B] border-[#C9A227] text-white"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted ? "bg-white/20 text-white" : isLocked ? "bg-stone-700 text-stone-400" : "bg-black/30 text-[#C9A227]"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-4 h-4 animate-bounce" />
                    )}
                  </div>

                  <div className="text-left text-xs font-bold leading-tight max-w-[110px] sm:max-w-[140px] truncate">
                    <span>{poi.title}</span>
                    <div className="text-[10px] font-normal flex items-center gap-1 mt-0.5">
                      {isCompleted ? (
                        <span className="text-emerald-200 font-bold">✓ Đã nhận +{poi.quest.xpReward} XP</span>
                      ) : isLocked ? (
                        <span className="text-stone-400">Khóa</span>
                      ) : (
                        <span className="text-[#C9A227] font-bold">+{poi.quest.xpReward} XP</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* 5. HERITAGE MAP POPUP CARD */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 sm:w-80 bg-[#F8F4E8] rounded-2xl border-2 border-[#C9A227] shadow-2xl text-[#242424] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-30 overflow-hidden">
                  <div className="relative h-36 w-full bg-stone-900">
                    <img
                      src={poi.imageUrl || templeBgImage}
                      alt={poi.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#9E2A2B] text-[#C9A227] text-[10px] font-bold border border-[#C9A227]">
                      Ảnh tư liệu thực tế
                    </span>
                    <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded truncate">
                      📍 {poi.subtitle || "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội"}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#9E2A2B] font-bold">
                      <span>Trạm #{poi.order} • Đền Hai Bà Trưng – Mê Linh</span>
                      {isCompleted ? (
                        <span className="text-[#2F6F68] font-bold">✓ Hoàn thành</span>
                      ) : isLocked ? (
                        <span className="text-rose-600 font-bold">🔒 Chưa mở</span>
                      ) : (
                        <span className="text-[#2F6F68] font-bold">✨ Sẵn sàng</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-[#9E2A2B]">{poi.title}</h4>
                    <p className="text-[11px] font-semibold text-[#242424] leading-snug">
                      {poi.shortDesc}
                    </p>
                    <p className="text-[11px] text-[#5A4032] line-clamp-2 leading-snug">
                      {poi.historicalSignificance}
                    </p>

                    {isLocked ? (
                      <div className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                        Cần hoàn thành trạm "{requiredPoiTitle}" trước
                      </div>
                    ) : (
                      <div className="pt-1 text-[11px] font-bold text-[#9E2A2B] flex items-center justify-end gap-1">
                        <span>Bấm để khám phá (+{poi.quest.xpReward} XP)</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Museum Digital Cards (Mandate #10) - List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#9E2A2B] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#C9A227]" />
              <span>DANH SÁCH TRẠM KHÁM PHÁ DIGI-MUSEUM</span>
            </h3>
            <span className="text-xs font-bold text-[#5A4032]">Hiển thị {filteredPois.length} địa điểm</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPois.map((poi) => {
              const { status, isLocked, requiredPoiTitle } = getPoiStatus(poi);
              const isCompleted = status === "completed";

              return (
                <div
                  key={poi.id}
                  onClick={() => handlePoiClick(poi)}
                  className={`rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 relative overflow-hidden bg-white group ${
                    isCompleted
                      ? "border-[#2F6F68]"
                      : isLocked
                      ? "border-stone-300 opacity-80"
                      : "border-[#C9A227]"
                  }`}
                >
                  <div>
                    <div className="relative h-48 w-full bg-stone-900 overflow-hidden">
                      <img
                        src={poi.imageUrl || templeBgImage}
                        alt={poi.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-bold">
                        <span className="px-3 py-1 rounded-full bg-[#9E2A2B]/90 text-[#F8F4E8] border border-[#C9A227]">
                          Trạm #{poi.order}
                        </span>
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-white font-bold bg-[#2F6F68]/90 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                          </span>
                        ) : isLocked ? (
                          <span className="flex items-center gap-1 text-stone-200 font-bold bg-stone-800/90 px-2.5 py-0.5 rounded-full">
                            <Lock className="w-3.5 h-3.5" /> Đã khóa
                          </span>
                        ) : (
                          <span className="text-[#9E2A2B] font-bold bg-[#C9A227] px-2.5 py-0.5 rounded-full">
                            +{poi.quest.xpReward} XP
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-amber-200 font-bold">
                        <span className="truncate">📍 {poi.subtitle}</span>
                        {poi.galleryUrls && poi.galleryUrls.length > 1 && (
                          <span className="px-2 py-0.5 rounded bg-black/60 text-white border border-white/20 shrink-0 ml-2">
                            {poi.galleryUrls.length} ảnh thực tế
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pb-2">
                      <h4 className="font-bold text-base text-[#9E2A2B] mb-2">
                        {poi.title}
                      </h4>

                      <p className="text-xs text-[#5A4032] leading-relaxed mb-3">
                        {poi.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-bold">
                    {isCompleted ? (
                      <span className="text-[#2F6F68]">Xem thông tin & di vật</span>
                    ) : isLocked ? (
                      <span className="text-stone-500 font-medium">Khóa: Cần trạm "{requiredPoiTitle}"</span>
                    ) : (
                      <span className="text-[#9E2A2B]">Khám phá trạm (+{poi.quest.xpReward} XP)</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#9E2A2B]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

