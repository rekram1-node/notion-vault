export default function Custom404() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg bg-surface-100 p-6 text-center shadow-lg">
        <h5 className="font-sans text-xl font-bold text-primary-500">
          404 - Not Found
        </h5>
        <p className="mt-2 font-sans text-base text-primary-400">
          This Page Does Not Exist
        </p>
      </div>
    </div>
  );
}
