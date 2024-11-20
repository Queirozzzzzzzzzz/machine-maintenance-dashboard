import { useRouter } from "next/router";
import { useEffect } from "react";

import { useUser } from "pages/interface";

export default function MaintenancesPending() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push(`/login`);

    if (router && user) {
      if (!user.features.includes("admin")) router.push("/login");
      else if (true) console.log(true);
    }
  }, [user, router, isLoadingUser]);

  return (
    <>
      <h1>Manutenções Solicitadas</h1>
    </>
  );
}
