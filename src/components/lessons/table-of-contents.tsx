import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

const TableOfContents = () => {
  const [items, setItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    // Get all headings from the content
    const headings = document.querySelectorAll(
      ".prose h1, .prose h2, .prose h3"
    );
    const tocItems: TOCItem[] = [];

    headings.forEach((heading) => {
      const id = heading.id || Math.random().toString(36).substr(2, 9);
      if (!heading.id) heading.id = id;

      tocItems.push({
        id,
        title: heading.textContent || "",
        level: parseInt(heading.tagName[1]),
      });
    });

    setItems(tocItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="print:block hidden my-8 pb-8 border-b">
      <h2 className="text-xl font-bold mb-4">المحتويات</h2>
      <div className="toc space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block text-muted-foreground hover:text-foreground no-underline",
              "print:text-black",
              item.level === 1 && "font-bold",
              item.level === 2 && "mr-4",
              item.level === 3 && "mr-8"
            )}
          >
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
};

export default TableOfContents;
