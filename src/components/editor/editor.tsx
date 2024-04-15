import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { useSnackbar } from "notistack";
import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import { encryptData, deriveDocumentKey } from "~/encryption/encryption";
import "react-quill/dist/quill.snow.css";

const QuillEditor = dynamic(() => import("react-quill"), { ssr: false });

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
  const [state, setState] = useState(editorState);
  const { enqueueSnackbar } = useSnackbar();

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ align: [] }],
      [{ color: [] }],
      ["code-block"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
    "align",
    "color",
    "code-block",
  ];

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

  const autoSave = async (rawEditorContent: string) => {
    setState(rawEditorContent);
    try {
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
        mutate({
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

  return (
    <>
      <QuillEditor
        value={state}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        className="h-full w-full bg-white"
      />
    </>
  );
};

export default Editor;
