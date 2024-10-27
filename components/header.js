export default function Header() {
  async function handleLogoutSubmit() {
    await fetch("/api/v1/sessions", { method: "DELETE" });
  }

  return (
    <>
      <form onClick={handleLogoutSubmit}>
        <button type="submit">Sair</button>
      </form>
    </>
  );
}
