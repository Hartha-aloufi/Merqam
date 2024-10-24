// src/app/topics/[topicId]/page.tsx
import { getTopics, getLessons } from '@/utils/mdx';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, CheckCircle2, ArrowLeft } from 'lucide-react';

export default async function TopicPage({ params }: { params: { topicId: string } }) {
  const topics = await getTopics();
  const topic = topics.find(t => t.id === params.topicId);
  const lessons = getLessons(params.topicId);
  
  if (!topic) return null;
  
  return (
    <div className="container px-4 py-8">
      {/* Topic Header */}
      <div className="relative mb-12 pb-8 border-b">
        <Link 
          href="/topics"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة إلى المواضيع
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {topic.description}
            </p>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>{lessons.length} دروس</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Link key={lesson.id} href={`/topics/${params.topicId}/${lesson.id}`}>
              <div className="group relative rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -z-10 transition-all duration-200 group-hover:scale-150" />
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {index + 1}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>درس تفاعلي</span>
                      </div>
                      {lesson.youtubeUrl && (
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          <span>فيديو تعليمي</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ابدأ الدرس
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}