import { getTopics } from '@/utils/mdx';
import TopicCard from '@/components/topics/TopicCard';

export const generateStaticParams = async () => {
  const topics = await getTopics();
  return topics.map(topic => ({ topicId: topic.id }));
};

export default async function TopicsPage() {
  const topics = await getTopics();
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {topics.map(topic => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
}