import { useState, useEffect } from "react";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { api } from "~/utils/api";
import {
  OpenInNewWindowIcon,
  CopyIcon,
  TrashIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import Modal from "../modal";

export interface EncryptedDocument {
  id: string;
  name: string;
}

const EncryptedDocument = ({ document }: { document: EncryptedDocument }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [baseUrl, setBaseUrl] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const utils = api.useUtils();

  const { mutate, isLoading: isDeleteLoading } =
    api.encryptedDocuments.delete.useMutation({
      onSuccess: () => {
        void utils.encryptedDocuments.getAll.invalidate();
        setIsDeleteModalVisible(false); // Close the modal
        enqueueSnackbar(`Deleted ${document.name}`, {
          autoHideDuration: 3000,
          variant: "success",
        });
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage?.[0]) {
          enqueueSnackbar(errorMessage[0], {
            autoHideDuration: 3000,
            variant: "error",
          });
        } else {
          enqueueSnackbar(
            "Failed to delete protected page! Please try again later.",
            {
              autoHideDuration: 3000,
              variant: "error",
            },
          );
        }
      },
    });

  useEffect(() => {
    setBaseUrl(window.location.href);
  }, []);

  const link = `${baseUrl}encrypted/${document.id}`; // baseUrl contains "/" after it

  const onCopy = () => {
    void navigator.clipboard.writeText(link);
    enqueueSnackbar(`Copied url to clipboard`, {
      autoHideDuration: 3000,
      variant: "info",
    });
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="relative mt-4 flex w-full flex-col items-center rounded-xl border-2 bg-card shadow-md">
          <div className="w-full">
            <div className="card variant-glass flex items-center justify-start p-6">
              <FileTextIcon className="mr-4 h-6 w-6" />
              <h5 className="h5 text-xl">{document.name}</h5>
              <div className="ml-auto flex items-center space-x-3">
                <button
                  className="mr-1"
                  onClick={onCopy}
                  title="Copy protected page url to clipboard"
                >
                  <CopyIcon className="h-6 w-6" />
                </button>
                <Link
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=""
                  title="Open protected page in new tab"
                >
                  <OpenInNewWindowIcon className="h-6 w-6" />
                </Link>
                <button
                  className=""
                  onClick={() => setIsDeleteModalVisible(true)}
                  title="Delete protected page"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isDeleteModalVisible && (
        <Modal
          title="Confirm Deletion"
          content={
            <p className="">Are you sure you want to delete {document.name}?</p>
          }
          isLoading={isDeleteLoading}
          onCancel={() => setIsDeleteModalVisible(false)}
          onConfirm={() => mutate({ id: document.id })}
        />
      )}
    </>
  );
};

export default EncryptedDocument;
