import { LoadingSpinner } from "./loading";

const Modal = ({
  title,
  content,
  actionText,
  isLoading,
  onCancel,
  onConfirm,
}: {
  title: string;
  content: JSX.Element;
  actionText?: string;
  isLoading: boolean;
  onCancel(): void;
  onConfirm(): void;
}) => {
  const actionTxt = actionText ?? "Delete";

  const handleModalClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onCancel}
      >
        <div
          className="rounded-lg bg-secondary-100 p-4 text-surface-50 shadow-lg"
          onClick={handleModalClick}
        >
          <h2 className="text-lg font-bold text-dark-text-500">{title}</h2>
          {content}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className={`rounded bg-primary-500 px-4 py-2 hover:bg-primary-700`}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`rounded bg-error-light px-4 py-2 hover:bg-error-normal`}
              onClick={onConfirm}
            >
              {!isLoading ? actionTxt : <LoadingSpinner />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
