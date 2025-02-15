import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService } from '../services/notes.service';
import type { CreateNoteDTO, UpdateNoteDTO, CreateTagDTO } from '@/types/note';
import { toast } from 'sonner';
import { queryClient } from '../lib/queryClient';

// Query keys factory
export const notesKeys = {
	all: ['notes'] as const,
	lists: () => [...notesKeys.all, 'list'] as const,
	list: (lessonId: string) => [...notesKeys.lists(), lessonId] as const,
	notes: () => [...notesKeys.all, 'note'] as const,
	note: (id: string) => [...notesKeys.notes(), id] as const,
	tags: () => [...notesKeys.all, 'tags'] as const,
} as const;

export function useNotes(lessonId: string) {
	return useQuery({
		queryKey: notesKeys.list(lessonId),
		queryFn: () => notesService.getNotes(lessonId),
		staleTime: 1000 * 60, // 1 minute
	});
}

export function useNotesCount(lessonId: string) {
	const useNotesQuery = useNotes(lessonId);
	return useNotesQuery.data?.length || 0;
}

type NoteList = Awaited<ReturnType<typeof notesService.getNotes>>;

export function useNote(lessonId: string, noteId: string | null) {
	return useQuery({
		queryKey: notesKeys.note(noteId || ''),
		queryFn: () =>
			queryClient
				.getQueryData<NoteList>(notesKeys.list(lessonId))
				?.find((n) => n.id === noteId),
		enabled: !!noteId,
	});
}

export function useHighlightNote(lessonId: string, highlightId: string) {
	return useQuery({
		queryKey: notesKeys.note(highlightId),
		queryFn: () =>
			queryClient
				.getQueryData<NoteList>(notesKeys.list(lessonId))
				?.find((n) => n.highlightId === highlightId),
		enabled: !!highlightId,
	});
}

export function useCreateNote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateNoteDTO) => notesService.createNote(data),
		onSuccess: (note) => {
			// Show success message
			toast.success('تم إنشاء الملاحظة بنجاح');

			// Invalidate both the list and specific note queries
			queryClient.invalidateQueries({
				queryKey: notesKeys.list(note.lessonId),
			});
			queryClient.invalidateQueries({
				queryKey: notesKeys.note(note.id),
			});

			// Optional: Add to cache immediately for faster UI updates
			queryClient.setQueryData(
				notesKeys.list(note.lessonId),
				(oldData: any[] = []) => [note, ...oldData]
			);
		},
		onError: (error: Error) => {
			// Handle specific error cases
			if (error.message.includes('Maximum number of notes')) {
				toast.error(
					'لقد وصلت للحد الأقصى من الملاحظات لهذا الدرس (200)'
				);
			} else {
				toast.error(error.message || 'حدث خطأ أثناء إنشاء الملاحظة');
			}
		},
	});
}

export function useUpdateNote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			noteId,
			data,
		}: {
			noteId: string;
			data: UpdateNoteDTO;
		}) => notesService.updateNote(noteId, data),
		onSuccess: (note) => {
			// Show success message
			toast.success('تم تحديث الملاحظة بنجاح');

			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: notesKeys.note(note.id),
			});
			queryClient.invalidateQueries({
				queryKey: notesKeys.list(note.lessonId),
			});

			// Optional: Update cache immediately
			queryClient.setQueryData(notesKeys.note(note.id), note);
			queryClient.setQueryData(
				notesKeys.list(note.lessonId),
				(oldData: any[] = []) =>
					oldData.map((item) => (item.id === note.id ? note : item))
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'حدث خطأ أثناء تحديث الملاحظة');
		},
	});
}

export function useDeleteNote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (noteId: string) => notesService.deleteNote(noteId),
		onSuccess: (_, noteId) => {
			// Show success message
			toast.success('تم حذف الملاحظة بنجاح');

			// Remove from cache and invalidate lists
			queryClient.removeQueries({
				queryKey: notesKeys.note(noteId),
			});
			queryClient.invalidateQueries({
				queryKey: notesKeys.lists(),
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || 'حدث خطأ أثناء حذف الملاحظة');
		},
	});
}

export function useTags() {
	return useQuery({
		queryKey: notesKeys.tags(),
		queryFn: () => notesService.getTags(),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useCreateTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTagDTO) => notesService.createTag(data),
		onSuccess: (tag) => {
			// Show success message
			toast.success('تم إنشاء التصنيف بنجاح');

			// Update cache immediately
			queryClient.setQueryData(
				notesKeys.tags(),
				(oldData: any[] = []) => [...oldData, tag]
			);

			// Invalidate to ensure consistency
			queryClient.invalidateQueries({
				queryKey: notesKeys.tags(),
			});
		},
		onError: (error: Error) => {
			// Handle specific error cases
			if (error.message.includes('unique constraint')) {
				toast.error('هذا التصنيف موجود مسبقاً');
			} else {
				toast.error(error.message || 'حدث خطأ أثناء إنشاء التصنيف');
			}
		},
	});
}
