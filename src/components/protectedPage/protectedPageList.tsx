import ListItem, { type ProtectedPage } from "./listItem";

const ProtectedPageList = ({ pages }: { pages: ProtectedPage[] }) => {
  return (
    <>
      {pages.map((page, index) => {
        return <ListItem key={index} page={page} />;
      })}
    </>
  );
};

export default ProtectedPageList;
