import React, { useState } from "react";
import {
  GradeCurriculumLesson,
  HeritageArtifact,
  HeritagePOI,
  OfficialSourceCitation,
  StudentPost,
  StudentProfile,
  UserRole
} from "../types";
import {
  GRADE_1_TO_5_LESSONS,
  OFFICIAL_HERITAGE_SOURCES
} from "../data/heritageData";
import { soundManager } from "../utils/audioUtils";
import {
  recordProgressEventInDb,
  trackUserActivityEvent,
  uploadFileToStorage
} from "../services/heritageDatabase";
import {
  Award,
  BookOpen,
  Bot,
  Box,
  Camera,
  CheckCircle2,
  Compass,
  FileCheck2,
  Flame,
  Gamepad2,
  GraduationCap,
  Heart,
  Image as ImageIcon,
  Layers,
  MapPin,
  Mic,
  Palette,
  PenTool,
  Play,
  Plus,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  Upload,
  Video,
  Volume2,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface DigitalHeritageClassroomProps {
  studentProfile: StudentProfile;
  currentRole: UserRole;
  pois: HeritagePOI[];
  artifacts: HeritageArtifact[];
  studentPosts: StudentPost[];
  onAddPost: (newPost: StudentPost) => void;
  onLikePost: (postId: string) => void;
  onAddXp: (amount: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  onOpenAIChat: (query: string) => void;
  onNavigateTab: (tab: string) => void;
}

type ClassroomWorkspaceTab =
  | "grade-lessons"
  | "field-experience"
  | "student-gallery"
  | "official-sources";

type LessonInteractiveStep =
  | "visual-card"
  | "video-lesson"
  | "space-3d"
  | "ai-mentor"
  | "quiz-mission";

type ExperienceUploadMode =
  | "visit_photo"
  | "artwork"
  | "experience_diary"
  | "student_narration_video";

export const DigitalHeritageClassroom: React.FC<DigitalHeritageClassroomProps> = ({
  studentProfile,
  currentRole,
  pois,
  artifacts,
  studentPosts,
  onAddPost,
  onLikePost,
  onAddXp,
  onUnlockBadge,
  onOpenAIChat,
  onNavigateTab
}) => {
  const [workspaceTab, setWorkspaceTab] = useState<ClassroomWorkspaceTab>("grade-lessons");
  const [selectedGrade, setSelectedGrade] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [lessonStep, setLessonStep] = useState<LessonInteractiveStep>("visual-card");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(["lesson-grade-1"]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isSpeakingLesson, setIsSpeakingLesson] = useState(false);

  // 3D rotation state inside classroom
  const [rotY, setRotY] = useState<number>(25);
  const [rotX, setRotX] = useState<number>(8);
  const [zoom3D, setZoom3D] = useState<number>(1.05);

  // Real-world Heritage Experience Upload State
  const [uploadMode, setUploadMode] = useState<ExperienceUploadMode>("visit_photo");
  const [expTitle, setExpTitle] = useState("");
  const [expContent, setExpContent] = useState("");
  const [expStationId, setExpStationId] = useState(pois[0]?.id || "tam-quan");
  const [expSourceIdx, setExpSourceIdx] = useState<number>(2);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(null);

  // Student Gallery Filter State
  const [galleryFilter, setGalleryFilter] = useState<
    "all" | "visit_photo" | "artwork" | "experience_diary" | "student_narration_video"
  >("all");

  const activeLesson: GradeCurriculumLesson =
    GRADE_1_TO_5_LESSONS.find((l) => l.gradeLevel === selectedGrade) ||
    GRADE_1_TO_5_LESSONS[3];

  const active3DArtifact: HeritageArtifact =
    artifacts.find((a) => a.id === activeLesson.model3DArtifactId) || artifacts[0];

  const handleSpeakLesson = (lesson: GradeCurriculumLesson) => {
    if (isSpeakingLesson) {
      soundManager.stopSpeech();
      setIsSpeakingLesson(false);
      return;
    }
    setIsSpeakingLesson(true);
    onAddXp(15);
    const script = `${lesson.gradeLabel} - ${lesson.title}. ${lesson.visualHeadline}. Nội dung trọng tâm: ${lesson.keyFacts.join(" ")} Nguồn tham khảo chính thống: ${lesson.officialSource.agencyName}, ${lesson.officialSource.documentTitle}.`;
    soundManager.speakVietnamese(script, () => setIsSpeakingLesson(false));
  };

  const handleCompleteLessonQuiz = (optionIdx: number) => {
    setSelectedQuizOption(optionIdx);
    if (optionIdx === activeLesson.quiz.correctIndex) {
      soundManager.playSuccessFanfare();
      if (!completedLessonIds.includes(activeLesson.id)) {
        setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
        onAddXp(activeLesson.xpReward);
        onUnlockBadge(activeLesson.badgeRewardId);
        recordProgressEventInDb({
          eventType: "complete_quiz",
          studentId: studentProfile.id,
          poiId: activeLesson.id,
          poiTitle: `${activeLesson.gradeLabel}: ${activeLesson.title}`,
          xpEarned: activeLesson.xpReward,
          role: currentRole
        });
      }
    }
  };

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      const isVideo = file.type.startsWith("video/");
      const uploadedItem = await uploadFileToStorage({
        dataUrl,
        fileName: file.name,
        title: expTitle || file.name,
        type: isVideo ? "video" : "image",
        category:
          uploadMode === "visit_photo"
            ? "Ảnh tham quan thực tế"
            : uploadMode === "artwork"
            ? "Tranh vẽ di sản"
            : uploadMode === "student_narration_video"
            ? "Video thuyết minh học sinh"
            : "Nhật ký trải nghiệm",
        uploadedBy: studentProfile.name
      });

      const finalUrl = uploadedItem?.url || dataUrl;
      if (isVideo || uploadMode === "student_narration_video") {
        setUploadedVideoUrl(finalUrl);
      } else {
        setUploadedMediaUrl(finalUrl);
      }
      setIsUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFieldExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;

    const chosenPoi = pois.find((p) => p.id === expStationId) || pois[0];
    const chosenSource: OfficialSourceCitation =
      OFFICIAL_HERITAGE_SOURCES[expSourceIdx] || OFFICIAL_HERITAGE_SOURCES[0];

    const categoryMap: Record<
      ExperienceUploadMode,
      {
        cat: StudentPost["category"];
        xp: number;
        badge: string;
        defaultImg: string;
      }
    > = {
      visit_photo: {
        cat: "Ảnh tham quan thực tế",
        xp: 40,
        badge: "badge-explorer",
        defaultImg: chosenPoi?.imageUrl || activeLesson.imageUrl
      },
      artwork: {
        cat: "Tranh vẽ di sản",
        xp: 50,
        badge: "badge-artist",
        defaultImg: activeLesson.imageUrl
      },
      experience_diary: {
        cat: "Nhật ký trải nghiệm",
        xp: 35,
        badge: "badge-historian",
        defaultImg: chosenPoi?.imageUrl || activeLesson.imageUrl
      },
      student_narration_video: {
        cat: "Video thuyết minh học sinh",
        xp: 60,
        badge: "badge-legend",
        defaultImg: chosenPoi?.imageUrl || activeLesson.imageUrl
      }
    };

    const cfg = categoryMap[uploadMode];

    const newPost: StudentPost = {
      id: `exp-${Date.now()}`,
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      studentGrade: studentProfile.grade || `Lớp ${selectedGrade}A`,
      title: expTitle.trim(),
      content:
        expContent.trim() ||
        `Sản phẩm trải nghiệm thực tế tại ${chosenPoi?.title} theo chương trình ${activeLesson.subjectName}.`,
      imageUrl: uploadedMediaUrl || cfg.defaultImg,
      videoUrl:
        uploadMode === "student_narration_video"
          ? uploadedVideoUrl || "https://www.youtube.com/embed/uS5bGu30nxU"
          : undefined,
      stationId: chosenPoi?.id,
      stationTitle: chosenPoi?.title,
      submissionType: uploadMode,
      officialSource: chosenSource,
      category: cfg.cat,
      hashtags: [
        "#MeLinhHeritage3DAI",
        `#Lop${selectedGrade}`,
        "#GDPT2018",
        "#DenHaiBaTrung"
      ],
      likesCount: 1,
      isLiked: true,
      comments: [],
      createdAt: "Vừa xong",
      status: "APPROVED",
      isHighlighted: true,
      featuredInExhibition: true
    };

    onAddPost(newPost);
    onAddXp(cfg.xp);
    onUnlockBadge(cfg.badge);
    soundManager.playSuccessFanfare();

    trackUserActivityEvent({
      eventType: "access_feature",
      userRole: currentRole,
      userName: studentProfile.name,
      contentUsed: `Nộp sản phẩm ${cfg.cat}: ${newPost.title} (Nguồn: ${chosenSource.referenceCode})`
    });

    setUploadSuccessBanner(
      `🎉 Đã lưu "${newPost.title}" lên Student Gallery & Firebase! Bạn nhận được +${cfg.xp} XP!`
    );
    setExpTitle("");
    setExpContent("");
    setUploadedMediaUrl("");
    setUploadedVideoUrl("");
    setTimeout(() => {
      setUploadSuccessBanner(null);
      setWorkspaceTab("student-gallery");
    }, 1800);
  };

  const filteredGalleryPosts = studentPosts.filter((post) => {
    if (galleryFilter === "all") return true;
    if (post.submissionType === galleryFilter) return true;
    if (galleryFilter === "visit_photo" && post.category === "Ảnh tham quan thực tế")
      return true;
    if (
      galleryFilter === "artwork" &&
      (post.category === "Tranh vẽ di sản" || post.category === "Góc vẽ sáng tạo")
    )
      return true;
    if (
      galleryFilter === "experience_diary" &&
      (post.category === "Nhật ký trải nghiệm" || post.category === "Cảm nhận di sản")
    )
      return true;
    if (
      galleryFilter === "student_narration_video" &&
      (post.category === "Video thuyết minh học sinh" || Boolean(post.videoUrl))
    )
      return true;
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {uploadSuccessBanner && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-5 py-4 rounded-2xl border-2 border-[#D4AF37] shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-extrabold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span>{uploadSuccessBanner}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. VISUAL-FIRST CLASSROOM HERO BANNER & 4 ECOSYSTEM PILLARS         */}
      {/* =================================================================== */}
      <section className="relative rounded-[32px] overflow-hidden border-2 border-[#D4AF37] bg-[#1A0D0E] text-white shadow-2xl">
        <img
          src={activeLesson.imageUrl}
          alt="Digital Heritage Classroom"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0D0E]/95 via-[#2C1416]/85 to-[#1A0D0E]/90" />

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B1E1E] border border-[#D4AF37] text-[#D4AF37] text-xs font-extrabold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>DIGITAL HERITAGE CLASSROOM • CHƯƠNG TRÌNH GDPT 2018</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-cinzel text-white">
                LỚP HỌC DI SẢN SỐ 3D AI (LỚP 1 – LỚP 5)
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/90 font-semibold">
                Bài học chính thống • Video • Không gian 3D • AI Mentor • Trải nghiệm thực tế & Student Gallery
              </p>
            </div>

            {/* Quick Student Passport Pill */}
            <div className="flex flex-wrap items-center gap-2.5 bg-black/55 p-3 rounded-2xl border border-[#D4AF37]/60">
              <div className="px-3 py-1.5 rounded-xl bg-[#8B1E1E] border border-[#D4AF37] text-xs font-extrabold text-[#D4AF37] flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>{studentProfile.xp} XP</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-extrabold text-amber-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>{studentProfile.unlockedBadgeIds.length} Huy hiệu</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("passport")}
                className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold cursor-pointer hover:brightness-105"
              >
                🛂 Mở Passport
              </button>
            </div>
          </div>

          {/* 4 Main Classroom Sub-Navigation Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: "grade-lessons" as const,
                icon: BookOpen,
                title: "📚 Bài Học Lớp 1–5",
                sub: "Video • 3D • AI Mentor • Quiz"
              },
              {
                id: "field-experience" as const,
                icon: Camera,
                title: "📸 Trải Nghiệm Thực Tế",
                sub: "Upload Ảnh • Tranh • Nhật ký • Video"
              },
              {
                id: "student-gallery" as const,
                icon: Palette,
                title: "🖼️ Student Gallery",
                sub: `${studentPosts.length} Tác phẩm học sinh`
              },
              {
                id: "official-sources" as const,
                icon: ShieldCheck,
                title: "🏛️ Nguồn Chính Thống",
                sub: "Hồ sơ Di tích & GDPT 2018"
              }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = workspaceTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorkspaceTab(item.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#8B1E1E] to-[#651313] border-[#D4AF37] shadow-xl scale-[1.01]"
                      : "bg-black/45 hover:bg-white/10 border-white/15"
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-cinzel font-extrabold text-xs sm:text-sm text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-amber-200/80 font-semibold truncate">
                      {item.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TAB 1: BÀI HỌC LỚP 1 - 5 (GDPT 2018 + VIDEO + 3D + AI MENTOR + QUIZ) */}
      {/* =================================================================== */}
      {workspaceTab === "grade-lessons" && (
        <div className="space-y-6">
          {/* Grade 1 - 5 Visual Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {GRADE_1_TO_5_LESSONS.map((lesson) => {
              const isSelected = selectedGrade === lesson.gradeLevel;
              const isDone = completedLessonIds.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => {
                    setSelectedGrade(lesson.gradeLevel);
                    setSelectedQuizOption(null);
                  }}
                  className={`relative h-32 rounded-3xl overflow-hidden border-2 text-left p-4 flex flex-col justify-between transition-all cursor-pointer group ${
                    isSelected
                      ? "border-[#8B1E1E] ring-4 ring-[#D4AF37]/60 shadow-xl scale-[1.02]"
                      : "border-[#D4AF37]/50 opacity-85 hover:opacity-100"
                  }`}
                >
                  <img
                    src={lesson.imageUrl}
                    alt={lesson.gradeLabel}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="px-2.5 py-1 rounded-xl bg-[#8B1E1E] border border-[#D4AF37] text-[#D4AF37] font-cinzel font-extrabold text-xs">
                      🎓 {lesson.gradeLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-[#D4AF37] text-[#1A0D0E]"
                      }`}
                    >
                      {isDone ? "✓ Đã học" : `+${lesson.xpReward} XP`}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="font-cinzel font-extrabold text-xs text-white line-clamp-2 leading-tight">
                      {lesson.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Grade Lesson Stage */}
          <div className="bg-white rounded-[32px] border-2 border-[#D4AF37] shadow-xl overflow-hidden">
            {/* Lesson Header + Official Reference Citation Badge */}
            <div className="bg-gradient-to-r from-[#2C1A1D] via-[#3E2723] to-[#2C1A1D] p-5 sm:p-6 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[#D4AF37]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold">
                    {activeLesson.gradeLabel} • {activeLesson.subjectName}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Nguồn: {activeLesson.officialSource.sourceType}</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-cinzel font-extrabold text-white mt-1">
                  {activeLesson.title}
                </h2>
              </div>

              {/* 5 Interactive Step Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/45 p-1.5 rounded-2xl border border-[#D4AF37]/50">
                {[
                  { id: "visual-card" as const, icon: ImageIcon, label: "1. Hình ảnh" },
                  { id: "video-lesson" as const, icon: Video, label: "2. Video" },
                  { id: "space-3d" as const, icon: Box, label: "3. Không gian 3D" },
                  { id: "ai-mentor" as const, icon: Bot, label: "4. AI Mentor" },
                  { id: "quiz-mission" as const, icon: Gamepad2, label: `5. Quiz (+${activeLesson.xpReward} XP)` }
                ].map((st) => {
                  const StIcon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setLessonStep(st.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                        lessonStep === st.id
                          ? "bg-[#D4AF37] text-[#1A0D0E] shadow"
                          : "text-amber-100 hover:bg-white/10"
                      }`}
                    >
                      <StIcon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Step Viewport */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left 70% Visual Stage (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {lessonStep === "visual-card" && (
                  <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl group bg-black">
                    <img
                      src={activeLesson.imageUrl}
                      alt={activeLesson.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1.5 rounded-xl bg-[#8B1E1E]/90 border border-[#D4AF37] text-[#D4AF37] text-xs font-extrabold">
                        {activeLesson.gradeLabel} • Flashcard Di sản
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeakLesson(activeLesson)}
                        className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A0D0E] font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        {isSpeakingLesson ? (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe AI giảng bài (+15 XP)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 space-y-2 text-white">
                      <p className="text-sm sm:text-base font-bold text-amber-200">
                        {activeLesson.visualHeadline}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {activeLesson.keyFacts.map((fact, idx) => (
                          <div
                            key={idx}
                            className="bg-black/65 backdrop-blur-md p-2.5 rounded-xl border border-[#D4AF37]/40 text-[11px] font-semibold text-stone-100"
                          >
                            ✦ {fact}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {lessonStep === "video-lesson" && (
                  <div className="space-y-3">
                    <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#D4AF37] bg-black shadow-2xl">
                      <iframe
                        src={`${activeLesson.videoEmbedUrl}?rel=0`}
                        title={activeLesson.videoCaption}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex items-center justify-between bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#D4AF37]/50">
                      <span className="text-xs font-extrabold text-[#2C1A1D]">
                        🎬 {activeLesson.videoCaption}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onAddXp(30);
                          soundManager.playSuccessFanfare();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#8B1E1E] text-[#D4AF37] text-xs font-extrabold border border-[#D4AF37] cursor-pointer"
                      >
                        ✓ Đã xem Video (+30 XP)
                      </button>
                    </div>
                  </div>
                )}

                {lessonStep === "space-3d" && active3DArtifact && (
                  <div className="bg-gradient-to-br from-[#1A0D0E] via-[#281517] to-[#1A0D0E] rounded-3xl border-2 border-[#D4AF37] p-5 text-white space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#D4AF37] flex items-center gap-1.5">
                        <Box className="w-4 h-4" />
                        <span>KHÔNG GIAN 3D LỚP HỌC: {activeLesson.model3DTitle}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setZoom3D((z) => Math.min(1.3, +(z + 0.1).toFixed(2)))}
                          className="p-1.5 rounded-lg bg-white/10 text-amber-200 cursor-pointer"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoom3D((z) => Math.max(0.85, +(z - 0.1).toFixed(2)))}
                          className="p-1.5 rounded-lg bg-white/10 text-amber-200 cursor-pointer"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateTab("map")}
                          className="px-3 py-1 rounded-lg bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold cursor-pointer"
                        >
                          Mở Toàn Cảnh 360°
                        </button>
                      </div>
                    </div>

                    <div
                      className="relative h-64 sm:h-72 rounded-2xl bg-[radial-gradient(circle_at_center,#3E2723_0%,#120809_75%)] border border-[#D4AF37]/50 flex items-center justify-center overflow-hidden"
                      style={{ perspective: "1000px" }}
                    >
                      <div
                        className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl border-4 border-[#D4AF37] shadow-2xl overflow-hidden transition-transform duration-100"
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
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-200 font-bold">Xoay 360°:</span>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={rotY}
                          onChange={(e) => setRotY(Number(e.target.value))}
                          className="w-full accent-[#D4AF37] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-200 font-bold">Góc nghiêng:</span>
                        <input
                          type="range"
                          min="-25"
                          max="25"
                          value={rotX}
                          onChange={(e) => setRotX(Number(e.target.value))}
                          className="w-full accent-[#D4AF37] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {lessonStep === "ai-mentor" && (
                  <div className="bg-gradient-to-br from-[#1A0D0E] to-[#2C1416] rounded-3xl border-2 border-[#D4AF37] p-6 text-white space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#8B1E1E] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shrink-0">
                        <Bot className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold text-[#D4AF37] uppercase">
                          AI MENTOR • CỐ VẤN HỌC TẬP {activeLesson.gradeLabel}
                        </span>
                        <h4 className="font-cinzel font-extrabold text-lg text-white">
                          Cô Mê Linh AI đồng hành cùng học sinh {activeLesson.gradeLabel}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-black/45 p-4 rounded-2xl border border-[#D4AF37]/40 text-sm text-amber-100 leading-relaxed">
                      “{activeLesson.aiMentorGreeting}”
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          onAddXp(20);
                          onOpenAIChat(activeLesson.aiMentorPrompt);
                        }}
                        className="px-5 py-3 rounded-2xl bg-[#D4AF37] text-[#1A0D0E] font-extrabold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Trò chuyện trực tiếp với AI Mentor (+20 XP)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpeakLesson(activeLesson)}
                        className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-200 font-extrabold text-xs flex items-center gap-2 border border-white/20 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Nghe AI Tóm tắt Bài học</span>
                      </button>
                    </div>
                  </div>
                )}

                {lessonStep === "quiz-mission" && (
                  <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-xl bg-[#8B1E1E] text-[#D4AF37] text-xs font-extrabold">
                        🎯 QUIZ TƯƠNG TÁC {activeLesson.gradeLabel} (+{activeLesson.xpReward} XP)
                      </span>
                      {completedLessonIds.includes(activeLesson.id) && (
                        <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Đã nhận +{activeLesson.xpReward} XP
                        </span>
                      )}
                    </div>

                    <h4 className="font-cinzel font-extrabold text-base sm:text-lg text-[#2C1A1D]">
                      {activeLesson.quiz.question}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeLesson.quiz.options.map((opt, idx) => {
                        const isPicked = selectedQuizOption === idx;
                        const isRight = idx === activeLesson.quiz.correctIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCompleteLessonQuiz(idx)}
                            className={`p-4 rounded-2xl border-2 text-left text-xs font-extrabold transition-all cursor-pointer ${
                              isPicked
                                ? isRight
                                  ? "bg-emerald-700 text-white border-emerald-400 shadow-lg"
                                  : "bg-rose-700 text-white border-rose-400"
                                : "bg-white hover:bg-amber-50 text-[#2C1A1D] border-[#D4AF37]/50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {selectedQuizOption !== null && (
                      <div className="p-4 rounded-2xl bg-amber-100/80 border border-[#D4AF37] text-xs font-bold text-[#2C1A1D]">
                        {activeLesson.quiz.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right 5 cols: Official Citation Box + Practical Mission Card */}
              <div className="lg:col-span-5 space-y-4">
                {/* Official Historical Reference Box (MANDATORY) */}
                <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#8B1E1E] uppercase">
                      <FileCheck2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>HỒ SƠ NGUỒN THAM KHẢO CHÍNH THỐNG</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#8B1E1E] text-amber-200 text-[10px] font-extrabold">
                      {activeLesson.officialSource.sourceType}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-extrabold text-[#2C1A1D]">
                      🏛️ {activeLesson.officialSource.agencyName}
                    </div>
                    <div className="text-stone-700 font-semibold">
                      📄 {activeLesson.officialSource.documentTitle}
                    </div>
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-100 text-[#8B1E1E] font-mono text-[11px] font-bold">
                      Mã hồ sơ: {activeLesson.officialSource.referenceCode}
                    </div>
                  </div>
                </div>

                {/* Practical Field Mission Card */}
                <div className="bg-gradient-to-br from-[#8B1E1E] to-[#5E1111] rounded-3xl border-2 border-[#D4AF37] p-5 text-white space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#D4AF37] uppercase flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      <span>NHIỆM VỤ THỰC HÀNH {activeLesson.gradeLabel}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold">
                      +{activeLesson.xpReward} XP
                    </span>
                  </div>

                  <p className="text-sm font-bold text-amber-100">
                    {activeLesson.missionTitle}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceTab("field-experience");
                        setExpTitle(`Bài thu hoạch ${activeLesson.gradeLabel}: ${activeLesson.title}`);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#D4AF37] text-[#1A0D0E] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nộp Sản Phẩm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonStep("quiz-mission")}
                      className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>Làm Quiz Ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: TRẢI NGHIỆM THỰC TẾ DI SẢN (UPLOAD ẢNH, TRANH, NHẬT KÝ, VIDEO) */}
      {/* =================================================================== */}
      {workspaceTab === "field-experience" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 4 Visual Experience Mode Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="font-cinzel font-extrabold text-lg text-[#8B1E1E]">
              Chọn Hình Thức Trải Nghiệm Thực Tế Di Sản
            </h3>

            {[
              {
                mode: "visit_photo" as const,
                icon: Camera,
                title: "1. Upload Ảnh Tham Quan",
                xp: "+40 XP",
                desc: "Chụp ảnh thực tế tại Đền Hai Bà Trưng & gắn Trạm di tích"
              },
              {
                mode: "artwork" as const,
                icon: Palette,
                title: "2. Upload Tranh Vẽ Di Sản",
                xp: "+50 XP",
                desc: "Tải lên tranh vẽ Hai Bà Trưng, Voi chiến, Trống đồng Mê Linh"
              },
              {
                mode: "experience_diary" as const,
                icon: PenTool,
                title: "3. Nhật Ký Trải Nghiệm",
                xp: "+35 XP",
                desc: "Viết nhật ký thu hoạch sau chuyến tham quan học tập"
              },
              {
                mode: "student_narration_video" as const,
                icon: Video,
                title: "4. Video Thuyết Minh Học Sinh",
                xp: "+60 XP",
                desc: "Tải lên video học sinh tự quay thuyết minh lịch sử"
              }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = uploadMode === item.mode;
              return (
                <div
                  key={item.mode}
                  onClick={() => setUploadMode(item.mode)}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#8B1E1E] to-[#5E1111] text-white border-[#D4AF37] shadow-xl"
                      : "bg-white text-[#2C1A1D] border-[#D4AF37]/50 hover:border-[#8B1E1E]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? "bg-[#D4AF37] text-[#1A0D0E] border-white"
                          : "bg-[#FAF8F5] text-[#8B1E1E] border-[#D4AF37]"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-cinzel font-extrabold text-sm">{item.title}</h4>
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected ? "text-amber-100" : "text-stone-600"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold shrink-0">
                    {item.xp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Upload & Submission Studio Form (7 cols) */}
          <form
            onSubmit={handleSubmitFieldExperience}
            className="lg:col-span-7 bg-white rounded-[32px] border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-cinzel font-extrabold text-xl text-[#8B1E1E]">
                {uploadMode === "visit_photo" && "📸 Tải Lên Ảnh Tham Quan Thực Tế"}
                {uploadMode === "artwork" && "🎨 Tải Lên Tranh Vẽ Di Sản Mê Linh"}
                {uploadMode === "experience_diary" && "📔 Viết Nhật Ký Trải Nghiệm Di Sản"}
                {uploadMode === "student_narration_video" && "🎥 Đăng Video Thuyết Minh Học Sinh"}
              </h3>
              <span className="text-xs font-extrabold text-emerald-700">
                Đồng bộ Firebase & Student Gallery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold text-stone-700 block mb-1">
                  Tiêu đề tác phẩm / bài thu hoạch *
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="VD: Ảnh lớp 4A tại Cổng Tam Quan Đền Hai Bà Trưng..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/60 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-stone-700 block mb-1">
                  Gắn với Trạm Di tích thực tế
                </label>
                <select
                  value={expStationId}
                  onChange={(e) => setExpStationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/60 text-xs font-bold"
                >
                  {pois.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Official Source Citation Selector (MANDATORY) */}
            <div>
              <label className="text-xs font-extrabold text-[#8B1E1E] block mb-1">
                🏛️ Nguồn tham khảo lịch sử chính thống đính kèm *
              </label>
              <select
                value={expSourceIdx}
                onChange={(e) => setExpSourceIdx(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-[#D4AF37] text-xs font-bold text-[#2C1A1D]"
              >
                {OFFICIAL_HERITAGE_SOURCES.map((src, idx) => (
                  <option key={idx} value={idx}>
                    [{src.sourceType}] {src.documentTitle} ({src.referenceCode})
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Box */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#D4AF37] text-center space-y-2">
              <label className="cursor-pointer inline-flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#8B1E1E] text-[#D4AF37] flex items-center justify-center shadow">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold text-[#8B1E1E]">
                  {isUploadingFile
                    ? "Đang tải tệp lên Firebase Storage..."
                    : "Bấm để chọn tệp Ảnh / Tranh vẽ / Video từ thiết bị"}
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleRealFileUpload}
                  className="hidden"
                />
              </label>

              {uploadMode === "student_narration_video" && (
                <input
                  type="text"
                  value={uploadedVideoUrl}
                  onChange={(e) => setUploadedVideoUrl(e.target.value)}
                  placeholder="Hoặc dán link YouTube / MP4 thuyết minh của học sinh..."
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold"
                />
              )}

              {uploadedMediaUrl && (
                <img
                  src={uploadedMediaUrl}
                  alt="Preview"
                  className="h-36 mx-auto rounded-xl object-cover border border-[#D4AF37] mt-2"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-extrabold text-stone-700 block mb-1">
                Nhật ký cảm nhận / Thuyết minh ngắn
              </label>
              <textarea
                rows={3}
                value={expContent}
                onChange={(e) => setExpContent(e.target.value)}
                placeholder="Ghi lại cảm nhận hoặc nội dung thuyết minh của em..."
                className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/60 text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={isUploadingFile}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] text-white font-extrabold text-xs sm:text-sm border-2 border-[#D4AF37] shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Lưu Vào Student Gallery & Nhận XP Ngay</span>
            </button>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: STUDENT GALLERY (TRIỂN LÃM ẢNH, TRANH VẼ, NHẬT KÝ, VIDEO)     */}
      {/* =================================================================== */}
      {workspaceTab === "student-gallery" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-[#D4AF37]">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all" as const, label: "🌟 Tất cả tác phẩm" },
                { id: "visit_photo" as const, label: "📸 Ảnh tham quan" },
                { id: "artwork" as const, label: "🎨 Tranh vẽ" },
                { id: "experience_diary" as const, label: "📔 Nhật ký trải nghiệm" },
                { id: "student_narration_video" as const, label: "🎥 Video thuyết minh" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    galleryFilter === tab.id
                      ? "bg-[#8B1E1E] text-white border border-[#D4AF37] shadow"
                      : "bg-[#FAF8F5] text-[#2C1A1D] hover:bg-amber-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setWorkspaceTab("field-experience")}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng tác phẩm mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGalleryPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* 70% Visual Image or Video */}
                  <div className="relative h-56 bg-stone-900 overflow-hidden">
                    {post.videoUrl ? (
                      <iframe
                        src={post.videoUrl}
                        title={post.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={post.imageUrl || activeLesson.imageUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-xl bg-[#8B1E1E]/90 text-[#D4AF37] text-[10px] font-extrabold border border-[#D4AF37]">
                        {post.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-black/70 text-white text-[10px] font-bold">
                        {post.studentGrade}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-cinzel font-extrabold text-sm text-[#2C1A1D] line-clamp-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-2">{post.content}</p>

                    <div className="p-2 rounded-xl bg-amber-50/80 border border-[#D4AF37]/40 text-[10px] font-bold text-[#8B1E1E] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        Nguồn:{" "}
                        {post.officialSource
                          ? `${post.officialSource.sourceType} (${post.officialSource.referenceCode})`
                          : "Hồ sơ Di tích Quốc gia Đặc biệt (QĐ 2383/QĐ-TTg)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-700 truncate">👩‍🎓 {post.studentName}</span>
                  <button
                    type="button"
                    onClick={() => onLikePost(post.id)}
                    className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#8B1E1E] flex items-center gap-1 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-[#8B1E1E]" />
                    <span>{post.likesCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: HỆ THỐNG NGUỒN LỊCH SỬ CHÍNH THỐNG                          */}
      {/* =================================================================== */}
      {workspaceTab === "official-sources" && (
        <div className="bg-white rounded-[32px] border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cinzel font-extrabold text-xl text-[#8B1E1E] flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                <span>DANH MỤC 5 NGUỒN LỊCH SỬ CHÍNH THỐNG BẮT BUỘC</span>
              </h3>
              <p className="text-xs text-stone-600 font-semibold mt-1">
                Toàn bộ bài học Lớp 1–5, hiện vật 3D, câu hỏi Quiz và thuyết minh AI đều lưu trữ mã nguồn tham khảo xác thực.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OFFICIAL_HERITAGE_SOURCES.map((src, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-[#FAF8F5] border-2 border-[#D4AF37]/60 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-xl bg-[#8B1E1E] text-[#D4AF37] text-xs font-extrabold">
                    {idx + 1}. {src.sourceType}
                  </span>
                  <h4 className="font-cinzel font-extrabold text-sm text-[#2C1A1D]">
                    {src.agencyName}
                  </h4>
                  <p className="text-xs text-stone-700 font-medium leading-relaxed">
                    {src.documentTitle}
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-[11px] font-bold text-[#8B1E1E]">
                  <span>Mã: {src.referenceCode}</span>
                  <span>Năm: {src.publishedYear}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
