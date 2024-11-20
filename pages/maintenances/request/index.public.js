import { useRouter } from "next/router";
import { useEffect } from "react";

import { useUser } from "pages/interface";

export default function MaintenancesRequest() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();

  useEffect(() => {
    if (router && !user && !isLoadingUser) {
      router.push(`/login`);
    }
  }, [user, router, isLoadingUser]);

  return (
    <>
      <h1>Maintenances Request</h1>
    </>
  );
}
