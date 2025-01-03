/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NOTION_API_KEY: string;
  readonly NOTION_DATABASE_ID: string;
  readonly NOTION_USER_ID: string;
  readonly NOTION_TOKEN_V2: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
