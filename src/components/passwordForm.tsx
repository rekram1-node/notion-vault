import { useState } from "react";
import { EyeOpenIcon, EyeNoneIcon, LockOpen1Icon } from "@radix-ui/react-icons";

export interface PasswordSubmitResult {
  valid: boolean;
  errMsg: string;
}

interface PasswordFormParams {
  formTitle: string;
  inputPlaceholder: string;
  submitButtonName: string;
  handlePassword(password: string): PasswordSubmitResult;
}

const PasswordForm = ({
  formTitle,
  inputPlaceholder,
  submitButtonName,
  handlePassword,
}: PasswordFormParams) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [eyeOpen, setEyeOpen] = useState(true);

  const handlePasswordSubmit = () => {
    const { valid, errMsg } = handlePassword(password);
    if (!valid) {
      setError(errMsg);
      setTimeout(() => setError(""), 820);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
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
                if (e.key === "Enter") handlePasswordSubmit();
              }}
              className="input input-bordered border-neutral w-full rounded bg-surface-50 p-2 text-dark-text-500"
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
          {error && <p className="text-center text-sm text-error">{error}</p>}
          <button
            onClick={handlePasswordSubmit}
            className="flex items-center justify-center rounded bg-primary-600 p-2 text-surface-50 hover:bg-primary-950"
          >
            <LockOpen1Icon className="mr-2" />
            {submitButtonName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordForm;
