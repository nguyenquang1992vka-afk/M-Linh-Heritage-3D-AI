import React, { useState } from "react";
import { StudentPost, MediaItem } from "../types";
import { 
  Award, 
  Crown, 
  Eye, 
  Image as ImageIcon, 
  Maximize2, 
  Music, 
  Newspaper, 
  Sparkles, 
  Star, 
  Trophy, 
  Video, 
  X 
} from "lucide-react";
import { HeritageAudioPlayer } from "./HeritageAudioPlayer";

interface HeritageExhibitionGalleryProps {
  posts: StudentPost[];
}

export const HeritageExhibitionGallery: React.FC<HeritageExhibitionGalleryProps> = ({ posts }) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [presentationPost, setPresentationPost] = useState<StudentPost | null>(null);

  // Exhibition items are posts that are APPROVED and either marked for exhibition or highlighted/approved
  const exhibitionPosts = posts.filter(
    (p) =>
      p.status === "APPROVED" ||
      p.status === ("Đã duyệt" as any) ||
      p.featuredInExhibition ||
      p.isHighlighted
  );

  const filteredPosts = exhibitionPosts.filter((p) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "images") return p.imageUrl;
    if (activeCategory === "videos") return p.videoUrl;
    if (activeCategory === "audios") return p.audioUrl;
    if (activeCategory === "highlighted") return p.isHighlighted || p.featuredInExhibition;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Gallery Header */}
      <div className="bg-[#9E2A2B] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C9A227] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
          <Trophy className="w-56 h-56 text-[#C9A227]" />
        </div>

        <div className="relative space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#C9A227] text-[#9E2A2B] text-xs font-bold border border-white">
              🏛️ TRIỂN LÃM DI SẢN SỐ
            </span>
            <span className="px-3 py-1 rounded-full bg-[#2F6F68] text-white text-xs font-bold border border-[#C9A227]">
              MÊ LINH SMART HERITAGE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8F4E8]">
            # GÓC TRIỂN LÃM DI SẢN HỌC SINH
          </h1>

          <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">
            Nơi trưng bày các tác phẩm xuất sắc nhất được Giáo viên lựa chọn: Tranh vẽ Voi Chiến, Video thuyết minh di tích, Audio cảm nhận và các bài nghiên cứu tiêu biểu của học sinh Mê Linh!
          </p>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#C9A227]/50 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "🌟 Tất cả sản phẩm" },
            { id: "images", label: "📷 Ảnh đẹp" },
            { id: "videos", label: "🎬 Video hay" },
            { id: "audios", label: "🎧 Thuyết minh hay" },
            { id: "highlighted", label: "🏆 Tác phẩm xuất sắc" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                activeCategory === cat.id
                  ? "bg-[#9E2A2B] text-white border-[#C9A227] shadow-xs"
                  : "bg-[#F8F4E8] text-[#5A4032] border-stone-200 hover:border-[#9E2A2B]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Presentation Button */}
        {filteredPosts.length > 0 && (
          <button
            onClick={() => setPresentationPost(filteredPosts[0])}
            className="px-4 py-2 rounded-xl bg-[#2F6F68] text-white text-xs font-bold hover:bg-[#1E4E48] transition-all flex items-center gap-1.5 border border-[#C9A227] shadow-xs shrink-0"
          >
            <Maximize2 className="w-4 h-4 text-[#C9A227]" />
            <span>Chế độ Trình chiếu Lớp học</span>
          </button>
        )}
      </div>

      {/* Grid Display */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-stone-200 space-y-2">
          <Trophy className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-600">Chưa có sản phẩm triển lãm trong mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl border-2 border-[#C9A227]/60 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Media Header */}
                {post.imageUrl && (
                  <div className="relative aspect-video overflow-hidden bg-stone-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#9E2A2B] text-white px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#C9A227]">
                      {post.category}
                    </div>
                  </div>
                )}

                {post.videoUrl && (
                  <div className="relative aspect-video bg-black overflow-hidden">
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

                {/* Content Details */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#9E2A2B] text-white text-xs font-bold flex items-center justify-center border border-[#C9A227]">
                        {post.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#242424]">{post.studentName}</div>
                        <div className="text-[10px] text-stone-500">{post.studentGrade}</div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#C9A227] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#C9A227]" />
                      Xuất sắc
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#9E2A2B] line-clamp-2">{post.title}</h3>

                  <p className="text-xs text-stone-700 leading-relaxed line-clamp-3">{post.content}</p>

                  {post.audioUrl && (
                    <div className="pt-2">
                      <HeritageAudioPlayer title="Nghe bài thuyết minh" audioUrl={post.audioUrl} />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-[#F8F4E8] border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-600">
                  📍 {post.stationTitle || "Di tích Đền Hai Bà Trưng"}
                </span>

                <button
                  onClick={() => setPresentationPost(post)}
                  className="px-3 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-bold hover:bg-[#7A1F20] transition-all flex items-center gap-1 border border-[#C9A227]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Trình chiếu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Classroom Presentation Modal */}
      {presentationPost && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#F8F4E8] max-w-4xl w-full rounded-3xl border-4 border-[#C9A227] shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setPresentationPost(null)}
              className="absolute top-4 right-4 p-2 bg-[#9E2A2B] text-white rounded-full hover:bg-red-700 transition-all border border-[#C9A227]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header Title */}
            <div className="text-center space-y-2 border-b border-[#C9A227]/40 pb-4">
              <span className="px-3 py-1 rounded-full bg-[#9E2A2B] text-white text-xs font-bold border border-[#C9A227]">
                🏆 BÀI TRIỂN LÃM XUẤT SẮC - TRÌNH CHIẾU LỚP HỌC
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#9E2A2B]">{presentationPost.title}</h2>
              <p className="text-xs font-bold text-[#2F6F68]">
                Tác giả: {presentationPost.studentName} ({presentationPost.studentGrade})
              </p>
            </div>

            {/* Media Highlight */}
            {presentationPost.imageUrl && (
              <div className="rounded-2xl overflow-hidden border-2 border-[#C9A227] shadow-md max-h-96">
                <img src={presentationPost.imageUrl} alt={presentationPost.title} className="w-full h-full object-contain bg-black" />
              </div>
            )}

            {presentationPost.videoUrl && (
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#C9A227] shadow-md bg-black">
                <iframe
                  src={presentationPost.videoUrl}
                  title={presentationPost.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}

            {presentationPost.audioUrl && (
              <div className="p-4 bg-white rounded-2xl border border-[#C9A227]">
                <HeritageAudioPlayer title="Bản thu âm Audio của học sinh" audioUrl={presentationPost.audioUrl} />
              </div>
            )}

            {/* Content Text */}
            <div className="bg-white p-5 rounded-2xl border border-[#C9A227]/40 space-y-2">
              <h4 className="font-bold text-xs text-[#9E2A2B] uppercase">Nội dung cảm nhận / Nghiên cứu:</h4>
              <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">{presentationPost.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
