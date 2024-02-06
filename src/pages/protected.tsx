import { useState } from "react";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";

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
    <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          {!isAuthenticated ? (
            <div className="flex flex-col space-y-4">
              <p className="text-center font-normal">
                Your content is locked. Verify your master password to continue
              </p>{" "}
              {/* << May want to increase font */}
              <div className="flex items-center">
                <input
                  type={eyeOpen ? "password" : "text"}
                  placeholder="Enter Master Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-grow rounded border p-2"
                />
                <button
                  onClick={handleEyeClick}
                  className="ml-2" // Add some left margin to separate it from the input
                >
                  {eyeOpen ? (
                    <EyeOpenIcon className="h-5 w-5" />
                  ) : (
                    <EyeNoneIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-center text-sm text-red-500">
                  Incorrect password, please try again.
                </p>
              )}
              <button
                onClick={handlePasswordSubmit}
                className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          ) : (
            <p>{content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProtectedPage;
