const AlertMessage = ({ children }) => {
  if (!children) {
    return null;
  }

  return (
    <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
      {children}
    </p>
  );
};

const ToastMessage = ({ children }) => {
  if (!children) {
    return null;
  }

  return (
    <div className="fixed top-24 right-6 z-50 animate-[toast-in_220ms_ease-out] motion-reduce:animate-none rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
          !
        </span>
        <span>{children}</span>
      </div>
    </div>
  );
};

export { AlertMessage, ToastMessage };
