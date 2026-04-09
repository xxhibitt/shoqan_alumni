import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing data
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // 1 ADMIN User
  await prisma.user.create({
    data: {
      email: 'admin@shoqanalumni.com',
      passwordHash: 'hashed_password_placeholder',
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'Superuser',
          bio: 'System Administrator for Shoqan Alumni Platform.',
          openToMentoring: false,
        }
      }
    }
  });

  // 2 STUDENT Users
  await prisma.user.create({
    data: {
      email: 'student1@example.com',
      passwordHash: 'hashed_password_placeholder',
      role: Role.STUDENT,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Alikhan',
          lastName: 'Smailov',
          bio: 'High school senior looking for mentorship in engineering.',
          openToMentoring: false,
          activities: ['Math Olympiad', 'Robotics Club'],
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      email: 'student2@example.com',
      passwordHash: 'hashed_password_placeholder',
      role: Role.STUDENT,
      isVerified: false,
      profile: {
        create: {
          firstName: 'Aruzhan',
          lastName: 'Kalykova',
          bio: 'Aspiring medical student, currently in 11th grade.',
          openToMentoring: false,
          activities: ['Biology Club', 'Debates'],
        }
      }
    }
  });

  // 7 ALUMNI Users
  const alumniData = [
    {
      email: 'alumni.harvard@example.com',
      first: 'Dias',
      last: 'Nugmanov',
      uni: 'Harvard University',
      major: 'Computer Science',
      country: 'USA',
      gpa: 4.0,
      sat: 1550,
      ielts: 8.5,
      aid: 'Full Ride',
      gradYear: 2023,
      act: ['Model UN', 'Hackathons', 'Student Council'],
      ach: { awards: ['National Math Olympiad Gold'] },
      links: { linkedin: "https://linkedin.com/in/dias" }
    },
    {
      email: 'alumni.mit@example.com',
      first: 'Madiyar',
      last: 'Bekbolat',
      uni: 'MIT',
      major: 'Mechanical Engineering',
      country: 'USA',
      gpa: 3.9,
      sat: 1530,
      ielts: 8.0,
      aid: 'Partial',
      gradYear: 2022,
      act: ['Robotics', 'Physics Olympiad'],
      ach: { projects: ['Autonomous Drone'] },
      links: { tg: "@madiyar_b" }
    },
    {
      email: 'alumni.nus@example.com',
      first: 'Zarina',
      last: 'Omarova',
      uni: 'National University of Singapore (NUS)',
      major: 'Economics',
      country: 'Singapore',
      gpa: 3.8,
      sat: 1480,
      ielts: 7.5,
      aid: 'Full Ride (ASEAN Scholarship)',
      gradYear: 2024,
      act: ['Debates', 'Economics Society'],
      ach: { awards: ['Best Delegate MUN'] },
      links: { insta: "@zari_omar" }
    },
    {
      email: 'alumni.ucl@example.com',
      first: 'Amina',
      last: 'Tolegen',
      uni: 'UCL (University College London)',
      major: 'Law',
      country: 'UK',
      gpa: 3.7,
      ielts: 8.0,
      aid: 'Self-funded',
      gradYear: 2025,
      act: ['Internship at Law Firm', 'Debates'],
      ach: { awards: ['Moot Court Finalist'] },
      links: { linkedin: "https://linkedin.com/in/amina_t" }
    },
    {
      email: 'alumni.kaist@example.com',
      first: 'Nurasyl',
      last: 'Kanat',
      uni: 'KAIST',
      major: 'Electrical Engineering',
      country: 'South Korea',
      gpa: 3.85,
      sat: 1500,
      ielts: 7.5,
      aid: 'Full Ride',
      gradYear: 2023,
      act: ['Korean Language Club', 'Tech Internship'],
      ach: { projects: ['Smart Home IoT'] },
      links: { "github": "https://github.com/nurasyl" }
    },
    {
      email: 'alumni.stanford@example.com',
      first: 'Dariga',
      last: 'Ermekova',
      uni: 'Stanford University',
      major: 'Biology',
      country: 'USA',
      gpa: 4.0,
      sat: 1580,
      ielts: 8.5,
      aid: 'Full Ride',
      gradYear: 2021,
      act: ['Volunteering', 'Research Assistant'],
      ach: { publications: ['Nature Genetics Co-Author'] },
      links: { linkedin: "https://linkedin.com/in/dariga" }
    },
    {
      email: 'alumni.nu@example.com',
      first: 'Sanzhar',
      last: 'Bolatov',
      uni: 'Nazarbayev University',
      major: 'Data Science',
      country: 'Kazakhstan',
      gpa: 3.6,
      ielts: 7.0,
      aid: 'State Grant',
      gradYear: 2026,
      act: ['Chess Club', 'Hackathons'],
      ach: { Hackathons: ['NU Hackathon Winner'] },
      links: { tg: "@SanzharData" }
    }
  ];

  for (const al of alumniData) {
    await prisma.user.create({
      data: {
        email: al.email,
        passwordHash: 'hashed_password_placeholder',
        role: Role.ALUMNI,
        isVerified: true,
        profile: {
          create: {
            firstName: al.first,
            lastName: al.last,
            bio: `Alumni studying ${al.major} at ${al.uni}.`,
            openToMentoring: true,
            university: al.uni,
            major: al.major,
            countryOfStudy: al.country,
            gpa: al.gpa,
            satScore: al.sat,
            ieltsScore: al.ielts,
            financialAidStatus: al.aid,
            gradYear: al.gradYear,
            activities: al.act,
            achievements: al.ach,
            socialLinks: al.links,
          }
        }
      }
    });
  }

  console.log('Seeding complete! 1 ADMIN, 2 STUDENTs, and 7 ALUMNI users created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
