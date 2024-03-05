import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import EncryptedDocumentItem, {
  type EncryptedDocument,
} from "./encryptedDocumentItem";

const ITEMS_PER_PAGE = 5;

const EncryptedDocumentsList = ({
  documents,
}: {
  documents: EncryptedDocument[];
}) => {
  documents = documents.concat(documents);
  documents = documents.concat(documents);

  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const start = currentPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentDocuments = documents.slice(start, end);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div>
      <div>
        {currentDocuments.map((document, index) => (
          <EncryptedDocumentItem key={index} document={document} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button onClick={prevPage} className="p-2">
            <ChevronLeftIcon />
          </button>
          <span>
            {currentPage + 1} of {totalPages}
          </span>
          <button onClick={nextPage} className="p-2">
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default EncryptedDocumentsList;

// import EncryptedDocumentItem, {
//   type EncryptedDocument,
// } from "./encryptedDocumentItem";

// const EncryptedDocumentsList = ({
//   documents,
// }: {
//   documents: EncryptedDocument[];
// }) => {
//   return (
//     <>
//       {documents.map((document, index) => {
//         return <EncryptedDocumentItem key={index} document={document} />;
//       })}
//     </>
//   );
// };

// export default EncryptedDocumentsList;
