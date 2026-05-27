"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { useRouter } from "next/navigation";

export function CreatePostModal() {
  const { isCreatePostOpen, setIsCreatePostOpen, showToast } = useDashboard();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCreatePostOpen(false);
    };
    if (isCreatePostOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isCreatePostOpen, setIsCreatePostOpen]);

  const handleSubmit = async () => {
    if (!title || !content) return;

    try {
      setIsSubmitting(true);
      let imageUrl = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file, "post-cover.jpg");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const tagsArray = tags.split(",").map((t) => t.trim()).filter((t) => t);

      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags: tagsArray,
          imageUrl,
          type: "Announcement",
        }),
      });

      if (postRes.ok) {
        setTitle("");
        setContent("");
        setTags("");
        setFile(null);
        setIsCreatePostOpen(false);
        router.refresh();
      } else {
        const errData = await postRes.json();
        console.error("Post creation failed:", errData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreatePostOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0f1915] shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a110e]">
              <h2 className="text-xl font-bold text-white">Create Admin Post</h2>
              <button
                onClick={() => setIsCreatePostOpen(false)}
                className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Software Engineering Internships"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Description
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share the details..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. #Tech, #Almaty, #Internship"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Cover Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      if (file.name.toLowerCase().endsWith(".heic")) {
                        showToast("HEIC format is not supported. Please upload a JPG or PNG.");
                        e.target.value = "";
                        return;
                      }
                      setFile(file);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors group"
                >
                  <ImageIcon className="h-8 w-8 text-white/30 group-hover:text-emerald-500 mb-2 transition-colors" />
                  <span className="text-sm font-medium text-white/50 group-hover:text-emerald-400 transition-colors">
                    {file ? file.name : "Click to upload image"}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#0a110e] flex justify-end gap-3">
              <button
                onClick={() => setIsCreatePostOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title || !content}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
              >
                {isSubmitting ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
