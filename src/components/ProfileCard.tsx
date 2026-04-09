"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe, GraduationCap, LinkIcon, Mail, Send } from "lucide-react";
import Image from "next/image";

type ProfileCardProps = {
  profile: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
    bio?: string | null;
    university?: string | null;
    major?: string | null;
    countryOfStudy?: string | null;
    gpa?: number | null;
    satScore?: number | null;
    ieltsScore?: number | null;
    financialAidStatus?: string | null;
    gradYear?: number | null;
    activities?: string[] | any; // Json array in DB
    achievements?: any; // Json object in DB
    socialLinks?: any; // Json object in DB (tg, insta, linkedin)
    openToMentoring?: boolean;
  };
  index: number;
};

export function ProfileCard({ profile, index }: ProfileCardProps) {
  // Stagger animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.1, ease: "easeOut" } },
  };

  const hasStats = profile.gpa || profile.satScore || profile.ieltsScore || profile.financialAidStatus;
  const activitiesArray = Array.isArray(profile.activities) ? profile.activities : [];

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/60 p-6 text-left shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-zinc-800/60 dark:bg-zinc-900/40 dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] dark:hover:border-zinc-700 dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)]"
    >
      {/* Glow Effect behind the card on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/[0.03]" />

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 shadow-sm border border-black/5 dark:border-white/5">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.firstName}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium tracking-tight text-zinc-600 dark:text-zinc-300">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {profile.firstName} {profile.lastName}
                </h3>
                <CheckCircle2 className="h-4 w-4 text-blue-500" fill="currentColor" opacity={0.2} />
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <GraduationCap className="h-4 w-4" />
                <span>
                  {profile.university} {profile.gradYear ? `'${profile.gradYear.toString().slice(-2)}` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Major & Bio */}
        <div className="mb-2">
          {profile.major && (
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {profile.major} {profile.countryOfStudy && <span className="text-zinc-400 font-normal">in {profile.countryOfStudy}</span>}
            </p>
          )}
          {profile.bio && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats Row */}
        {hasStats ? (
          <div className="flex flex-wrap gap-2">
            {profile.gpa && (
              <span className="inline-flex items-center rounded-md border border-emerald-200/50 bg-emerald-50/50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-300">
                GPA: {profile.gpa}
              </span>
            )}
            {profile.satScore && (
              <span className="inline-flex items-center rounded-md border border-blue-200/50 bg-blue-50/50 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300">
                SAT: {profile.satScore}
              </span>
            )}
            {profile.ieltsScore && (
              <span className="inline-flex items-center rounded-md border border-purple-200/50 bg-purple-50/50 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-300">
                IELTS: {profile.ieltsScore}
              </span>
            )}
            {profile.financialAidStatus && (
              <span className="inline-flex items-center rounded-md border border-amber-200/50 bg-amber-50/50 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-300">
                {profile.financialAidStatus}
              </span>
            )}
          </div>
        ) : null}

        {/* Tags Row */}
        {activitiesArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1 border-t border-zinc-100 pt-4 dark:border-zinc-800/50">
            {activitiesArray.slice(0, 3).map((act: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {act}
              </span>
            ))}
            {activitiesArray.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                +{activitiesArray.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          {profile.openToMentoring ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Open to Mentoring
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
              Busy
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
          {profile.socialLinks?.linkedin && (
            <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
              <Globe className="h-4 w-4" />
            </a>
          )}
          {profile.socialLinks?.tg && (
            <a href={`https://t.me/${profile.socialLinks.tg.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
              <Send className="h-4 w-4" />
            </a>
          )}
          {profile.socialLinks?.insta && (
            <a href={`https://instagram.com/${profile.socialLinks.insta.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-pink-600 transition-colors">
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
          <a href={`mailto:${profile.email}`} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
