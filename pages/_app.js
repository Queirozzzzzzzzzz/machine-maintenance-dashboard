import "components/css/index.css";
import { UserProvider } from "pages/interface";
import Layout from "/components/layout.js";
import { Toaster } from "sonner";
import { useRouter } from "next/router";
import Header from "/components/header.js";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <UserProvider>
      <Layout>
        <Toaster />
        {router.pathname !== "/login" && router.pathname !== "/signup" && (
          <Header></Header>
        )}
        <Component {...pageProps} />
      </Layout>
    </UserProvider>
  );
}
