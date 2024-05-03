"use client";
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
  encryptData,
  deriveDocumentKey,
} from "~/encryption/encryption";
import { Button } from "~/components/novel/ui/button";
import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import Editor from "~/components/novel/editor";
import { ThemeToggle } from "~/components/novel/themeToggle";
import { type JSONContent } from "novel";
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
  name: string;
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
  const [isLocked, setIsLocked] = useState(true);
  const [documentData, setDocumentData] = useState<DocumentData | undefined>();
  const [documentContent, setDocumentContent] = useState<JSONContent>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: salt,
    isLoading: isGetBaseLoading,
    isError: isGetBaseError,
  } = api.encryptedDocuments.getBase.useQuery({
    id: documentId,
  });

  const {
    mutate: validatePasswordMutation,
    isLoading: isValidatePasswordLoading,
  } = api.encryptedDocuments.validatePassword.useMutation({
    onSuccess: async (data) => {
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
        name: data.name,
        decryptedContent,
        iv: data.iv,
        documentSalt: data.documentSalt,
      });
      setIsLoading(false);
      setIsLocked(false);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const content: JSONContent = JSON.parse(decryptedContent);
      setDocumentContent(content);
    },
    onError: (e) => {
      setIsLoading(false);
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        enqueueSnackbar(errorMessage[0], {
          autoHideDuration: 3000,
          variant: "error",
        });
      } else {
        enqueueSnackbar("invalid password", {
          autoHideDuration: 3000,
          variant: "error",
        });
      }
    },
  });

  // need to adjust loading here
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
        enqueueSnackbar("invalid password", {
          autoHideDuration: 3000,
          variant: "error",
        });
        return {
          valid: false,
          errMsg: "",
        };
      }

      setIsLoading(true);
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

  // ignore loading for now...
  const { mutate } = api.encryptedDocuments.update.useMutation({
    // ignore on success for now...
    onSuccess: () => {
      // enqueueSnackbar("saved changes", {
      //   autoHideDuration: 2000,
      //   variant: "success",
      // });
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        enqueueSnackbar(errorMessage[0], {
          autoHideDuration: 3000,
          variant: "error",
        });
      } else {
        enqueueSnackbar("Failed to save page content! Contact Support", {
          autoHideDuration: 3000,
          variant: "error",
        });
      }
    },
  });

  const autoSave = async (editorJSON: JSONContent) => {
    setDocumentContent(editorJSON);
    if (!documentData) return;
    try {
      const documentKey = await deriveDocumentKey(
        passwordString,
        documentData.documentSalt,
      );
      const encryptedContent = await encryptData(
        JSON.stringify(editorJSON),
        documentData.iv,
        documentKey,
      );
      mutate({
        id: documentId,
        encryptedContent,
      });
    } catch (e) {
      enqueueSnackbar("Failed to autosave: " + String(e), {
        autoHideDuration: 3000,
        variant: "error",
      });
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      {isGetBaseLoading && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="bg-surface-100 flex max-w-sm justify-center rounded-lg p-6 shadow-lg">
            <LoadingSpinner size={60} />
          </div>
        </div>
      )}
      {!isGetBaseLoading && (
        <>
          {isGetBaseError ? (
            <div className="flex h-full w-full items-center justify-center">
              Invalid Document Link
            </div>
          ) : (
            <>
              {salt.passwordSalt ? (
                <>
                  {isLocked && (
                    <div className="flex w-1/2 flex-col items-center justify-start pt-2">
                      <LockClosedIcon className="mb-5" height={48} width={48} />
                      <div className="pb-5 text-center text-lg">
                        <p className="">Your content is locked. Verify your</p>
                        <p className="">password to continue.</p>
                      </div>
                      <PasswordForm
                        inputPlaceholder="Enter Password"
                        submitButtonName="Unlock"
                        isLoading={isValidatePasswordLoading || isLoading}
                        handlePassword={handlePasswordSubmit}
                      />
                    </div>
                  )}
                  {!isLocked && documentData && (
                    <div className="flex h-full w-screen flex-col gap-6 rounded-md bg-background p-6 pb-10">
                      <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-semibold">
                          {documentData.name}
                        </h1>
                        <div className="flex">
                          <ThemeToggle />
                          <Button
                            variant="outline"
                            size="icon"
                            className="ml-2"
                            onClick={() => setIsLocked(true)}
                          >
                            <LockOpen1Icon className="h-[1.2rem] w-[1.2rem] scale-100" />
                            <span className="sr-only">Lock Document</span>
                          </Button>
                        </div>
                      </div>
                      <div className="">
                        <Editor
                          initialValue={documentContent}
                          onChange={autoSave}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <CreateForm id={documentId} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EncryptedDocumentPage;
