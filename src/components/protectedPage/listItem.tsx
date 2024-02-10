import { OpenInNewWindowIcon, CopyIcon } from "@radix-ui/react-icons";

interface ListItemProps {
  name: string;
  uuid: string;
}

const ListItem = ({ name }: ListItemProps) => {
  const link = `/protected`;
  return (
    <>
      <div className="flex items-center justify-center text-surface-50">
        <div className="relative mt-2 flex w-5/6 flex-col items-center rounded-xl bg-primary-500 shadow-md">
          <div className="w-full">
            <div className="card variant-glass flex items-center justify-between p-4">
              <h5 className="h5 font-sans text-xl font-bold">{name}</h5>
              <div className="flex items-center">
                <button
                  type="button"
                  className="mr-2 flex items-center justify-center rounded-full bg-primary-500 text-surface-50"
                >
                  <CopyIcon className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full bg-primary-500 text-surface-50"
                >
                  <OpenInNewWindowIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListItem;
