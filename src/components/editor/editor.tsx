"use client";

import { useEffect, useState } from "react";
/* Lexical Design System */
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";
// import { useLexicalEditable } from "@lexical/react/useLexicalEditable";

/* Lexical Plugins Local */
import ToolbarPlugin from "~/components/editor/plugins/ToolbarPlugin";
import AutoLinkPlugin from "~/components/editor/plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "~/components/editor/plugins/CodeHighlightPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

/* Lexical Plugins Remote */
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";

/* Lexical Others */
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ExampleTheme from "~/components/editor/themes/ExampleTheme";

/* Lexical Texts */
import { textDailyStandup } from "./daily-standup";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig = {
  // The editor theme
  theme: ExampleTheme,
  namespace: "daily-standup-editor",
  editorState: textDailyStandup,
  // Handling of errors during update
  onError(error: unknown) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    // TableNode,
    // TableCellNode,
    // TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

const Editor = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin
              onChange={(editorState) => {
                editorState.read(() => {
                  // write to database, local storage, etc.
                  const value = JSON.stringify(editorState); // or JSON.stringify(editorState.toJSON())
                  console.log(value);
                });
              }}
            />
            <ListPlugin />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <CodeHighlightPlugin />
            <LinkPlugin />
            <TabIndentationPlugin />
            <AutoLinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </LexicalComposer>
    </>
  );
};

export default Editor;
