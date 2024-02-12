import { useState, useEffect } from "react";
import Link from "next/link";
import { useSnackbar } from "notistack";
import {
  OpenInNewWindowIcon,
  CopyIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import Modal from "../modal";

interface ListItemProps {
  name: string;
  uuid: string;
}

const ListItem = ({ name, uuid }: ListItemProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [baseUrl, setBaseUrl] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.href);
  }, []);

  const link = `${baseUrl}protected/${uuid}`;

  const onCopy = () => {
    void navigator.clipboard.writeText(link);
    enqueueSnackbar(`Copied ${name} url to clipboard`, {
      autoHideDuration: 3000,
      variant: "info",
    });
  };

  const onDelete = () => {
    setIsDeleteModalVisible(false); // Close the modal
    enqueueSnackbar(`Deleted ${name}`, {
      autoHideDuration: 3000,
      variant: "success",
    });
  };

  return (
    <>
      <div className="flex items-center justify-center text-surface-50">
        <div className="relative mt-2 flex w-5/6 flex-col items-center rounded-xl bg-primary-500 shadow-md">
          <div className="w-full">
            <div className="card variant-glass flex items-center justify-between p-4">
              <h5 className="h5 font-sans text-xl font-bold">{name}</h5>
              <div className="flex items-center">
                <button
                  className="mr-2 flex items-center justify-center rounded-full bg-primary-500 text-surface-50"
                  onClick={onCopy}
                >
                  <CopyIcon className="h-6 w-6" />
                </button>
                <Link
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full bg-primary-500 text-surface-50"
                >
                  <OpenInNewWindowIcon className="h-6 w-6" />
                </Link>
                <button
                  className="mr-2 flex items-center justify-center rounded-full bg-primary-500 text-surface-50"
                  onClick={() => setIsDeleteModalVisible(true)}
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
            <p className="text-dark-text-500">
              Are you sure you want to delete {name}?
            </p>
          }
          onCancel={() => setIsDeleteModalVisible(false)}
          onConfirm={onDelete}
        />
      )}
    </>
  );
};

export default ListItem;
