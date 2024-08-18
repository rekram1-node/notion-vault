import { PlusCircledIcon } from "@radix-ui/react-icons";
import EncryptedDocument from "~/components/encryptedDocument/encryptedDocument";
import { useState } from "react";
import { api } from "~/utils/api";
import CreateForm from "~/components/encryptedDocument/createForm";
import EncryptedDocumentSkeleton from "~/components/encryptedDocument/encryptedDocumentSkeleton";
import { env } from "~/env";
import { Notion, type Page } from "~/lib/notion/notion";
import { useSnackbar } from "notistack";
import { getAuth } from "@clerk/nextjs/server";
import { type GetServerSideProps } from "next";
import NotionPagesForm from "~/components/encryptedDocument/notionPagesForm";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);

  if (!userId) {
    return { props: {} };
  }

  const notion = await Notion.New(userId);
  if (!notion.isOk) {
    console.error(notion.error);
    return { props: {} };
  }
  const pages = await notion.data.ReadPages();

  if (!pages.isOk) {
    console.error(pages.error);
    return { props: {} };
  }

  return { props: { notionPages: pages.data } };
};

const Home = ({ notionPages }: { notionPages: Page[] }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isNotionModalVisible, setIsNotionModalVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState<null | string>();
  const { data: documents, isLoading } =
    api.encryptedDocuments.getAll.useQuery();

  const disabled =
    isLoading ||
    (documents && documents.length >= Number(env.NEXT_PUBLIC_MAX_PAGES));

  const { mutate } = api.encryptedDocuments.addToNotionDocument.useMutation({
    onSuccess: () => {
      enqueueSnackbar("Added document to notion", {
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
          "Failed to add protected page! Please try again later.",
          {
            autoHideDuration: 3000,
            variant: "error",
          },
        );
      }
    },
  });

  const onAddToNotion = (pageId: string) => {
    if (!selectedPage) {
      return;
    }
    mutate({
      encryptedDocumentId: selectedPage,
      pageId: pageId,
    });
  };

  return (
    <>
      <div className="flex h-full w-full justify-center pt-2">
        <div className="flex w-[80%] flex-col">
          <div className="card variant-glass flex items-center justify-between px-1 pb-4 pt-4">
            <h5 className="text-xl font-semibold">Your Protected Pages</h5>
            <button
              onClick={() => setIsCreateModalVisible(true)}
              disabled={disabled}
              title="Create protected page"
            >
              <PlusCircledIcon
                className={`h-10 w-10 rounded-full bg-primary text-accent hover:brightness-75 ${disabled ? "cursor-not-allowed opacity-20" : ""}`}
              />
            </button>
          </div>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <EncryptedDocumentSkeleton key={index} />
            ))}
          {!isLoading && (
            <div>
              {documents && documents.length > 0 ? (
                <div>
                  {documents.map((document, index) => (
                    <EncryptedDocument
                      key={index}
                      document={document}
                      onAddToNotion={() => setIsNotionModalVisible(true)}
                      setSelectedPage={setSelectedPage}
                    />
                  ))}
                </div>
              ) : (
                <div className="mx-auto flex items-center justify-center p-36">
                  <div className="text-center">
                    You have no encrypted documents, click the plus sign to
                    create one
                  </div>
                </div>
              )}
            </div>
          )}
          {isCreateModalVisible && (
            <CreateForm onClose={() => setIsCreateModalVisible(false)} />
          )}
          {isNotionModalVisible && (
            <NotionPagesForm
              pages={notionPages}
              closeModal={() => setIsNotionModalVisible(false)}
              onAddPage={onAddToNotion}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
