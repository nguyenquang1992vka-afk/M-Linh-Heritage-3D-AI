import React, { useState } from "react";
import { QuizQuestion } from "../types";
import { soundManager } from "../utils/audioUtils";
import { 
  Swords, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Award, 
  Flame,
  Brain,
  Loader2
} from "lucide-react";

interface HeritageQuizModalProps {
  defaultQuizzes: QuizQuestion[];
  onAddXp: (xp: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  onCompleteQuizAttempt?: (summary: {
    score: number;
    xpEarned: number;
    totalQuestions: number;
    correctAnswers: number;
  }) => void;
}

export const HeritageQuizModal: React.FC<HeritageQuizModalProps> = ({
  defaultQuizzes,
  onAddXp,
  onUnlockBadge,
  onCompleteQuizAttempt
}) => {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(defaultQuizzes);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // AI Hint state
  const [aiHintText, setAiHintText] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);

  // AI Custom Quiz Generator state
  const [targetGrade, setTargetGrade] = useState<string>("Lớp 4-5");
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState<boolean>(false);

  const currentQuiz = quizzes[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);

    const isCorrect = selectedOption === currentQuiz.correctAnswerIndex;

    if (isCorrect) {
      soundManager.playCoinSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setScore((prev) => prev + currentQuiz.xpPoints);
      setCorrectCount((prev) => prev + 1);
      onAddXp(currentQuiz.xpPoints);

      if (newStreak >= 3) {
        onUnlockBadge("badge-history-scholar");
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setAiHintText(null);

    if (currentIndex + 1 < quizzes.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      soundManager.playSuccessFanfare();
      setShowSummary(true);
      if (onCompleteQuizAttempt) {
        const pctScore = Math.round((correctCount / Math.max(1, quizzes.length)) * 100);
        onCompleteQuizAttempt({
          score: pctScore,
          xpEarned: score,
          totalQuestions: quizzes.length,
          correctAnswers: correctCount
        });
      }
    }
  };

  const handleFetchAiHint = async () => {
    setIsLoadingHint(true);
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Cho tớ một gợi ý nhỏ (không tiết lộ ngay đáp án) cho câu hỏi trắc nghiệm lịch sử sau: "${currentQuiz.question}"`
        })
      });
      const data = await res.json();
      setAiNarrationHint(data.reply || currentQuiz.hint || "Hãy liên hệ đến thời điểm cuộc khởi nghĩa bùng nổ!");
    } catch (e) {
      setAiNarrationHint(currentQuiz.hint || "Hãy chú ý đến các chi tiết trong phần giới thiệu di tích!");
    } finally {
      setIsLoadingHint(false);
    }
  };

  const setAiNarrationHint = (text: string) => {
    setAiHintText(text);
  };

  const handleGenerateAiQuizSet = async () => {
    setIsGeneratingAiQuiz(true);
    try {
      const res = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: targetGrade, count: 5 })
      });
      const data = await res.json();
      if (data.quizzes && data.quizzes.length > 0) {
        setQuizzes(data.quizzes);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setCorrectCount(0);
        setStreak(0);
        setMaxStreak(0);
        setShowSummary(false);
        setAiHintText(null);
      }
    } catch (e) {
      console.error("AI Quiz generator error", e);
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setShowSummary(false);
    setAiHintText(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner & AI Quiz Generator Bar */}
      <div className="bg-[#F8F4E8] p-5 sm:p-6 rounded-3xl border-2 border-[#C9A227] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-[#9E2A2B] text-xs font-bold mb-1">
            <Swords className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>ĐẤU TRÍ LỊCH SỬ & THỬ THÁCH DI SẢN</span>
          </div>
          <h2 className="font-bold text-2xl text-[#9E2A2B]">
            HÀNH QUÂN TRANH TÀI MÊ LINH
          </h2>
          <p className="text-xs text-[#5A4032] font-semibold mt-1">
            Trả lời câu hỏi trắc nghiệm để tích lũy Điểm Linh Khí (XP) và nhận Huy Hiệu Thông Thái!
          </p>
        </div>

        {/* AI Generator Controls */}
        <div className="bg-white p-3 rounded-2xl border border-[#C9A227]/50 shadow-xs flex items-center gap-2">
          <select
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            className="bg-[#F8F4E8] text-[#9E2A2B] text-xs font-bold px-2.5 py-1.5 rounded-xl border border-[#C9A227]/50 focus:outline-none"
          >
            <option value="Lớp 4-5">Trình độ Lớp 4-5</option>
            <option value="Lớp 3">Trình độ Lớp 3</option>
            <option value="THCS">Mở rộng THCS</option>
          </select>

          <button
            onClick={handleGenerateAiQuizSet}
            disabled={isGeneratingAiQuiz}
            className="px-3.5 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-bold hover:bg-[#7A1F20] disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
          >
            {isGeneratingAiQuiz ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A227]" />
            ) : (
              <Brain className="w-3.5 h-3.5 text-[#C9A227]" />
            )}
            <span>Tạo Bộ Đề AI</span>
          </button>
        </div>
      </div>

      {!showSummary ? (
        /* Quiz Gameplay Card */
        <div className="bg-[#FAF8F5] p-6 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs font-bold border-b border-stone-200 pb-3">
            <span className="text-[#3E2723]">
              CÂU HỎI {currentIndex + 1} / {quizzes.length}
            </span>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-rose-600" title="Chuỗi đúng liên tiếp">
                <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Chuỗi {streak}x</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>+{currentQuiz.xpPoints} XP</span>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-white p-5 rounded-2xl border-2 border-amber-300/60 shadow-sm">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2C1A1D] leading-relaxed">
              {currentQuiz.question}
            </h3>
          </div>

          {/* AI Hint Trigger */}
          {!isAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleFetchAiHint}
                disabled={isLoadingHint}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#3E2723] text-xs font-bold transition-colors flex items-center gap-1.5 border border-amber-300"
              >
                <HelpCircle className="w-4 h-4 text-[#C81D25]" />
                <span>{isLoadingHint ? "Đang lấy gợi ý AI..." : "Gợi ý thông minh AI"}</span>
              </button>
            </div>
          )}

          {/* AI Hint Box */}
          {aiHintText && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-900 leading-relaxed font-medium">
              💡 <span className="font-bold">Gợi ý từ Trợ lý AI:</span> {aiHintText}
            </div>
          )}

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuiz.options.map((opt, idx) => {
              let style = "bg-white text-stone-800 border-stone-200 hover:border-[#D4AF37]";

              if (selectedOption === idx) {
                style = "bg-amber-100 border-[#D4AF37] text-[#2C1A1D] font-bold shadow";
              }

              if (isAnswered) {
                if (idx === currentQuiz.correctAnswerIndex) {
                  style = "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold shadow-md";
                } else if (selectedOption === idx) {
                  style = "bg-rose-100 border-rose-400 text-rose-900 font-bold";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <span className="leading-snug">{opt}</span>
                  {isAnswered && idx === currentQuiz.correctAnswerIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && selectedOption === idx && idx !== currentQuiz.correctAnswerIndex && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className={`p-4 rounded-2xl border-2 ${
              selectedOption === currentQuiz.correctAnswerIndex
                ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                : "bg-rose-50 border-rose-300 text-rose-900"
            }`}>
              <p className="font-bold text-sm mb-1">
                {selectedOption === currentQuiz.correctAnswerIndex
                  ? "🎉 Chính xác! Bạn trả lời rất xuất sắc!"
                  : "💡 Chưa đúng rồi! Hãy cùng học thuộc bài học này nhé:"}
              </p>
              <p className="text-xs leading-relaxed">{currentQuiz.explanation}</p>
            </div>
          )}

          {/* Action Button */}
          {!isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="w-full bg-gradient-to-r from-[#C81D25] to-[#B22222] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
            >
              Xác Nhận Đáp Án
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-[#2C1A1D] py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:brightness-105 transition-all"
            >
              {currentIndex + 1 < quizzes.length ? "Câu Hỏi Tiếp Theo →" : "Xem Kết Quả Tranh Tài 🎉"}
            </button>
          )}
        </div>
      ) : (
        /* Quiz Summary Card */
        <div className="bg-[#FAF8F5] p-8 rounded-3xl border-4 border-[#D4AF37] shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF5C0] text-[#2C1A1D] flex items-center justify-center mx-auto shadow-xl border-2 border-amber-300">
            <Award className="w-10 h-10 text-[#C81D25]" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-2xl text-[#2C1A1D]">
              HOÀN THÀNH HÀNH QUÂN TRANH TÀI!
            </h3>
            <p className="text-stone-600 text-sm mt-1">
              Bạn đã hoàn thành bộ câu hỏi thử thách di sản Đền Mê Linh!
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 max-w-sm mx-auto shadow-sm space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Tổng điểm XP tích lũy:</span>
              <span className="font-bold text-amber-600">+{score} XP</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Chuỗi đúng cao nhất:</span>
              <span className="font-bold text-rose-600">{maxStreak} câu liên tiếp</span>
            </div>
          </div>

          <button
            onClick={handleRestartQuiz}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C81D25] to-[#B22222] text-white font-bold text-sm shadow-xl hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử Thách Lại Với Đề Mới</span>
          </button>
        </div>
      )}
    </div>
  );
};
