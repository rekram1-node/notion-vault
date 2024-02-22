import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { useState } from "react";
import { LoadingSpinner } from "~/components/loading";
import PasswordForm, {
  type PasswordSubmitResult,
} from "~/components/passwordForm";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useSnackbar } from "notistack";
import {
  hashPassword,
  decryptData,
  deriveDocumentKey,
} from "~/encryption/encryption";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("~/components/encryptedDocument/editor"), {
  ssr: false,
});

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

interface DocumentData {
  // encryptedContent: string;
  decryptedContent: string;
  // iv: string;
  // documentSalt: string;
}

const EncryptedDocumentPage = ({
  documentId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [passwordString, setPasswordString] = useState("");
  const [documentData, setDocumentData] = useState<DocumentData | undefined>();

  const { data: salt, isLoading: isGetSaltDataLoading } =
    api.encryptedDocuments.getBase.useQuery({
      id: documentId,
    });

  const {
    mutate: validatePasswordMutation,
    isLoading: isValidatePasswordLoading,
  } = api.encryptedDocuments.validatePassword.useMutation({
    onSuccess: async (data) => {
      enqueueSnackbar("Correct Password, decrypting content...", {
        //remove this
        autoHideDuration: 3000,
        variant: "success",
      });
      const documentKey = await deriveDocumentKey(
        passwordString,
        data.documentSalt,
      );
      const decryptedContent = await decryptData(
        data.encryptedContent,
        data.iv,
        documentKey,
      );
      setDocumentData({
        decryptedContent,
      });
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        enqueueSnackbar(errorMessage[0], {
          autoHideDuration: 3000,
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          "Failed to validate password! Please try again later.",
          {
            autoHideDuration: 3000,
            variant: "error",
          },
        );
      }
    },
  });

  /*
    Add error handling, try catching and make more snappy...
  */
  const handlePasswordSubmit = async (
    password: string,
  ): Promise<PasswordSubmitResult> => {
    // try {

    // } catch (e) {

    // }
    if (!salt?.passwordSalt) {
      return {
        valid: false,
        errMsg: "Document is missing critical data - contact support",
      };
    }

    if (password.length === 0) {
      return {
        valid: false,
        errMsg: "Invalid Password",
      };
    }

    setPasswordString(user?.id + password);
    const passwordHash = await hashPassword(
      user?.id + password,
      salt.passwordSalt,
    );

    validatePasswordMutation({
      id: documentId,
      hashedPassword: passwordHash,
    });

    return {
      valid: true,
      errMsg: "",
    };
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        {isGetSaltDataLoading || !salt?.passwordSalt ? (
          <div className="w-full max-w-sm rounded-lg bg-surface-100 p-6 shadow-lg">
            <div className="flex flex-grow items-center justify-center pb-10 pt-10">
              <LoadingSpinner size={60} />
            </div>
          </div>
        ) : (
          <>
            {!documentData && (
              <PasswordForm
                formTitle="Your content is locked. Verify your master password to continue"
                inputPlaceholder="Enter Master Password"
                submitButtonName="Unlock"
                isLoading={isValidatePasswordLoading}
                handlePassword={handlePasswordSubmit}
              />
            )}
            {documentData && (
              <p className="text-dark-text-500">
                Editor Below:
                <Editor decryptedContent={documentData.decryptedContent} />
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default EncryptedDocumentPage;
