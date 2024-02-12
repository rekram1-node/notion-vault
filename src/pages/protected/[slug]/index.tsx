import PasswordForm, {
  type PasswordSubmitResult,
} from "~/components/passwordForm";
import { useState } from "react";

const ProtectedPage = () => {
  const [content, setContent] = useState({
    value: "Encrypted content from server",
    encrypted: true,
  });

  // Simulate decryption, replace this with actual decryption logic
  const decryptContent = (_encryptedContent: string) => {
    return {
      value: "Decrypted content: This is a secret message!",
      encrypted: false,
    };
  };

  const handlePasswordSubmit = (password: string): PasswordSubmitResult => {
    if (password.length === 0) {
      return {
        valid: false,
        errMsg: "Invalid Password",
      };
    }
    setContent(decryptContent(content.value));
    return {
      valid: true,
      errMsg: "",
    };
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        {content.encrypted && (
          <PasswordForm
            formTitle="Your content is locked. Verify your master password to continue"
            inputPlaceholder="Enter Master Password"
            submitButtonName="Unlock"
            handlePassword={handlePasswordSubmit}
          />
        )}
        {!content.encrypted && (
          <p className="text-dark-text-500">{content.value}</p>
        )}
      </div>
    </>
  );
};

export default ProtectedPage;
