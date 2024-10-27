import Head from "/components/head.js";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");

    if (message) {
      const decodedMessage = decodeURIComponent(message);
      const messageType = decodedMessage.split(" ")[0];
      const actualMessage = decodedMessage.slice(messageType.length);

      switch (messageType) {
        case "error":
          toast.error(actualMessage, {
            className: "alert error",
            duration: 2000,
          });
          break;
        case "success":
          toast.success(actualMessage, {
            className: "alert success",
            duration: 2000,
          });
          break;
        default:
          toast(actualMessage, {
            className: "alert default",
            duration: 2000,
          });
      }
    }
  }, []);

  return (
    <>
      <Head />
      <main>
        <div className="container">
          <Toaster />
          {children}
        </div>
      </main>
    </>
  );
}
