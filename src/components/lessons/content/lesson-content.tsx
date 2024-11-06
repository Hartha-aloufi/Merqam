// components/lessons/content/lesson-content.tsx
// This is a server component that handles MDX rendering
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ClientMDXWrapper } from "./client-mdx-wrapper";
import { createMDXComponents } from "./mdx-components";

const options = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeHighlight, { ignoreMissing: true }]],
  },
};

interface LessonContentProps {
  content: string;
  topicId: string;
  lessonId: string;
}

/**
 * A generator that increments a counter each time it is called
 */
function* incrementingGenerator() {
  let count = 0;
  while (true) {
    yield count;
    count++;
  }
}

export function LessonContent({ content }: LessonContentProps) {
  const paragraphIndexGen = incrementingGenerator();
  const mdxComponents = createMDXComponents(paragraphIndexGen);

  return (
    <ClientMDXWrapper>
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={options}
      />
    </ClientMDXWrapper>
  );
}
