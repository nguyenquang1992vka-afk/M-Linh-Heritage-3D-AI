import React, { useState } from "react";
import { StudentProfile, StudentPost, HeritageBadge, HeritagePOI } from "../types";
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Crown, 
  Flame, 
  Image as ImageIcon, 
  MapPin, 
  Music, 
  Newspaper, 
  Sparkles, 
  Star, 
  User, 
  Video 
} from "lucide-react";
import { HeritageAudioPlayer } from "./HeritageAudioPlayer";

interface StudentProfileViewProps {
  profile: StudentProfile;
  posts: StudentPost[];
  badges: HeritageBadge[];
  pois: HeritagePOI[];
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  profile,
  posts,
  badges,
  pois
}) => {
  const [activeTab, setActiveTab] = useState<"posts" | "images" | "videos" | "audios" | "badges" | "stations">("posts");

  // Filter student's own posts
  const myPosts = posts.filter(p => p.studentId === profile.id || p.studentName === profile.name);
  const myImages = myPosts.filter(p => p.imageUrl);
  const myVideos = myPosts.filter(p => p.videoUrl);
  const myAudios = myPosts.filter(p => p.audioUrl);

  const unlockedBadges = badges.filter(b => profile.unlockedBadgeIds.includes(b.id));
  const completedPoiObjects = pois.filter(p => profile.completedPOIs.includes(p.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Profile Header Banner */}
      <section className="bg-[#F8F4E8] p-6 sm:p-8 rounded-3xl border-2 border-[#C9A227] shadow-lg flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-[#9E2A2B] pointer-events-none">
          <Crown className="w-64 h-64" />
        </div>

        {/* Student Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#9E2A2B] text-white font-bold text-4xl flex items-center justify-center border-4 border-[#C9A227] shadow-md">
            {profile.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#C9A227] text-[#9E2A2B] p-1.5 rounded-full border-2 border-white shadow-xs">
            <Crown className="w-5 h-5 fill-[#9E2A2B]" />
          </div>
        </div>

        {/* Student Info & Level Stats */}
        <div className="space-y-3 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-[#9E2A2B] text-white text-xs font-bold border border-[#C9A227]">
              {profile.grade}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#2F6F68] text-white text-xs font-bold border border-[#C9A227]">
              {profile.school}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#9E2A2B]">{profile.name}</h1>

          {/* Level Title & XP Bar */}
          <div className="space-y-1 max-w-md">
            <div className="flex items-center justify-between text-xs font-bold text-[#5A4032]">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#C9A227] fill-[#C9A227]" />
                Cấp độ {profile.level}: <span className="text-[#9E2A2B]">{profile.levelTitle}</span>
              </span>
              <span className="font-mono text-[#9E2A2B]">{profile.xp} XP / 500 XP</span>
            </div>

            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden border border-[#C9A227]/50">
              <div
                className="h-full bg-gradient-to-r from-[#9E2A2B] to-[#C9A227] transition-all duration-500"
                style={{ width: `${Math.min(100, (profile.xp / 500) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-[#C9A227]/60 shadow-xs shrink-0 text-center">
          <div>
            <div className="text-xl font-bold text-[#9E2A2B]">{myPosts.length}</div>
            <div className="text-[11px] font-bold text-stone-500">Bài viết</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#2F6F68]">{unlockedBadges.length}</div>
            <div className="text-[11px] font-bold text-stone-500">Huy hiệu</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#C9A227]">{completedPoiObjects.length}/6</div>
            <div className="text-[11px] font-bold text-stone-500">Trạm qua</div>
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-3 rounded-2xl border border-[#C9A227]/50 shadow-xs">
        {[
          { id: "posts", label: "📝 Bài viết", count: myPosts.length },
          { id: "images", label: "🖼️ Tệp ảnh", count: myImages.length },
          { id: "videos", label: "🎬 Video", count: myVideos.length },
          { id: "audios", label: "🎧 Audio MP3", count: myAudios.length },
          { id: "badges", label: "🏆 Huy hiệu", count: unlockedBadges.length },
          { id: "stations", label: "📍 Trạm đã khám phá", count: completedPoiObjects.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === tab.id
                ? "bg-[#9E2A2B] text-white border-[#C9A227] shadow-xs"
                : "bg-[#F8F4E8] text-[#5A4032] border-stone-200 hover:border-[#9E2A2B]"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-[#C9A227] text-black' : 'bg-stone-200 text-stone-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {activeTab === "posts" && (
          <div className="space-y-4">
            {myPosts.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-stone-200 space-y-2">
                <Newspaper className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-600 font-bold">Em chưa đăng bài viết nào!</p>
              </div>
            ) : (
              myPosts.map((post) => (
                <div key={post.id} className="bg-white p-5 rounded-2xl border border-[#C9A227]/50 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#9E2A2B]">{post.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      post.status === "APPROVED" || post.status === ("Đã duyệt" as any)
                        ? "bg-emerald-100 text-emerald-800"
                        : post.status === "PENDING" || post.status === ("Chờ duyệt" as any)
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#242424]">{post.title}</h3>
                  <p className="text-xs text-stone-700 leading-relaxed">{post.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "images" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {myImages.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <div className="font-bold text-xs text-[#9E2A2B] truncate">{p.title}</div>
                  <div className="text-[10px] text-stone-500">{p.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myVideos.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-3 space-y-2">
                <div className="aspect-video rounded-xl bg-black overflow-hidden relative">
                  <iframe src={p.videoUrl} title={p.title} className="w-full h-full" />
                </div>
                <div className="font-bold text-xs text-[#9E2A2B]">{p.title}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "audios" && (
          <div className="space-y-3">
            {myAudios.map((p) => (
              <div key={p.id} className="bg-white p-3 rounded-2xl border border-stone-200">
                <HeritageAudioPlayer title={p.title} audioUrl={p.audioUrl || ""} />
              </div>
            ))}
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {unlockedBadges.map((b) => (
              <div key={b.id} className="bg-[#F8F4E8] p-4 rounded-2xl border-2 border-[#C9A227] flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#9E2A2B] text-white flex items-center justify-center shrink-0 border border-[#C9A227]">
                  <Award className="w-6 h-6 text-[#C9A227]" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#9E2A2B]">{b.title}</div>
                  <div className="text-[11px] text-[#5A4032]">{b.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "stations" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedPoiObjects.map((poi) => (
              <div key={poi.id} className="bg-white p-4 rounded-2xl border border-[#C9A227]/60 flex items-center gap-3 shadow-xs">
                <img src={poi.imageUrl} alt={poi.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div>
                  <div className="font-bold text-xs text-[#9E2A2B]">Trạm {poi.order}: {poi.title}</div>
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã hoàn thành thử thách</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
