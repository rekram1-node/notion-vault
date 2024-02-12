const Modal = ({
  title,
  content,
  actionText,
  onCancel,
  onConfirm,
}: {
  title: string;
  content: JSX.Element;
  actionText?: string;
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
              className={`rounded px-4 py-2 ${actionTxt !== "Delete" ? "bg-error-light hover:bg-error-normal" : "bg-primary-500 hover:bg-primary-700"}`}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`rounded px-4 py-2 ${actionTxt !== "Delete" ? "bg-primary-500 hover:bg-primary-700" : "bg-error-light hover:bg-error-normal"}`}
              onClick={onConfirm}
            >
              {actionTxt}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
