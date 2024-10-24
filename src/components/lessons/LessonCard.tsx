import { Lesson } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Book } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  topicId: string;
}

const LessonCard = ({ lesson, topicId }: LessonCardProps) => {
  return (
    <Card className="flex flex-col h-full border border-border hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{lesson.title}</CardTitle>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Link href={`/topics/${topicId}/${lesson.id}`} className="w-full">
          <Button className="w-full">
            <Book className="ml-2 h-4 w-4" />
            ابدأ الدرس
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;