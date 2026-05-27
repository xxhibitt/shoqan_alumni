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
    activities?: string[] | any;
    achievements?: any;
    socialLinks?: any;
    openToMentoring?: boolean;
  };
  index: number;
};

export function ProfileCard({ profile, index }: ProfileCardProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.1 } },
  };

  const hasStats = profile.gpa || profile.satScore || profile.ieltsScore || profile.financialAidStatus;
  const activitiesArray = Array.isArray(profile.activities) ? profile.activities : [];

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/20"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-white/10 to-transparent shadow-sm border border-white/10">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.firstName}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium tracking-tight text-white/70">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  {profile.firstName} {profile.lastName}
                </h3>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" fill="currentColor" opacity={0.4} />
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-white/70">
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
            <p className="text-sm font-medium text-white/70">
              {profile.major} {profile.countryOfStudy && <span className="text-white/50 font-normal">in {profile.countryOfStudy}</span>}
            </p>
          )}
          {profile.bio && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/50">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats Row */}
        {hasStats ? (
          <div className="flex flex-wrap gap-2">
            {profile.gpa && (
              <span className="inline-flex items-center rounded-md border border-emerald-900/40 bg-emerald-900/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                GPA: {profile.gpa}
              </span>
            )}
            {profile.satScore && (
              <span className="inline-flex items-center rounded-md border border-blue-900/40 bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                SAT: {profile.satScore}
              </span>
            )}
            {profile.ieltsScore && (
              <span className="inline-flex items-center rounded-md border border-purple-900/40 bg-purple-900/20 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                IELTS: {profile.ieltsScore}
              </span>
            )}
            {profile.financialAidStatus && (
              <span className="inline-flex items-center rounded-md border border-amber-900/40 bg-amber-900/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                {profile.financialAidStatus}
              </span>
            )}
          </div>
        ) : null}

        {/* Tags Row */}
        {activitiesArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1 border-t border-white/10 pt-4">
            {activitiesArray.slice(0, 3).map((act: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70"
              >
                {act}
              </span>
            ))}
            {activitiesArray.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/50">
                +{activitiesArray.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          {profile.openToMentoring ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Open to Mentoring
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-white/50">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white/20"></span>
              Busy
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 text-white/50">
          {profile.socialLinks?.linkedin && (
            <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-[#0077b5] transition-colors">
              <Globe className="h-4 w-4" />
            </a>
          )}
          {profile.socialLinks?.tg && (
            <a href={`https://t.me/${profile.socialLinks.tg.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-[#229ED9] transition-colors">
              <Send className="h-4 w-4" />
            </a>
          )}
          {profile.socialLinks?.insta && (
            <a href={`https://instagram.com/${profile.socialLinks.insta.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-[#E1306C] transition-colors">
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
          <a href={`mailto:${profile.email}`} className="hover:text-white transition-colors">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
