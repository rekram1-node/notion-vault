import Editor from "~/components/novel/editor";
import { ThemeToggle } from "~/components/novel/themeToggle";
import { type JSONContent } from "novel";
import { useState } from "react";

export const defaultValue = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

export default function EncryptedDocument() {
  const title = "SOME TITLE";
  const [value, setValue] = useState<JSONContent>(defaultValue);

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div className="flex max-h-screen w-screen flex-col gap-6 overflow-auto rounded-md border bg-card p-6">
        <div className="flex justify-between">
          <h1 className="text-4xl font-semibold"> {title}</h1>
          <ThemeToggle />
        </div>
        <div className="h-screen w-full">
          <Editor initialValue={value} onChange={setValue} />
        </div>
      </div>
    </main>
  );
}
