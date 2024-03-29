import { useState } from "react";
import { EyeOpenIcon, EyeNoneIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { LoadingSpinner } from "./loading";

export interface PasswordSubmitResult {
  valid: boolean;
  errMsg: string;
}

interface PasswordFormParams {
  formTitle: string;
  inputPlaceholder: string;
  submitButtonName: string;
  isLoading: boolean;
  handlePassword(password: string): Promise<PasswordSubmitResult>;
}

const PasswordForm = ({
  formTitle,
  inputPlaceholder,
  submitButtonName,
  isLoading,
  handlePassword,
}: PasswordFormParams) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [eyeOpen, setEyeOpen] = useState(true);

  const handlePasswordSubmit = async () => {
    const { valid, errMsg } = await handlePassword(password);
    if (!valid) {
      setError(errMsg);
      setTimeout(() => setError(""), 820);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-lg bg-surface-100 p-6 shadow-lg">
      <div className="flex flex-col space-y-4">
        <p className="text-center font-semibold text-dark-text-500">
          {formTitle}
        </p>
        <div className="flex items-center">
          <input
            type={eyeOpen ? "password" : "text"}
            placeholder={inputPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handlePasswordSubmit();
              }
            }}
            className="input input-bordered border-neutral w-full rounded bg-surface-50 p-2 text-dark-text-500"
            required
          />
          <button
            onClick={() => setEyeOpen(!eyeOpen)}
            className="ml-2 text-dark-text-500"
          >
            {eyeOpen ? (
              <EyeOpenIcon className="h-5 w-5" />
            ) : (
              <EyeNoneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && <p className="text-error text-center text-sm">{error}</p>}
        <button
          onClick={handlePasswordSubmit}
          className="flex items-center justify-center rounded bg-primary-600 p-2 text-surface-50 hover:bg-primary-950"
        >
          {!isLoading && (
            <>
              <LockOpen1Icon className="mr-2" />
              {submitButtonName}
            </>
          )}
          {isLoading && (
            <div className="py-1">
              <LoadingSpinner />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordForm;
