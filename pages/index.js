import { useRouter } from "next/router";
import { useEffect } from "react";

import { useUser } from "pages/interface";

export default function Home() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();

  useEffect(() => {
    if (router && !user && !isLoadingUser) {
      router.push(`/login`);
    }
  }, [user, router, isLoadingUser]);

  async function handleLogoutSubmit() {
    await fetch("/api/v1/sessions", { method: "DELETE" });
  }

  return (
    <>
      <h1>Dashboard</h1>
      <form onClick={handleLogoutSubmit}>
        <button type="submit">Sair</button>
      </form>
    </>
  );
}
