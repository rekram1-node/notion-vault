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
import Editor from "~/components/editor/editor";
import CreateForm from "~/components/encryptedDocument/createFormNoClose";

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
  decryptedContent: string;
  iv: string;
  documentSalt: string;
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
        iv: data.iv,
        documentSalt: data.documentSalt,
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

  const handlePasswordSubmit = async (
    password: string,
  ): Promise<PasswordSubmitResult> => {
    try {
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
    } catch (e) {
      return {
        valid: false,
        errMsg: String(e),
      };
    }
    return {
      valid: true,
      errMsg: "",
    };
  };

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center overflow-hidden">
        {isGetSaltDataLoading || !salt?.passwordSalt ? (
          isGetSaltDataLoading ? (
            <div className="w-full max-w-sm rounded-lg bg-surface-100 p-6 shadow-lg">
              <div className="flex flex-grow items-center justify-center pb-10 pt-10">
                <LoadingSpinner size={60} />
              </div>
            </div>
          ) : (
            <CreateForm id={documentId} />
          )
        ) : (
          <>
            {!documentData && (
              <PasswordForm
                formTitle="Your content is locked. Enter your password to continue"
                inputPlaceholder="Enter Password"
                submitButtonName="Unlock"
                isLoading={isValidatePasswordLoading}
                handlePassword={handlePasswordSubmit}
              />
            )}
            {documentData && (
              // consider making this smaller in the future?
              <div className="h-screen w-screen">
                <Editor
                  editorState={documentData.decryptedContent}
                  documentId={documentId}
                  passwordString={passwordString}
                  documentSalt={documentData.documentSalt}
                  iv={documentData.iv}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default EncryptedDocumentPage;
