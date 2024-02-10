import { PlusCircledIcon } from "@radix-ui/react-icons";
import ListItem from "~/components/protectedPage/listItem";

const Home = () => {
  const hasPages = false;
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
              <button type="button" className="">
                <PlusCircledIcon className="h-8 w-8 rounded-full bg-primary-500 text-surface-50" />
              </button>
            </div>
            {hasPages && (
              <>
                <ListItem name="My First Protected Page" uuid="" />
                <ListItem name="My Second Protected Page" uuid="" />
                <ListItem name="My Third Protected Page" uuid="" />
                <ListItem name="My Fourth Protected Page" uuid="" />
              </>
            )}
            {!hasPages && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-primary-500 opacity-75">
                <span className="text-2xl font-medium">
                  You have no protected pages, click the add button to create
                  one!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
