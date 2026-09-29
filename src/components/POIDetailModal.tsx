import React, { useState } from "react";
import { HeritagePOI } from "../types";
import { soundManager } from "../utils/audioUtils";
import { recordProgressEventInDb } from "../services/heritageDatabase";
import templeRealImg from "../assets/images/den_hai_ba_trung_real.jpg";
import { 
  X, 
  Sparkles, 
  Compass, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Award,
  Maximize2,
  MapPin
} from "lucide-react";

interface POIDetailModalProps {
  poi: HeritagePOI;
  isCompleted: boolean;
  onClose: () => void;
  onCompletePoiQuest: (poiId: string, xpEarned: number) => void;
  onOpenAIChat: (topic: string) => void;
}

export const POIDetailModal: React.FC<POIDetailModalProps> = ({
  poi,
  isCompleted,
  onClose,
  onCompletePoiQuest,
  onOpenAIChat
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "virtual360" | "quest">("overview");

  // Quest state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(isCompleted);
  const [isCorrect, setIsCorrect] = useState<boolean>(isCompleted);

  // Active gallery photo index
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const galleryPhotos = poi.galleryUrls && poi.galleryUrls.length > 0 ? poi.galleryUrls : [poi.imageUrl || templeRealImg];
  const currentPhotoUrl = galleryPhotos[activePhotoIdx] || poi.imageUrl || templeRealImg;

  // Virtual 360 Pan state
  const [panX, setPanX] = useState<number>(50);
  const [tracked360, setTracked360] = useState<boolean>(false);

  const handleOpen360Tab = () => {
    setActiveTab("virtual360");
    if (!tracked360) {
      setTracked360(true);
      recordProgressEventInDb({
        eventType: "explore_360",
        poiId: poi.id,
        poiTitle: poi.title,
        xpEarned: 25
      });
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === poi.quest.correctIndex;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    if (correct && !isCompleted) {
      soundManager.playSuccessFanfare();
      onCompletePoiQuest(poi.id, poi.quest.xpReward);
      recordProgressEventInDb({
        eventType: "complete_mission",
        poiId: poi.id,
        poiTitle: poi.title,
        xpEarned: poi.quest.xpReward
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF8F5] border-4 border-[#D4AF37] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto relative animate-in fade-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2C1A1D] via-[#3E2723] to-[#2C1A1D] p-4 sm:p-5 text-white flex items-center justify-between border-b-2 border-[#D4AF37]/50">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#C81D25] text-amber-100 text-xs font-bold border border-amber-300/40">
              {poi.category}
            </span>
            <h3 className="font-serif font-bold text-lg sm:text-2xl text-amber-100">
              {poi.title}
            </h3>
          </div>

          <button
            id="btn-close-poi-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="bg-[#1D1113] border-b border-[#D4AF37]/30 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#2C1A1D] font-bold shadow"
                : "text-amber-200/80 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tổng Quan Lịch Sử</span>
          </button>

          <button
            onClick={handleOpen360Tab}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "virtual360"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#2C1A1D] font-bold shadow"
                : "text-amber-200/80 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Thực Tế Ảo 360°</span>
          </button>

          <button
            onClick={() => setActiveTab("quest")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 relative ${
              activeTab === "quest"
                ? "bg-gradient-to-r from-[#C81D25] to-[#B22222] text-white font-bold shadow"
                : "text-amber-200/80 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Nhiệm Vụ Di Sản</span>
            {!isCompleted && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1"></span>
            )}
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Image Showcase (Real Historical Photo of the selected station + Gallery Switcher) */}
              <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-lg bg-[#1A0D0E]">
                <div className="relative h-64 sm:h-80 overflow-hidden">
                  <img
                    src={currentPhotoUrl}
                    alt={poi.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#8B1E1E] text-[#D4AF37] text-xs font-extrabold border border-[#D4AF37]">
                      Trạm {poi.order} • Ảnh tư liệu thực tế
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/80 text-white text-xs font-bold border border-[#D4AF37]/50 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Hạ Lôi, Mê Linh, Hà Nội
                    </span>
                  </div>
                </div>

                {galleryPhotos.length > 1 && (
                  <div className="px-4 py-2.5 bg-[#160B0C] border-t border-[#D4AF37]/30 flex items-center gap-2.5 overflow-x-auto">
                    <span className="text-[11px] font-bold text-[#D4AF37] shrink-0">
                      Bộ ảnh tư liệu ({galleryPhotos.length}):
                    </span>
                    {galleryPhotos.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative w-16 h-11 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activePhotoIdx === idx
                            ? "border-[#D4AF37] scale-105 shadow-md"
                            : "border-white/20 opacity-65 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${poi.title} - ảnh ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-[#231113] text-white border-t border-[#D4AF37]/50 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-cinzel font-bold text-sm sm:text-base text-[#D4AF37]">
                      {poi.title}
                    </p>
                    <span className="text-xs text-amber-200 font-semibold">
                      Đền Hai Bà Trưng – Mê Linh (Đền Hạ Lôi)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white">
                    {poi.subtitle}
                  </p>
                  <p className="text-xs text-stone-300 leading-relaxed pt-1">
                    <strong className="text-[#D4AF37]">Mô tả hạng mục:</strong> {poi.shortDesc}
                  </p>
                </div>
              </div>

              {/* Main Content & Significance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                    <h4 className="font-serif font-bold text-lg text-[#2C1A1D] mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#C81D25]" />
                      <span>Chi Tiết Kiến Trúc & Lịch Sử</span>
                    </h4>
                    <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                      {poi.fullDesc}
                    </p>
                  </div>

                  <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300/60 shadow-sm">
                    <h4 className="font-serif font-bold text-[#3E2723] text-sm mb-1">
                      Giá trị lịch sử dân tộc
                    </h4>
                    <p className="text-stone-800 text-xs leading-relaxed font-medium">
                      {poi.historicalSignificance}
                    </p>
                  </div>
                </div>

                {/* Sidebar: Fun Fact ("Góc Sử Học Nhí") */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF0C2] p-4 rounded-2xl border-2 border-[#D4AF37]/60 shadow-md">
                    <div className="flex items-center gap-2 text-[#C81D25] font-serif font-bold text-sm mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Góc Sử Học Nhí!</span>
                    </div>
                    <p className="text-stone-800 text-xs leading-relaxed font-medium">
                      {poi.funFact}
                    </p>
                  </div>

                  {/* Ask AI Button */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAIChat(`Hãy kể thêm cho tớ nghe những điều thú vị về ${poi.title}!`);
                    }}
                    className="w-full bg-gradient-to-r from-[#2C1A1D] to-[#3E2723] text-amber-200 p-3 rounded-2xl border border-amber-400/40 text-xs font-bold hover:text-white transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Hỏi Trợ lý AI về địa danh này</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIRTUAL 360 */}
          {activeTab === "virtual360" && (
            <div className="space-y-4">
              <div className="bg-stone-900 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-xl relative h-80 sm:h-96">
                <div 
                  className="w-full h-full bg-cover bg-center transition-all duration-300"
                  style={{
                    backgroundImage: `url(${poi.imageUrl})`,
                    backgroundPosition: `${panX}% center`
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  <span>Chế độ Góc nhìn Panorama 360° Mô phỏng</span>
                </div>

                {/* Pan Controller Slider */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-amber-400/40 text-white flex items-center gap-4">
                  <span className="text-xs font-semibold text-amber-300 shrink-0">Xoay góc nhìn:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={panX}
                    onChange={(e) => setPanX(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-stone-300">{panX}°</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUEST */}
          {activeTab === "quest" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FFF8E7] p-5 rounded-2xl border-2 border-[#D4AF37] shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[#C81D25] font-serif font-bold text-base">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span>Thử Thách Thử Tài Lịch Sử</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 text-xs font-bold border border-amber-400/50">
                    Phần thưởng: +{poi.quest.xpReward} XP
                  </span>
                </div>

                <h4 className="font-serif font-bold text-lg text-[#2C1A1D] mb-4">
                  {poi.quest.question}
                </h4>

                {/* Quiz Options */}
                <div className="space-y-2.5">
                  {poi.quest.options.map((opt, idx) => {
                    let btnStyle = "bg-white text-stone-800 border-stone-300 hover:border-[#D4AF37]";
                    
                    if (selectedOption === idx) {
                      btnStyle = "bg-amber-100 border-[#D4AF37] text-[#2C1A1D] font-bold";
                    }

                    if (isAnswerSubmitted) {
                      if (idx === poi.quest.correctIndex) {
                        btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold";
                      } else if (selectedOption === idx) {
                        btnStyle = "bg-rose-100 border-rose-500 text-rose-900 font-bold";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerSubmitted && idx === poi.quest.correctIndex && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action Submit */}
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedOption === null}
                    className="mt-5 w-full bg-gradient-to-r from-[#C81D25] to-[#B22222] text-white py-3 rounded-2xl font-bold text-sm shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    Gửi Đáp Án & Nhận Điểm
                  </button>
                ) : (
                  <div className={`mt-5 p-4 rounded-2xl border-2 ${
                    isCorrect ? "bg-emerald-50 border-emerald-400 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"
                  }`}>
                    <p className="font-bold text-sm mb-1">
                      {isCorrect ? "🎉 Xuất sắc! Bạn đã trả lời đúng!" : "💡 Chưa chính xác rồi bạn nhỏ ơi!"}
                    </p>
                    <p className="text-xs leading-relaxed">{poi.quest.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
