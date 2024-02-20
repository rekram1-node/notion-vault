import EncryptedDocumentItem, {
  type EncryptedDocument,
} from "./encryptedDocumentItem";

const EncryptedDocumentsList = ({
  documents,
}: {
  documents: EncryptedDocument[];
}) => {
  return (
    <>
      {documents.map((document, index) => {
        return <EncryptedDocumentItem key={index} document={document} />;
      })}
    </>
  );
};

export default EncryptedDocumentsList;
