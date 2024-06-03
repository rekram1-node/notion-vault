import { PlusCircledIcon } from "@radix-ui/react-icons";
import EncryptedDocument from "~/components/encryptedDocument/encryptedDocument";
import { useState } from "react";
import { api } from "~/utils/api";
import CreateForm from "~/components/encryptedDocument/createForm";
import EncryptedDocumentSkeleton from "~/components/encryptedDocument/encryptedDocumentSkeleton";

const Home = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { data: documents, isLoading } =
    api.encryptedDocuments.getAll.useQuery();

  return (
    <>
      <div className="flex h-screen w-full justify-center pt-2">
        <div className="flex w-[80%] flex-col">
          <div className="card variant-glass flex items-center justify-between px-1 pb-4 pt-4">
            <h5 className="text-xl font-semibold">Your Protected Pages</h5>
            <button
              onClick={() => setIsCreateModalVisible(true)}
              title="Create protected page"
            >
              <PlusCircledIcon className="h-10 w-10 rounded-full bg-primary text-accent hover:brightness-75" />
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
                    <EncryptedDocument key={index} document={document} />
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
        </div>
      </div>
    </>
  );
};

export default Home;
