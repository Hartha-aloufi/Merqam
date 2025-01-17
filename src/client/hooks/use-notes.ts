import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService } from '../services/notes.service';
import type { CreateNoteDTO, UpdateNoteDTO, CreateTagDTO } from '@/types/note';
import { toast } from 'sonner';

// Query keys factory
export const notesKeys = {
	all: ['notes'] as const,
	lists: () => [...notesKeys.all, 'list'] as const,
	list: (lessonId: string) => [...notesKeys.lists(), lessonId] as const,
	notes: () => [...notesKeys.all, 'note'] as const,
	note: (id: string) => [...notesKeys.notes(), id] as const,
	tags: () => [...notesKeys.all, 'tags'] as const,
} as const;

// Custom hooks
export function useNotes(lessonId: string) {
	return useQuery({
		queryKey: notesKeys.list(lessonId),
		queryFn: () => notesService.getNotes(lessonId),
		staleTime: 1000 * 60, // 1 minute
	});
}

export function useNote(noteId: string, enabled = true) {
	return useQuery({
		queryKey: notesKeys.note(noteId),
		queryFn: () => notesService.getNote(noteId),
		staleTime: 1000 * 60, // 1 minute
    enabled,
	});
}

export function useCreateNote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateNoteDTO) => notesService.createNote(data),
		onSuccess: (note) => {
			queryClient.invalidateQueries({
				queryKey: notesKeys.list(note.lessonId),
			});
			toast.success('تم إنشاء الملاحظة بنجاح');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'حدث خطأ أثناء إنشاء الملاحظة');
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
			queryClient.invalidateQueries({
				queryKey: notesKeys.note(note.id),
			});
			queryClient.invalidateQueries({
				queryKey: notesKeys.list(note.lessonId),
			});
			toast.success('تم تحديث الملاحظة بنجاح');
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
			// Invalidate and refetch
			queryClient.invalidateQueries({
				queryKey: notesKeys.lists(),
			});
			toast.success('تم حذف الملاحظة بنجاح');
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
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: notesKeys.tags(),
			});
			toast.success('تم إنشاء التصنيف بنجاح');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'حدث خطأ أثناء إنشاء التصنيف');
		},
	});
}
