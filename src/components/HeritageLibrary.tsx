import React, { useState } from "react";
import { MediaItem, StudentPost, HeritagePOI } from "../types";
import { 
  BookOpen, 
  Download, 
  FileText, 
  Filter, 
  Folder, 
  Image as ImageIcon, 
  Library, 
  Music, 
  Newspaper, 
  Search, 
  Sparkles, 
  Video 
} from "lucide-react";
import { HeritageAudioPlayer } from "./HeritageAudioPlayer";

interface HeritageLibraryProps {
  mediaLibrary: MediaItem[];
  studentPosts: StudentPost[];
  pois: HeritagePOI[];
}

export const HeritageLibrary: React.FC<HeritageLibraryProps> = ({
  mediaLibrary,
  studentPosts,
  pois
}) => {
  const [activeTab, setActiveTab] = useState<"teacher" | "student" | "project">("teacher");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "audio" | "document" | "post">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Teacher media items
  const teacherItems = mediaLibrary.filter(
    (m) => m.uploadedBy.includes("Giáo viên") || m.uploaderRole === "teacher"
  );

  // Approved student posts/media
  const studentItems = studentPosts.filter(
    (p) => p.status === "APPROVED" || p.status === ("Đã duyệt" as any)
  );

  // Project documentation / Heritage knowledge
  const projectItems = pois;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#5A4032] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C9A227] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
          <Library className="w-56 h-56 text-[#C9A227]" />
        </div>

        <div className="relative space-y-2 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-[#C9A227] text-[#9E2A2B] text-xs font-bold border border-white">
            📚 KHO TƯ LIỆU SỐ BẢO TÀNG
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8F4E8]">
            # THƯ VIỆN DI SẢN MÊ LINH
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Kho lưu trữ tổng hợp hình ảnh di vật Đông Sơn, video thuyết minh, nhạc kịch hội đền, file MP3 đọc sử và các bài thu hoạch tư liệu của Giáo viên & Học sinh.
          </p>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#C9A227]/50 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "teacher", label: "👩‍🏫 GIÁO VIÊN ĐÓNG GÓP" },
            { id: "student", label: "🎓 HỌC SINH ĐÓNG GÓP" },
            { id: "project", label: "🏛️ TƯ LIỆU DỰ ÁN DÂN TỘC" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? "bg-[#9E2A2B] text-white border-[#C9A227] shadow-xs"
                  : "bg-[#F8F4E8] text-[#5A4032] border-stone-200 hover:border-[#9E2A2B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm tư liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F8F4E8] border border-stone-300 text-xs font-bold focus:outline-none focus:border-[#9E2A2B]"
          />
        </div>
      </div>

      {/* Media Type Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Tất cả tư liệu" },
          { id: "image", label: "📷 Ảnh" },
          { id: "video", label: "🎬 Video" },
          { id: "audio", label: "🎧 Audio MP3" },
          { id: "document", label: "📄 Tài liệu / Sắc phong" },
          { id: "post", label: "📝 Bài viết" }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setTypeFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
              typeFilter === f.id
                ? "bg-[#2F6F68] text-white border-[#C9A227]"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Library Content Grid */}
      {activeTab === "teacher" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teacherItems
            .filter((item) => {
              if (typeFilter !== "all" && item.type !== typeFilter) return false;
              if (searchQuery && !item.caption.toLowerCase().includes(searchQuery.toLowerCase()) && !item.fileName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              return true;
            })
            .map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#C9A227]/50 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  {item.type === "image" && (
                    <img src={item.url} alt={item.caption} className="w-full h-44 object-cover" />
                  )}

                  {item.type === "video" && (
                    <div className="aspect-video bg-black">
                      <iframe
                        src={item.url}
                        title={item.caption}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-[#F8F4E8] text-[#9E2A2B] text-[10px] font-bold border border-[#C9A227]/40">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-stone-500">{item.createdAt}</span>
                    </div>

                    <h4 className="font-bold text-xs text-[#242424]">{item.fileName}</h4>
                    <p className="text-xs text-stone-600 line-clamp-2">{item.caption}</p>

                    {item.type === "audio" && (
                      <HeritageAudioPlayer title={item.fileName} audioUrl={item.url} />
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#F8F4E8] border-t border-stone-200 flex items-center justify-between text-[11px] font-bold text-stone-600">
                  <span>Tải lên bởi: {item.uploadedBy}</span>
                  <a href={item.url} download target="_blank" rel="noreferrer" className="text-[#9E2A2B] hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </a>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "student" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentItems
            .filter((post) => {
              if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              return true;
            })
            .map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9E2A2B]">{post.category}</span>
                  <span className="text-[10px] text-stone-500">{post.studentName} ({post.studentGrade})</span>
                </div>

                <h4 className="font-bold text-sm text-[#242424]">{post.title}</h4>
                <p className="text-xs text-stone-700 leading-relaxed line-clamp-3">{post.content}</p>

                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="w-full h-36 object-cover rounded-xl border border-stone-200" />
                )}

                {post.videoUrl && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-stone-200 bg-black">
                    <iframe
                      src={post.videoUrl}
                      title={post.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}

                {post.audioUrl && (
                  <HeritageAudioPlayer title="Audio thuyết minh" audioUrl={post.audioUrl} />
                )}
              </div>
            ))}
        </div>
      )}

      {activeTab === "project" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectItems.map((poi) => (
            <div key={poi.id} className="bg-white p-5 rounded-2xl border-2 border-[#C9A227]/60 shadow-xs flex flex-col sm:flex-row gap-4">
              <img src={poi.imageUrl} alt={poi.title} className="w-full sm:w-36 h-36 rounded-xl object-cover shrink-0" />
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded bg-[#9E2A2B] text-white text-[10px] font-bold">
                  Trạm {poi.order}: {poi.category}
                </span>
                <h3 className="font-bold text-base text-[#9E2A2B]">{poi.title}</h3>
                <p className="text-xs text-stone-700 line-clamp-3 leading-relaxed">{poi.fullDesc}</p>
                <div className="text-[11px] font-bold text-[#2F6F68]">
                  💡 Góc Sử Học Nhí: {poi.funFact}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
