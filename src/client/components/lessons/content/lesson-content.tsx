// Server component that handles MDX rendering
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MDXClientWrapper } from "./client-mdx-wrapper";
import { createMDXComponents } from "./mdx-components";

const options = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeHighlight, { ignoreMissing: true }]],
  },
};

interface LessonContentProps {
	content: string;
	playlistId: string | null;
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

/**
 * Server component that renders MDX content with:
 * - Syntax highlighting
 * - Auto-generated slugs for headings
 * - Custom MDX components
 * - Client-side features (highlighting, font size, etc.)
 */
export function LessonContent({
  content,
  playlistId,
  lessonId,
}: LessonContentProps) {
  const paragraphIndexGen = incrementingGenerator();
  const mdxComponents = createMDXComponents(paragraphIndexGen);

  return (
		<MDXClientWrapper topicId={playlistId} lessonId={lessonId}>
			<MDXRemote
				source={content}
				components={mdxComponents}
				options={options}
			/>
		</MDXClientWrapper>
  );
}
