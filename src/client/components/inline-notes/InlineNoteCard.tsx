// src/client/components/lessons/margin-notes/InlineNoteCard.tsx
import React, { useState } from 'react';
import { Note } from '@/types/note';
import { Button } from '@/client/components/ui/button';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
	MoreHorizontal,
	PencilLine,
	Trash2,
	X,
	MessageSquarePlus,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu';
import { useDeleteNote } from '@/client/hooks/use-notes';
import { InlineNoteEditor } from './InlineNoteEditor';
import { cn } from '@/client/lib/utils';
import { Avatar, AvatarFallback } from '@/client/components/ui/avatar';
import { useSession } from '@/client/hooks/use-auth-query';

interface InlineNoteCardProps {
	note: Note;
	lessonId: string;
}

/**
 * Renders a single inline note with minimal UI like Notion
 */
export function InlineNoteCard({ note }: InlineNoteCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [showActions, setShowActions] = useState(false);
	const { data: session } = useSession();
	const { mutate: deleteNote } = useDeleteNote();

	const handleDelete = () => {
		if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
			deleteNote(note.id);
		}
	};

	return (
		<div
			className={cn(
				'group relative rounded-lg border bg-background shadow-sm transition-shadow hover:shadow-md',
				'mb-4 w-[300px]'
			)}
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}
		>
			{/* Note Header */}
			<div className="flex items-center gap-2 p-3">
				<Avatar className="h-6 w-6">
					<AvatarFallback>
						{session?.user?.email?.[0].toUpperCase() || 'م'}
					</AvatarFallback>
				</Avatar>

				<div className="flex flex-1 items-center justify-between">
					<div>
						<span className="text-sm font-medium">
							{session?.user?.email?.split('@')[0]}
						</span>
						<span className="mx-2 text-xs text-muted-foreground">
							{format(new Date(note.createdAt), 'p', {
								locale: ar,
							})}
						</span>
					</div>

					{/* Actions Menu */}
					<div
						className={cn(
							'flex items-center gap-0.5 transition-opacity duration-200',
							showActions ? 'opacity-100' : 'opacity-0'
						)}
					>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
								>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40">
								<DropdownMenuItem
									onClick={() => setIsEditing(true)}
								>
									<PencilLine className="mr-2 h-4 w-4" />
									تعديل
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleDelete}
									className="text-red-600 focus:text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									حذف
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Note Content */}
			<div className="px-3 pb-3">
				<div className="relative rounded-md">
					{isEditing ? (
						<InlineNoteEditor
							note={note}
							onClose={() => setIsEditing(false)}
						/>
					) : (
						<div className="text-sm whitespace-pre-wrap break-words">
							{note.content}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
