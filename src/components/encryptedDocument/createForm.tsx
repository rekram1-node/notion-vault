import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { LoadingSpinner } from "~/components/loading";
import { useCreateEncryptedDocument } from "./useCreateEncryptedDocument";

const CreateForm = ({ onClose }: { onClose: () => void }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { mutate, isLoading } = useCreateEncryptedDocument(() => closeModal());

  const passwordClassName = (err: string) =>
    `block w-full rounded-lg border ${err ? "border-red-500" : "border-dark-text-200"} bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 ${err ? "" : "focus:border-primary-500"} focus:outline-none`;
  const setPasswordClassName =
    error !== "Passwords do not match."
      ? passwordClassName(error)
      : passwordClassName("");
  const confirmPasswordClassName =
    error === "Passwords do not match."
      ? passwordClassName(error)
      : passwordClassName("");

  const disabled =
    error !== "" ||
    !name ||
    !password ||
    !confirmPassword ||
    confirmPassword !== password;

  const closeModal = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setName("");
    onClose();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setDebouncedError = useCallback(
    debounce((err: string) => {
      setError(err);
    }, 750),
    [],
  );

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
    if (!value) {
      setDebouncedError("");
    } else if (!value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
      setDebouncedError(
        "Password needs: 8 characters, at least one number, at least one uppercase and one lowercase letter.",
      );
    } else {
      setError("");
    }
  };

  const onConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setConfirmPassword(value);
    if (!value) {
      setDebouncedError("");
    } else if (value !== password) {
      setDebouncedError("Passwords do not match.");
    } else {
      setError("");
    }
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
                    required
                    placeholder="Name of the page"
                    className="block w-full rounded-lg border border-dark-text-200 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:border-primary-500"
                    value={name}
                    onChange={(e) => {
                      const { value } = e.currentTarget;
                      setName(value);
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
                    required
                    placeholder="••••••••"
                    className={setPasswordClassName}
                    value={password}
                    onChange={onPasswordChange}
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
                    required
                    placeholder="••••••••"
                    className={confirmPasswordClassName}
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    onKeyDown={(e) => {
                      if (disabled || isLoading) return;
                      if (e.key === "Enter") {
                        void mutate(name, password);
                      }
                    }}
                  />
                </div>
                <div className="mt-1 h-5 w-full max-w-md">
                  <p className="text-xs italic text-red-500">{error}</p>
                </div>
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
