// src/components/admin/topics/TopicsManagement.tsx
"use client";

import { useState } from "react";
import { Topic } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileEdit,
  Folder,
  ChevronLeft,
  Search,
  PlusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TopicsManagementProps {
  initialTopics: Topic[];
}

export function TopicsManagement({ initialTopics }: TopicsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTopics = initialTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن موضوع..."
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin/generate" className="!text-white hover:text-white">
            <PlusCircle className="ml-2 h-4 w-4" />
            درس جديد
          </Link>
        </Button>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic) => (
          <Card
            key={topic.id}
            className={cn(
              "transition-all duration-200",
              "hover:border-primary/50 hover:shadow-md"
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Folder className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium leading-none line-clamp-1">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {topic.description}
                  </p>
                  <p className="text-sm text-muted-foreground pt-1">
                    {topic.lessons.length} دروس
                  </p>
                </div>
              </div>

              {/* Lessons List */}
              <div className="mt-4 space-y-2">
                {topic.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/admin/topics/${topic.id}/${lesson.id}/edit`}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md",
                      "hover:bg-muted transition-colors duration-200",
                      "text-sm text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileEdit className="h-4 w-4" />
                    <span className="flex-1 line-clamp-1">{lesson.title}</span>
                    <ChevronLeft className="h-4 w-4 opacity-60" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "لا توجد نتائج مطابقة لبحثك" : "لا توجد مواضيع بعد"}
          </p>
        </div>
      )}
    </div>
  );
}
