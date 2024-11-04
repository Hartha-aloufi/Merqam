// components/lessons/content/lesson-content.tsx
// This is a server component that handles MDX rendering
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { ClientMDXWrapper } from './client-mdx-wrapper';
import { mdxComponents } from './mdx-components';

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
}

export function LessonContent({ content, fontSize = 'medium' }: LessonContentProps) {
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