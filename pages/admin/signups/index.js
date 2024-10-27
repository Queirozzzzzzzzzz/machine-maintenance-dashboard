import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useUser } from "pages/interface";

export default function Home() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();
  const [signups, setSignups] = useState([]);
  const [isLoadingSignups, setisLoadingUserSignups] = useState(true);

  useEffect(() => {
    if (router && !user && !isLoadingUser) {
      router.push(`/login`);
    }

    if (user) {
      if (!user.features.includes("admin")) router.push("/login");
    }

    const fetchSignups = async () => {
      try {
        setisLoadingUserSignups(true);
        const res = await fetch("/api/v1/users/pending", { method: "GET" });
        if (!res.ok) alert("Ocorreu um erro ao enviar sua solicitação!");
        const resBody = await res.json();

        setSignups(resBody);
      } catch (err) {
        console.error("Error fetching signups:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setisLoadingUserSignups(false);
      }
    };

    fetchSignups();
  }, [user, router, isLoadingUser]);

  const acceptSignup = async (email) => {
    try {
      await Promise.all([
        fetch(`/api/v1/user/${email}/features`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: ["read:activation_token"] }),
        }),
        fetch(`/api/v1/user/${email}/features`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: ["create:session"] }),
        }),
      ]);

      setSignups((prevSignups) =>
        prevSignups.filter((signup) => signup.email !== email),
      );
    } catch (error) {
      alert("Ocorreu um erro ao enviar sua solicitação!");
    }
  };

  const denySignup = async (email) => {
    const res = await fetch(`/api/v1/user/${email}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Ocorreu um erro ao enviar sua solicitação!");
      return;
    }

    setSignups((prevSignups) =>
      prevSignups.filter((signup) => signup.email !== email),
    );
  };

  if (isLoadingUser || isLoadingSignups) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Cadastros pendentes</h1>
      {signups.map((signup) => (
        <>
          <h3>{signup.full_name}</h3>
          <p>
            <strong>Email: </strong>
            {signup.email}
          </p>
          <button onClick={() => acceptSignup(signup.email)}>Aceitar</button>
          <button onClick={() => denySignup(signup.email)}>Negar</button>
        </>
      ))}
    </>
  );
}
