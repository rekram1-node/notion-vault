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
import { LockOpen1Icon } from "@radix-ui/react-icons";
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
        name: data.name,
        decryptedContent,
        iv: data.iv,
        documentSalt: data.documentSalt,
      });
      setIsLocked(false);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const content: JSONContent = JSON.parse(decryptedContent);
      setDocumentContent(content);
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

  // ignore loading for now...
  const { mutate } = api.encryptedDocuments.update.useMutation({
    onSuccess: () => {
      // This should really be done "google drive style"
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
    <>
      <main className="flex min-h-screen w-full items-center justify-center">
        {isGetSaltDataLoading || !salt?.passwordSalt ? (
          isGetSaltDataLoading ? (
            <div className="w-full max-w-sm rounded-lg bg-surface-100 p-6 shadow-lg">
              <div className="flex flex-grow items-center justify-center pb-10 pt-10">
                <LoadingSpinner size={60} />
              </div>
            </div>
          ) : (
            <div className="h-screen w-screen">
              <CreateForm id={documentId} />
            </div>
          )
        ) : (
          <>
            {isLocked && (
              <PasswordForm
                formTitle="Your content is locked. Enter your password to continue"
                inputPlaceholder="Enter Password"
                submitButtonName="Unlock"
                isLoading={isValidatePasswordLoading}
                handlePassword={handlePasswordSubmit}
              />
            )}
            {!isLocked && documentData && (
              <div className="flex max-h-screen w-screen flex-col gap-6 overflow-auto rounded-md border bg-card p-6">
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
                <div className="h-screen w-full">
                  <Editor initialValue={documentContent} onChange={autoSave} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default EncryptedDocumentPage;
