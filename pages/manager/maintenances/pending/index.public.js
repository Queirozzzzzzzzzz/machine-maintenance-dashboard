import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useUser } from "pages/interface";
import { toast } from "sonner";

export default function MaintenancesPending() {
  const router = useRouter();
  const { user, isLoadingUser, userIsAdmin } = useUser();
  const [maintenances, setMaintenances] = useState([]);
  const [isLoadingMaintenances, setIsLoadingMaintenances] = useState(true);

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push("/login");

    if (router && user && !isLoadingUser && userIsAdmin) {
      fetchMaintenances();
    }
  }, [user, router, isLoadingUser]);

  const fetchMaintenances = async () => {
    try {
      setIsLoadingMaintenances(true);
      const res = await fetch("/api/v1/maintenances/request", {
        method: "GET",
      });
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

  const openMaintenance = async (id) => {
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

  const renderMaintenance = (maintenance) => (
    <div className={`card`} key={maintenance.id}>
      <div class="card-inner">
        <p class="text-primary font-weight-bold">{maintenance.machine}</p>
      </div>
      <span class="text-secondary">
        <b>Solicitado:</b>{" "}
        {new Date(maintenance.created_at).toLocaleDateString()}
      </span>
      <span class="text-secondary">
        <b>Problema:</b> {maintenance.problem}
      </span>

      <div className="buttons-container">
        <button onClick={() => openMaintenance(maintenance.id)}>Abrir</button>
        {userIsAdmin && (
          <button onClick={() => deleteMaintenance(maintenance.id)}>
            Excluir
          </button>
        )}
      </div>
    </div>
  );

  if (isLoadingUser || isLoadingMaintenances) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Manutenções solicitadas</h1>

      <div class="main-cards">
        {maintenances.length > 0 ? (
          maintenances.map(renderMaintenance)
        ) : (
          <p>Não há manutenções para exibir.</p>
        )}
      </div>
    </>
  );
}
