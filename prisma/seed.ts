import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Cleaning database...")
  
  // Clean all models, ensuring correct camelCase and pluralization for Prisma's generated methods
  try { await prisma.connectionRequest.deleteMany() } catch (e) {}
  try { await prisma.savedPost.deleteMany() } catch (e) {}
  try { await prisma.savedProfile.deleteMany() } catch (e) {}
  try { await prisma.post.deleteMany() } catch (e) {}
  try { await prisma.alumniData.deleteMany() } catch (e) {}
  try { await prisma.academicData.deleteMany() } catch (e) {}
  try { await prisma.tag.deleteMany() } catch (e) {}
  try { await prisma.university.deleteMany() } catch (e) {}
  try { await prisma.profile.deleteMany() } catch (e) {}
  try { await prisma.user.deleteMany() } catch (e) {}

  console.log("Generating dummy data...")

  // Create explicit tags and universities
  const uni = await prisma.university.upsert({
    where: { name: "Nazarbayev University" },
    update: {},
    create: { name: "Nazarbayev University", country: "Kazakhstan" }
  })

  // Generate 10 Users & Profiles
  const users = []
  for (let i = 0; i < 10; i++) {
    const email = `test${i}@nazarbayev.edu`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: "password123", // Adjusted to passwordHash as per schema
        role: i === 0 ? "ADMIN" : (i % 3 === 0 ? "ALUMNI" : "STUDENT"),
        isVerified: true,
        profile: {
          create: {
            firstName: i % 2 === 0 ? "Alikhan" : "Aruzhan",
            lastName: i % 2 === 0 ? "Smailov" : "Kalykova",
            bio: `I am a driven individual interested in tech and community. Passions include software engineering and making an impact. #${i}`,
            avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=200`,
            bannerUrl: `https://images.unsplash.com/photo-${1600000000000 + i}?auto=format&fit=crop&q=80&w=800`,
            universityId: uni.id,
            socialLinks: {
              tg: i % 2 === 0 ? "alikhan_tg" : "aruzhan_tg"
            },
            tags: {
              connectOrCreate: [
                { where: { name: "SoftwareEngineering" }, create: { name: "SoftwareEngineering" } },
                { where: { name: "MUN" }, create: { name: "MUN" } }
              ]
            },
            academicData: i % 3 !== 0 ? {
              create: {
                satScore: 1500 + i,
                ieltsScore: 7.5,
                intendedMajor: "Computer Science"
              }
            } : undefined,
            alumniData: i % 3 === 0 ? {
              create: {
                jobTitle: "Software Engineer at Google",
                currentCompany: "Google",
                isMentoring: true
              }
            } : undefined
          }
        }
      }
    });
    users.push(user);
  }

  // Generate Posts
  const admin = users[0];
  for (let i = 0; i < 5; i++) {
    await prisma.post.create({
      data: {
        title: `Important Announcement ${i + 1}`,
        content: `We are excited to announce our upcoming networking event in Astana. Please RSVP and connect with fellow alumni!`,
        type: "ANNOUNCEMENT",
        authorId: admin.id,
        tags: {
          connectOrCreate: [
            { where: { name: "Event" }, create: { name: "Event" } }
          ]
        }
      }
    });
  }

  console.log("Database seeded successfully with realistic data!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Seed error:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
