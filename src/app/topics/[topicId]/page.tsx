import { getTopics, getLessons } from '@/utils/mdx';
import LessonCard from '@/components/lessons/LessonCard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TopicPageProps {
  params: { topicId: string }
}

export const generateStaticParams = async () => {
  const topics = await getTopics();
  return topics.map(topic => ({ topicId: topic.id }));
};

export default async function TopicPage({ params }: TopicPageProps) {
  const topics = await getTopics();
  const topic = topics.find(t => t.id === params.topicId);
  const lessons = getLessons(params.topicId);
  
  if (!topic) return null;
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{topic.title}</CardTitle>
          <CardDescription>{topic.description}</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map(lesson => (
          <LessonCard 
            key={lesson.id} 
            lesson={lesson} 
            topicId={params.topicId}
          />
        ))}
      </div>
    </div>
  );
}