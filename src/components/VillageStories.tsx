import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, Plus, Upload, Trash2, ArrowLeft, MoreVertical, Eye, Flag } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadUserFile } from "@/lib/supabase/storage";
import { timeAgo as getTimeAgo } from "@/lib/store";
import { checkContentSafety } from "@/lib/moderation";

const dummyStories = [
  {
    id: "1",
    author: "Sarpanch",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    mediaType: "video",
    caption: "Road repairs starting in Ward 4. Please avoid the main junction today.",
    timeAgo: "2h ago",
    isVerified: true,
  },
  {
    id: "2",
    author: "Agri Officer",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    mediaUrl: "https://images.unsplash.com/photo-1592982537447-6f2b6a0a6723?q=80&w=600",
    mediaType: "image",
    caption: "New subsidized seeds available at the panchayat office.",
    timeAgo: "5h ago",
    isVerified: true,
  }
];

export function VillageStories() {
  const [stories, setStories] = useState<any[]>(dummyStories);
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [reactions, setReactions] = useState<Record<string, { username: string; emoji: string }[]>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [storyDuration, setStoryDuration] = useState(7);
  const triggerHaptic = useUIStore((s) => s.triggerHaptic);
  const { user, role, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (activeStory) {
      setIsPaused(false);
      setShowMenu(false);
      setStoryDuration(activeStory.mediaType === "video" ? 35 : 7);
    }
  }, [activeStory]);

  const handlePointerDown = () => {
    setIsPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handlePointerUp = () => {
    setIsPaused(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleAddReaction = (storyId: string, emoji: string) => {
    const currentUsername = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Villager";
    
    setReactions((prev) => {
      const existing = prev[storyId] || [];
      const filtered = existing.filter((r) => r.username !== currentUsername);
      return {
        ...prev,
        [storyId]: [...filtered, { username: currentUsername, emoji }],
      };
    });

    toast.success(`Reacted ${emoji}`);
    triggerHaptic("light");
  };

  const isAdmin = 
    role === "village_admin" || 
    role === "super_admin" || 
    (role as string) === "platform_admin" ||
    profile?.designation === "Sarpanch";

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }
      const img = new Image();
      const blobUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(blobUrl);
        const MAX_PX = 1280;
        const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.80
        );
      };
      img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
      img.src = blobUrl;
    });

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("village_stories")
          .select(`
            id,
            author_id,
            media_url,
            media_type,
            caption,
            created_at,
            profiles:author_id (
              full_name,
              photo_url,
              role,
              is_verified,
              designation
            )
          `)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });

        if (data && !error) {
          const mapped = data.map((s: any) => {
            const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
            return {
              id: s.id,
              author: p?.full_name || p?.designation || "Official",
              avatarUrl: p?.photo_url || "https://i.pravatar.cc/150?img=11",
              mediaUrl: s.media_url,
              mediaType: s.media_type as "image" | "video",
              caption: s.caption || "",
              timeAgo: getTimeAgo(new Date(s.created_at).getTime()),
              isVerified: p?.is_verified || false,
              authorId: s.author_id,
            };
          });
          setStories([...mapped, ...dummyStories]);
        }
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      }
    };
    fetchStories();
  }, []);

  const handleStoryClick = (story: any) => {
    triggerHaptic("medium");
    setActiveStory(story);
  };

  const closeStory = () => {
    triggerHaptic("light");
    setActiveStory(null);
  };

  const handleDeleteStory = async (storyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    
    // Immediately remove from UI
    setStories(s => s.filter(x => x.id !== storyId));
    if (activeStory?.id === storyId) setActiveStory(null);

    // Also delete from database if it's not a static dummy story
    if (storyId !== "1" && storyId !== "2") {
      try {
        await (supabase as any).from("village_stories").delete().eq("id", storyId);
        toast.success("Story deleted.");
      } catch (err) {
        console.error("Delete story error:", err);
      }
    } else {
      toast.success("Demo story removed.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const caption = window.prompt("Enter a description for your update:");
    if (caption === null) return; // Cancelled
    
    if (caption) {
      const safety = await checkContentSafety(caption);
      if (!safety.isSafe) {
        toast.error(safety.reason || "Inappropriate language detected.");
        return;
      }
    }
    
    const isVideo = file.type.startsWith("video/");
    
    toast.promise(
      async () => {
        // 1. Fast client-side image compression for ultra-fast uploads
        const fileToUpload = isVideo ? file : await compressImage(file);
        
        // 2. Upload to Supabase Storage
        const uploaded = await uploadUserFile("events", user.id, fileToUpload);
        
        // 3. Build insert payload
        const villageId = profile?.village_id;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const payload: Record<string, any> = {
          author_id: user.id,
          media_url: uploaded.url,
          media_type: isVideo ? "video" : "image",
          caption: caption || null,
          expires_at: expiresAt,
        };

        if (villageId) {
          payload.village_id = villageId;
        }
        
        const { error } = await (supabase as any).from("village_stories").insert(payload);
        
        if (error) {
          console.error("[VillageStories] insert error:", JSON.stringify(error));
          throw error;
        }
        
        // 4. Add to UI immediately
        const newStory = {
          id: Date.now().toString(),
          author: profile?.full_name || profile?.designation || role || "Official",
          avatarUrl: profile?.photo_url || "https://i.pravatar.cc/150?img=11",
          mediaUrl: uploaded.url,
          mediaType: isVideo ? "video" : "image",
          caption: caption || "New village update",
          timeAgo: "Just now",
          isVerified: true,
          authorId: user.id,
        };
        setStories(prev => [newStory, ...prev]);

        // 5. Dispatch instant live notifications to all villagers in this village!
        try {
          const authorName = profile?.full_name || profile?.designation || role || "Village Official";
          let notifQuery = (supabase as any).from("profiles").select("id");
          if (villageId) {
            notifQuery = notifQuery.eq("village_id", villageId);
          }
          const { data: villagers } = await notifQuery;

          if (villagers && villagers.length > 0) {
            const notifItems = villagers
              .filter((v: any) => v.id !== user.id)
              .map((v: any) => ({
                recipient_id: v.id,
                created_by: user.id,
                village_id: villageId || null,
                title: `📸 New Update from ${authorName}`,
                body: caption ? `"${caption}"` : "A new story update was posted in your village. Tap to view!",
                type: "story",
                action_url: "/timeline",
              }));

            if (notifItems.length > 0) {
              await (supabase as any).from("notifications").insert(notifItems);
            }
          }
        } catch (notifErr) {
          console.warn("[VillageStories] Story notification warning:", notifErr);
        }
      },
      {
        loading: isVideo ? "Uploading video..." : "Optimizing & posting update...",
        success: "Story posted successfully! Live for 24 hours.",
        error: (err: any) => `Error [${err.code || "Upload"}]: ${err.message || "Failed to post story."}`
      }
    );
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  return (
    <div className="w-full bg-transparent pb-4 pt-2">
      {/* Scrollable Avatars */}
      <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 no-scrollbar snap-x items-start">
        
        {/* Admin Post Button */}
        {isAdmin && (
          <div className="snap-start flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative size-[68px] rounded-full border-2 border-dashed border-primary/50 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary transition group"
            >
              <Plus className="size-6 group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-md">
                <Upload className="size-3" />
              </div>
            </button>
            <span className="text-[10px] font-bold text-primary mt-1">Post Update</span>
            <input 
              type="file" 
              accept="video/*,image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleUpload}
            />
          </div>
        )}

        {/* Admin Trash Icon overlay on story circle */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => handleStoryClick(story)}
            className="snap-start flex flex-col items-center gap-1 cursor-pointer shrink-0"
          >
            <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-emerald-500">
              <div className="bg-background rounded-full p-[2px]">
                <img
                  src={story.avatarUrl}
                  alt={story.author}
                  className="size-16 rounded-full object-cover shadow-sm border border-border"
                />
              </div>
              {story.isVerified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 shadow-md">
                  <ShieldCheck className="size-3" />
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={(e) => handleDeleteStory(story.id, e)}
                  title="Delete Story"
                  className="absolute -top-1 -right-1 z-10 bg-red-500 hover:scale-110 text-white rounded-full p-1 shadow-md transition"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
            <span className="text-[10px] font-semibold text-foreground/80 truncate max-w-[70px] text-center">
              {story.author}
            </span>
          </div>
        ))}
      </div>

      {/* Fullscreen WhatsApp Status Style Story Viewer via Portal to document.body */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {activeStory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="fixed inset-0 z-[9999999] flex flex-col bg-black text-white overflow-hidden select-none"
            >
              {/* Top Bar: Progress Bar + User Info + 3-Dots Menu + Close/Back */}
              <div className={`absolute top-0 inset-x-0 z-30 flex flex-col bg-gradient-to-b from-black/95 via-black/50 to-transparent pt-3 pb-8 px-4 transition-opacity duration-200 ${isPaused ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                
                {/* Progress Segment */}
                <div className="w-full bg-white/20 h-1 rounded-full mb-3 overflow-hidden">
                  <motion.div
                    key={activeStory.id}
                    initial={{ width: "0%" }}
                    animate={{ width: isPaused ? undefined : "100%" }}
                    transition={{ duration: storyDuration, ease: "linear" }}
                    onAnimationComplete={() => {
                      if (!isPaused && activeStory.mediaType !== "video") {
                        closeStory();
                      }
                    }}
                    className="bg-white h-full rounded-full"
                  />
                </div>

                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Back Arrow Button */}
                    <button
                      onClick={closeStory}
                      className="grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 active:scale-95 transition"
                      aria-label="Back"
                    >
                      <ArrowLeft className="size-5" />
                    </button>

                    <img
                      src={activeStory.avatarUrl}
                      className="size-10 rounded-full border border-white/30 object-cover"
                      alt={activeStory.author}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white drop-shadow">
                        {activeStory.author}
                        {activeStory.isVerified && <ShieldCheck className="size-4 text-blue-400 fill-blue-500/20" />}
                      </div>
                      <span className="text-white/70 text-xs">{activeStory.timeAgo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    {/* WhatsApp 3-Dots Menu Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu((prev) => !prev);
                      }}
                      className="grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 transition"
                      title="More Options"
                    >
                      <MoreVertical className="size-5" />
                    </button>

                    {/* WhatsApp Style 3-Dots Dropdown Menu */}
                    {showMenu && (
                      <div className="absolute top-11 right-0 w-44 rounded-2xl bg-zinc-900/95 border border-white/15 text-white shadow-2xl p-1.5 z-50 backdrop-blur-xl">
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              setShowMenu(false);
                              handleDeleteStory(activeStory.id, e);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-xl transition font-medium"
                          >
                            <Trash2 className="size-4" />
                            Delete Update
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            toast.success("Story reported for review.");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 rounded-xl transition"
                        >
                          <Flag className="size-4" />
                          Report Update
                        </button>
                      </div>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={closeStory}
                      className="grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 transition"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Media Area (Full Screen Center) */}
              <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
                {activeStory.mediaType === "video" ? (
                  <video
                    ref={videoRef}
                    src={activeStory.mediaUrl}
                    autoPlay
                    playsInline
                    controls
                    onLoadedMetadata={(e) => {
                      const dur = e.currentTarget.duration;
                      if (dur && !isNaN(dur) && isFinite(dur)) {
                        setStoryDuration(Math.max(5, Math.ceil(dur)));
                      }
                    }}
                    onEnded={closeStory}
                    className="w-full h-full object-contain max-h-screen"
                  />
                ) : (
                  <img
                    src={activeStory.mediaUrl}
                    alt={activeStory.caption}
                    className="w-full h-full object-contain max-h-screen"
                  />
                )}
              </div>

              {/* Bottom Caption, Reactions & Who Reacted List (WhatsApp Status Style) */}
              <div className={`absolute bottom-0 inset-x-0 z-30 flex flex-col items-center bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-12 pb-6 px-4 gap-3 transition-opacity duration-200 ${isPaused ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                {/* Caption Text - High Contrast & Large */}
                {activeStory.caption && (
                  <div className="w-full max-w-lg bg-black/60 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-center shadow-xl">
                    <p className="text-sm md:text-base font-semibold text-white leading-relaxed">
                      {activeStory.caption}
                    </p>
                  </div>
                )}

                {/* Who Reacted Display with Usernames */}
                {(reactions[activeStory.id]?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/90 shadow-md">
                    <Eye className="size-3.5 text-emerald-400" />
                    <span className="font-medium">
                      Reacted:{" "}
                      {reactions[activeStory.id]
                        .map((r) => `${r.emoji} ${r.username}`)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {/* WhatsApp Quick Emoji Reactions */}
                <div className="flex items-center justify-center gap-3 w-full max-w-sm pt-1">
                  {["❤️", "🙏", "👏", "👍", "🔥", "😮"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddReaction(activeStory.id, emoji);
                      }}
                      className="text-xl p-2 rounded-full bg-white/10 hover:bg-white/25 active:scale-125 transition backdrop-blur-sm shadow-md"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
