// components/lessons/content/lesson-content.tsx
// This is a server component that handles MDX rendering
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { ClientMDXWrapper } from './client-mdx-wrapper';
import { createMDXComponents } from './mdx-components';
import { useParagraphIndex } from '@/hooks/use-paragraph-index';
import { useEffect } from 'react';
import { useParagraphTracking } from '@/hooks/use-paragraph-tracking';

const options = {
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            rehypeSlug,
            [rehypeHighlight, { ignoreMissing: true }],
        ],
    },
};

interface LessonContentProps {
    content: string;
    fontSize?: 'small' | 'medium' | 'large';
    topicId: string,
    lessonId: string
}

export function LessonContent({ content, fontSize = 'medium', topicId, lessonId }: LessonContentProps) {
    const { getNextIndex, resetIndex } = useParagraphIndex();
    const mdxComponents = createMDXComponents(getNextIndex);
    const pTracker = useParagraphTracking(topicId, lessonId);

    useEffect(() => {
        pTracker.track();

        return () => {
            pTracker.untrack();
        }
    }, [content])

    // Reset index when component mounts
    useEffect(() => {
        resetIndex();
    }, [resetIndex]);

    return (
        <ClientMDXWrapper fontSize={fontSize}>
            <MDXRemote
                source={content}
                components={mdxComponents}
                options={options}
                
            />
        </ClientMDXWrapper>
    );
}