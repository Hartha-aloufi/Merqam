// src/components/lessons/LessonContent.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { MDXClientWrapper, mdxComponents } from './MDXClientWrapper';

const options = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeHighlight, { ignoreMissing: true }],
    ],
  },
};

const LessonContent = ({ content }: { content: string }) => {
  return (
    <MDXClientWrapper>
      <MDXRemote 
        source={content}
        components={mdxComponents}
        options={options}
      />
    </MDXClientWrapper>
  );
};

export default LessonContent;