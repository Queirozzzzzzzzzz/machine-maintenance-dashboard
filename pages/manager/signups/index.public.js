import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useUser } from "pages/interface";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();
  const [signups, setSignups] = useState([]);
  const [isLoadingSignups, setisLoadingUserSignups] = useState(true);

  const fetchSignups = async () => {
    try {
      setisLoadingUserSignups(true);
      const res = await fetch("/api/v1/users/pending", { method: "GET" });
      if (!res.ok)
        router.push(
          "/?message=error Ocorreu um erro ao enviar sua solicitação!",
        );
      const resBody = await res.json();

      setSignups(resBody);
    } catch (err) {
      console.error("Error fetching signups:", err);
      toast.error(err.message || "Ocorreu um erro ao carregar os cadastros!", {
        className: "alert error",
        duration: 2000,
      });
    } finally {
      setisLoadingUserSignups(false);
    }
  };

  useEffect(() => {
    if (!user && !isLoadingUser) router.push("/login");

    if (user) {
      if (!user.features.includes("admin")) router.push("/login");
      else if (signups.length <= 0) fetchSignups();
    }
  }, [user, router, isLoadingUser]);

  const acceptSignup = async (email) => {
    try {
      let res = await fetch(`/api/v1/user/${email}/features`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: ["active"] }),
      });

      if (!res.ok) throw new Error();

      res = await fetch(`/api/v1/user/${email}/features`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: ["create:session"] }),
      });

      if (!res.ok) throw new Error();

      setSignups((prevSignups) =>
        prevSignups.filter((signup) => signup.email !== email),
      );

      toast.success("Usuário aceito com sucesso!", {
        className: "alert success",
        duration: 1000,
      });
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro ao aceitar o cadastro!", {
        className: "alert error",
        duration: 2000,
      });
    }
  };

  const denySignup = async (email) => {
    const res = await fetch(`/api/v1/user/${email}`, { method: "DELETE" });
    const resBody = await res.json();

    if (!res.ok) {
      toast.error(resBody.message || "Ocorreu um erro ao negar o cadastro!", {
        className: "alert error",
        duration: 2000,
      });
      return;
    }

    setSignups((prevSignups) =>
      prevSignups.filter((signup) => signup.email !== email),
    );

    toast.success("Usuário negado com sucesso!", {
      className: "alert success",
      duration: 1000,
    });
  };

  if (isLoadingUser || isLoadingSignups) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Cadastros pendentes</h1>
      {signups && Array.isArray(signups) && signups.length > 0 ? (
        signups.map((signup) => (
          <>
            <h3>{signup.full_name}</h3>
            <p>
              <strong>Email: </strong>
              {signup.email}
            </p>
            <button onClick={() => acceptSignup(signup.email)}>Aceitar</button>
            <button onClick={() => denySignup(signup.email)}>Negar</button>
          </>
        ))
      ) : (
        <p>Não há cadastros para exibir.</p>
      )}
    </>
  );
}
