"use client";
import React from "react";
const {
  MDXEditor,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  useCodeBlockEditorContext,
} = await import("@mdxeditor/editor");

const PlainTextCodeEditorDescriptor = {
  match: () => true,
  priority: 0,
  Editor: () => {
    const cb = useCodeBlockEditorContext();
    return (
      <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
        <textarea
          rows={10} // Adjusted for a larger editor
          cols={50} // Adjusted for a larger editor
          // defaultValue={props.code}
          onChange={(e) => cb.setCode(e.target.value)}
          autoFocus // Ensures cursor starts within the text box
        />
      </div>
    );
  },
};

// Enhanced editor setup
const Editor = ({ decryptedContent }: { decryptedContent: string }) => {
  return (
    <MDXEditor
      onChange={console.log}
      markdown={decryptedContent}
      plugins={[
        codeBlockPlugin({
          codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor],
        }),
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
      ]}
    />
  );
};

export default Editor;
