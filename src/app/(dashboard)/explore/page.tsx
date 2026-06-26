import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

// Тот самый "Ядерный вариант": строго запрещаем серверу рендерить этот компонент
const ExploreClient = dynamic(
  () => import("@/components/explore/ExploreClient").then((mod) => mod.ExploreClient),
  { ssr: false }
);

export default async function ExplorePage() {
  // 1. Проверяем сессию
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 2. Достаем только АКТИВНЫЕ посты (без архива)
  const announcements = await prisma.post.findMany({
    where: {
      type: "ANNOUNCEMENT",
      isArchived: false
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Передаем готовые данные в Клиентский компонент
  return <ExploreClient announcements={announcements} />;
}