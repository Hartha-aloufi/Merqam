// src/app/page.tsx
import Link from 'next/link';
import { getTopics } from '@/utils/mdx';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Bookmark, GraduationCap } from 'lucide-react';

export default async function HomePage() {
  const topics = await getTopics();
  const totalLessons = topics.reduce((acc, topic) => acc + topic.lessons.length, 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 space-y-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Welcome to EduPlatform
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Explore our interactive lessons and enhance your learning journey with video tutorials and comprehensive content.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/topics">
                <Button size="lg" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-4 md:px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <BookOpen className="h-8 w-8" />
              <div className="grid gap-1">
                <CardTitle>{topics.length}</CardTitle>
                <CardDescription>Total Topics</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Bookmark className="h-8 w-8" />
              <div className="grid gap-1">
                <CardTitle>{totalLessons}</CardTitle>
                <CardDescription>Available Lessons</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <GraduationCap className="h-8 w-8" />
              <div className="grid gap-1">
                <CardTitle>Featured Topics</CardTitle>
                <CardDescription>Start with our best content</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured Topics Section */}
      <section className="container px-4 md:px-6 py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Featured Topics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.slice(0, 3).map((topic) => (
            <Card key={topic.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={`/topics/${topic.id}`}>
                  <Button className="w-full gap-2">
                    <BookOpen className="h-4 w-4" />
                    View Lessons ({topic.lessons.length})
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}