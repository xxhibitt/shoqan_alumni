"use client";

import { motion } from "framer-motion";
import { ProfileCard } from "./ProfileCard";

type FeedGridProps = {
  alumni: any[];
};

export function FeedGrid({ alumni }: FeedGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  if (alumni.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
        <p className="text-zinc-500 dark:text-zinc-400">No verified alumni found.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {alumni.map((profile, index) => (
        <ProfileCard key={profile.userId} profile={profile} index={index} />
      ))}
    </motion.div>
  );
}
