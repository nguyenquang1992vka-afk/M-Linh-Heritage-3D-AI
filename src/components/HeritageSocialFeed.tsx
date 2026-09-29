import React, { useState, useRef } from "react";
import { StudentPost, UserRole, StudentComment } from "../types";
import {
  Heart,
  MessageCircle,
  Send,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  Video,
  FileText,
  Upload,
  Filter,
  Trash2,
  Eye,
  Compass,
  Image as ImageIcon,
  Globe,
  User,
  School,
  Link2,
  Play
} from "lucide-react";
import { soundManager } from "../utils/audioUtils";
import { INITIAL_POIS } from "../data/heritageData";
import nghiMonNgoaiImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import sanNguPhucImg from "../assets/images/san_ngu_phuc_da_the_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import hoBanNguyetImg from "../assets/images/ho_ban_nguyet_canh_quan_real.jpg";

interface HeritageSocialFeedProps {
  posts: StudentPost[];
  onUpdatePosts: React.Dispatch<React.SetStateAction<StudentPost[]>>;
  userRole: UserRole;
  studentName: string;
  studentGrade: string;
  studentSchool?: string;
  onAddXp: (amount: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  compactHeader?: boolean;
}

const SAMPLE_HERITAGE_PHOTOS = [
  {
    label: "Nghi môn ngoại – Cổng Tam Quan",
    url: nghiMonNgoaiImg
  },
  {
    label: "Sân Ngũ Phúc & Đá Thề Mê Linh",
    url: sanNguPhucImg
  },
  {
    label: "Tam tòa Chính diện Đền Hai Bà Trưng",
    url: tamToaChinhDienImg
  },
  {
    label: "Hồ Bán Nguyệt Đền Hạ Lôi",
    url: hoBanNguyetImg
  }
];

const SAMPLE_HERITAGE_VIDEOS = [
  {
    label: "Phim tư liệu Di tích Đền Hai Bà Trưng – Mê Linh",
    url: "https://www.youtube.com/embed/uS5bGu30nxU"
  },
  {
    label: "Lễ hội Rước Kiệu Đền Hai Bà Trưng (Mùng 6 Tháng Giêng)",
    url: "https://www.youtube.com/embed/xJ2Usaa1RWQ"
  },
  {
    label: "Mê Linh Tôi Yêu – Hào Khí Lịch Sử",
    url: "https://www.youtube.com/embed/lQuZY2uPs08"
  },
  {
    label: "Kể chuyện lịch sử Khởi nghĩa Hai Bà Trưng năm 40 SCN",
    url: "https://www.youtube.com/embed/xfkZmPhM9Q0"
  }
];

const QUICK_COMMENT_SUGGESTIONS = [
  "Bài đăng rất hay và ý nghĩa! Tự hào truyền thống Hai Bà Trưng Mê Linh! 🌟",
  "Hình ảnh/video về Đền Hai Bà Trưng đẹp và rõ nét quá bạn ơi! 👏",
  "Cảm ơn bạn đã chia sẻ tư liệu lịch sử bổ ích cho chúng mình nhé! ❤️",
  "Mình cũng rất thích tham quan và tìm hiểu lịch sử tại Đền Hai Bà Trưng!"
];

function normalizeVideoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  // Convert standard youtube.com/watch?v=ID or youtu.be/ID or youtube.com/shorts/ID into embed URL
  const ytWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return `https://www.youtube.com/embed/${ytWatchMatch[1]}`;
  }
  return trimmed;
}

function isDirectVideoFile(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:video/") || url.startsWith("blob:") || url.startsWith("/uploads/")) {
    return true;
  }
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export const HeritageSocialFeed: React.FC<HeritageSocialFeedProps> = ({
  posts,
  onUpdatePosts,
  userRole,
  studentName,
  studentGrade,
  studentSchool = "Trường Tiểu học Văn Khê",
  onAddXp,
  onUnlockBadge,
  compactHeader = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");
  const [stationFilter, setStationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Author info editable if student wants to customize their name/class/school when posting
  const [authorNameInput, setAuthorNameInput] = useState(studentName || "Học sinh Mê Linh");
  const [authorGradeInput, setAuthorGradeInput] = useState(
    studentGrade
      ? studentSchool && !studentGrade.includes(studentSchool.split("–")[0].trim())
        ? `${studentGrade} • ${studentSchool.split("–")[0].trim()}`
        : studentGrade
      : "Lớp 5A • Tiểu học Văn Khê"
  );

  // Create Post Form State
  const [postType, setPostType] = useState<"article" | "photo" | "video">("article");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newStationId, setNewStationId] = useState<string>(INITIAL_POIS[0]?.id || "tam-quan");
  const [newCategory, setNewCategory] = useState<StudentPost["category"]>("Cảm nhận di sản");
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [postSuccessBanner, setPostSuccessBanner] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Public Comment State per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentAuthorName, setCommentAuthorName] = useState<string>(
    studentName || "Học sinh Mê Linh"
  );
  const [collapsedComments, setCollapsedComments] = useState<Record<string, boolean>>({});

  const categories = [
    "Tất cả",
    "Cảm nhận di sản",
    "Góc vẽ sáng tạo",
    "Kể chuyện lịch sử",
    "Tìm hiểu di vật",
    "Em yêu di sản Mê Linh"
  ];

  // Normalize status helper
  const getNormalizedStatus = (status: StudentPost["status"]): "PENDING" | "APPROVED" | "REJECTED" => {
    if (status === "APPROVED" || status === "Đã duyệt") return "APPROVED";
    if (status === "REJECTED") return "REJECTED";
    // Show student posts publicly by default
    return "APPROVED";
  };

  // Filter posts
  const visiblePosts = posts.filter((post) => {
    const normStatus = getNormalizedStatus(post.status);
    if (userRole === "teacher" || userRole === "admin") {
      if (statusFilter !== "ALL" && normStatus !== statusFilter) return false;
    } else {
      if (normStatus === "REJECTED") return false;
    }
    if (activeCategory !== "Tất cả" && post.category !== activeCategory) return false;
    if (stationFilter !== "all" && post.stationId && post.stationId !== stationFilter) return false;
    return true;
  });

  const handleOpenComposerWithType = (type: "article" | "photo" | "video") => {
    soundManager.playClick();
    setPostType(type);
    if (type === "photo" && !mediaPreviewUrl) {
      setNewCategory("Góc vẽ sáng tạo");
    } else if (type === "video") {
      setNewCategory("Kể chuyện lịch sử");
    } else {
      setNewCategory("Cảm nhận di sản");
    }
    setShowCreateModal(true);
  };

  // Handle Real Photo File Upload from student's device
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundManager.playClick();
    setIsUploadingMedia(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setMediaPreviewUrl(dataUrl);
      try {
        const res = await fetch("/api/storage/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataUrl,
            fileName: file.name,
            uploadedBy: authorNameInput || studentName || "Học sinh Mê Linh"
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.file?.url) {
            setMediaPreviewUrl(data.file.url);
          }
        }
      } catch (_err) {
        // Fallback to local dataUrl preview
      } finally {
        setIsUploadingMedia(false);
      }
    };
    reader.onerror = () => {
      setIsUploadingMedia(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Real Video File Upload from student's device
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundManager.playClick();
    setIsUploadingMedia(true);
    setUploadedFileName(file.name);

    // If file is under 18MB, read as base64 dataUrl and upload to /api/storage/upload; otherwise use blob URL
    if (file.size <= 18 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result || "");
        setVideoPreviewUrl(dataUrl);
        try {
          const res = await fetch("/api/storage/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dataUrl,
              fileName: file.name,
              uploadedBy: authorNameInput || studentName || "Học sinh Mê Linh"
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.file?.url) {
              setVideoPreviewUrl(data.file.url);
            }
          }
        } catch (_err) {
          // Keep dataUrl if upload fails
        } finally {
          setIsUploadingMedia(false);
        }
      };
      reader.onerror = () => {
        const blobUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(blobUrl);
        setIsUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } else {
      const blobUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(blobUrl);
      setIsUploadingMedia(false);
    }
  };

  // Handle Create Public Post (Article, Photo, or Video)
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    soundManager.playSuccess();
    const selectedPoi = INITIAL_POIS.find((p) => p.id === newStationId);
    const finalAuthorName = (authorNameInput || studentName || "Học sinh Mê Linh").trim();
    const finalAuthorGrade = (authorGradeInput || studentGrade || "Học sinh Mê Linh").trim();

    const finalImageUrl =
      postType === "photo"
        ? mediaPreviewUrl || nghiMonNgoaiImg
        : postType === "article" && mediaPreviewUrl
        ? mediaPreviewUrl
        : undefined;

    const finalVideoUrl =
      postType === "video"
        ? normalizeVideoUrl(videoPreviewUrl) || "https://www.youtube.com/embed/uS5bGu30nxU"
        : undefined;

    const createdPost: StudentPost = {
      id: `post-${Date.now()}`,
      studentId: `std-${Date.now()}`,
      studentName: finalAuthorName,
      studentGrade: finalAuthorGrade,
      title: newTitle.trim(),
      content: newContent.trim(),
      postType,
      stationId: newStationId,
      stationTitle: selectedPoi ? selectedPoi.title : "Đền Hai Bà Trưng – Mê Linh",
      category: newCategory,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      likesCount: 1,
      isLiked: true,
      comments: [],
      createdAt: "Vừa xong",
      status: "APPROVED",
      isHighlighted: false,
      featuredInExhibition: true
    };

    onUpdatePosts((prev) => [createdPost, ...prev]);
    onAddXp(40);
    onUnlockBadge("badge-young-historian");

    setNewTitle("");
    setNewContent("");
    setMediaPreviewUrl("");
    setVideoPreviewUrl("");
    setUploadedFileName("");
    setShowCreateModal(false);
    setPostSuccessBanner(
      `Đã đăng ${
        postType === "photo" ? "hình ảnh" : postType === "video" ? "video" : "bài viết"
      } công khai thành công lên Bảng tin Học sinh! (+40 XP)`
    );
    setTimeout(() => setPostSuccessBanner(null), 5000);
  };

  // Toggle Like
  const handleLike = (postId: string) => {
    soundManager.playClick();
    onUpdatePosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likesCount: nextLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1)
        };
      })
    );
  };

  // Add Public Comment
  const handleAddComment = (postId: string, overrideText?: string) => {
    const text = (overrideText !== undefined ? overrideText : commentInputs[postId] || "").trim();
    if (!text) return;

    soundManager.playSuccess();
    const resolvedCommenterName =
      userRole === "teacher"
        ? "Giáo viên Mê Linh"
        : userRole === "admin"
        ? "Ban Quản Trị Di Sản"
        : (commentAuthorName || authorNameInput || studentName || "Học sinh Mê Linh").trim();

    const newComment: StudentComment = {
      id: `cmt-${Date.now()}`,
      authorName: resolvedCommenterName,
      authorRole: userRole,
      content: text,
      createdAt: "Vừa xong"
    };

    onUpdatePosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );

    if (overrideText === undefined) {
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
    onAddXp(10);
  };

  // Teacher / Admin Moderation Actions
  const handleUpdateStatus = (postId: string, newStatus: "APPROVED" | "REJECTED") => {
    soundManager.playClick();
    onUpdatePosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, status: newStatus } : post))
    );
  };

  const handleToggleHighlight = (postId: string) => {
    soundManager.playSuccess();
    onUpdatePosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isHighlighted: !post.isHighlighted } : post
      )
    );
  };

  const handleDeletePost = (postId: string) => {
    soundManager.playClick();
    onUpdatePosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Banner Header & Quick Post Action Bar */}
      <div
        className={`relative rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-xl bg-gradient-to-r from-[#5A1010] via-[#8B1E1E] to-[#3A1D12] text-white ${
          compactHeader ? "p-5 sm:p-6" : "p-6 sm:p-8"
        }`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-extrabold">
              <Globe className="w-3.5 h-3.5" />
              <span>DIỄN ĐÀN HỌC SINH CÔNG KHAI • ĐĂNG BÀI • ẢNH • VIDEO • BÌNH LUẬN</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold font-cinzel tracking-wide text-[#FFFDF9]">
              Góc Học Sinh Đăng Bài, Ảnh, Video & Bình Luận Công Khai
            </h2>
            <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed">
              Học sinh các trường Tiểu học, THCS, THPT tự do đăng bài cảm nhận, tải ảnh chụp, đăng video giới thiệu lịch sử Đền Hai Bà Trưng và bình luận giao lưu công khai cùng bạn bè!
            </p>
          </div>

          {/* 3 Quick Create Buttons: Đăng Bài, Đăng Ảnh, Đăng Video */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenComposerWithType("article")}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Đăng Bài Viết</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenComposerWithType("photo")}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-[#D4AF37] font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-[#F3D27A]" />
              <span>Đăng Ảnh</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenComposerWithType("video")}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-[#D4AF37] font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#F3D27A]" />
              <span>Đăng Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Inline Composer Prompt Card (Facebook/Social style) */}
      {!showCreateModal && (
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/70 p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div
            onClick={() => handleOpenComposerWithType("article")}
            className="flex items-center gap-3 flex-1 cursor-pointer bg-[#FAF8F5] hover:bg-amber-50/50 border border-stone-200 rounded-2xl px-4 py-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1E1E] to-amber-700 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
              {(authorNameInput || studentName || "HS").charAt(0).toUpperCase()}
            </div>
            <div className="text-xs sm:text-sm text-stone-500 font-semibold">
              {authorNameInput || studentName || "Bạn"} ơi, bấm vào đây để đăng bài viết, tải ảnh hoặc video về Đền Hai Bà Trưng nhé...
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenComposerWithType("article")}
              className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8B1E1E] border border-amber-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#8B1E1E]" />
              <span>Bài viết</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenComposerWithType("photo")}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Đăng ảnh</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenComposerWithType("video")}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Video className="w-4 h-4 text-rose-700" />
              <span>Đăng video</span>
            </button>
          </div>
        </div>
      )}

      {postSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs sm:text-sm font-extrabold flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{postSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setPostSuccessBanner(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Create Post / Photo / Video Form */}
      {showCreateModal && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#D4AF37] shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#8B1E1E]" />
              <h3 className="font-bold text-lg sm:text-xl text-stone-900 font-cinzel">
                Đăng Bài, Ảnh Hoặc Video Công Khai Lên Bảng Tin Học Sinh
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
            >
              Thu gọn ✕
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            {/* Step 0: Student Author Name & School/Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#8B1E1E]" />
                  <span>Họ và tên học sinh đăng bài *</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorNameInput}
                  onChange={(e) => {
                    setAuthorNameInput(e.target.value);
                    setCommentAuthorName(e.target.value);
                  }}
                  placeholder="Nhập họ và tên của em..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                  <School className="w-3.5 h-3.5 text-[#8B1E1E]" />
                  <span>Lớp & Trường học *</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorGradeInput}
                  onChange={(e) => setAuthorGradeInput(e.target.value)}
                  placeholder="VD: Lớp 6A • THCS Mê Linh / Lớp 4A • Tiểu học Văn Khê..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                />
              </div>
            </div>

            {/* Step 1: Choose Post Type (Bài viết / Hình ảnh / Video) */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase mb-2">
                1. Chọn hình thức nội dung muốn đăng công khai
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPostType("article")}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                    postType === "article"
                      ? "border-[#8B1E1E] bg-[#8B1E1E]/10 text-[#8B1E1E] shadow-xs"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>📝 Đăng Bài Viết</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("photo")}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                    postType === "photo"
                      ? "border-[#8B1E1E] bg-[#8B1E1E]/10 text-[#8B1E1E] shadow-xs"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>📸 Đăng Ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("video")}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                    postType === "video"
                      ? "border-[#8B1E1E] bg-[#8B1E1E]/10 text-[#8B1E1E] shadow-xs"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>🎬 Đăng Video</span>
                </button>
              </div>
            </div>

            {/* Step 2: Select Heritage Station & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                  2. Gắn với địa điểm tại Đền Hai Bà Trưng
                </label>
                <select
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:border-[#8B1E1E]"
                >
                  {INITIAL_POIS.map((poi) => (
                    <option key={poi.id} value={poi.id}>
                      Trạm {poi.order}: {poi.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                  3. Chủ đề bài đăng
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as StudentPost["category"])}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:border-[#8B1E1E]"
                >
                  <option value="Cảm nhận di sản">Cảm nhận di sản</option>
                  <option value="Góc vẽ sáng tạo">Góc vẽ sáng tạo / Ảnh chụp</option>
                  <option value="Kể chuyện lịch sử">Kể chuyện lịch sử / Video</option>
                  <option value="Tìm hiểu di vật">Tìm hiểu di vật</option>
                  <option value="Em yêu di sản Mê Linh">Em yêu di sản Mê Linh</option>
                </select>
              </div>
            </div>

            {/* Step 3: Title & Content */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                4. Tiêu đề bài đăng *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Cảm nhận của em khi tham quan Đền Hai Bà Trưng – Mê Linh..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                5. Nội dung chia sẻ công khai *
              </label>
              <textarea
                rows={4}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Viết bài cảm nhận, thuyết minh cho bức ảnh hoặc giới thiệu nội dung video của em..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#8B1E1E]"
                required
              />
            </div>

            {/* Step 4A: Photo Upload (shown for "photo" or optional attachment for "article") */}
            {(postType === "photo" || postType === "article") && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-stone-700 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#8B1E1E]" />
                    <span>
                      {postType === "photo"
                        ? "Tải ảnh từ thiết bị hoặc dán link ảnh *"
                        : "Đính kèm hình ảnh minh họa (Tùy chọn)"}
                    </span>
                  </span>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="px-4 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#6E1616] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#F3D27A]" />
                    <span>
                      {isUploadingMedia ? "Đang tải ảnh lên..." : "Chọn file Ảnh từ máy/điện thoại"}
                    </span>
                  </button>
                </div>

                {uploadedFileName && postType !== "video" && (
                  <div className="text-xs font-bold text-emerald-700">
                    ✓ Đã chọn tệp ảnh: {uploadedFileName}
                  </div>
                )}

                <input
                  type="text"
                  value={mediaPreviewUrl}
                  onChange={(e) => setMediaPreviewUrl(e.target.value)}
                  placeholder="Hoặc dán đường dẫn URL hình ảnh vào đây..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium"
                />

                {/* Quick sample photo selector */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-500">
                    Hoặc chọn nhanh ảnh tư liệu Đền Hai Bà Trưng:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_HERITAGE_PHOTOS.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => setMediaPreviewUrl(sample.url)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          mediaPreviewUrl === sample.url
                            ? "bg-[#8B1E1E] text-white border-[#8B1E1E]"
                            : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {mediaPreviewUrl && (
                  <div className="relative h-52 rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-stone-900">
                    <img
                      src={mediaPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPreviewUrl("");
                        setUploadedFileName("");
                      }}
                      className="absolute top-2.5 right-2.5 px-3 py-1 rounded-xl bg-black/70 text-white text-xs font-bold cursor-pointer"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4B: Video Upload / YouTube Link (shown for "video") */}
            {postType === "video" && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-stone-700 uppercase flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#8B1E1E]" />
                    <span>Tải file Video từ máy/điện thoại hoặc dán link YouTube *</span>
                  </span>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="px-4 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#6E1616] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#F3D27A]" />
                    <span>
                      {isUploadingMedia ? "Đang tải video lên..." : "Chọn file Video (MP4/MOV/WebM)"}
                    </span>
                  </button>
                </div>

                {uploadedFileName && (
                  <div className="text-xs font-bold text-emerald-700">
                    ✓ Đã tải tệp video: {uploadedFileName}
                  </div>
                )}

                <div className="relative">
                  <Link2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={videoPreviewUrl}
                    onChange={(e) => setVideoPreviewUrl(e.target.value)}
                    placeholder="Hoặc dán link YouTube (VD: https://www.youtube.com/watch?v=...) hoặc link file .mp4"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-medium"
                  />
                </div>

                {/* Quick sample video selector */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-500">
                    Hoặc chọn nhanh video tư liệu Đền Hai Bà Trưng:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_HERITAGE_VIDEOS.map((vid) => (
                      <button
                        key={vid.label}
                        type="button"
                        onClick={() => setVideoPreviewUrl(vid.url)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          videoPreviewUrl === vid.url
                            ? "bg-[#8B1E1E] text-white border-[#8B1E1E]"
                            : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        🎬 {vid.label}
                      </button>
                    ))}
                  </div>
                </div>

                {videoPreviewUrl && (
                  <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-black aspect-video max-h-64">
                    {isDirectVideoFile(videoPreviewUrl) ? (
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={normalizeVideoUrl(videoPreviewUrl)}
                        title="Xem trước video"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Bài đăng sẽ được hiển thị công khai ngay trên Bảng tin Học sinh và cộng thêm{" "}
                  <strong className="text-[#8B1E1E]">+40 XP</strong>!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMedia}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-amber-700 hover:brightness-110 text-white text-xs sm:text-sm font-extrabold shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#F3D27A]" />
                  <span>Đăng Công Khai Ngay (+40 XP)</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Teacher / Admin Moderation Toolbar */}
      {(userRole === "teacher" || userRole === "admin") && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#8B1E1E]">
            <Filter className="w-4 h-4" />
            <span>CHẾ ĐỘ GIÁO VIÊN / QUẢN TRỊ: QUẢN LÝ BÀI ĐĂNG & BÌNH LUẬN HỌC SINH</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#8B1E1E] text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {st === "ALL"
                  ? "Tất cả bài"
                  : st === "APPROVED"
                  ? "Đang công khai"
                  : st === "PENDING"
                  ? "Chờ duyệt"
                  : "Đã ẩn"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category & Station Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playClick();
                setActiveCategory(cat);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#8B1E1E] text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-amber-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Compass className="w-4 h-4 text-[#8B1E1E]" />
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none focus:border-[#8B1E1E]"
          >
            <option value="all">Tất cả 6 Trạm Di tích</option>
            {INITIAL_POIS.map((poi) => (
              <option key={poi.id} value={poi.id}>
                Trạm {poi.order}: {poi.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visiblePosts.map((post) => {
          const normStatus = getNormalizedStatus(post.status);
          const isCommentsCollapsed = Boolean(collapsedComments[post.id]);

          return (
            <div
              key={post.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                post.isHighlighted ? "border-2 border-[#D4AF37] ring-2 ring-amber-400/20" : "border-stone-200/90"
              }`}
            >
              <div>
                {/* Highlighted / Status Bar */}
                <div className="bg-gradient-to-r from-[#FFF9E6] to-amber-50/70 px-5 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs font-bold text-[#8B1E1E]">
                  <div className="flex items-center gap-1.5">
                    {post.isHighlighted ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                        <span>Tác phẩm tiêu biểu • Triển lãm Di sản Học sinh</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-emerald-800">Bài đăng Học sinh Công khai</span>
                      </>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    {normStatus === "APPROVED" ? "Công khai" : normStatus}
                  </span>
                </div>

                {/* Post Author Header */}
                <div className="p-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1E1E] to-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                      {post.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-stone-900 text-sm">{post.studentName}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                          {post.studentGrade}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                        <span>{post.createdAt}</span>
                        {post.stationTitle && (
                          <>
                            <span>•</span>
                            <span className="text-[#8B1E1E] font-semibold truncate max-w-[200px]">
                              📍 {post.stationTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-amber-50 text-[#8B1E1E] border border-amber-200/60 text-xs font-bold shrink-0">
                    {post.category}
                  </span>
                </div>

                {/* Post Content */}
                <div className="px-5 py-2 space-y-2">
                  <h3 className="font-bold text-stone-900 text-base leading-snug">{post.title}</h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{post.content}</p>
                </div>

                {/* Post Image */}
                {post.imageUrl && !post.videoUrl && (
                  <div className="px-5 pt-3">
                    <div className="rounded-2xl overflow-hidden border border-stone-200 max-h-64 bg-stone-100">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                )}

                {/* Post Video (Supports both uploaded video files & YouTube embeds) */}
                {post.videoUrl && (
                  <div className="px-5 pt-3">
                    <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 aspect-video bg-stone-950 shadow-sm">
                      {isDirectVideoFile(post.videoUrl) ? (
                        <video
                          src={post.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <iframe
                          src={normalizeVideoUrl(post.videoUrl)}
                          title={post.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Post Footer & Public Comments */}
              <div className="p-5 pt-4 mt-2 space-y-3">
                <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        post.isLiked ? "text-rose-600" : "text-stone-500 hover:text-rose-600"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? "fill-rose-600" : ""}`} />
                      <span>{post.likesCount} Yêu thích</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setCollapsedComments((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id]
                        }));
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E1E] hover:underline cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length} Bình luận công khai</span>
                    </button>
                  </div>

                  {/* Teacher / Admin Moderation Controls */}
                  {(userRole === "teacher" || userRole === "admin") && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleHighlight(post.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border cursor-pointer ${
                          post.isHighlighted
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        <span>{post.isHighlighted ? "Bỏ tiêu biểu" : "Chọn tiêu biểu"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        title="Xóa bài"
                        className="p-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Public Comments Section (Visible by default so everyone can read & comment publicly) */}
                {!isCommentsCollapsed && (
                  <div className="pt-2 space-y-2.5 bg-[#FAF8F5] rounded-2xl p-3.5 border border-stone-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B1E1E] flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Bình luận công khai ({post.comments.length})</span>
                      </span>
                      <span className="text-[10px] font-semibold text-stone-500">
                        Hiển thị công khai cho toàn trường
                      </span>
                    </div>

                    {post.comments.length === 0 ? (
                      <p className="text-xs text-stone-400 italic py-1">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận công khai cổ vũ bạn nhé!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {post.comments.map((cmt) => (
                          <div
                            key={cmt.id}
                            className={`p-2.5 rounded-xl text-xs ${
                              cmt.authorRole === "teacher" || cmt.authorRole === "admin"
                                ? "bg-amber-50 border border-amber-200/80"
                                : "bg-white border border-stone-200/70"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-stone-800 flex items-center gap-1">
                                {cmt.authorName}
                                {(cmt.authorRole === "teacher" || cmt.authorRole === "admin") && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#8B1E1E] text-white text-[9px]">
                                    Giáo viên
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-stone-400">{cmt.createdAt}</span>
                            </div>
                            <p className="text-stone-700">{cmt.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Comment Suggestions */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {QUICK_COMMENT_SUGGESTIONS.slice(0, 2).map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddComment(post.id, sug)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-stone-600 hover:text-[#8B1E1E] border border-stone-200 text-[10px] font-semibold transition-colors cursor-pointer text-left truncate max-w-full"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>

                    {/* Public Comment Input Row */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentAuthorName}
                          onChange={(e) => setCommentAuthorName(e.target.value)}
                          placeholder="Tên của bạn..."
                          className="w-32 sm:w-36 px-2.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none focus:border-[#8B1E1E] shrink-0"
                        />
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Viết bình luận công khai..."
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-[#8B1E1E]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 py-2 rounded-xl bg-[#8B1E1E] text-white hover:bg-[#6E1616] transition-colors text-xs font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Gửi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
