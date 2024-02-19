/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PlusCircledIcon } from "@radix-ui/react-icons";
import ListItem from "~/components/protectedPage/listItem";
import { useState, useEffect } from "react";
import { createSalt, decryptData, encryptData } from "~/encryption/encryption";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { useSnackbar } from "notistack";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const argon2 = require("argon2-browser");

interface Argon2HashResult {
  hash: Buffer;
  hashHex: string;
  encoded: string;
}

const Home = () => {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isTyping) {
      const handler = setTimeout(() => {
        if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
          setError(
            "Password needs: 8 characters, at least one number, at least one uppercase and one lowercase letter.",
          );
        } else if (password !== confirmPassword && confirmPassword !== "") {
          setError("Passwords do not match.");
        } else {
          setError("");
        }
        setIsTyping(false);
      }, 500); // Delay for 500ms before showing error

      return () => clearTimeout(handler);
    }
  }, [password, confirmPassword, isTyping]);

  const passwordClassName = (err: string) =>
    `block w-full rounded-lg border ${err ? "border-red-500" : "border-dark-text-200"} bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 ${err ? "" : "focus:border-primary-500"} focus:outline-none`;
  const setPasswordClassName = passwordClassName(error);
  const confirmPasswordClassName =
    error === "Passwords do not match."
      ? passwordClassName(error)
      : passwordClassName("");

  const disabled =
    error !== "" ||
    !password ||
    !confirmPassword ||
    confirmPassword !== password;

  const hasPages = true;

  const { mutate, isLoading: isCreatePageLoading } =
    api.pages.create.useMutation({
      onSuccess: () => {
        // void ctx.posts.getAll.invalidate();
        closeModal();
        enqueueSnackbar("Successfully created new page!", {
          autoHideDuration: 3000,
          variant: "success",
        });
        return;
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

  const onCreate = async () => {
    const passwordString = user?.id + password;
    const documentSalt = createSalt();
    const iv = createSalt();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derivedKeyHash = (await argon2.hash({
      pass: passwordString,
      salt: documentSalt,
      time: 2,
      mem: 2 ** 17,
      parallelism: 1,
      hashLen: 32,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: argon2.ArgonType.Argon2id,
    })) as Argon2HashResult;
    const documentKey = derivedKeyHash?.hash;
    // encrypt doc
    const encryptedData = await encryptData("", iv, documentKey);
    // encrypt password
    const passwordSalt = createSalt();
    const passwordHash = (await argon2.hash({
      pass: passwordString,
      salt: passwordSalt,
      time: 2,
      mem: 2 ** 17,
      parallelism: 1,
      hashLen: 32,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: argon2.ArgonType.Argon2id,
    })) as Argon2HashResult;

    mutate({
      name,
      encryptedContent: encryptedData,
      passwordHash: passwordHash.encoded,
      passwordSalt: passwordSalt.toString("base64"),
      iv: iv.toString("base64"),
      documentSalt: documentSalt.toString("base64"),
    });
  };

  const closeModal = () => {
    setIsCreateModalVisible(false);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setName("");
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <div
          className="relative mt-2 flex h-fit w-1/2 flex-col items-center rounded-xl bg-surface-100 shadow-md"
          style={{ minWidth: "300px", minHeight: "400px" }}
        >
          <div className="flex w-full flex-col">
            <div className="card variant-glass flex items-center justify-between p-4">
              <h5 className="h5 font-sans text-xl font-bold text-primary-500">
                Your Protected Pages
              </h5>
              <button onClick={() => setIsCreateModalVisible(true)}>
                <PlusCircledIcon className="h-8 w-8 rounded-full bg-primary-500 text-surface-50" />
              </button>
            </div>
            {hasPages ? (
              <>
                <ListItem name="My First Protected Page" uuid="someMockUUID1" />
                <ListItem
                  name="My Second Protected Page"
                  uuid="someMockUUID2"
                />
                <ListItem name="My Third Protected Page" uuid="someMockUUID3" />
                <ListItem
                  name="My Fourth Protected Page"
                  uuid="someMockUUID4"
                />
              </>
            ) : (
              <div className="flex flex-grow items-center justify-center pt-28 text-center text-primary-500 opacity-75">
                <span className="text-2xl font-medium">
                  You have no protected pages, click the add button to create
                  one!
                </span>
              </div>
            )}
            {isCreateModalVisible && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                onClick={closeModal}
              >
                <div
                  className="rounded-lg bg-secondary-100 p-4 text-surface-50 shadow-lg"
                  onClick={(
                    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
                  ) => {
                    e.stopPropagation();
                  }}
                >
                  <h2 className="text-lg font-bold text-dark-text-500">
                    Create New Protected Page
                  </h2>
                  <form className="mt-2 h-auto w-full max-w-2xl">
                    <div className="-mx-3 mb-6 flex flex-wrap">
                      <div className="w-full px-3 pt-2">
                        <div className="mb-4">
                          <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                            Page Name
                          </label>
                          <input
                            name="name"
                            id="name"
                            placeholder="Name of the page"
                            className="block w-full rounded-lg border border-dark-text-200 bg-dark-text-100 px-4 py-3 leading-tight text-dark-text-500 focus:border-primary-500"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                            }}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                            Set Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            className={setPasswordClassName}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setIsTyping(true);
                            }}
                          />
                        </div>
                        <div className="mb-1">
                          <label className="mb-1 block text-sm font-semibold text-dark-text-500">
                            Confirm password
                          </label>
                          <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            placeholder="••••••••"
                            className={confirmPasswordClassName}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setIsTyping(true);
                            }}
                          />
                        </div>
                        {error && (
                          <p className="mt-1 text-xs italic text-red-500">
                            {error}
                          </p>
                        )}
                        <p className="text-s mt-4 italic text-dark-text-400">
                          This password will be used to decrypt your page,
                          remember it
                        </p>
                      </div>
                    </div>
                  </form>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      className={`rounded bg-error-light px-4 py-2 hover:bg-error-normal`}
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      className={`rounded bg-primary-500 px-4 py-2 hover:bg-primary-700 ${disabled || isCreatePageLoading ? "cursor-not-allowed opacity-50" : ""}`}
                      onClick={async () => {
                        await onCreate();
                      }}
                      disabled={disabled || isCreatePageLoading}
                    >
                      {isCreatePageLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Loading...
                        </div>
                      ) : (
                        "Create"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
