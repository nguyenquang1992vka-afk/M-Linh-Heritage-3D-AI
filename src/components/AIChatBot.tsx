import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { soundManager } from "../utils/audioUtils";
import coMeLinhAvatar from "../assets/images/co_me_linh_ai_avatar_1790426772614.jpg";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";
import sanNguPhucImg from "../assets/images/san_ngu_phuc_da_the_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import hoBanNguyetImg from "../assets/images/ho_ban_nguyet_canh_quan_real.jpg";

export type GradeTone = "primary" | "secondary";
import {
  Send,
  Sparkles,
  Volume2,
  Square,
  RotateCcw,
  Compass,
  GraduationCap,
  BookOpen,
  Award,
  MapPin,
  Bot
} from "lucide-react";

interface AIChatBotProps {
  studentName: string;
  onUnlockAIBadge: () => void;
  onAddXp: (amount: number) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  isMuted: boolean;
}

type AIAssistantMode = "visitor" | "student" | "teacher";

export const AIChatBot: React.FC<AIChatBotProps> = ({
  studentName,
  onUnlockAIBadge,
  onAddXp,
  initialPrompt,
  onClearInitialPrompt,
  isMuted
}) => {
  const [assistantMode, setAssistantMode] = useState<AIAssistantMode>("visitor");
  const [gradeLevel, setGradeLevel] = useState<GradeTone>("primary");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: `Xin chào! Tôi là **Cô Mê Linh AI – Hướng dẫn viên Di sản 3D**.\nChọn **Câu hỏi gợi ý**, **Kể chuyện lịch sử**, hoặc **Hỗ trợ học sinh** để bắt đầu (+15 XP)!`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [activeStoryCard, setActiveStoryCard] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const AI_STORIES = [
    {
      title: "Hội Thề Sông Hát Năm 40 SCN",
      era: "Mùa Xuân Năm 40",
      xp: 25,
      image: templeBgImage,
      narration:
        "Mùa xuân năm 40 sau Công nguyên, bên dòng sông Hát, Hai Bà Trưng lập đàn tế trời đất, đọc bốn câu thề bất hủ và phất cờ khởi nghĩa, giải phóng 65 thành trì Lĩnh Nam, đóng đô tại Mê Linh."
    },
    {
      title: "Tượng Binh Voi Vàng Xung Trận",
      era: "Năm 40 – 43 SCN",
      xp: 25,
      image: coMeLinhAvatar,
      narration:
        "Từ kinh đô Mê Linh, Trưng Trắc và Trưng Nhị ngự trên lưng voi chiến khổng lồ, chỉ huy nghĩa quân đánh tan quân Đông Hán, mở ra kỷ nguyên độc lập tự chủ đầu tiên."
    },
    {
      title: "Nghi Lễ Kiệu Quay Đầu Hạ Lôi",
      era: "Di sản Phi vật thể",
      xp: 25,
      image: templeBgImage,
      narration:
        "Tại Lễ hội Đền Hai Bà Trưng mồng 6 tháng Giêng, kiệu Vua chị Trưng Trắc đi trước khi ra khỏi đền, nhưng khi qua cổng làng Hạ Lôi lại nhường kiệu em gái Trưng Nhị đi trước — trọn vẹn phép nước tình nhà."
    }
  ];

  // 3 Modes Configuration
  const MODES_CONFIG: {
    id: AIAssistantMode;
    badge: string;
    title: string;
    subtitle: string;
    icon: string;
    colorClass: string;
    quickActions: { label: string; prompt: string }[];
  }[] = [
    {
      id: "visitor",
      badge: "CHẾ ĐỘ DU KHÁCH",
      title: "Du khách",
      subtitle: "Hướng dẫn tham quan Đền Hai Bà Trưng",
      icon: "🌏",
      colorClass: "from-[#9A3412] to-[#6E1414]",
      quickActions: [
        {
          label: "🗺️ Lộ trình tham quan 6 trạm (60 phút)",
          prompt:
            "[Chế độ Du khách - Hướng dẫn tham quan] Hãy gợi ý lộ trình tham quan 6 trạm tại Đền Hai Bà Trưng – Mê Linh trong 60 phút cho đoàn khách du lịch."
        },
        {
          label: "🏛️ Thuyết minh Nghi môn & Chính điện",
          prompt:
            "[Chế độ Du khách - Hướng dẫn tham quan] Hãy thuyết minh ngắn gọn, hấp dẫn về Nghi môn ngoại, Nghi môn nội và Tam tòa chính điện Đền Hai Bà Trưng."
        },
        {
          label: "🎉 Ý nghĩa Lễ hội Rước Kiệu Mồng 6 Tết",
          prompt:
            "[Chế độ Du khách - Hướng dẫn tham quan] Hãy giới thiệu nghi thức Lễ hội Rước Kiệu Giao Quân mồng 6 tháng Giêng tại Đền Hai Bà Trưng."
        },
        {
          label: "🚌 Hướng dẫn gửi xe & nội quy dâng hương",
          prompt:
            "[Chế độ Du khách - Hướng dẫn tham quan] Hãy hướng dẫn quy định trang phục, nội quy dâng hương và vị trí bãi đỗ xe tại Đền Hai Bà Trưng."
        }
      ]
    },
    {
      id: "student",
      badge: "CHẾ ĐỘ HỌC SINH",
      title: "Học sinh",
      subtitle: "Giải thích lịch sử theo cấp học",
      icon: "🧑‍🎓",
      colorClass: "from-[#8B1E1E] to-[#5E1111]",
      quickActions: [
        {
          label: "🏛️ Tại sao Hai Bà Trưng chọn Mê Linh làm căn cứ?",
          prompt:
            "Tại sao Hai Bà Trưng chọn Mê Linh làm căn cứ khởi nghĩa và đóng đô năm 40 sau Công nguyên?"
        },
        {
          label: "⚔️ Kể chuyện Khởi nghĩa Hai Bà Trưng năm 40",
          prompt: `[Chế độ Học sinh - Cấp ${gradeLevel === "primary" ? "Tiểu học" : "THCS"}] Hãy kể câu chuyện Khởi nghĩa Hai Bà Trưng mùa xuân năm 40 SCN dễ hiểu, sinh động theo cấp học.`
        },
        {
          label: "📜 Giải thích 4 câu Lời thề Sông Hát",
          prompt: `[Chế độ Học sinh - Cấp ${gradeLevel === "primary" ? "Tiểu học" : "THCS"}] Hãy đọc và giải thích ý nghĩa 4 câu Lời thề Sông Hát của Hai Bà Trưng.`
        },
        {
          label: "🐘 Vì sao kiệu Voi Bà Trưng Trắc đi trước?",
          prompt: `[Chế độ Học sinh - Cấp ${gradeLevel === "primary" ? "Tiểu học" : "THCS"}] Hãy giải thích nghi thức Giao Quân đổi vị trí kiệu của Hai Bà Trưng tại lễ hội Mê Linh.`
        }
      ]
    },
    {
      id: "teacher",
      badge: "CHẾ ĐỘ GIÁO VIÊN",
      title: "Giáo viên",
      subtitle: "Soạn hoạt động giáo dục di sản",
      icon: "👩‍🏫",
      colorClass: "from-[#2F6F68] to-[#1D4642]",
      quickActions: [
        {
          label: "📋 Soạn kịch bản Hoạt động trải nghiệm 45 phút",
          prompt:
            "[Chế độ Giáo viên - Soạn hoạt động giáo dục di sản] Hãy thiết kế kế hoạch tổ chức hoạt động giáo dục di sản 45 phút chủ đề Khởi nghĩa Hai Bà Trưng và Đền Hai Bà Trưng – Mê Linh."
        },
        {
          label: "📝 Tạo bộ 5 câu hỏi trắc nghiệm kiểm tra",
          prompt:
            "[Chế độ Giáo viên - Soạn hoạt động giáo dục di sản] Hãy biên soạn 5 câu hỏi trắc nghiệm (kèm đáp án và giải thích) về Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng."
        },
        {
          label: "🎭 Thiết kế trò chơi Nhập vai Sứ giả Mê Linh",
          prompt:
            "[Chế độ Giáo viên - Soạn hoạt động giáo dục di sản] Hãy gợi ý kịch bản trò chơi học tập theo nhóm khi đưa học sinh đi tham quan thực tế tại 6 trạm Đền Hai Bà Trưng."
        },
        {
          label: "📊 Phiếu học tập khám phá 6 trạm di tích",
          prompt:
            "[Chế độ Giáo viên - Soạn hoạt động giáo dục di sản] Hãy thiết kế nội dung Phiếu học tập thu hoạch cho học sinh khi tham quan 6 trạm tại Đền Hai Bà Trưng."
        }
      ]
    }
  ];

  const currentModeConfig =
    MODES_CONFIG.find((m) => m.id === assistantMode) || MODES_CONFIG[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    return () => {
      soundManager.stopSpeech();
    };
  }, []);

  const handleModeSwitch = (mode: AIAssistantMode) => {
    setAssistantMode(mode);
    const cfg = MODES_CONFIG.find((m) => m.id === mode)!;
    const modeIntroMsg: ChatMessage = {
      id: `mode-${Date.now()}`,
      sender: "assistant",
      text: `${cfg.icon} Đã chuyển sang chế độ **${cfg.title}: "${cfg.subtitle}"**.\nHãy chọn một gợi ý nhanh bên dưới hoặc nhập yêu cầu của bạn!`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, modeIntroMsg]);
  };

  const handleSendMessage = async (customText?: string) => {
    const query = (customText ?? input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setIsLoading(true);

    onUnlockAIBadge();
    onAddXp(15);

    const historyForApi = messages.slice(-6).map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("model" as const),
      text: m.text
    }));

    const modePrefix =
      assistantMode === "visitor"
        ? "[Chế độ Du khách: Hướng dẫn tham quan Đền Hai Bà Trưng ngắn gọn, rõ ràng] "
        : assistantMode === "teacher"
        ? "[Chế độ Giáo viên: Soạn hoạt động giáo dục di sản chuyên nghiệp, cấu trúc rõ ràng] "
        : `[Chế độ Học sinh (${gradeLevel === "primary" ? "Tiểu học" : "THCS"}): Giải thích lịch sử theo cấp học dễ hiểu] `;

    let aiReplyText =
      "Đền Hai Bà Trưng – Mê Linh (thôn Hạ Lôi, xã Mê Linh, TP. Hà Nội) là Di tích Quốc gia Đặc biệt gắn liền với cuộc khởi nghĩa Hai Bà Trưng mùa xuân năm 40 SCN.";

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${modePrefix}${query}`,
          history: historyForApi
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.reply) {
          aiReplyText = data.reply;
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI reply", err);
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: "assistant",
      text: aiReplyText,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    if (isMuted) return;
    if (speakingMessageId === msg.id) {
      soundManager.stopSpeech();
      setSpeakingMessageId(null);
      return;
    }
    setSpeakingMessageId(msg.id);
    soundManager.speakVietnamese(msg.text.replace(/\*\*/g, ""), () => {
      setSpeakingMessageId(null);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* =================================================================== */}
      {/* 1. VISUAL-FIRST AVATAR GUIDE + HISTORICAL STORYTELLING STAGE        */}
      {/* =================================================================== */}
      <section className="relative rounded-[32px] overflow-hidden bg-[#1A0D0E] text-white border-2 border-[#D4AF37] shadow-2xl p-6 sm:p-8 space-y-6">
        <img
          src={templeBgImage}
          alt="AI Hướng dẫn viên 3D"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0D0E]/95 via-[#2C1416]/85 to-[#1A0D0E]/95 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Avatar Hướng dẫn viên Stage (5 cols) */}
          <div className="lg:col-span-5 flex items-center gap-4 bg-black/45 p-4 rounded-3xl border border-[#D4AF37]/60">
            <div className="relative shrink-0">
              <img
                src={coMeLinhAvatar}
                alt="Cô Mê Linh AI - Avatar Hướng dẫn viên"
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-[#D4AF37] shadow-2xl"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-[#1A0D0E] text-[10px] font-extrabold ring-2 ring-[#1A0D0E]">
                AI LIVE
              </span>
            </div>

            <div className="space-y-2 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AVATAR HƯỚNG DẪN VIÊN 3D</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-cinzel text-white truncate">
                CÔ MÊ LINH AI
              </h1>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const story = AI_STORIES[activeStoryCard];
                    onAddXp(story.xp);
                    onUnlockAIBadge();
                    soundManager.speakVietnamese(story.narration);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe Kể Chuyện (+25 XP)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Kể chuyện lịch sử Interactive Visual Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                📖 KỂ CHUYỆN LỊCH SỬ BẰNG GIỌNG AI • CHẠM ĐỂ NGHE
              </span>
              {assistantMode === "student" && (
                <div className="flex items-center bg-white/10 p-1 rounded-xl border border-[#D4AF37]/50 gap-1">
                  <button
                    type="button"
                    onClick={() => setGradeLevel("primary")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      gradeLevel === "primary"
                        ? "bg-[#D4AF37] text-[#1A0D0E]"
                        : "text-amber-100"
                    }`}
                  >
                    🌱 Tiểu học
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradeLevel("secondary")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      gradeLevel === "secondary"
                        ? "bg-[#D4AF37] text-[#1A0D0E]"
                        : "text-amber-100"
                    }`}
                  >
                    🛡️ THCS
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AI_STORIES.map((st, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveStoryCard(idx);
                    handleSendMessage(`Hãy kể câu chuyện lịch sử "${st.title}" (${st.era}) sinh động và rút ra bài học cho học sinh!`);
                  }}
                  className={`group relative h-32 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                    activeStoryCard === idx
                      ? "border-[#D4AF37] shadow-lg scale-[1.01]"
                      : "border-white/20 opacity-85 hover:opacity-100"
                  }`}
                >
                  <img
                    src={st.image}
                    alt={st.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-extrabold">
                    <span className="text-[#D4AF37]">{st.era}</span>
                    <span className="px-2 py-0.5 rounded bg-[#8B1E1E] text-amber-200">+{st.xp} XP</span>
                  </div>
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <h4 className="font-cinzel font-extrabold text-xs text-white line-clamp-2">
                      {st.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 SPECIALIZED MODES: DU KHÁCH • HỖ TRỢ HỌC SINH • GIÁO VIÊN */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODES_CONFIG.map((m) => {
            const isActive = assistantMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeSwitch(m.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                  isActive
                    ? `bg-gradient-to-br ${m.colorClass} border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.3)]`
                    : "bg-white/5 hover:bg-white/10 border-white/15"
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-black/30 border border-[#D4AF37]/60 flex items-center justify-center text-2xl shrink-0">
                  {m.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel font-extrabold text-base text-white">
                      {m.title}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1A0D0E] text-[10px] font-extrabold">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-100 font-semibold line-clamp-1">
                    {m.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE AI WORKSPACE (QUICK PROMPTS + CHAT STREAM)           */}
      {/* =================================================================== */}
      <section className="bg-white rounded-[32px] border-2 border-[#D4AF37] shadow-2xl overflow-hidden flex flex-col">
        {/* Quick Prompts Bar for Selected Mode */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
              {currentModeConfig.icon} Gợi ý tác vụ nhanh — Chế độ {currentModeConfig.title}:{" "}
              {currentModeConfig.subtitle}
            </span>
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: "reset-msg",
                    sender: "assistant",
                    text: `${currentModeConfig.icon} Sẵn sàng hỗ trợ bạn trong chế độ **${currentModeConfig.title}: "${currentModeConfig.subtitle}"**!`,
                    timestamp: new Date().toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  }
                ])
              }
              className="text-xs font-bold text-stone-500 hover:text-[#8B1E1E] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentModeConfig.quickActions.map((qa, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qa.prompt)}
                className="p-3 rounded-2xl bg-white hover:bg-amber-50 border border-[#D4AF37]/60 hover:border-[#8B1E1E] text-left text-xs sm:text-sm font-bold text-stone-800 transition-all shadow-2xs cursor-pointer truncate"
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[480px] min-h-[340px] overflow-y-auto bg-gradient-to-b from-white to-[#FAF8F5]">
          {messages.map((msg) => {
            const isAI = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAI ? "justify-start" : "justify-end"}`}
              >
                {isAI && (
                  <img
                    src={coMeLinhAvatar}
                    alt="AI"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-2xl object-cover border-2 border-[#D4AF37] shrink-0 mt-0.5"
                  />
                )}

                <div
                  className={`max-w-[82%] rounded-3xl p-4 sm:p-5 space-y-2 shadow-sm ${
                    isAI
                      ? "bg-[#FAF6EE] border-2 border-[#D4AF37]/60 text-stone-800"
                      : "bg-gradient-to-r from-[#8B1E1E] to-[#6E1414] text-white border border-[#D4AF37]"
                  }`}
                >
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                    {msg.text}
                  </div>

                  {/* Rich Visual Heritage Card + Related Station + Official Source Citation for AI Answers */}
                  {isAI && msg.id !== "welcome-msg" && !msg.id.startsWith("mode-") && !msg.id.startsWith("reset-") && (
                    <div className="pt-3 mt-2 border-t border-[#D4AF37]/40 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white/90 p-3 rounded-2xl border border-[#D4AF37]/50">
                        <div className="sm:col-span-4 h-24 rounded-xl overflow-hidden border border-stone-200">
                          <img
                            src={
                              msg.text.toLowerCase().includes("nghi môn") || msg.text.toLowerCase().includes("đá thề")
                                ? sanNguPhucImg
                                : msg.text.toLowerCase().includes("hồ bán nguyệt")
                                ? hoBanNguyetImg
                                : tamToaChinhDienImg
                            }
                            alt="Tư liệu Đền Hai Bà Trưng"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="sm:col-span-8 space-y-1 text-xs">
                          <div className="font-extrabold text-[#8B1E1E] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Điểm tham quan liên quan: Trạm 1 (Nghi môn & Đá Thề) · Trạm 3 (Tam tòa Chính diện Đền Hai Bà Trưng)
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-600">
                            📚 <strong>Nguồn trích dẫn chuẩn:</strong> Hồ sơ khoa học Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng – Mê Linh (Quyết định 2383/QĐ-TTg) & SGK Lịch sử và Địa lý (GDPT 2018).
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] opacity-75">
                    <span>{msg.timestamp}</span>
                    {isAI && (
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8B1E1E] text-amber-100 font-bold cursor-pointer"
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <Square className="w-3 h-3" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Nghe giọng AI</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs font-bold text-[#8B1E1E] p-3">
              <div className="w-3 h-3 rounded-full bg-[#8B1E1E] animate-ping" />
              <span>Trợ lý Di sản AI đang phản hồi...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-stone-200 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Nhập câu hỏi cho Trợ lý Di sản AI (${currentModeConfig.subtitle})...`}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-semibold"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] hover:brightness-110 disabled:opacity-50 text-white font-extrabold text-sm border-2 border-[#D4AF37] shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 text-[#D4AF37]" />
            <span>Gửi</span>
          </button>
        </form>
      </section>
    </div>
  );
};
