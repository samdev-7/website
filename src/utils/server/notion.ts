import { Client } from "@notionhq/client";
import type { BlogDbPage, BlogPage } from "../notionTypes";

export async function findPost(slug: string): Promise<BlogPage | undefined> {
  const notion = new Client({
    auth: import.meta.env.NOTION_API_KEY,
  });

  const blogDb = await notion.databases.query({
    database_id: import.meta.env.NOTION_DATABASE_ID,
    filter: {
      and: [
        {
          property: "Visibility",
          select: {
            equals: "Public",
          },
        },
        {
          property: "Slug",
          rich_text: {
            equals: slug,
          },
        },
      ],
    },
    page_size: 1,
  });

  if (blogDb.results.length === 0) {
    return undefined;
  }

  const page = blogDb.results[0] as unknown as BlogDbPage;

  return {
    id: page.properties.id.rich_text[0].plain_text,
    slug: page.properties.Slug.rich_text[0].plain_text,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    tags: page.properties.Tags.multi_select.map((tag) => tag.name),
    tag_colors: page.properties.Tags.multi_select.map((tag) => tag.color),
    title: page.properties.Page.title[0].plain_text,
    summary: page.properties.Summary.rich_text[0].plain_text,
  };
}

export async function listPost(limit: number = 100): Promise<BlogPage[]> {
  const notion = new Client({
    auth: import.meta.env.NOTION_API_KEY,
  });

  const blogDb = await notion.databases.query({
    database_id: import.meta.env.NOTION_DATABASE_ID,
    filter: {
      property: "Visibility",
      select: {
        equals: "Public",
      },
    },
    sorts: [
      {
        property: "Created time",
        direction: "descending",
      },
    ],
    page_size: limit,
  });

  let result: BlogPage[] = [];

  await Promise.all(
    blogDb.results.map(async (rawPage) => {
      if (rawPage.object !== "page") {
        return;
      }

      const page = rawPage as unknown as BlogDbPage;

      result.push({
        id: page.properties.id.rich_text[0].plain_text,
        slug: page.properties.Slug.rich_text[0].plain_text,
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
        tags: page.properties.Tags.multi_select.map((tag) => tag.name),
        tag_colors: page.properties.Tags.multi_select.map((tag) => tag.color),
        title: page.properties.Page.title[0].plain_text,
        summary: page.properties.Summary.rich_text[0].plain_text,
      });
    })
  );

  return result;
}
