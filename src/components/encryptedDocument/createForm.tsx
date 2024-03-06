import { useState, useEffect } from "react";
import { LoadingSpinner } from "~/components/loading";
import { useCreateEncryptedDocument } from "./useCreateEncryptedDocument";

const CreateForm = ({ onClose }: { onClose: () => void }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { mutate, isLoading } = useCreateEncryptedDocument(() => closeModal());

  useEffect(() => {
    if (isTyping) {
      const handler = setTimeout(() => {
        if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
          setError(
            "Password needs: 8 characters, at least one number, at least one uppercase and one lowercase letter.",
          );
        } else if (password !== confirmPassword && confirmPassword !== "") {
          setError("Passwords do not match.");
        } else {
          setError("");
        }
        setIsTyping(false);
      }, 500); // Delay for 500ms before showing error

      return () => clearTimeout(handler);
    }
  }, [password, confirmPassword, isTyping]);

  const passwordClassName = (err: string) =>
    `block w-full rounded-lg border ${err ? "border-red-500" : "border-dark-text-200"} bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 ${err ? "" : "focus:border-primary-500"} focus:outline-none`;
  const setPasswordClassName = passwordClassName(error);
  const confirmPasswordClassName =
    error === "Passwords do not match."
      ? passwordClassName(error)
      : passwordClassName("");

  const disabled =
    error !== "" ||
    !password ||
    !confirmPassword ||
    confirmPassword !== password;

  // const onCreate = async () => {
  //   await mutate(password, name);
  // };

  const closeModal = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setName("");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={closeModal}
      >
        <div
          className="rounded-lg bg-secondary-100 p-4 text-surface-50 shadow-lg"
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation();
          }}
        >
          <h2 className="text-lg font-bold text-dark-text-500">
            Create New Protected Page
          </h2>
          <form className="mt-2 h-auto w-full max-w-2xl">
            <div className="-mx-3 mb-6 flex flex-wrap">
              <div className="w-full px-3 pt-2">
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                    Page Name
                  </label>
                  <input
                    name="name"
                    id="name"
                    placeholder="Name of the page"
                    className="block w-full rounded-lg border border-dark-text-200 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:border-primary-500"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                    Set Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className={setPasswordClassName}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsTyping(true);
                    }}
                  />
                </div>
                <div className="mb-1">
                  <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="••••••••"
                    className={confirmPasswordClassName}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setIsTyping(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void mutate(name, password);
                      }
                    }}
                  />
                </div>
                {error && (
                  <p className="mt-1 text-xs italic text-red-500">{error}</p>
                )}
                <p className="text-s mt-4 italic text-dark-text-400">
                  This password will be used to decrypt your page, remember it
                </p>
              </div>
            </div>
          </form>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className={`rounded bg-error-light px-4 py-2 hover:bg-error-normal`}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className={`rounded bg-primary-500 px-4 py-2 hover:bg-primary-700 ${disabled || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={async () => mutate(name, password)}
              disabled={disabled || isLoading}
            >
              {!isLoading ? "Create" : <LoadingSpinner />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateForm;
