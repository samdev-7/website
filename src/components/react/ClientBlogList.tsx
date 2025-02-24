import { useState } from "react";
import type { BlogPage } from "../../utils/notionTypes";
import BlogCard from "./BlogCard";
import { toSimpleDate } from "../../utils/dates";
import BlogCardSkeleton from "./BlogCardSkeleton";

interface ClientBlogListProps {
  limit?: number;
}

const ClientBlogList: React.FC<ClientBlogListProps> = ({ limit = 3 }) => {
  const skeletonCount = 2;
  const [pages, setPages] = useState<BlogPage[]>([]);

  if (pages.length == 0) {
    fetch(`/api/blog/list?limit=${limit}`).then(async (res) => {
      if (!res.ok) return;

      const data = (await res.json()) as unknown as {
        success: boolean;
        pages: BlogPage[];
      };
      if (!data.success) return;

      setPages(data.pages);
    });
  }

  return (
    <div className="flex flex-col space-y-4">
      {pages.length === 0 && (
        <>
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </>
      )}
      {pages.length !== 0 &&
        pages.length != 0 &&
        pages.map((page) => (
          <BlogCard
            title={page.title}
            summary={page.summary}
            date={toSimpleDate(new Date(page.created_time))}
            href={`blog/${page.slug}`}
            tags={page.tags}
            tag_colors={page.tag_colors}
            key={page.id}
          />
        ))}
    </div>
  );
};

export default ClientBlogList;
