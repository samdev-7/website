import type { ExtendedRecordMap } from "notion-types";
import React from "react";
import { NotionRenderer } from "react-notion-x";
import { Code } from "react-notion-x/build/third-party/code";
import { Equation } from "react-notion-x/build/third-party/equation";

import "../../utils/notion.css";
// import "react-notion-x/src/styles.css";
import "katex/dist/katex.min.css";
// import "prismjs/themes/prism-tomorrow.css";

export default function NotionPage({
  recordMap,
}: {
  recordMap: ExtendedRecordMap;
}) {
  console.log("Test");

  return (
    <NotionRenderer
      recordMap={recordMap}
      darkMode={false}
      components={{
        Code,
        Equation,
      }}
    />
  );
}
