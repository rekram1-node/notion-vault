import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { useState } from "react";
import { LoadingSpinner } from "~/components/loading";
import PasswordForm, {
  type PasswordSubmitResult,
} from "~/components/passwordForm";
import { api } from "~/utils/api";

// type Repo = {
//   name: string
//   stargazers_count: number
// }

export const getStaticProps = (async (ctx) => {
  const slug = ctx.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");
  const documentId = slug;
  return { props: { documentId } };
}) satisfies GetStaticProps<{
  documentId: string;
}>;

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

const EncryptedDocumentPage = ({
  documentId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  // const isLoading = true;
  const { data, isLoading } = api.encryptedDocuments.getBase.useQuery({
    id: documentId,
  });

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
        {isLoading ? (
          <div className="w-full max-w-sm rounded-lg bg-surface-100 p-6 shadow-lg">
            <div className="flex flex-grow items-center justify-center pb-10 pt-10">
              <LoadingSpinner size={60} />
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
};

export default EncryptedDocumentPage;
