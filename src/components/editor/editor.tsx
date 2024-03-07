"use client";

import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { api } from "~/utils/api";
import { useSnackbar } from "notistack";
import { encryptData, deriveDocumentKey } from "~/encryption/encryption";

/* Lexical Design System */
import type { EditorState } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";

/* Lexical Plugins Local */
import ToolbarPlugin from "~/components/editor/plugins/ToolbarPlugin";
// import AutoLinkPlugin from "~/components/editor/plugins/AutoLinkPlugin";
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

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

export const EmptyState = `{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`;

const Editor = ({
  editorState,
  documentId,
  passwordString,
  documentSalt,
  iv,
}: {
  editorState: string;
  documentId: string;
  passwordString: string;
  documentSalt: string;
  iv: string;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isMounted, setIsMounted] = useState(false);

  // ignore loading for now...
  const { mutate } = api.encryptedDocuments.update.useMutation({
    onSuccess: () => {
      // This should really be done "google drive style"
      // enqueueSnackbar("saved changes", {
      //   autoHideDuration: 2000,
      //   variant: "success",
      // });
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        enqueueSnackbar(errorMessage[0], {
          autoHideDuration: 3000,
          variant: "error",
        });
      } else {
        enqueueSnackbar("Failed to save page content! Contact Support", {
          autoHideDuration: 3000,
          variant: "error",
        });
      }
    },
  });

  const autoSave = async (editorState: EditorState) => {
    try {
      const rawEditorContent = JSON.stringify(editorState);
      if (true) {
        const documentKey = await deriveDocumentKey(
          passwordString,
          documentSalt,
        );
        const encryptedContent = await encryptData(
          rawEditorContent,
          iv,
          documentKey,
        );
        void mutate({
          id: documentId,
          encryptedContent,
        });
      }
    } catch (e) {
      enqueueSnackbar("Failed to autosave: " + String(e), {
        autoHideDuration: 3000,
        variant: "error",
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange = useCallback(debounce(autoSave, 1000), []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const editorConfig = {
    // The editor theme
    theme: ExampleTheme,
    namespace: "encrypted-document-editor",
    editorState,
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
              // need to memoize or something, sends too many updates
              onChange={onChange}
            />
            <ListPlugin />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <CodeHighlightPlugin />
            <LinkPlugin />
            <TabIndentationPlugin />
            {/* <AutoLinkPlugin /> */} {/* autolink plugin causes errors */}
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </LexicalComposer>
    </>
  );
};

export default Editor;
