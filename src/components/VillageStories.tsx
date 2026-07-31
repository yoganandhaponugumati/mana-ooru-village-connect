import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play, ShieldCheck } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";

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
  },
  {
    id: "3",
    author: "Primary Health Center",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    mediaUrl: "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=600",
    mediaType: "image",
    caption: "Free eye checkup camp this Sunday! Everyone is welcome.",
    timeAgo: "8h ago",
    isVerified: true,
  },
];

export function VillageStories() {
  const [activeStory, setActiveStory] = useState<typeof dummyStories[0] | null>(null);
  const triggerHaptic = useUIStore((s) => s.triggerHaptic);

  const handleStoryClick = (story: typeof dummyStories[0]) => {
    triggerHaptic("medium");
    setActiveStory(story);
  };

  const closeStory = () => {
    triggerHaptic("light");
    setActiveStory(null);
  };

  return (
    <div className="w-full bg-transparent pb-4 pt-2">
      {/* Scrollable Avatars */}
      <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 no-scrollbar snap-x">
        {dummyStories.map((story) => (
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
              <button
                onClick={closeStory}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md"
              >
                <X className="size-5" />
              </button>
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
