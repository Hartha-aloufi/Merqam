// src/app/admin/topics/page.tsx
import { Metadata } from "next";
import { getTopics } from "@/utils/mdx";
import { TopicsManagement } from "@/components/admin/topics/TopicsManagement";

export const metadata: Metadata = {
  title: "إدارة المواضيع | مِرْقَم",
  description: "إدارة المواضيع والدروس",
};

export default async function AdminTopicsPage() {
  const topics = await getTopics();

  return (
    <div className="container px-4 py-6 md:py-8 mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة المواضيع</h1>
        <p className="text-muted-foreground">
          قم بإدارة المواضيع والدروس من هذه الصفحة
        </p>
      </div>

      <TopicsManagement initialTopics={topics} />
    </div>
  );
}
