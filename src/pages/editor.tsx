import Editor from "~/components/editor/editor";

const EditPage = () => {
  return (
    <>
      {/* This turns out pretty good but there is a hint of weirdness with the "invisible navbar" */}
      <div className="flex h-screen items-center justify-center overflow-hidden">
        <div className="max-h-[calc(100vh-5rem)] w-full overflow-y-auto">
          <Editor />
        </div>
      </div>
    </>
  );
};

export default EditPage;
