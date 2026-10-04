import { useEffect, useState } from "react";

const ToastHost = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const showToast = (event) => {
      setToast(event.detail);
      window.setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener("bloodcare:toast", showToast);
    return () => window.removeEventListener("bloodcare:toast", showToast);
  }, []);

  if (!toast) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center sm:left-auto sm:max-w-md sm:justify-end">
      <div
        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${toast.type === "success" ? "bg-emerald-700 text-white" : "bg-rose-700 text-white"}`}
        role="status"
      >
        {toast.message}
      </div>
    </div>
  );
};

export default ToastHost;
