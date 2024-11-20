import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useUser } from "pages/interface";
import { toast } from "sonner";

export default function Maintenances() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();
  const [maintenances, setMaintenances] = useState([]);
  const [isLoadingMaintenances, setIsLoadingMaintenances] = useState(true);

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push("/login");

    if (router && user) {
      fetchMaintenances();
    }
  }, [user, router, isLoadingUser]);

  const fetchMaintenances = async () => {
    try {
      setIsLoadingMaintenances(true);
      const res = await fetch("/api/v1/maintenances", { method: "GET" });
      if (!res.ok)
        throw new Error("Ocorreu um erro ao carregar as manutenções");

      const resBody = await res.json();
      setMaintenances(resBody);
    } catch (err) {
      console.error("Error fetching maintenances:", err);
      toast.error(
        err.message || "Ocorreu um erro ao carregar as manutenções!",
        {
          className: "alert error",
          duration: 2000,
        },
      );
    } finally {
      setIsLoadingMaintenances(false);
    }
  };

  const editMaintenance = async (id) => {
    router.push(`/maintenances/${id}`);
  };

  const deleteMaintenance = async (id) => {
    try {
      const res = await fetch(`/api/v1/maintenances/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Ocorreu um erro ao excluir a manutenção.");

      setMaintenances(maintenances.filter((m) => m.id !== id));
      toast.success("Manutenção excluída com sucesso!", {
        className: "alert success",
        duration: 2000,
      });
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro ao excluir a manutenção!", {
        className: "alert error",
        duration: 2000,
      });
    }
  };

  if (isLoadingUser || isLoadingMaintenances) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Manutenções</h1>
      {maintenances.length > 0 ? (
        maintenances.map((maintenance) => (
          <div key={maintenance.id}>
            <h3>{maintenance.machine}</h3>
            <p>
              <strong>Data:</strong> <p>{maintenance.responsible}</p>
              {new Date(maintenance.expires_at).toLocaleDateString()}
            </p>
            <button onClick={() => editMaintenance(maintenance.id)}>
              Editar
            </button>
            <button onClick={() => deleteMaintenance(maintenance.id)}>
              Excluir
            </button>
          </div>
        ))
      ) : (
        <p>Não há manutenções para exibir.</p>
      )}
    </>
  );
}
