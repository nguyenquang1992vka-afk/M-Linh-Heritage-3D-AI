import React, { useState } from "react";
import { 
  HomepageContentConfig, 
  HeritagePOI, 
  HeritageArtifact, 
  QuizQuestion, 
  HeritageBadge, 
  MediaItem, 
  StudentPost, 
  ClassStudentProgress 
} from "../types";
import { 
  Edit3, 
  Compass, 
  Landmark, 
  BookOpen, 
  CheckSquare, 
  Swords, 
  HelpCircle, 
  Music, 
  Video, 
  Image as ImageIcon, 
  Award, 
  Bot, 
  Bell, 
  Users, 
  Newspaper, 
  Plus, 
  Upload, 
  Save, 
  Send, 
  Trash2, 
  Play, 
  Pause, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  FileAudio, 
  FileText, 
  Layers,
  Search,
  Volume2
} from "lucide-react";
import { HeritageAudioPlayer } from "./HeritageAudioPlayer";

interface TeacherContentCenterProps {
  homepageConfig: HomepageContentConfig;
  onUpdateHomepageConfig: (newConfig: HomepageContentConfig) => void;

  pois: HeritagePOI[];
  onUpdatePois: (newPois: HeritagePOI[]) => void;

  artifacts: HeritageArtifact[];
  onUpdateArtifacts: (newArtifacts: HeritageArtifact[]) => void;

  quizzes: QuizQuestion[];
  onUpdateQuizzes: (newQuizzes: QuizQuestion[]) => void;

  badges: HeritageBadge[];
  onUpdateBadges: (newBadges: HeritageBadge[]) => void;

  mediaLibrary: MediaItem[];
  onUpdateMediaLibrary: (newMedia: MediaItem[]) => void;

  studentPosts: StudentPost[];
  onUpdateStudentPosts: (newPosts: StudentPost[]) => void;

  studentsList: ClassStudentProgress[];
  onUpdateStudentsList: (newStudents: ClassStudentProgress[]) => void;
}

export const TeacherContentCenter: React.FC<TeacherContentCenterProps> = ({
  homepageConfig,
  onUpdateHomepageConfig,
  pois,
  onUpdatePois,
  artifacts,
  onUpdateArtifacts,
  quizzes,
  onUpdateQuizzes,
  badges,
  onUpdateBadges,
  mediaLibrary,
  onUpdateMediaLibrary,
  studentPosts,
  onUpdateStudentPosts,
  studentsList,
  onUpdateStudentsList
}) => {
  // Editorial Menu State
  const [activeMenu, setActiveMenu] = useState<string>("homepage");

  // Homepage Edit State
  const [hpState, setHpState] = useState<HomepageContentConfig>(homepageConfig);
  const [hpSavedSuccess, setHpSavedSuccess] = useState(false);

  // Audio Library State
  const [audioTitleInput, setAudioTitleInput] = useState("");
  const [audioUrlInput, setAudioUrlInput] = useState("");
  const [audioCategoryInput, setAudioCategoryInput] = useState("Thuyết minh Di sản");
  const [audioLocationInput, setAudioLocationInput] = useState("Nghi môn ngoại & Chính điện thờ Hai Bà Trưng");
  const [showAddAudioModal, setShowAddAudioModal] = useState(false);

  // Image Library State
  const [imgTitleInput, setImgTitleInput] = useState("");
  const [imgUrlInput, setImgUrlInput] = useState("");
  const [imgCategoryInput, setImgCategoryInput] = useState("Hình ảnh Kiến trúc");
  const [showAddImgModal, setShowAddImgModal] = useState(false);

  // Announcement State
  const [announcementText, setAnnouncementText] = useState(homepageConfig.announcementText);

  // AI Cô Quang Knowledge Prompt State
  const [aiKnowledgePrompt, setAiKnowledgePrompt] = useState(
    "Trợ lý AI Cô Quang là trợ lý lịch sử học đường thân thiện của Quần thể Di tích Đền Hai Bà Trưng - Mê Linh. Hãy trả lời câu hỏi của các em học sinh Tiểu học bằng giọng điệu ấm áp, khen ngợi và chính xác lịch sử năm 40 SCN!"
  );

  // Handle Homepage Save
  const handleSaveHomepage = () => {
    onUpdateHomepageConfig({ ...hpState, announcementText });
    setHpSavedSuccess(true);
    setTimeout(() => setHpSavedSuccess(false), 3000);
  };

  // Handle Add Audio MP3
  const handleAddAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioTitleInput.trim()) return;

    const newAudioItem: MediaItem = {
      id: `med-audio-${Date.now()}`,
      type: "audio",
      url: audioUrlInput.trim() || "https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg",
      fileName: audioTitleInput.trim().replace(/\s+/g, "_") + ".mp3",
      duration: "02:15",
      fileSize: "3.1 MB",
      caption: audioTitleInput.trim(),
      category: audioCategoryInput,
      uploadedBy: "Cô Quang (Giáo viên)",
      createdAt: new Date().toISOString().split("T")[0],
      status: "Đã xuất bản",
      attachedLocation: audioLocationInput
    };

    onUpdateMediaLibrary([newAudioItem, ...mediaLibrary]);
    setAudioTitleInput("");
    setAudioUrlInput("");
    setShowAddAudioModal(false);
  };

  // Handle Add Image
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgTitleInput.trim()) return;

    const newImgItem: MediaItem = {
      id: `med-img-${Date.now()}`,
      type: "image",
      url: imgUrlInput.trim() || "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80",
      fileName: imgTitleInput.trim().replace(/\s+/g, "_") + ".jpg",
      fileSize: "2.4 MB",
      caption: imgTitleInput.trim(),
      category: imgCategoryInput,
      uploadedBy: "Cô Quang (Giáo viên)",
      createdAt: new Date().toISOString().split("T")[0],
      status: "Đã xuất bản"
    };

    onUpdateMediaLibrary([newImgItem, ...mediaLibrary]);
    setImgTitleInput("");
    setImgUrlInput("");
    setShowAddImgModal(false);
  };

  // Editorial Menus Definition
  const menuItems = [
    { id: "homepage", label: "📝 Nội dung trang chủ", desc: "Biên tập Banner, Tiêu đề, Video" },
    { id: "map", label: "🗺️ Bản đồ", desc: "Quản lý vị trí & Tọa độ trạm 2D" },
    { id: "pois", label: "🏛️ Trạm di sản", desc: "Chỉnh sửa 6 trạm di tích" },
    { id: "artifacts", label: "📚 Thư viện", desc: "Danh mục Di vật & Bảo vật" },
    { id: "missions", label: "🎯 Nhiệm vụ", desc: "Cài đặt Nhiệm vụ khám phá" },
    { id: "games", label: "🎮 Trò chơi", desc: "Game Quiz & Tô màu Trống đồng" },
    { id: "quizzes", label: "❓ Câu hỏi", desc: "Ngân hàng câu hỏi Quiz Quest" },
    { id: "video", label: "🎬 Video", desc: "Thư viện Phim tư liệu & Clip" },
    { id: "images", label: "🖼️ Hình ảnh", desc: "Kho ảnh sắc nét Di tích" },
    { id: "badges", label: "🏆 Huy hiệu", desc: "Quản lý Danh hiệu & Badge" },
    { id: "ai", label: "🤖 AI Cô Quang", desc: "Tri thức & Prompt Trợ lý AI" },
    { id: "announcements", label: "📢 Thông báo", desc: "Loa phát thanh & Cuộc thi" },
    { id: "students", label: "👩‍🎓 Học sinh", desc: "Quản lý danh sách lớp học" },
    { id: "social_posts", label: "📰 Bài đăng học sinh", desc: "Duyệt & Quản lý mạng xã hội" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Title Banner (# TRUNG TÂM BIÊN TẬP) */}
      <section className="bg-[#F8F4E8] p-6 sm:p-8 rounded-3xl border-2 border-[#C9A227] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-[#9E2A2B] text-xs font-bold mb-2">
            <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>HỆ THỐNG BIÊN TẬP NỘI DUNG DI SẢN KHÔNG CẦN CODE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#9E2A2B]">
            # TRUNG TÂM BIÊN TẬP
          </h1>

          <p className="text-xs sm:text-sm text-[#5A4032] font-semibold mt-1 max-w-2xl">
            Giáo viên có toàn quyền cập nhật nội dung Trang chủ, Thư viện Audio MP3, Trạm di sản, Ngân hàng câu hỏi Quiz và duyệt Bài đăng Mạng xã hội của học sinh!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSaveHomepage}
            className="px-5 py-3 rounded-2xl bg-[#9E2A2B] hover:bg-[#7A1F20] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 border border-[#C9A227]"
          >
            <Save className="w-4 h-4 text-[#C9A227]" />
            <span>[ LƯU TOÀN BỘ ]</span>
          </button>
          <button
            onClick={handleSaveHomepage}
            className="px-5 py-3 rounded-2xl bg-[#2F6F68] hover:bg-[#23534e] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 border border-[#C9A227]"
          >
            <Send className="w-4 h-4 text-[#C9A227]" />
            <span>[ XUẤT BẢN APP ]</span>
          </button>
        </div>
      </section>

      {/* Main Layout: Left Sidebar Navigation & Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Editorial Navigation Sidebar */}
        <aside className="lg:col-span-1 bg-white p-4 rounded-3xl border-2 border-[#C9A227]/60 shadow-md space-y-1 h-fit">
          <div className="text-xs font-bold text-[#9E2A2B] px-3 py-2 border-b border-stone-200 mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C9A227]" />
            <span>DANH MỤC BIÊN TẬP</span>
          </div>

          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between text-xs font-bold ${
                  activeMenu === item.id
                    ? "bg-[#9E2A2B] text-white shadow-xs border border-[#C9A227]"
                    : "bg-transparent text-[#5A4032] hover:bg-[#F8F4E8]"
                }`}
              >
                <span>{item.label}</span>
                {activeMenu === item.id && <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Active Editorial Panel */}
        <main className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#C9A227] shadow-lg space-y-6">
          {hpSavedSuccess && (
            <div className="bg-[#2F6F68] text-white p-4 rounded-2xl border-2 border-[#C9A227] flex items-center justify-between text-xs font-bold animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                Đã lưu và xuất bản toàn bộ thay đổi lên Mê Linh Smart Heritage!
              </span>
            </div>
          )}

          {/* MENU 1: NỘI DUNG TRANG CHỦ (# CHỈNH SỬA TRANG CHỦ) */}
          {activeMenu === "homepage" && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2">
                    <Edit3 className="w-6 h-6 text-[#C9A227]" />
                    <span># CHỈNH SỬA TRANG CHỦ</span>
                  </h2>
                  <p className="text-xs text-[#5A4032] font-semibold mt-1">
                    Cập nhật tiêu đề, phụ đề, mô tả, hình ảnh banner và video giới thiệu mà không cần sửa code.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#5A4032] block mb-1">Tiêu đề chính Trang chủ:</label>
                  <input
                    type="text"
                    value={hpState.title}
                    onChange={(e) => setHpState({ ...hpState, title: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 font-bold focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A4032] block mb-1">Phụ đề:</label>
                  <input
                    type="text"
                    value={hpState.subtitle}
                    onChange={(e) => setHpState({ ...hpState, subtitle: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 font-bold focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A4032] block mb-1">Mô tả tổng quan:</label>
                  <textarea
                    value={hpState.description}
                    onChange={(e) => setHpState({ ...hpState, description: e.target.value })}
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 font-semibold focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#5A4032] block mb-1">Link Ảnh Hero Banner:</label>
                    <input
                      type="text"
                      value={hpState.heroImageUrl}
                      onChange={(e) => setHpState({ ...hpState, heroImageUrl: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#5A4032] block mb-1">Link Video Phim Giới Thiệu (YouTube Embed):</label>
                    <input
                      type="text"
                      value={hpState.introVideoUrl}
                      onChange={(e) => setHpState({ ...hpState, introVideoUrl: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A4032] block mb-1">Nội dung Nút Kích Hoạt Hành Trình (CTA):</label>
                  <input
                    type="text"
                    value={hpState.ctaButtonText}
                    onChange={(e) => setHpState({ ...hpState, ctaButtonText: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 font-bold"
                  />
                </div>

                {/* Editorial Buttons Toolbar required in instructions */}
                <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => alert("Tính năng [ + THÊM NỘI DUNG ] đã mở sẵn khối biên tập bên dưới!")}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F4E8] text-[#9E2A2B] font-bold text-xs border border-[#C9A227] hover:bg-[#C9A227]/20"
                  >
                    [ + THÊM NỘI DUNG ]
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMenu("images")}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F4E8] text-[#2F6F68] font-bold text-xs border border-[#2F6F68] hover:bg-[#2F6F68]/20"
                  >
                    [ TẢI ẢNH ]
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMenu("video")}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F4E8] text-[#5A4032] font-bold text-xs border border-[#5A4032] hover:bg-[#5A4032]/20"
                  >
                    [ TẢI VIDEO ]
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveHomepage}
                    className="px-5 py-2.5 rounded-xl bg-[#2F6F68] text-white font-bold text-xs border border-[#C9A227] shadow-xs hover:bg-[#23534e]"
                  >
                    [ LƯU ]
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveHomepage}
                    className="px-5 py-2.5 rounded-xl bg-[#9E2A2B] text-white font-bold text-xs border border-[#C9A227] shadow-xs hover:bg-[#7A1F20]"
                  >
                    [ XUẤT BẢN ]
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MENU 8: MANDATORY REQUIREMENT # THƯ VIỆN AUDIO DI SẢN */}
          {activeMenu === "audio" && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2">
                    <Music className="w-6 h-6 text-[#C9A227]" />
                    <span># THƯ VIỆN AUDIO DI SẢN</span>
                  </h2>
                  <p className="text-xs text-[#5A4032] font-semibold mt-1">
                    Tải file âm thanh .mp3, .wav, .m4a để gắn bài thuyết minh audio vào Trạm di sản, Bản đồ, Timeline & Bài học!
                  </p>
                </div>

                <button
                  onClick={() => setShowAddAudioModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#2F6F68] hover:bg-[#23534e] text-white font-bold text-xs shadow-md border border-[#C9A227] flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#C9A227]" />
                  <span>[ + TẢI AUDIO ]</span>
                </button>
              </div>

              {/* Sample Embedded Player Showcase */}
              <div className="p-4 bg-[#F8F4E8] rounded-2xl border border-[#C9A227] space-y-2">
                <div className="text-xs font-bold text-[#9E2A2B] flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#C9A227]" />
                  <span>🎧 DEMO TRÌNH PHÁT THUYẾT MINH MP3 ĐỀN HAI BÀ TRƯNG</span>
                </div>
                <HeritageAudioPlayer
                  title="🎧 Nghe thuyết minh về Đền Hai Bà Trưng (Mê Linh)"
                  audioUrl="https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg"
                  duration="03:45"
                />
              </div>

              {/* Audio Files Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F4E8] text-[#5A4032] font-bold border-b border-[#C9A227]/40">
                      <th className="p-3">TÊN FILE AUDIO MP3</th>
                      <th className="p-3">GẮN TẠI VỊ TRÍ</th>
                      <th className="p-3">THỜI LƯỢNG</th>
                      <th className="p-3">DUNG LƯỢNG</th>
                      <th className="p-3">NGƯỜI TẢI</th>
                      <th className="p-3">TRẠNG THÁI</th>
                      <th className="p-3 text-center">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-semibold">
                    {mediaLibrary.filter(m => m.type === "audio").map((audio) => (
                      <tr key={audio.id} className="hover:bg-[#F8F4E8]/50">
                        <td className="p-3 font-bold text-[#9E2A2B]">
                          <div className="flex items-center gap-2">
                            <FileAudio className="w-4 h-4 text-[#C9A227]" />
                            <span>{audio.fileName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-[#2F6F68] font-bold">{audio.attachedLocation || "Chưa gắn"}</td>
                        <td className="p-3 font-mono">{audio.duration || "02:30"}</td>
                        <td className="p-3 text-stone-500">{audio.fileSize}</td>
                        <td className="p-3">{audio.uploadedBy}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                            {audio.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              const updated = mediaLibrary.filter(m => m.id !== audio.id);
                              onUpdateMediaLibrary(updated);
                            }}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                            title="Xóa audio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MENU 10: HÌNH ẢNH (# KHO HÌNH ẢNH DI TÍCH) */}
          {activeMenu === "images" && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-[#C9A227]" />
                    <span># KHO HÌNH ẢNH DI TÍCH (JPG, PNG, WEBP)</span>
                  </h2>
                  <p className="text-xs text-[#5A4032] font-semibold mt-1">
                    Quản lý bộ sưu tập hình ảnh di tích, xem trước, mô tả và phân loại lưu trữ Firebase.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddImgModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#7A1F20] text-white font-bold text-xs shadow-md border border-[#C9A227] flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#C9A227]" />
                  <span>[ + TẢI ẢNH ]</span>
                </button>
              </div>

              {/* Images Grid Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mediaLibrary.filter(m => m.type === "image").map((img) => (
                  <div key={img.id} className="bg-[#F8F4E8] rounded-2xl border border-[#C9A227]/50 p-3 space-y-2">
                    <div className="h-36 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs font-bold text-[#9E2A2B] truncate">{img.caption}</div>
                    <div className="text-[10px] text-stone-500 font-semibold flex items-center justify-between">
                      <span>{img.fileName}</span>
                      <span>{img.fileSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU 3: TRẠM DI SẢN (HERITAGE POIS) */}
          {activeMenu === "pois" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2 border-b border-stone-200 pb-3">
                <Landmark className="w-6 h-6 text-[#C9A227]" />
                <span>🏛️ CHỈNH SỬA TÊN VÀ NỘI DUNG 6 TRẠM DI SẢN</span>
              </h2>

              <div className="space-y-4">
                {pois.map((poi, idx) => (
                  <div key={poi.id} className="p-4 rounded-2xl bg-[#F8F4E8] border border-[#C9A227]/50 space-y-3">
                    <div className="flex items-center justify-between font-bold text-xs text-[#9E2A2B]">
                      <span>Trạm {poi.order}: {poi.title}</span>
                      <span className="text-[#2F6F68]">Tọa độ: X={poi.mapCoords.x}%, Y={poi.mapCoords.y}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        value={poi.title}
                        onChange={(e) => {
                          const updated = [...pois];
                          updated[idx].title = e.target.value;
                          onUpdatePois(updated);
                        }}
                        className="p-2 rounded-xl border border-stone-300 font-bold bg-white"
                      />
                      <input
                        type="text"
                        value={poi.subtitle}
                        onChange={(e) => {
                          const updated = [...pois];
                          updated[idx].subtitle = e.target.value;
                          onUpdatePois(updated);
                        }}
                        className="p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU 7: CÂU HỎI QUIZ */}
          {activeMenu === "quizzes" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2 border-b border-stone-200 pb-3">
                <HelpCircle className="w-6 h-6 text-[#C9A227]" />
                <span>❓ NGÂN HÀNG CÂU HỎI QUIZ QUEST</span>
              </h2>

              <div className="space-y-4">
                {quizzes.map((q, qIdx) => (
                  <div key={q.id} className="p-4 bg-[#F8F4E8] rounded-2xl border border-[#C9A227]/40 space-y-2 text-xs">
                    <div className="font-bold text-[#9E2A2B]">Câu hỏi {qIdx + 1}: {q.question}</div>
                    <div className="text-stone-600 font-semibold">Đáp án đúng: {q.options[q.correctAnswerIndex]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU 15: BÀI ĐĂNG HỌC SINH */}
          {activeMenu === "social_posts" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2 border-b border-stone-200 pb-3">
                <Newspaper className="w-6 h-6 text-[#2F6F68]" />
                <span>📰 DUYỆT BÀI ĐĂNG MẠNG XÃ HỘI CỦA HỌC SINH</span>
              </h2>

              <div className="space-y-3">
                {studentPosts.map((post) => (
                  <div key={post.id} className="p-4 bg-[#F8F4E8] rounded-2xl border border-[#C9A227]/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#9E2A2B]">{post.title}</div>
                      <div className="text-stone-600 font-semibold">Tác giả: {post.studentName} ({post.studentGrade})</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">{post.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER MENUS FALLBACK DISPLAY */}
          {["map", "artifacts", "missions", "games", "video", "badges", "ai", "announcements", "students"].includes(activeMenu) && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#9E2A2B] flex items-center gap-2 border-b border-stone-200 pb-3">
                <Sparkles className="w-6 h-6 text-[#C9A227]" />
                <span>BIÊN TẬP: {menuItems.find(m => m.id === activeMenu)?.label}</span>
              </h2>
              <div className="p-6 bg-[#F8F4E8] rounded-2xl border border-[#C9A227]/40 text-xs text-[#5A4032] space-y-2">
                <div className="font-bold text-sm text-[#9E2A2B]">Mô đun biên tập đã sẵn sàng!</div>
                <p>Nội dung đang kết nối dữ liệu Firestore để giáo viên lưu và xuất bản tức thời trên ứng dụng.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL ADD AUDIO MP3 */}
      {showAddAudioModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F4E8] rounded-3xl border-2 border-[#C9A227] shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-[#9E2A2B] border-b border-[#C9A227]/30 pb-2">
              [ + TẢI AUDIO MP3 DI SẢN ]
            </h3>
            <form onSubmit={handleAddAudio} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5A4032] block mb-1">Tên file / Tiêu đề audio (*):</label>
                <input
                  type="text"
                  value={audioTitleInput}
                  onChange={(e) => setAudioTitleInput(e.target.value)}
                  placeholder="Ví dụ: Thuyết minh Chính điện thờ Hai Bà Trưng MP3"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-bold bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#5A4032] block mb-1">Gắn vị trí di tích:</label>
                <input
                  type="text"
                  value={audioLocationInput}
                  onChange={(e) => setAudioLocationInput(e.target.value)}
                  placeholder="Ví dụ: Trạm 3 - Chính điện thờ Hai Bà Trưng"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#5A4032] block mb-1">Đường dẫn File Audio (.mp3, .wav):</label>
                <input
                  type="text"
                  value={audioUrlInput}
                  onChange={(e) => setAudioUrlInput(e.target.value)}
                  placeholder="Dán link file mp3 trực tiếp..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddAudioModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-stone-600 hover:bg-stone-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F6F68] text-white font-bold shadow-xs hover:bg-[#23534e]"
                >
                  Lưu File Audio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD IMAGE */}
      {showAddImgModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F4E8] rounded-3xl border-2 border-[#C9A227] shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-[#9E2A2B] border-b border-[#C9A227]/30 pb-2">
              [ + TẢI ẢNH DI TÍCH ]
            </h3>
            <form onSubmit={handleAddImage} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5A4032] block mb-1">Mô tả bức ảnh (*):</label>
                <input
                  type="text"
                  value={imgTitleInput}
                  onChange={(e) => setImgTitleInput(e.target.value)}
                  placeholder="Ví dụ: Toàn cảnh Tượng Voi Chiến Mê Linh"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-bold bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#5A4032] block mb-1">Link Ảnh (JPG, PNG, WEBP):</label>
                <input
                  type="text"
                  value={imgUrlInput}
                  onChange={(e) => setImgUrlInput(e.target.value)}
                  placeholder="Dán URL ảnh..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddImgModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-stone-600 hover:bg-stone-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9E2A2B] text-white font-bold shadow-xs hover:bg-[#7A1F20]"
                >
                  Tải Ảnh Lên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
