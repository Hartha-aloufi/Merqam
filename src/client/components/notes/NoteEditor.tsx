import React from 'react';
import { Button } from '@/client/components/ui/button';
import { Textarea } from '@/client/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/client/components/ui/card';
import { useNotes } from '@/client/contexts/notes-context';

export function NoteEditor() {
  const [content, setContent] = React.useState('');
  const { actions } = useNotes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    actions.addNote(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="border-none shadow-none">
        <CardContent>
          <Textarea
            placeholder="اكتب ملاحظتك هنا..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] resize-none"
            dir="auto"
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setContent('')}
            disabled={!content}
          >
            مسح
          </Button>
          <Button type="submit" disabled={!content.trim()}>
            إضافة ملاحظة
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}