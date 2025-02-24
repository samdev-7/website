import {
  getBackgroundColor,
  getForegroundColor,
} from "../../utils/notionColors";

interface BlogCardProps {
  title: string;
  summary: string;
  date?: string;
  tags?: string[];
  tag_colors?: string[];
  class?: string;
  href?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  summary,
  date,
  tags = [],
  tag_colors = [],
  class: className,
  href,
}) => {
  return (
    <a
      href={href ? href : "#"}
      className={`${className} border shadow border-gray-200 rounded py-5 px-5 w-full ${href ? "motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md motion-safe:transition" : ""}`}
    >
      <div className="space-y-2">
        <div className="flex space-x-4 items-center">
          <h3 className="grow text-xl font-medium">{title}</h3>
          {date && (
            <p className="text-gray-500 text-sm sm:block hidden">{date}</p>
          )}
          <div className="hidden sm:flex space-x-1.5 text-sm">
            {tags.map((tag, i) => (
              <p
                className="rounded-full px-3 py-0.5"
                style={{
                  backgroundColor: getBackgroundColor(tag_colors[i]),
                  color: getForegroundColor(tag_colors[i]),
                }}
                key={tag}
              >
                {tag}
              </p>
            ))}
          </div>
        </div>
        <p
          className="text-sm overflow-hidden text-ellipsis text-wrap w-full max-h-[5lh]"
          style={{
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
          }}
        >
          {summary}
        </p>
      </div>
    </a>
  );
};

export default BlogCard;
