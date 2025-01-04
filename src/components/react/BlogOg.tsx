import { ImageResponse } from "@vercel/og";
import font from "../../assets/fonts/og/ibmplexsans-regular.ttf";
import type { BlogPage } from "../../utils/notionTypes";
import { getForegroundColor } from "../../utils/notionColors";
import { toSimpleDate } from "../../utils/dates";

export default async function handler({ page }: { page: BlogPage }) {
  const ibmRegFont = await (
    await fetch(
      "https://cloud-8yuaa4uwv-hack-club-bot.vercel.app/1ibmplexsans-regular.ttf"
    )
  ).arrayBuffer();
  const ibmMedFont = await (
    await fetch(
      "https://cloud-8yuaa4uwv-hack-club-bot.vercel.app/0ibmplexsans-medium.ttf"
    )
  ).arrayBuffer();

  return new ImageResponse(
    (
      <div
        tw="flex flex-col bg-white h-full w-full"
        style={{ fontFamily: "'IBM Plex Sans'" }}
      >
        <div tw="flex text-4xl w-full items-center">
          <div tw="flex items-center ml-12">
            <p tw="text-3xl font-medium">Sam Liu</p>
            <p tw="text-2xl mx-3">/</p>
            <p tw="text-2xl">Blog</p>
          </div>
          <p tw="grow text-xl flex justify-end grow mr-12 text-gray-500">
            {toSimpleDate(new Date(page.created_time))}
          </p>
        </div>
        <div tw="flex flex-col grow mx-12 justify-center mb-12">
          <p tw="text-4xl m-0 font-medium">{page.title}</p>
          <p tw="text-2xl">{page.summary}</p>
        </div>
        <div tw="flex h-4">
          {page.tag_colors.map((color) => (
            <div
              tw="h-4 grow"
              style={{ backgroundColor: getForegroundColor(color) }}
            ></div>
          ))}
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
      fonts: [
        {
          name: "IBM Plex Sans",
          data: ibmRegFont,
          style: "normal",
          weight: 400,
        },
        {
          name: "IBM Plex Sans",
          data: ibmMedFont,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
