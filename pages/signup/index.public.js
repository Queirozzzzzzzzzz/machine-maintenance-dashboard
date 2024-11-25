import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function signup() {
  const router = useRouter();

  const fullNameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const [errorMessage, setErrorMessage] = useState("");

  function toLogin() {
    router.push("/login");
  }

  async function signupOnSubmit(e) {
    e.preventDefault();

    const info = {
      fullName: fullNameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      confirmPassword: confirmPasswordRef.current.value,
    };

    const res = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: info.fullName,
        email: info.email,
        password: info.password,
        confirm_password: info.confirmPassword,
      }),
    });

    if (res.status === 201) {
      toast.success("Cadastro realizado com sucesso!", {
        className: "alert success",
        duration: 2000,
      });
      router.push("/login");
      return;
    }

    const resBody = await res.json();
    toast.error(resBody.message, { className: "alert error", duration: 2000 });
  }

  return (
    <>
      <div className="login">
        <h1>Cadastro</h1>
        <button className="signup-button" onClick={toLogin}>
          Já tenho uma conta
        </button>
        <p></p>
        <form onSubmit={signupOnSubmit}>
          <div className="input-section">
            <input
              type="text"
              name="fullName"
              ref={fullNameRef}
              autoComplete="off"
              autoCorrect="off"
              placeholder="Nome Completo"
            ></input>
          </div>
          <div className="input-section">
            <input
              type="text"
              name="email"
              ref={emailRef}
              autoComplete="off"
              autoCorrect="off"
              placeholder="Email"
            ></input>
          </div>
          <div className="input-section">
            <input
              type="password"
              name="password"
              ref={passwordRef}
              autoComplete="off"
              autoCorrect="off"
              placeholder="Senha"
            ></input>
          </div>
          <div className="input-section">
            <input
              type="password"
              name="confirmPassword"
              ref={confirmPasswordRef}
              autoComplete="off"
              autoCorrect="off"
              placeholder="Confirmar Senha"
            ></input>
          </div>
          <button type="submit">Criar</button>
        </form>
      </div>
    </>
  );
}
