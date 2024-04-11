import { useState } from "react";
import { debounce } from "lodash";
import { LoadingSpinner } from "~/components/loading";
import { useInitializeEncryptedDocument } from "./useInitializeEncryptedDocument";

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

const CreateForm = ({ id }: { id: string }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate, isLoading } = useInitializeEncryptedDocument(id, () =>
    closeModal(),
  );

  const validPassword =
    password !== "" && password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;
  const isError = !validPassword || !passwordsMatch;

  const disabled =
    isError || !password || !confirmPassword || confirmPassword !== password;

  const closeModal = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
  };

  const onConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setConfirmPassword(value);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          className="rounded-lg bg-secondary-100 p-4 text-surface-50 shadow-lg"
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation();
          }}
        >
          <h2 className="text-lg font-bold text-dark-text-500">
            Initialize Protected Page
          </h2>
          <form className="mt-2 h-auto w-full" style={{ minWidth: "600px" }}>
            <div className="flexflex-wrap -mx-3 mb-6">
              <div className="px-3 pt-2">
                <div className="mb-1">
                  <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                    Set Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    placeholder="••••••••"
                    className={
                      password === "" || validPassword
                        ? "block w-full rounded-lg border border-dark-text-200 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:border-primary-500 focus:outline-none"
                        : "block w-full rounded-lg border border-red-500 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:outline-none"
                    }
                    onChange={debounce(onPasswordChange, 600)}
                  />
                </div>
                <div className="mb-4">
                  {password !== "" && !validPassword && (
                    <p className="text-xs italic text-red-500">
                      Password needs: 8 characters, at least one number, at
                      least one uppercase and one lowercase letter.
                    </p>
                  )}
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
                    className={
                      confirmPassword === "" || passwordsMatch
                        ? "block w-full rounded-lg border border-dark-text-200 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:border-primary-500 focus:outline-none"
                        : "block w-full rounded-lg border border-red-500 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:outline-none"
                    }
                    onChange={debounce(onConfirmPasswordChange, 600)}
                    onKeyDown={(e) => {
                      if (disabled || isLoading) return;
                      if (e.key === "Enter") {
                        void mutate(password);
                      }
                    }}
                  />
                </div>
                <div className="mt-1 h-5 w-full max-w-md">
                  {confirmPassword !== "" && !passwordsMatch && (
                    <p className="text-xs italic text-red-500">
                      Passwords do not match.
                    </p>
                  )}
                </div>
                <p className="text-s mt-4 italic text-dark-text-400">
                  This password will be used to decrypt your page, remember it
                </p>
              </div>
            </div>
          </form>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className={`rounded bg-primary-500 px-4 py-2 hover:bg-primary-700 ${disabled || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={async () => mutate(password)}
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
