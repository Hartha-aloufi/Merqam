import { TextHighlight } from '@/types/highlight';

/**
 * Calculate offset from the start of a paragraph including marked text
 */
export function calculateNodeOffset(node: Node): number {
    let offset = 0;
    let current = node.previousSibling;

    while (current) {
        if (current.nodeType === Node.TEXT_NODE) {
            offset += current.textContent?.length || 0;
        } else if (current.nodeType === Node.ELEMENT_NODE && current.nodeName === 'MARK') {
            offset += current.textContent?.length || 0;
        }
        current = current.previousSibling;
    }

    // Handle nested marks
    let parent = node.parentElement;
    while (parent && parent.closest('[data-paragraph-index]') !== parent) {
        if (parent.nodeName === 'MARK') {
            const prevSiblings = Array.from(parent.parentNode?.childNodes || []);
            const beforeMark = prevSiblings.slice(0, prevSiblings.indexOf(parent));
            offset += beforeMark.reduce((acc, node) =>
                acc + (node.textContent?.length || 0), 0
            );
        }
        parent = parent.parentElement;
    }

    return offset;
}

/**
 * Get real offset considering highlighted text and direction
 */
export function getRealOffset(
    node: Node,
    offset: number,
    isStart: boolean,
    highlights: TextHighlight[]
): number {
    let realOffset = calculateNodeOffset(node);

    if (node.nodeType === Node.TEXT_NODE && node.parentElement?.nodeName === 'MARK') {
        const mark = node.parentElement;
        const markId = mark.getAttribute('data-highlight');
        const highlight = highlights.find(h => h.id === markId);

        if (highlight && isStart) {
            realOffset = highlight.startOffset + offset;
        } else if (highlight && !isStart) {
            realOffset = highlight.startOffset + offset;
        } else {
            realOffset += offset;
        }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'MARK') {
        const markId = (node as HTMLElement).getAttribute('data-highlight');
        const highlight = highlights.find(h => h.id === markId);

        if (highlight) {
            realOffset = isStart ? highlight.startOffset : highlight.endOffset;
        } else {
            realOffset += offset;
        }
    } else {
        realOffset += offset;
    }

    return realOffset;
}

/**
 * Detect if selection is backwards (right to left)
 */
export function detectBackwardsSelection(range: Range): boolean {
    const tempRange = document.createRange();
    tempRange.setStart(range.startContainer, range.startOffset);
    tempRange.setEnd(range.endContainer, range.endOffset);
    return tempRange.collapsed;
}

/**
 * Process highlights to merge overlapping ones
 */
export function processHighlights(highlights: TextHighlight[]): TextHighlight[] {
    return highlights
        .slice()
        .sort((a, b) => a.startOffset - b.startOffset)
        .reduce((acc: TextHighlight[], current) => {
            if (acc.length === 0 || acc[acc.length - 1].endOffset <= current.startOffset) {
                acc.push(current);
            } else {
                const last = acc[acc.length - 1];
                last.endOffset = Math.max(last.endOffset, current.endOffset);
            }
            return acc;
        }, []);
} 