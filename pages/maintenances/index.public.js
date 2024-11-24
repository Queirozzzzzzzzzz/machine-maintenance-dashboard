import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useUser } from "pages/interface";
import { toast } from "sonner";

export default function Maintenances() {
  const router = useRouter();
  const { user, isLoadingUser, userIsAdmin } = useUser();
  const [maintenances, setMaintenances] = useState([]);
  const [isLoadingMaintenances, setIsLoadingMaintenances] = useState(true);

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push("/login");

    if (router && user) {
      fetchMaintenances();
    }
  }, [user, router, isLoadingUser]);

  const fetchResponsibleUsers = async (maintenances) => {
    const responsibles = [...new Set(maintenances.map((m) => m.responsible))];

    const promises = responsibles.map(async (r) => {
      try {
        if (r == null) return null;

        const res = await fetch(`/api/v1/user/${r}`);
        const resBody = await res.json();
        return { id: r, responsible_name: resBody.full_name };
      } catch (error) {
        console.error(`Error fetching user ${r}:`, error);
        return null;
      }
    });

    return Promise.all(promises);
  };

  async function mergeResponsibleUsers(rawMaintenances, responsibleUsers) {
    const validResponsibleUsers = responsibleUsers.filter(
      (user) => user !== null,
    );

    return rawMaintenances.map((maintenance) => {
      if (maintenance.responsible === null) {
        return maintenance;
      }

      const matchingUser = validResponsibleUsers.find(
        (user) => user.id === maintenance.responsible,
      );
      return {
        ...maintenance,
        responsible_name: matchingUser ? matchingUser.responsible_name : null,
      };
    });
  }

  const fetchMaintenances = async () => {
    try {
      setIsLoadingMaintenances(true);
      const res = await fetch("/api/v1/maintenances", { method: "GET" });
      if (!res.ok)
        throw new Error("Ocorreu um erro ao carregar as manutenções");

      const resBody = await res.json();
      const responsibleUsers = await fetchResponsibleUsers(resBody);
      const updatedMaintenances = await mergeResponsibleUsers(
        resBody,
        responsibleUsers,
      );

      setMaintenances(updatedMaintenances);
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

  const criticalityTranslations = {
    light: "Leve",
    moderate: "Moderado",
    high: "Alto",
    critical: "Crítico",
  };

  const renderMaintenance = (maintenance) => (
    <div key={maintenance.id}>
      <h3>{maintenance.machine}</h3>
      <p>
        <strong>Prazo:</strong>{" "}
        {new Date(maintenance.expires_at).toLocaleDateString()}
      </p>

      <p>
        <strong>Criticidade:</strong>{" "}
        {criticalityTranslations[maintenance.criticality]}
      </p>

      {maintenance.responsible && (
        <p>
          <strong>Responsável:</strong> {maintenance.responsible_name}
        </p>
      )}
      <button onClick={() => openMaintenance(maintenance.id)}>Abrir</button>
      {userIsAdmin && (
        <button onClick={() => deleteMaintenance(maintenance.id)}>
          Excluir
        </button>
      )}
    </div>
  );

  if (isLoadingUser || isLoadingMaintenances) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Manutenções</h1>
      {maintenances.length > 0 ? (
        maintenances.map(renderMaintenance)
      ) : (
        <p>Não há manutenções para exibir.</p>
      )}
    </>
  );
}
