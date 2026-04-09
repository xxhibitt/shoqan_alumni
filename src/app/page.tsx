import { PrismaClient } from "@prisma/client";
import { FeedGrid } from "@/components/FeedGrid";

const prisma = new PrismaClient();

// Optional: you can force dynamic rendering if data gets updated often, but caching is fine initially
export const revalidate = 60; // revalidate every 60 seconds

export default async function Home() {
  // Directly fetch from DB avoiding overhead of an HTTP API fetch inside local SSG/SSR
  const verifiedAlumni = await prisma.user.findMany({
    where: {
      role: 'ALUMNI',
      isVerified: true,
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
          university: true,
          major: true,
          countryOfStudy: true,
          gpa: true,
          satScore: true,
          ieltsScore: true,
          financialAidStatus: true,
          gradYear: true,
          activities: true,
          achievements: true,
          socialLinks: true,
          openToMentoring: true,
        },
      },
    },
  });

  // Flatten mapped exactly like API to share uniform client side prop maps
  const formattedAlumni = verifiedAlumni.map((user) => ({
    userId: user.id,
    email: user.email,
    ...user.profile,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-shoqan-dark dark:text-shoqan-light sm:text-5xl">
          Shoqan Walikhanov Alumni Network
        </h1>
        <p className="mt-4 text-lg leading-8 text-shoqan-dark/70 dark:text-shoqan-light/70">
          Discover where Shoqan Walikhanov graduates are heading. Connect with our expansive community of top talent, find dedicated mentorship, and explore incredible achievements at premier universities and global enterprises.
        </p>
      </div>
      
      {/* Interactive Staggered Grid */}
      <FeedGrid alumni={formattedAlumni} />
    </div>
  );
}
