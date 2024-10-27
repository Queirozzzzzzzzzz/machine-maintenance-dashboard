import Head from "next/head";

export default function LayoutHead({ children }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Dashboard</title>
        <link rel="icon" href="/static/img/icon.ico" />
      </Head>
      {children}
    </>
  );
}
