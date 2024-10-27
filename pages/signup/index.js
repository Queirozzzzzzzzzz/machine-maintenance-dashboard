import { useRouter } from "next/router";
import { useRef, useState } from "react";

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
      router.push("/login");
      return;
    }

    const resBody = await res.json();
    setErrorMessage(resBody.message);
  }

  return (
    <>
      <h1>Cadastro</h1>
      <button onClick={toLogin}>Login</button>
      <p>{errorMessage}</p>
      <form onSubmit={signupOnSubmit}>
        <label htmlFor="fullName">Nome Completo</label>
        <input
          type="text"
          name="fullName"
          ref={fullNameRef}
          autoComplete="off"
          autoCorrect="off"
        ></input>
        <label htmlFor="email">Email</label>
        <input
          type="text"
          name="email"
          ref={emailRef}
          autoComplete="off"
          autoCorrect="off"
        ></input>
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          name="password"
          ref={passwordRef}
          autoComplete="off"
          autoCorrect="off"
        ></input>
        <label htmlFor="confirmPassword">Confirmar Senha</label>
        <input
          type="password"
          name="confirmPassword"
          ref={confirmPasswordRef}
          autoComplete="off"
          autoCorrect="off"
        ></input>
        <button type="submit">Criar</button>
      </form>
    </>
  );
}
