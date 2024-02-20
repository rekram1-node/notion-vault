import { PlusCircledIcon } from "@radix-ui/react-icons";
import ProtectedPageList from "~/components/protectedPage/protectedPageList";
import { useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";
import CreateForm from "~/components/protectedPage/createForm";

const Home = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { data, isLoading } = api.pages.getAll.useQuery();

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
            {isLoading && (
              <div className="flex flex-grow items-center justify-center pt-28">
                <LoadingSpinner size={60} />
              </div>
            )}
            {!isLoading &&
              (data && data.length > 0 ? (
                <ProtectedPageList pages={data} />
              ) : (
                <div className="flex flex-grow items-center justify-center pt-28 text-center text-primary-500 opacity-75">
                  <span className="text-2xl font-medium">
                    You have no protected pages, click the add button to create
                    one!
                  </span>
                </div>
              ))}
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
