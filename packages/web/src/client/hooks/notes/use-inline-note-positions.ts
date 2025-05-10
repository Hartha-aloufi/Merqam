import { Note } from '@/types/note';


export const createInlineNoteElId = (noteId: string) => `inline-note-${noteId}`;

/**
 * In case we have notes to view, we can maximize the space in the viewport by translating the whole content to the left.
 * This function calculates the translation value based on the viewport width.
 * in case there is no need to translate, it returns -1.
 * How we calculate min and max viewPortWidth:
 * content = 768px
 * inlineNote = 300px
 * paddings = 24px * 2px
 * playerPadding = 56px
 * total (minViewPort)= 1172px
 * @param viewPortWidth
 * @returns
 */
export function calcTranslationValue(viewPortWidth) {
	const minViewPortWidth = 1172,
		maxViewPortWidth = 1512;
	const minTrans = 0,
		maxTrans = 172;

	if (viewPortWidth >= maxViewPortWidth || viewPortWidth < 1172) return -1;

	// map the range 1172 - 1512 to 172 - 0
	const translateX =
		maxTrans -
		((viewPortWidth - minViewPortWidth) * (maxTrans - minTrans)) /
			(maxViewPortWidth - minViewPortWidth);

	// convert to integer
	return Math.round(translateX);
}

/**
 * Calculate the top position of the highlight element with the given id
 * this function is dependent on the DOM, so it should be used only after the component is mounted
 * @param highlightId 
 * @returns 
 */
export const getHighlightElementTopPosition = (highlightId?: string | null): number => {
	const highlightEl = document.querySelector(
		`mark[data-highlight="${highlightId}"]`
	) as HTMLElement;

	if (!highlightEl) return 0;

	// Get highlight position
	const { top } = highlightEl.getBoundingClientRect();

	// Add scroll offset
	return Math.max(0, top + window.scrollY) - 150;
};

/**
 * get the height of the note element with the given id
 * this function is dependent on the DOM, so it should be used only after the component is mounted
 * @param noteId 
 * @returns 
 */
const getNoteHeight = (noteId: string) => {
	const noteEl = document.getElementById(createInlineNoteElId(noteId));
	if (!noteEl) return 0;

	return noteEl.getBoundingClientRect().height;
};

type PositionedNote = Note & { top: number };

/**
 * Avoid overlap between notes by adjusting the top position of the note
 * top position should be greater than the previous note top position + previous note height
 * @param note 
 * @param prevNote 
 * @returns 
 */
const avoidOverlap = (note: PositionedNote, prevNote?: {id: string, top: number}) => {
	if (!prevNote) return note.top;
	const prevNoteHeight = getNoteHeight(prevNote.id);

	const minTop = prevNote.top + prevNoteHeight;

	return Math.max(minTop, note.top);
};

/**
 * Align notes with their corresponding highlights
 * This will ensure that notes are displayed in the correct order and avoid overlapping
 * @param notes 
 * @returns 
 */
export const alignNotesWithHighlights = (notes?: Note[]) => {
	if (!notes) return new Map<string, number>();
	return (
		notes
			// get initial top position for each note
			.map((note) => {
				return {
					...note,
					top: getHighlightElementTopPosition(note.highlightId),
				};
			})
			// filter out notes without highlights
			.filter((note) => note)
			// sort notes by top position
			.sort((a, b) => a.top - b.top)
			// .map((note, idx, arr) => ({
				// 	id: note.id,
				// 	top: avoidOverlap(note, arr[idx - 1]),
				// }))
			// avoid overlap notes by adjusting top position
			// convert to map of noteId -> top position
			.reduce((acc, note, idx, arr) => {
				if(acc.size > 0) {
					const prevNoteTop = acc.get(arr[idx - 1].id);

					const newTop = avoidOverlap(note, { id: arr[idx - 1].id, top: prevNoteTop as number });
					acc.set(note.id, newTop);
				} else {
					acc.set(note.id, note.top);
				}				

				return acc;
			}, new Map<string, number>())
	);
};

