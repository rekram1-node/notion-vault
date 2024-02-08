import { useState } from "react";
import { EyeOpenIcon, EyeNoneIcon, LockOpen1Icon } from "@radix-ui/react-icons";

const ProtectedPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState("Encrypted content from server");
  const [error, setError] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);

  // Placeholder for decryption function
  const decryptContent = (_encryptedContent: string) => {
    // Simulate decryption, replace this with actual decryption logic
    return "Decrypted content: This is a secret message!";
  };

  const handlePasswordSubmit = () => {
    // Simulate password check
    if (password === "correctPassword") {
      setIsAuthenticated(true);
      setContent(decryptContent(content));
      setError(false);
    } else {
      setError(true); // Set error state to trigger UI changes
      setPassword("");
      setTimeout(() => setError(false), 820);
    }
  };

  const handleEyeClick = () => {
    setEyeOpen(!eyeOpen);
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-surface-100 w-full max-w-sm rounded-lg p-6 shadow-lg">
        {!isAuthenticated ? (
          <div className="flex flex-col space-y-4">
            <p className="text-dark-text-500 text-center font-semibold">
              Your content is locked. Verify your master password to continue
            </p>
            <div className="flex items-center">
              <input
                type={eyeOpen ? "password" : "text"}
                placeholder="Enter Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePasswordSubmit();
                }}
                className="input input-bordered border-neutral bg-surface-50 text-dark-text-500 w-full rounded p-2"
              />
              <button
                onClick={handleEyeClick}
                className="text-dark-text-500 ml-2"
              >
                {eyeOpen ? (
                  <EyeOpenIcon className="h-5 w-5" />
                ) : (
                  <EyeNoneIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-error text-center text-sm">
                Incorrect password, please try again.
              </p>
            )}
            <button
              onClick={handlePasswordSubmit}
              className="bg-surface-200 text-dark-text-500 hover:bg-surface-300 flex items-center justify-center rounded p-2"
            >
              <LockOpen1Icon className="mr-2" />
              Unlock
            </button>
          </div>
        ) : (
          <p className="text-dark-text-500">{content}</p>
        )}
      </div>
    </div>
  );
};

export default ProtectedPage;
