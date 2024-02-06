import { useState } from 'react';

const ProtectedPage = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState('Encrypted content from server');
  const [error, setError] = useState(false);

  // Placeholder for decryption function
  const decryptContent = (encryptedContent: string) => {
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
      setPassword('');
      setTimeout(() => setError(false), 820);
    }
  };

  return (
    <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-sm w-full">
          {!isAuthenticated ? (
            <div className="flex flex-col space-y-4">
              <p className="text-center font-normal">Your content is locked. Verify your master password to continue</p> {/* << May want to increase font */}
              <input
                type="password"
                placeholder="Enter Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded "
              />
              {/* ADD HIDDEN INPUT TOGGLE BUTTON */}
              {error && <p className="text-red-500 text-sm text-center">Incorrect password, please try again.</p>}
              <button
                onClick={handlePasswordSubmit}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
