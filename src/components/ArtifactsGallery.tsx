import React, { useState, useEffect } from "react";
import { HeritageArtifact } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { soundManager } from "../utils/audioUtils";
import templeHomeImg from "../assets/images/den_hai_ba_trung_real.jpg";
import nghiMonNgoaiImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import nhaKhachImg from "../assets/images/nha_khach_don_tiep_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import khuThoThanPhuImg from "../assets/images/khu_tho_than_phu_real.jpg";
import khuThoTuongLinhImg from "../assets/images/khu_tho_tuong_linh_real.jpg";
import hoBanNguyetImg from "../assets/images/ho_ban_nguyet_canh_quan_real.jpg";
import festivalBannerImg from "../assets/images/le_hoi_real.jpg";
import {
  Landmark,
  Search,
  MapPin,
  Sparkles,
  X,
  Box,
  Compass,
  BookOpen,
  RotateCw,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Award,
  Maximize2,
  Minimize2,
  ExternalLink,
  RefreshCw,
  Eye,
  Image as ImageIcon,
  Video,
  Volume2,
  Square,
  Gamepad2
} from "lucide-react";
import { MeLinhVideoShowcase } from "./MeLinhVideoShowcase";

const EMBEDDED_MUSEUM_URL = "https://giaoviendoimoi.com/share/panorama/room_1790428229108?embed=1";

type HeritageItemMediaMode = "photo" | "video" | "3d" | "ai-audio" | "quiz";

interface ArtifactsGalleryProps {
  artifacts: HeritageArtifact[];
  onOpenAIChat: (query: string) => void;
  onAddXp?: (amount: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export const ArtifactsGallery: React.FC<ArtifactsGalleryProps> = ({
  artifacts,
  onOpenAIChat,
  onAddXp,
  onUnlockBadge
}) => {
  const { language } = useLanguage();
  const [museumTab, setMuseumTab] = useState<"interactive-museum" | "3d-objects" | "virtual-tour" | "stories">("interactive-museum");
  const [selectedArtifact, setSelectedArtifact] = useState<HeritageArtifact | null>(null);
  const [active3DIndex, setActive3DIndex] = useState<number>(0);
  const [itemMediaMode, setItemMediaMode] = useState<HeritageItemMediaMode>("3d");
  const [isSpeakingArtifact, setIsSpeakingArtifact] = useState<boolean>(false);
  const [artifactQuizAnswer, setArtifactQuizAnswer] = useState<number | null>(null);
  const [completedArtifactQuizIds, setCompletedArtifactQuizIds] = useState<string[]>([]);
  const [rotY, setRotY] = useState<number>(18);
  const [rotX, setRotX] = useState<number>(8);
  const [zoom3D, setZoom3D] = useState<number>(1);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Embedded Interactive Museum Tour state
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreenMuseum, setIsFullscreenMuseum] = useState<boolean>(false);
  const [claimedMuseumTourXp, setClaimedMuseumTourXp] = useState<boolean>(false);

  // Virtual Tour state
  const [tourSpaceIdx, setTourSpaceIdx] = useState<number>(0);
  const [panAngle, setPanAngle] = useState<number>(50);

  // Historical Stories state
  const [selectedStoryIdx, setSelectedStoryIdx] = useState<number>(0);
  const [readStories, setReadStories] = useState<Array<number | string>>([]);

  useEffect(() => {
    if (!autoSpin || museumTab !== "3d-objects") return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 2) % 360);
    }, 80);
    return () => clearInterval(interval);
  }, [autoSpin, museumTab]);

  const virtualTourSpaces = [
    {
      id: "tam-quan",
      name: "1. Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng",
      location: "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội (Đền Hạ Lôi)",
      image: nghiMonNgoaiImg,
      desc: "Không gian Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng với kiến trúc cột đồng trụ (tứ trụ) truyền thống, bia đá và khuôn viên tưởng niệm gắn với cuộc khởi nghĩa Hai Bà Trưng năm 40.",
      hotspots: [
        { x: 50, y: 56, label: "Cổng chính Nghi môn ngoại (Tứ trụ)" },
        { x: 30, y: 42, label: "Đỉnh trụ trang trí tứ phượng & ô lồng đèn tứ linh" }
      ]
    },
    {
      id: "nha-khach",
      name: "2. Nhà khách và không gian đón tiếp",
      location: "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội",
      image: nhaKhachImg,
      desc: "Khu vực Nhà khách và không gian đón tiếp trang trọng phục vụ công tác thuyết minh, trưng bày tư liệu và đón đoàn tham quan học tập tại Đền Hai Bà Trưng – Mê Linh.",
      hotspots: [
        { x: 48, y: 45, label: "Thuyết minh giới thiệu thân thế, sự nghiệp Hai Bà Trưng" },
        { x: 65, y: 70, label: "Không gian đón đoàn đại biểu và học sinh" }
      ]
    },
    {
      id: "chinh-dien",
      name: "3. Chính điện thờ Hai Bà Trưng",
      location: "Tam tòa chính điện – Đền Hai Bà Trưng (Mê Linh)",
      image: tamToaChinhDienImg,
      desc: "Phía trước Tam tòa chính điện thờ Hai Bà Trưng (Trưng Trắc và Trưng Nhị) với kiến trúc gỗ lim chạm trổ tinh tế, hương án đá và sân nghi lễ trang nghiêm.",
      hotspots: [
        { x: 50, y: 62, label: "Hương án đá phía trước Tam tòa chính điện" },
        { x: 50, y: 38, label: "Tam tòa chính điện thờ Hai Bà Trưng" }
      ]
    },
    {
      id: "khu-tho-than-phu-than-mau",
      name: "4. Khu thờ thân phụ, thân mẫu Hai Bà Trưng",
      location: "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội",
      image: khuThoThanPhuImg,
      desc: "Đền thờ thân phụ - thân mẫu, sư phụ - sư mẫu của Hai Bà Trưng và đền thờ thân phụ - thân mẫu ông Thi Sách cùng Tướng quân Thi Sách dưới bóng cây cổ thụ.",
      hotspots: [
        { x: 48, y: 72, label: "Đỉnh hương đồng trước Khu thờ thân phụ, thân mẫu" },
        { x: 52, y: 48, label: "Đền thờ thân phụ, thân mẫu Hai Bà Trưng" }
      ]
    },
    {
      id: "khu-tho-tuong-linh",
      name: "5. Khu thờ các tướng lĩnh Hai Bà Trưng",
      location: "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội",
      image: khuThoTuongLinhImg,
      desc: "Đền thờ các vị nữ tướng và nam tướng triều Hai Bà Trưng đã tụ nghĩa, sát cánh chiến đấu trong cuộc khởi nghĩa năm 40 sau Công nguyên.",
      hotspots: [
        { x: 52, y: 46, label: "Khu thờ các tướng lĩnh Hai Bà Trưng" },
        { x: 38, y: 66, label: "Biểu tượng tinh thần đại đoàn kết dân tộc" }
      ]
    },
    {
      id: "ho-ban-nguyet",
      name: "6. Hồ Bán Nguyệt - Không gian cảnh quan di tích",
      location: "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội",
      image: hoBanNguyetImg,
      desc: "Toàn cảnh Hồ Bán Nguyệt và không gian cảnh quan khu di tích rộng 13ha tọa lạc trên khu đất cao nhìn ra đê sông Hồng tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội.",
      hotspots: [
        { x: 50, y: 60, label: "Hồ Bán Nguyệt & Trục cảnh quan di tích" },
        { x: 45, y: 35, label: "Quần thể di tích nhìn ra đê sông Hồng" }
      ]
    }
  ];

  const historicalStories = [
    {
      id: 0,
      era: "Mùa Xuân Năm 40 SCN",
      title: language === "vi" ? "Lời Thề Sông Hát – Hào Khí Mê Linh" : "The Hat River Oath – Spirit of Me Linh",
      subtitle:
        language === "vi"
          ? "Bốn câu thề bất hủ vang vọng non sông Việt Nam"
          : "The four immortal oath verses echoing through Vietnamese history",
      image: templeHomeImg,
      poem: `“Một xin rửa sạch nước thù,\nHai xin đem lại nghiệp xưa họ Hùng,\nBa kẻo oan ức lòng chồng,\nBốn xin vẻn vẹn sở công lênh này!”`,
      content:
        language === "vi"
          ? "Mùa xuân năm 40 Sau Công Nguyên, trước ách đô hộ tàn bạo của nhà Đông Hán do Thái thú Tô Định cầm đầu, hai chị em Trưng Trắc và Trưng Nhị (con gái Lạc tướng Mê Linh) đã lập đàn tế trời đất bên dòng sông Hát. Tiếng trống đồng Mê Linh vang rền, nghĩa quân khắp nơi hội tụ, chỉ trong thời gian ngắn đã giải phóng 65 thành trì ở Lĩnh Nam, thu phục non sông về một mối và đóng đô tại Mê Linh."
          : "In Spring 40 AD, facing the harsh rule of Eastern Han governor Su Ding, the sisters Trung Trac and Trung Nhi (daughters of the Lac Lord of Me Linh) raised the flag of uprising. To the resounding beats of Me Linh bronze drums, patriotic forces liberated 65 citadels and established the royal capital right in Me Linh.",
      moral:
        language === "vi"
          ? "Bài học lịch sử: Lòng yêu nước nồng nàn, ý chí độc lập tự cường và sức mạnh đoàn kết toàn dân tộc."
          : "Historical Lesson: Deep patriotism, self-reliance, and national unity."
    },
    {
      id: 1,
      era: "Năm 40 – 43 SCN",
      title: language === "vi" ? "Hai Bà Cưỡi Voi Vàng Xung Trận" : "The Trung Sisters Riding War Elephants",
      subtitle:
        language === "vi"
          ? "Hình ảnh oai hùng của hai vị Nữ Vương đầu tiên trong lịch sử dân tộc"
          : "Heroic image of the first two Queens in Vietnamese history",
      image: festivalBannerImg,
      poem: `“Ngàn Tây nổi áng phong trần,\nẦm ầm binh mã xuống gần Long Biên.\nHồng quần nhẹ bước chinh yên,\nĐuổi ngay Tô Định, dẹp yên biên thành!”`,
      content:
        language === "vi"
          ? "Từ đất Mê Linh, Bà Trưng Trắc và Bà Trưng Nhị mặc giáp vàng, che lọng vàng, ngự trên lưng hai thớt voi chiến khổng lồ trực tiếp chỉ huy đại quân tiến đánh thành Luy Lâu. Đội tượng binh Mê Linh dũng mãnh khiến quân Đông Hán khiếp sợ, Thái thú Tô Định phải cắt tóc, cạo râu, vứt bỏ ấn tín trốn chạy. Sau chiến thắng, Bà Trưng Trắc được suy tôn làm Vua (Trưng Nữ Vương), xá thuế hai năm liền cho nhân dân."
          : "From Me Linh, Trung Trac and Trung Nhi rode majestic war elephants at the forefront of their army to capture Luy Lau citadel. Following the glorious victory, Trung Trac was proclaimed Queen (Trung Nu Vuong), abolishing taxes for two years for the people.",
      moral:
        language === "vi"
          ? "Bài học lịch sử: Bản lĩnh kiên cường của người phụ nữ Việt Nam 'Giặc đến nhà đàn bà cũng đánh'."
          : "Historical Lesson: The indomitable courage and leadership of Vietnamese women."
    },
    {
      id: 2,
      era: "Truyền Thống Ngàn Năm",
      title: language === "vi" ? "Sự Tích Nghi Lễ 'Kiệu Quay Đầu' Làng Hạ Lôi" : "Legend of the Turning Palanquins in Ha Loi",
      subtitle:
        language === "vi"
          ? "Phép nước nghiêm minh và tình chị em thắm thiết của Hai Bà"
          : "Royal protocol inside the temple and sisterly affection in the village",
      image: templeHomeImg,
      poem: `“Trong đền phép nước ngôi Vua,\nNgoài làng tình chị nhường em vẹn toàn.”`,
      content:
        language === "vi"
          ? "Tại Lễ hội Đền Hai Bà Trưng ở thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội, có một nghi thức độc nhất vô nhị: Khi rước kiệu từ Chính điện thờ Hai Bà Trưng qua Nghi môn ngoại, kiệu Bà Trưng Trắc (là Vua) đi trước, kiệu Bà Trưng Nhị đi sau. Nhưng ngay khi qua khỏi cổng làng Hạ Lôi, kiệu Bà Trưng Trắc dừng lại sang bên đường để nhường kiệu em gái là Bà Trưng Nhị đi lên trước. Nghi thức ấy nhắc nhở con cháu bài học sâu sắc về lễ nghĩa gia đình và phép tắc quốc gia."
          : "At the Me Linh Temple Festival in Ha Loi village, when leaving the temple, Queen Trung Trac's palanquin leads first. Yet once outside the village gate, her palanquin steps aside to let her younger sister Trung Nhi go ahead — teaching generations about harmony between national duty and family love.",
      moral:
        language === "vi"
          ? "Bài học lịch sử: Tôn trọng kỷ cương và giữ gìn tình yêu thương, nhường nhịn anh chị em trong gia đình."
          : "Historical Lesson: Respecting rules while cherishing sibling harmony and kindness."
    }
  ];

  const filteredArtifacts = artifacts.filter(
    (art) =>
      art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const active3DArtifact = artifacts[active3DIndex] || artifacts[0];

  const getArtifactQuiz = (art: HeritageArtifact) => ({
    question: `Di sản "${art.name}" gắn liền với thời kỳ lịch sử và địa điểm nào tại Đền Hai Bà Trưng?`,
    options: [
      `${art.period} – Lưu giữ tại ${art.locationInTemple}`,
      "Thời nhà Nguyễn – Lưu giữ tại Kinh thành Huế",
      "Thời nhà Lý – Lưu giữ tại Hoàng thành Thăng Long",
      "Thời nhà Trần – Lưu giữ tại Phủ Thiên Trường"
    ],
    correctIndex: 0
  });

  const handleToggleArtifactNarration = (art: HeritageArtifact) => {
    if (isSpeakingArtifact) {
      soundManager.stopSpeech();
      setIsSpeakingArtifact(false);
      return;
    }
    setIsSpeakingArtifact(true);
    if (onAddXp) onAddXp(20);
    const script = `Thuyết minh AI Mê Linh Heritage 3D: ${art.name}. Niên đại: ${art.period}. Chất liệu: ${art.material}. Vị trí: ${art.locationInTemple}. ${art.description} Giá trị bảo tồn: ${art.historicalValue}`;
    soundManager.speakVietnamese(script, () => setIsSpeakingArtifact(false));
  };

  const handleAnswerArtifactQuiz = (art: HeritageArtifact, optionIdx: number) => {
    setArtifactQuizAnswer(optionIdx);
    if (optionIdx === 0 && !completedArtifactQuizIds.includes(art.id)) {
      setCompletedArtifactQuizIds((prev) => [...prev, art.id]);
      soundManager.playSuccessFanfare();
      if (onAddXp) onAddXp(35);
      if (onUnlockBadge) onUnlockBadge("badge-artist");
    }
  };

  const handleMarkStoryRead = (id: number | string) => {
    if (!readStories.includes(id)) {
      setReadStories([...readStories, id]);
      soundManager.playCoinSound();
      if (onAddXp) onAddXp(25);
    }
  };

  const handleClaimMuseumTourXp = () => {
    if (!claimedMuseumTourXp) {
      setClaimedMuseumTourXp(true);
      soundManager.playCoinSound();
      if (onAddXp) onAddXp(50);
    }
  };

  return (
    <div className="space-y-8 pb-14">
      {/* 1. DIGITAL MUSEUM HEADER & 3 MODULE TABS */}
      <div className="bg-gradient-to-r from-[#2C1A1D] via-[#3E2723] to-[#2C1A1D] p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37] shadow-2xl text-white space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs font-bold mb-2">
              <Landmark className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {language === "vi"
                  ? "BẢO TÀNG SỐ 3D • THAM QUAN 360° • KHO CHUYỆN KỂ LỊCH SỬ"
                  : "3D DIGITAL MUSEUM • 360° VIRTUAL TOUR • HISTORICAL STORIES"}
              </span>
            </div>
            <h2 className="font-cinzel font-extrabold text-2xl sm:text-4xl text-amber-100">
              {language === "vi" ? "BẢO TÀNG SỐ DI SẢN MÊ LINH" : "ME LINH DIGITAL HERITAGE MUSEUM"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              {language === "vi"
                ? "Tương tác xoay 3D hiện vật Trống Đồng & Kiệu Bát Cống, tham quan không gian 360° Đền Hai Bà Trưng và khám phá các câu chuyện lịch sử hào hùng."
                : "Inspect interactive 3D heritage artifacts, take a 360° virtual tour of Hai Ba Trung Temple, and read illustrated historical stories."}
            </p>
          </div>

          {/* 4 Sub-Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-[#1A0D0E]/90 p-1.5 rounded-2xl border border-[#D4AF37]/50 self-start lg:self-auto">
            <button
              onClick={() => setMuseumTab("interactive-museum")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                museumTab === "interactive-museum"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#1A0D0E] shadow"
                  : "text-amber-100/80 hover:text-white"
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>{language === "vi" ? "Tham Quan Bảo Tàng Số" : "Interactive Museum"}</span>
            </button>

            <button
              onClick={() => setMuseumTab("3d-objects")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                museumTab === "3d-objects"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#1A0D0E] shadow"
                  : "text-amber-100/80 hover:text-white"
              }`}
            >
              <Box className="w-4 h-4" />
              <span>{language === "vi" ? "Hiện Vật 3D" : "3D Objects"}</span>
            </button>

            <button
              onClick={() => setMuseumTab("virtual-tour")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                museumTab === "virtual-tour"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#1A0D0E] shadow"
                  : "text-amber-100/80 hover:text-white"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{language === "vi" ? "Tham Quan 360°" : "Virtual Tour"}</span>
            </button>

            <button
              onClick={() => setMuseumTab("stories")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                museumTab === "stories"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#1A0D0E] shadow"
                  : "text-amber-100/80 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{language === "vi" ? "Chuyện Kể Lịch Sử" : "Historical Stories"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODULE 0: EMBEDDED INTERACTIVE DIGITAL MUSEUM APP                     */}
      {/* ===================================================================== */}
      {museumTab === "interactive-museum" && (
        <div
          className={
            isFullscreenMuseum
              ? "fixed inset-3 z-50 bg-[#1A0D0E] rounded-3xl border-2 border-[#D4AF37] shadow-2xl flex flex-col overflow-hidden"
              : "bg-gradient-to-b from-[#1A0D0E] via-[#281517] to-[#1A0D0E] rounded-3xl border-2 border-[#D4AF37] p-4 sm:p-6 shadow-2xl space-y-4 text-white"
          }
        >
          {/* Top Control Bar */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isFullscreenMuseum ? "p-4 bg-[#1A0D0E] border-b border-[#D4AF37]/40 text-white" : ""
            }`}
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E1E] border border-[#D4AF37] text-amber-200 text-xs font-extrabold">
                <Landmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>BẢO TÀNG ĐỀN HAI BÀ TRƯNG • PHÒNG TRƯNG BÀY ẢO</span>
              </div>
              <h3 className="font-cinzel font-extrabold text-lg sm:text-2xl text-amber-100">
                Tham Quan Bảo Tàng Số Đền Hai Bà Trưng – Mê Linh
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClaimMuseumTourXp}
                disabled={claimedMuseumTourXp}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#1A0D0E] font-extrabold text-xs shadow flex items-center gap-1.5 disabled:opacity-70"
              >
                <Award className="w-4 h-4 text-[#8B1E1E]" />
                <span>
                  {claimedMuseumTourXp ? "Đã nhận +50 XP Tham quan" : "Hoàn thành Tham quan (+50 XP)"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIframeKey((prev) => prev + 1)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Tải lại không gian bảo tàng"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Làm mới</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreenMuseum((prev) => !prev)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {isFullscreenMuseum ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Thu nhỏ</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Toàn màn hình</span>
                  </>
                )}
              </button>

              <a
                href={EMBEDDED_MUSEUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#A32222] text-white border border-[#D4AF37] text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Mở tab riêng</span>
              </a>
            </div>
          </div>

          {/* Embedded Museum Application Iframe (BẢO TÀNG ĐỀN HAI BÀ TRƯNG) */}
          <div
            className={
              isFullscreenMuseum
                ? "flex-1 w-full h-full overflow-hidden bg-[#0f172a] m-0 p-0"
                : "relative w-full h-[650px] sm:h-[740px] rounded-[12px] overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-[#0f172a] m-0 p-0"
            }
          >
            {/* Phòng trưng bày. Muốn đổi sang phòng khác thì thay link trong src="..." */}
            <iframe
              key={iframeKey}
              src={EMBEDDED_MUSEUM_URL}
              allowFullScreen
              title="Phòng trưng bày ảo"
              className="block w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            />
          </div>
        </div>
      )}

      {/* VIDEO DI SẢN ĐẶC SẮC: "MÊ LINH TÔI YÊU - HÀO KHÍ LỊCH SỬ, KHÁT VỌNG VƯƠN XA" */}
      <MeLinhVideoShowcase onAddXp={onAddXp} />

      {/* OFFICIAL HISTORICAL HERITAGE VIDEO & PROFILE IN DIGITAL MUSEUM GALLERY */}
      <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-lg bg-black">
            <iframe
              src="https://www.youtube.com/embed/uS5bGu30nxU?rel=0"
              title="Di tích lịch sử Đền Hai Bà Trưng - Mê Linh"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#8B1E1E] bg-[#FAF8F5] px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50">
            <span>🎬 Video tư liệu: Di tích lịch sử Quốc gia đặc biệt Đền Hai Bà Trưng – Mê Linh</span>
            <a
              href="https://www.youtube.com/watch?v=uS5bGu30nxU"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-[#8B1E1E] text-[#D4AF37] hover:brightness-110 transition-all"
            >
              Mở YouTube ↗
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-[#8B1E1E] text-xs font-bold border border-[#D4AF37]">
            <span>HỒ SƠ DI TÍCH & TƯ LIỆU ẢNH GỐC BẢO TÀNG SỐ</span>
          </span>
          <h3 className="font-cinzel font-extrabold text-2xl text-[#8B1E1E]">
            ĐỀN HAI BÀ TRƯNG – MÊ LINH
          </h3>
          <p className="text-sm font-bold text-[#2C1A1D]">
            “Di tích lịch sử Quốc gia đặc biệt, nơi thờ Hai Bà Trưng - hai nữ anh hùng dân tộc.”
          </p>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#D4AF37]/60 space-y-1.5 text-xs">
            <div>
              <span className="font-bold text-[#8B1E1E]">Tên gọi khác: </span>
              <span className="font-semibold text-stone-800">Đền Hạ Lôi</span>
            </div>
            <div>
              <span className="font-bold text-[#8B1E1E]">Địa điểm: </span>
              <span className="font-semibold text-stone-800">Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội.</span>
            </div>
            <div>
              <span className="font-bold text-[#8B1E1E]">Đối tượng thờ: </span>
              <span className="font-semibold text-stone-800">Hai Bà Trưng (Trưng Trắc và Trưng Nhị).</span>
            </div>
            <div>
              <span className="font-bold text-[#8B1E1E]">Loại hình: </span>
              <span className="font-semibold text-stone-800">Di tích lịch sử văn hóa.</span>
            </div>
            <div>
              <span className="font-bold text-[#8B1E1E]">Xếp hạng: </span>
              <span className="font-semibold text-stone-800">Di tích Quốc gia đặc biệt.</span>
            </div>
            <div>
              <span className="font-bold text-[#8B1E1E]">Giá trị: </span>
              <span className="text-stone-700 leading-relaxed">
                Là nơi tưởng niệm Hai Bà Trưng - hai nữ anh hùng dân tộc đã lãnh đạo cuộc khởi nghĩa chống ách đô hộ nhà Đông Hán năm 40 sau Công nguyên.
              </span>
            </div>
            <div className="pt-1.5 border-t border-[#D4AF37]/30">
              <span className="font-bold text-[#8B1E1E]">Mô tả ảnh gốc (Historical Heritage Photo): </span>
              <span className="text-stone-700 leading-relaxed">
                “Không gian phía trước Đền Hai Bà Trưng với kiến trúc truyền thống, bia đá và khuôn viên tưởng niệm gắn với cuộc khởi nghĩa Hai Bà Trưng năm 40.”
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODULE 1: 3D HERITAGE OBJECTS STUDIO (ẢNH • VIDEO • 3D • AI • QUIZ)     */}
      {/* ===================================================================== */}
      {museumTab === "3d-objects" && (
        <div className="space-y-8">
          {/* Interactive 5-Mode Heritage Studio Stage */}
          {active3DArtifact && (
            <div className="bg-gradient-to-br from-[#1A0D0E] via-[#281517] to-[#1A0D0E] rounded-3xl border-2 border-[#D4AF37] p-5 sm:p-8 text-white shadow-2xl space-y-6">
              {/* Top 5-Mode Switcher: ẢNH • VIDEO • 3D • AI THUYẾT MINH • QUIZ */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#8B1E1E] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37]">
                      DI SẢN 5 TRONG 1 • ẢNH • VIDEO • 3D • AI • QUIZ
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-cinzel text-white">
                      {active3DArtifact.name}
                    </h3>
                  </div>
                </div>

                {/* 5 Interactive Mode Buttons */}
                <div className="flex flex-wrap items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-[#D4AF37]/50">
                  <button
                    type="button"
                    onClick={() => setItemMediaMode("photo")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      itemMediaMode === "photo"
                        ? "bg-[#D4AF37] text-[#1A0D0E] shadow"
                        : "text-amber-100 hover:bg-white/10"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Ảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemMediaMode("video")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      itemMediaMode === "video"
                        ? "bg-[#D4AF37] text-[#1A0D0E] shadow"
                        : "text-amber-100 hover:bg-white/10"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemMediaMode("3d")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      itemMediaMode === "3d"
                        ? "bg-[#D4AF37] text-[#1A0D0E] shadow"
                        : "text-amber-100 hover:bg-white/10"
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    <span>3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemMediaMode("ai-audio");
                      handleToggleArtifactNarration(active3DArtifact);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      itemMediaMode === "ai-audio"
                        ? "bg-[#D4AF37] text-[#1A0D0E] shadow"
                        : "text-amber-100 hover:bg-white/10"
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>AI Thuyết minh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemMediaMode("quiz");
                      setArtifactQuizAnswer(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      itemMediaMode === "quiz"
                        ? "bg-[#D4AF37] text-[#1A0D0E] shadow"
                        : "text-amber-100 hover:bg-white/10"
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Quiz (+35 XP)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Interactive Viewport (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* MODE 1: PHOTO */}
                  {itemMediaMode === "photo" && (
                    <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-black shadow-2xl group">
                      <img
                        src={active3DArtifact.imageUrl}
                        alt={active3DArtifact.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-extrabold text-amber-200">
                        <span>🖼️ Ảnh tư liệu gốc độ phân giải cao</span>
                        <span>{active3DArtifact.locationInTemple}</span>
                      </div>
                    </div>
                  )}

                  {/* MODE 2: VIDEO */}
                  {itemMediaMode === "video" && (
                    <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-black shadow-2xl">
                      <iframe
                        src="https://www.youtube.com/embed/uS5bGu30nxU?rel=0"
                        title={`Video Di sản ${active3DArtifact.name}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* MODE 3: 3D MODEL STAGE */}
                  {itemMediaMode === "3d" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#D4AF37] flex items-center gap-1.5">
                          <Box className="w-4 h-4" />
                          <span>KHÔNG GIAN TƯƠNG TÁC XOAY 3D 360°</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAutoSpin(!autoSpin)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                              autoSpin
                                ? "bg-[#D4AF37] text-[#1A0D0E] border-[#D4AF37]"
                                : "bg-white/10 text-stone-200 border-white/20"
                            }`}
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${autoSpin ? "animate-spin" : ""}`} />
                            <span>Xoay 360°</span>
                          </button>
                          <button
                            onClick={() => setZoom3D((z) => Math.min(1.35, +(z + 0.1).toFixed(2)))}
                            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-200 cursor-pointer"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setZoom3D((z) => Math.max(0.85, +(z - 0.1).toFixed(2)))}
                            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-200 cursor-pointer"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div
                        className="relative h-80 sm:h-96 rounded-2xl bg-[radial-gradient(circle_at_center,#3E2723_0%,#120809_75%)] border-2 border-[#D4AF37]/50 flex items-center justify-center overflow-hidden select-none"
                        style={{ perspective: "1100px" }}
                      >
                        <div className="absolute bottom-6 w-64 h-12 rounded-full border-2 border-[#D4AF37]/40 bg-[#D4AF37]/10 blur-[1px] transform rotate-x-75"></div>

                        <div
                          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-4 border-[#D4AF37] shadow-[0_25px_60px_rgba(212,175,55,0.3)] overflow-hidden transition-transform duration-100"
                          style={{
                            transform: `scale(${zoom3D}) rotateX(${rotX}deg) rotateY(${rotY}deg)`
                          }}
                        >
                          <img
                            src={active3DArtifact.imageUrl}
                            alt={active3DArtifact.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-amber-300/20 pointer-events-none"></div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-amber-200/90 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D4AF37]/30">
                          <span>
                            3D Y: {rotY}° · X: {rotX}° · Zoom: {Math.round(zoom3D * 100)}%
                          </span>
                          <span>{active3DArtifact.period}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300 font-bold whitespace-nowrap">Xoay 360°:</span>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={rotY}
                            onChange={(e) => {
                              setAutoSpin(false);
                              setRotY(Number(e.target.value));
                            }}
                            className="w-full accent-[#D4AF37] cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300 font-bold whitespace-nowrap">Góc nghiêng:</span>
                          <input
                            type="range"
                            min="-25"
                            max="25"
                            value={rotX}
                            onChange={(e) => {
                              setAutoSpin(false);
                              setRotX(Number(e.target.value));
                            }}
                            className="w-full accent-[#D4AF37] cursor-pointer"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* MODE 4: AI AUDIO GUIDE */}
                  {itemMediaMode === "ai-audio" && (
                    <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-black p-6 flex flex-col justify-between">
                      <img
                        src={active3DArtifact.imageUrl}
                        alt={active3DArtifact.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D0E] via-[#1A0D0E]/75 to-black/50" />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-[#8B1E1E] border border-[#D4AF37] text-[#D4AF37] text-xs font-extrabold">
                          🤖 AI THUYẾT MINH TỰ ĐỘNG (+20 XP)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleArtifactNarration(active3DArtifact)}
                          className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A0D0E] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSpeakingArtifact ? (
                            <>
                              <Square className="w-3.5 h-3.5" />
                              <span>Dừng đọc</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Phát Giọng Đọc AI</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative z-10 space-y-3 bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-[#D4AF37]/50">
                        <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-medium">
                          “{active3DArtifact.description} {active3DArtifact.historicalValue}”
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MODE 5: MINI QUIZ FOR THIS HERITAGE ITEM */}
                  {itemMediaMode === "quiz" && (
                    <div className="relative min-h-[320px] rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-[#1F0F11] p-6 flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#D4AF37] uppercase flex items-center gap-1.5">
                          <Gamepad2 className="w-4 h-4" />
                          <span>THỬ THÁCH QUIZ HIỆN VẬT (+35 XP)</span>
                        </span>
                        {completedArtifactQuizIds.includes(active3DArtifact.id) && (
                          <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Đã nhận +35 XP
                          </span>
                        )}
                      </div>

                      <h4 className="font-cinzel font-extrabold text-base sm:text-lg text-white">
                        {getArtifactQuiz(active3DArtifact).question}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {getArtifactQuiz(active3DArtifact).options.map((opt, oIdx) => {
                          const isChosen = artifactQuizAnswer === oIdx;
                          const isCorrect = oIdx === 0;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleAnswerArtifactQuiz(active3DArtifact, oIdx)}
                              className={`p-3.5 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                                isChosen
                                  ? isCorrect
                                    ? "bg-emerald-700/80 border-emerald-400 text-white"
                                    : "bg-rose-800/80 border-rose-400 text-white"
                                  : "bg-white/5 hover:bg-white/15 border-white/20 text-amber-100"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {artifactQuizAnswer !== null && (
                        <div className="p-3 rounded-xl bg-black/50 border border-[#D4AF37]/40 text-xs font-bold text-amber-200">
                          {artifactQuizAnswer === 0
                            ? "🎉 Chính xác! Bạn đã nhận +35 XP và mở khóa tiến trình Bảo tàng Số 3D!"
                            : "💡 Gợi ý: Hãy xem niên đại và vị trí lưu giữ của hiện vật ngay bên phải nhé!"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Concise Visual Summary & Selector (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Niên đại</span>
                      <span className="font-extrabold text-[#D4AF37]">{active3DArtifact.period}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Chất liệu</span>
                      <span className="font-extrabold text-amber-100">{active3DArtifact.material}</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/15 p-3.5 rounded-2xl border border-[#D4AF37]/40 text-xs text-amber-100">
                    <strong className="text-[#D4AF37] block mb-0.5">📍 {active3DArtifact.locationInTemple}</strong>
                    <span className="line-clamp-2">{active3DArtifact.historicalValue}</span>
                  </div>

                  {/* Quick Artifact Thumbnails Grid */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider block">
                      Chọn Di Sản 3D ({artifacts.length} hiện vật):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {artifacts.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActive3DIndex(idx);
                            setArtifactQuizAnswer(null);
                          }}
                          className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            active3DIndex === idx
                              ? "bg-[#8B1E1E] border-[#D4AF37] text-white shadow"
                              : "bg-white/5 border-white/15 text-stone-300 hover:bg-white/10"
                          }`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-[#D4AF37]/50 shrink-0"
                          />
                          <span className="truncate">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onOpenAIChat(`Cô Mê Linh AI ơi, hãy phân tích ý nghĩa lịch sử của hiện vật ${active3DArtifact.name} tại Đền Hai Bà Trưng!`)
                    }
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#1A0D0E] font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Hỏi AI Hướng Dẫn Viên (+15 XP)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Visual-First Heritage Cards Grid (70% Image, 20% Icons for Ảnh/Video/3D/AI/Quiz, 10% Text) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-[#8B1E1E] font-cinzel">
                KHO HIỆN VẬT 3D AI (CHỌN CHẾ ĐỘ TRỰC TIẾP)
              </h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8B1E1E] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm hiện vật..."
                  className="w-full bg-white text-xs text-stone-800 placeholder-stone-400 pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredArtifacts.map((art, idx) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setActive3DIndex(idx);
                    setSelectedArtifact(art);
                  }}
                  className="bg-white rounded-3xl border-2 border-[#D4AF37]/50 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  {/* 70% Visual Area */}
                  <div className="relative h-56 overflow-hidden bg-stone-900">
                    <img
                      src={art.imageUrl}
                      alt={art.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-extrabold text-amber-200">
                      <span className="bg-black/65 px-2.5 py-1 rounded-lg border border-[#D4AF37]/50">
                        {art.period}
                      </span>
                      <span className="bg-[#8B1E1E] px-2.5 py-1 rounded-lg border border-[#D4AF37] text-[#D4AF37]">
                        3D • AI • Quiz
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-cinzel font-extrabold text-base leading-snug">
                        {art.name}
                      </h3>
                    </div>
                  </div>

                  {/* 20% Interactive Icons Bar (Ảnh • Video • 3D • AI • Quiz) + 10% Concise Text */}
                  <div className="p-3.5 bg-[#FAF8F5] flex items-center justify-between gap-1">
                    {[
                      { mode: "photo" as const, icon: ImageIcon, label: "Ảnh" },
                      { mode: "video" as const, icon: Video, label: "Video" },
                      { mode: "3d" as const, icon: Box, label: "3D" },
                      { mode: "ai-audio" as const, icon: Volume2, label: "AI" },
                      { mode: "quiz" as const, icon: Gamepad2, label: "Quiz" }
                    ].map((btn) => {
                      const BtnIcon = btn.icon;
                      return (
                        <button
                          key={btn.mode}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActive3DIndex(idx);
                            setItemMediaMode(btn.mode);
                            if (btn.mode === "ai-audio") {
                              handleToggleArtifactNarration(art);
                            }
                            window.scrollTo({ top: 180, behavior: "smooth" });
                          }}
                          className="flex-1 py-2 rounded-xl bg-white hover:bg-[#8B1E1E] text-[#8B1E1E] hover:text-[#D4AF37] border border-[#D4AF37]/40 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition-all cursor-pointer"
                        >
                          <BtnIcon className="w-3.5 h-3.5" />
                          <span>{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODULE 2: 360° VIRTUAL TOUR OF DEN HAI BA TRUNG                       */}
      {/* ===================================================================== */}
      {museumTab === "virtual-tour" && (
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#8B1E1E] uppercase tracking-wider font-cinzel flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#D4AF37]" />
                {language === "vi" ? "TRẢI NGHIỆM THAM QUAN ẢO 360°" : "360° VIRTUAL HERITAGE TOUR"}
              </span>
              <h3 className="text-2xl font-bold text-[#2C1A1D] font-cinzel mt-1">
                {virtualTourSpaces[tourSpaceIdx].name}
              </h3>
              <p className="text-xs text-[#5A4032]">{virtualTourSpaces[tourSpaceIdx].location}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {virtualTourSpaces.map((sp, idx) => (
                <button
                  key={sp.id}
                  onClick={() => {
                    setTourSpaceIdx(idx);
                    setPanAngle(50);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    tourSpaceIdx === idx
                      ? "bg-[#8B1E1E] text-white border-[#D4AF37] shadow"
                      : "bg-[#F8F5EF] text-[#5A4032] border-[#D4AF37]/40 hover:border-[#8B1E1E]"
                  }`}
                >
                  {language === "vi" ? `Trạm ${idx + 1}` : `Station ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>

          {/* 360 Panorama Viewport */}
          <div className="relative h-96 sm:h-[440px] rounded-3xl overflow-hidden border-2 border-[#D4AF37] bg-stone-900 shadow-2xl">
            <div
              className="w-full h-full bg-cover bg-no-repeat transition-all duration-200"
              style={{
                backgroundImage: `url(${virtualTourSpaces[tourSpaceIdx].image})`,
                backgroundPosition: `${panAngle}% center`,
                backgroundSize: "135% auto"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>
            </div>

            {/* Top Badge */}
            <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/60 text-amber-200 text-xs font-bold flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Chế độ Góc nhìn Toàn cảnh 360° • Góc phương vị: {Math.round(panAngle * 3.6)}°</span>
            </div>

            {/* Interactive Hotspots inside 360 View */}
            {virtualTourSpaces[tourSpaceIdx].hotspots.map((hs, i) => (
              <div
                key={i}
                style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="px-3 py-1.5 rounded-full bg-[#8B1E1E]/95 text-white border-2 border-[#D4AF37] text-xs font-bold shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{hs.label}</span>
                </div>
              </div>
            ))}

            {/* Bottom Pan Slider */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-[#D4AF37]/50 text-white space-y-2">
              <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                {virtualTourSpaces[tourSpaceIdx].desc}
              </p>
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-bold text-[#D4AF37] shrink-0">
                  {language === "vi" ? "Kéo để xoay góc nhìn 360°:" : "Drag to pan 360° view:"}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={panAngle}
                  onChange={(e) => setPanAngle(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-xs font-mono text-amber-200 shrink-0">{Math.round(panAngle * 3.6)}°</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODULE 3: HISTORICAL STORIES (CHUYỆN KỂ LỊCH SỬ MÊ LINH)              */}
      {/* ===================================================================== */}
      {museumTab === "stories" && (
        <div className="space-y-6">
          {/* Embedded Historical Storytelling Video */}
          <div className="bg-gradient-to-r from-[#231113] via-[#2C1A1D] to-[#1A0D0E] rounded-3xl border-2 border-[#D4AF37] p-5 sm:p-7 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/xfkZmPhM9Q0?rel=0"
                    title="Video kể chuyện lịch sử Hai Bà Trưng"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B1E1E] border border-[#D4AF37] text-amber-200 text-xs font-bold">
                  🎬 VIDEO KỂ CHUYỆN LỊCH SỬ HAI BÀ TRƯNG
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-cinzel text-[#D4AF37]">
                  Phim Kể Chuyện Lịch Sử Hai Bà Trưng – Khởi Nghĩa Mê Linh Năm 40 SCN
                </h3>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  Xem video kể chuyện lịch sử về Hai Bà Trưng (Trưng Trắc và Trưng Nhị) phất cờ khởi nghĩa chống ách đô hộ nhà Đông Hán, giải phóng 65 thành trì và định đô tại Mê Linh.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleMarkStoryRead("video-hai-ba-trung")}
                    disabled={readStories.includes("video-hai-ba-trung")}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5BE38] text-[#1A0D0E] font-extrabold text-xs shadow disabled:opacity-60 flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4 text-[#8B1E1E]" />
                    <span>
                      {readStories.includes("video-hai-ba-trung")
                        ? "Đã hoàn thành xem video (+25 XP)"
                        : "Xác nhận đã xem video (+25 XP)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Story List Left Column (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {historicalStories.map((st, idx) => {
              const isRead = readStories.includes(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStoryIdx(idx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all space-y-1.5 ${
                    selectedStoryIdx === idx
                      ? "bg-[#8B1E1E] text-white border-[#D4AF37] shadow-lg"
                      : "bg-white text-[#2C1A1D] border-[#D4AF37]/40 hover:border-[#8B1E1E]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={selectedStoryIdx === idx ? "text-[#D4AF37]" : "text-[#8B1E1E]"}>
                      {st.era}
                    </span>
                    {isRead && (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã đọc
                      </span>
                    )}
                  </div>
                  <h4 className="font-cinzel font-bold text-sm sm:text-base">{st.title}</h4>
                  <p
                    className={`text-xs line-clamp-2 ${
                      selectedStoryIdx === idx ? "text-amber-100/90" : "text-stone-500"
                    }`}
                  >
                    {st.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Story Reader Right Column (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#D4AF37]">
              <img
                src={historicalStories[selectedStoryIdx].image}
                alt={historicalStories[selectedStoryIdx].title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-3 py-1 rounded-full bg-[#8B1E1E] border border-[#D4AF37] text-xs font-bold text-amber-200">
                  {historicalStories[selectedStoryIdx].era}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-cinzel mt-2">
                  {historicalStories[selectedStoryIdx].title}
                </h3>
              </div>
            </div>

            {/* Verse Pull-Quote */}
            <blockquote className="bg-[#FAF8F5] p-4 rounded-2xl border-l-4 border-[#8B1E1E] font-serif italic text-sm text-[#2C1A1D] whitespace-pre-line">
              {historicalStories[selectedStoryIdx].poem}
            </blockquote>

            {/* Story Body */}
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
              {historicalStories[selectedStoryIdx].content}
            </p>

            {/* Moral Takeaway */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-[#D4AF37] text-xs sm:text-sm text-[#3E2723] font-semibold">
              💡 {historicalStories[selectedStoryIdx].moral}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
              <button
                onClick={() => handleMarkStoryRead(historicalStories[selectedStoryIdx].id)}
                disabled={readStories.includes(historicalStories[selectedStoryIdx].id)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] text-white font-bold text-xs border border-[#D4AF37] shadow disabled:opacity-60 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {readStories.includes(historicalStories[selectedStoryIdx].id)
                    ? "Đã hoàn thành đọc hiểu (+25 XP)"
                    : "Hoàn thành đọc câu chuyện (+25 XP)"}
                </span>
              </button>

              <button
                onClick={() =>
                  onOpenAIChat(
                    `Cô Mê Linh AI ơi, hãy kể thêm cho em về câu chuyện "${historicalStories[selectedStoryIdx].title}" nhé!`
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-[#2C1A1D] text-amber-200 font-bold text-xs border border-[#D4AF37]/50 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Thảo luận cùng Cô Mê Linh AI</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border-4 border-[#D4AF37] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto relative animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-[#2C1A1D] to-[#3E2723] p-4 text-white flex items-center justify-between border-b-2 border-[#D4AF37]/50">
              <h3 className="font-serif font-bold text-xl text-amber-100">
                {selectedArtifact.name}
              </h3>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37] h-64 bg-stone-900">
                <img
                  src={selectedArtifact.imageUrl}
                  alt={selectedArtifact.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-stone-500 font-semibold block">Niên đại lịch sử:</span>
                  <span className="font-bold text-[#2C1A1D]">{selectedArtifact.period}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-stone-500 font-semibold block">Chất liệu chế tác:</span>
                  <span className="font-bold text-[#2C1A1D]">{selectedArtifact.material}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#2C1A1D]">Mô tả chi tiết di vật</h4>
                <p className="text-xs text-stone-700 leading-relaxed">{selectedArtifact.description}</p>
              </div>

              <div className="bg-amber-100/60 p-4 rounded-xl border border-amber-300 space-y-1">
                <h4 className="font-serif font-bold text-xs text-[#3E2723]">Giá trị lịch sử & bảo tồn</h4>
                <p className="text-xs text-stone-800 leading-relaxed">{selectedArtifact.historicalValue}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const name = selectedArtifact.name;
                    setSelectedArtifact(null);
                    onOpenAIChat(`Cô Mê Linh AI ơi, hãy giải thích cho em về nguồn gốc và giá trị của ${name}!`);
                  }}
                  className="w-full bg-[#2C1A1D] text-amber-200 py-2.5 rounded-xl font-bold text-xs shadow border border-amber-400/40 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Hỏi Cô Mê Linh AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
