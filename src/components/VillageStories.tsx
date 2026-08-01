import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play, ShieldCheck, Plus, Upload, Trash2 } from "lucide-react";
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
  const triggerHaptic = useUIStore((s) => s.triggerHaptic);
  const { user, role, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = role === "village_admin" || role === "super_admin" || profile?.designation === "Sarpanch";

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

  const handleDeleteStory = async (storyId: string) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    toast.promise(
      async () => {
        const { error } = await (supabase as any).from("village_stories").delete().eq("id", storyId);
        if (error) throw error;
        setStories(s => s.filter(x => x.id !== storyId));
        setActiveStory(null);
      },
      { loading: "Deleting...", success: "Story deleted.", error: (e:any) => `Failed: ${e.message}` }
    );
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
        // 1. Upload to Supabase Storage
        const uploaded = await uploadUserFile("events", user.id, file);
        
        // 2. Build insert payload — only include village_id if it's a real value
        const villageId = profile?.village_id;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const payload: Record<string, any> = {
          author_id: user.id,
          media_url: uploaded.url,
          media_type: isVideo ? "video" : "image",
          caption: caption || null,
          expires_at: expiresAt,
        };

        // Only attach village_id if profile has a real one
        if (villageId) {
          payload.village_id = villageId;
        }
        
        const { data: insertData, error } = await (supabase as any).from("village_stories").insert(payload).select();
        
        if (error) {
          console.error("[VillageStories] insert error:", JSON.stringify(error));
          throw error;
        }
        
        // 3. Add to UI immediately
        const newStory = {
          id: Date.now().toString(),
          author: profile?.full_name || profile?.designation || role || "Official",
          avatarUrl: profile?.photo_url || "https://i.pravatar.cc/150?img=11",
          mediaUrl: uploaded.url,
          mediaType: isVideo ? "video" : "image",
          caption: caption || "New village update",
          timeAgo: "Just now",
          isVerified: true,
        };
        setStories(prev => [newStory, ...prev]);
      },
      {
        loading: isVideo ? "Uploading video (this may take a moment)..." : "Uploading image...",
        success: "Story posted successfully! Live for 24 hours.",
        error: (err: any) => `Error [${err.code}]: ${err.message || err.hint || "Unknown error. Check browser console."}`
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
            </div>
            <span className="text-[10px] font-semibold text-foreground/80 truncate max-w-[70px] text-center">
              {story.author}
            </span>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal (WhatsApp Status Style) */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent absolute top-0 w-full z-10">
              <div className="flex items-center gap-3">
                <img
                  src={activeStory.avatarUrl}
                  className="size-10 rounded-full border border-white/20"
                  alt={activeStory.author}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-white font-semibold text-sm">
                    {activeStory.author}
                    {activeStory.isVerified && <ShieldCheck className="size-3 text-blue-400" />}
                  </div>
                  <span className="text-white/60 text-xs">{activeStory.timeAgo}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(isAdmin || user?.id === activeStory?.authorId) && (
                  <button
                    onClick={() => handleDeleteStory(activeStory.id)}
                    className="grid size-10 place-items-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/40 transition backdrop-blur-md"
                  >
                    <Trash2 className="size-5" />
                  </button>
                )}
                <button
                  onClick={closeStory}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden px-2">
              {activeStory.mediaType === "video" ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  controls
                  className="max-h-[85vh] w-full max-w-md rounded-2xl object-cover"
                />
              ) : (
                <img
                  src={activeStory.mediaUrl}
                  alt={activeStory.caption}
                  className="max-h-[85vh] w-full max-w-md rounded-2xl object-cover"
                />
              )}
            </div>

            {/* Caption */}
            <div className="absolute bottom-10 w-full px-6 flex justify-center">
              <div className="bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-2xl max-w-md text-center border border-white/10 shadow-2xl">
                <p className="text-sm font-medium">{activeStory.caption}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
