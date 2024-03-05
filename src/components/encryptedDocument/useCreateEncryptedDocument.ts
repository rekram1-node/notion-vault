import { useState, useCallback } from 'react';
import {
    createSalt,
    encryptData,
    deriveDocumentKey,
    hashPassword,
} from "~/encryption/encryption";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useSnackbar } from "notistack";
import { EmptyState } from "~/components/editor/editor";

export const useCreateEncryptedDocument = (onSuccess: () => void) => {
    const { user } = useUser();
    const { enqueueSnackbar } = useSnackbar();
    const utils = api.useUtils();
    const [loading, setLoading] = useState(false);

    const { mutate: createPageMutate, isLoading: isCreatePageLoading } =
        api.encryptedDocuments.create.useMutation({
            onSuccess: () => {
                void utils.encryptedDocuments.getAll.invalidate();
                onSuccess();
                enqueueSnackbar("Successfully created new page!", {
                    autoHideDuration: 3000,
                    variant: "success",
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
                    "Failed to create protected page! Please try again later.",
                    {
                        autoHideDuration: 3000,
                        variant: "error",
                    },
                    );
                }
            },
        });

    const mutate = useCallback(async(name: string, password: string) => {
        setLoading(true);
        const passwordString = user?.id + password;
        try {
            const documentSalt = createSalt();
            const iv = createSalt();
            const documentKey = await deriveDocumentKey(passwordString, documentSalt);
            const encryptedData = await encryptData(EmptyState, iv, documentKey);
            const passwordSalt = createSalt();
            const passwordHash = await hashPassword(passwordString, passwordSalt);

            createPageMutate({
                name,
                encryptedContent: encryptedData,
                passwordHash: passwordHash,
                passwordSalt: passwordSalt.toString("base64"),
                iv: iv.toString("base64"),
                documentSalt: documentSalt.toString("base64"),
              });
        } catch(e: unknown) {
            enqueueSnackbar("Failed to hash password", {
                autoHideDuration: 3000,
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createPageMutate]); 
    const isLoading = loading || isCreatePageLoading;

    return { mutate, isLoading };
}