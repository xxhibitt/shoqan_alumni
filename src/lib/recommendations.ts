// src/lib/recommendations.ts

export function recommendProfiles(currentUserProfile: any, allProfiles: any[]) {
  if (!currentUserProfile) return allProfiles;

  const userTags = currentUserProfile.tags?.map((t: any) => t.name) || [];
  const userMajor = currentUserProfile.academicData?.intendedMajor || currentUserProfile.alumniData?.jobTitle || "";
  const userUniId = currentUserProfile.universityId;

  const scoredProfiles = allProfiles
    .filter(p => p.id !== currentUserProfile.id)
    .map(p => {
      let score = 0;

      // Same University
      if (userUniId && p.universityId === userUniId) {
        score += 3;
      }

      // Same Major / Job
      const pMajor = p.academicData?.intendedMajor || p.alumniData?.jobTitle || "";
      if (userMajor && pMajor && pMajor.toLowerCase() === userMajor.toLowerCase()) {
        score += 2;
      }

      // Overlapping Tags
      const pTags = p.tags?.map((t: any) => t.name) || [];
      const overlap = pTags.filter((t: string) => userTags.includes(t)).length;
      score += overlap;

      return { profile: p, score };
    });

  // Sort by score descending
  scoredProfiles.sort((a, b) => b.score - a.score);

  return scoredProfiles.map(sp => sp.profile);
}

export function recommendPosts(currentUserProfile: any, allPosts: any[]) {
  if (!currentUserProfile) return allPosts;

  const userTags = currentUserProfile.tags?.map((t: any) => t.name) || [];
  const userMajor = currentUserProfile.academicData?.intendedMajor || currentUserProfile.alumniData?.jobTitle || "";

  const scoredPosts = allPosts.map(post => {
    let score = 0;
    
    const postTags = post.tags?.map((t: any) => t.name) || [];
    const overlap = postTags.filter((t: string) => userTags.includes(t)).length;
    score += overlap * 2;

    if (userMajor && post.title.toLowerCase().includes(userMajor.toLowerCase())) {
      score += 3;
    }

    return { post, score };
  });

  scoredPosts.sort((a, b) => b.score - a.score);
  return scoredPosts.map(sp => sp.post);
}

export function recommendUniversities(currentUserProfile: any, allProfiles: any[]) {
  if (!currentUserProfile || !currentUserProfile.academicData) return [];

  const { gpa, satScore, ieltsScore, intendedMajor } = currentUserProfile.academicData;
  
  // Find profiles with similar stats who went to a university
  const similarAlumni = allProfiles.filter(p => {
    if (!p.university || !p.academicData) return false;
    if (p.id === currentUserProfile.id) return false;

    let matchCount = 0;
    if (gpa && p.academicData.gpa && Math.abs(gpa - p.academicData.gpa) <= 0.3) matchCount++;
    if (satScore && p.academicData.satScore && Math.abs(satScore - p.academicData.satScore) <= 100) matchCount++;
    if (ieltsScore && p.academicData.ieltsScore && Math.abs(ieltsScore - p.academicData.ieltsScore) <= 0.5) matchCount++;
    if (intendedMajor && p.academicData.intendedMajor && intendedMajor.toLowerCase() === p.academicData.intendedMajor.toLowerCase()) matchCount++;

    return matchCount >= 1; // At least one similarity
  });

  const uniCounts: Record<string, number> = {};
  const uniData: Record<string, any> = {};

  similarAlumni.forEach(p => {
    const uni = p.university;
    if (uni) {
      uniCounts[uni.id] = (uniCounts[uni.id] || 0) + 1;
      if (!uniData[uni.id]) uniData[uni.id] = uni;
    }
  });

  const recommendedUnis = Object.keys(uniCounts).map(id => ({
    university: uniData[id],
    score: uniCounts[id]
  }));

  recommendedUnis.sort((a, b) => b.score - a.score);
  return recommendedUnis.map(ru => ru.university);
}
