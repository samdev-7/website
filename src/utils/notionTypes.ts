export type BlogDbPage = {
  id: string;
  properties: {
    Slug: {
      rich_text: Array<{
        plain_text: string;
      }>;
    };
    Tags: {
      multi_select: Array<{
        name: string;
        color: string;
      }>;
    };
    Page: {
      title: Array<{
        plain_text: string;
      }>;
    };
    Summary: {
      rich_text: Array<{
        plain_text: string;
      }>;
    };
    id: {
      rich_text: Array<{
        plain_text: string;
      }>;
    };
    "Created time": {
      date: {
        start: string;
      };
    };
    "Last edited time": {
      date: {
        start: string;
      };
    };
  };
};

export type BlogPage = {
  id: string;
  slug: string;
  created_time: string;
  last_edited_time: string;
  tags: string[];
  tag_colors: string[];
  title: string;
  summary: string;
};
