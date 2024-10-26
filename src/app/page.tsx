// src/app/page.tsx
import Link from 'next/link';
import { getTopics } from '@/utils/mdx';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function HomePage() {
  const topics = await getTopics();
  const totalLessons = topics.reduce((acc, topic) => acc + topic.lessons.length, 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="container px-4 mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              منصة التعليم التفاعلية
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              تعلم بطريقة مميزة مع دروس تفاعلية وتمارين عملية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/topics">
                <Button size="lg" className="w-full sm:w-auto">
                  <BookOpen className="ml-2 h-5 w-5" />
                  ابدأ التعلم
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, label: 'المواضيع المتوفرة', value: topics.length },
              { icon: GraduationCap, label: 'الدروس التعليمية', value: totalLessons },
              { icon: Users, label: 'الطلاب النشطين', value: '500+' },
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <div className="bg-background rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Topics */}
      <section className="py-16">
        <div className="container px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">المواضيع المميزة</h2>
            <Link href="/topics">
              <Button variant="ghost" className="group">
                جميع المواضيع
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.slice(0, 3).map((topic, index) => (
              <Link key={topic.id} href={`/topics/${topic.id}`}>
                <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -z-10 transition-all duration-200 group-hover:scale-150" />
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-grow">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {topic.lessons.length} دروس
                      </span>
                      <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                        ابدأ الآن
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}