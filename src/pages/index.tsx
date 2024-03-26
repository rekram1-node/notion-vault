import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import EncryptedDocumentItem from "~/components/encryptedDocument/encryptedDocumentItem";
import { useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";
import CreateForm from "~/components/encryptedDocument/createForm";

const Home = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { data: documents, isLoading } =
    api.encryptedDocuments.getAll.useQuery();

  const itemsPerPage = 5;

  const totalPages = documents ? Math.ceil(documents.length / itemsPerPage) : 0;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = documents?.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev));
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <div
          className="relative mt-2 flex h-fit w-1/2 flex-col items-center rounded-xl bg-surface-100 shadow-md"
          style={{ minWidth: "300px", minHeight: "450px" }}
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
            {isLoading && (
              <div className="flex flex-grow items-center justify-center pt-28">
                <LoadingSpinner size={60} />
              </div>
            )}
            {!isLoading && (
              <div className="flex-grow">
                {" "}
                {/* Updated this line */}
                {currentDocuments && currentDocuments.length > 0 ? (
                  currentDocuments.map((document, index) => (
                    <EncryptedDocumentItem key={index} document={document} />
                  ))
                ) : (
                  <div className="mx-auto flex max-w-4xl items-center justify-center p-36">
                    <div className="text-center text-primary-500">
                      You have no encrypted documents, click the plus sign to
                      create one
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 mt-auto flex items-center justify-between pt-4">
                  {totalPages > 0 && (
                    <>
                      <button onClick={prevPage} disabled={currentPage === 0}>
                        <ChevronLeftIcon className="h-9 w-9 text-primary-600" />
                      </button>
                      <span className="text-primary-600">
                        {currentPage + 1} of {totalPages}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages - 1}
                      >
                        <ChevronRightIcon className="h-9 w-9 text-primary-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            {isCreateModalVisible && (
              <CreateForm onClose={() => setIsCreateModalVisible(false)} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
