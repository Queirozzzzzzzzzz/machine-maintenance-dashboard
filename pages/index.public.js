import { useRouter } from "next/router";
import { useEffect } from "react";

import { useUser } from "pages/interface";

export default function Home() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push(`/login`);

    if (router && user) {
      if (user.features.includes("admin")) {
        router.push("/manager/dashboard");
      } else {
        router.push("/maintenances");
      }
    }
  }, [user, router, isLoadingUser]);

  return (
    <>
      <h1>Carregando...</h1>
    </>
  );
}
