import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useUser } from "pages/interface";
import { toast } from "sonner";

export default function Maintenance() {
  const router = useRouter();
  const { user, isLoadingUser, userIsAdmin } = useUser();
  const { isLoadingMaintenance, setIsLoadingMaintenance } = useState(true);
  const [maintenance, setMaintenance] = useState({});

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push("/login");

    if (router.query.id) fetchMaintenance(router.query.id);
  }, [user, router, isLoadingUser]);

  const fetchResponsibleUser = async (m) => {
    if (!m.responsible) return m;

    try {
      const res = await fetch(`/api/v1/user/${m.responsible}`);
      const resBody = await res.json();

      m.responsible_name = resBody.full_name;
    } catch (error) {
      console.error(`Error fetching user ${r}:`, error);
      return null;
    }

    return m;
  };

  const fetchMaintenance = async (maintenanceId) => {
    const res = await fetch(`/api/v1/maintenances/${maintenanceId}`);
    const resBody = await res.json();

    if (res.status == 200) {
      const m = await fetchResponsibleUser(resBody);
      setMaintenance(m);
    } else {
      toast.error(resBody.message, {
        className: "alert error",
        duration: 2000,
      });
      router.push("/maintenances");
    }
  };

  const finishMaintenance = async (id) => {
    try {
      const res = await fetch(`/api/v1/maintenances/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress: "concluded" }),
      });

      if (res.status == 200) {
        toast.success("Manutenção concluida com sucesso!", {
          className: "alert success",
          duration: 2000,
        });
      } else {
        const resBody = await res.json();
        console.error(resBody);
        throw new Error("Ocorreu um erro ao concluir a manutenção.");
      }
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro ao concluir a manutenção!", {
        className: "alert error",
        duration: 2000,
      });
    }
  };

  const editMaintenance = async (id) => {
    router.push(`/maintenances/${id}/edit`);
  };

  const deleteMaintenance = async (id) => {
    try {
      const res = await fetch(`/api/v1/maintenances/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Ocorreu um erro ao excluir a manutenção.");

      toast.success("Manutenção excluída com sucesso!", {
        className: "alert success",
        duration: 2000,
      });

      router.push("/maintenances");
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro ao excluir a manutenção!", {
        className: "alert error",
        duration: 2000,
      });
    }
  };

  if (isLoadingUser || isLoadingMaintenance) {
    return <div>Carregando...</div>;
  }

  const criticalityTranslations = {
    light: "Leve",
    moderate: "Moderado",
    high: "Alto",
    critical: "Crítico",
  };

  const progressTranslations = {
    ongoing: "Em andamento",
    concluded: "Concluída",
    aborted: "Cancelada",
  };

  const renderMaintenance = () => (
    <div key={maintenance.id}>
      <h3>{maintenance.machine}</h3>
      <p>
        <strong>Data:</strong>{" "}
        {new Date(maintenance.expires_at).toLocaleDateString()}
      </p>
      <p>
        <strong>Criticidade:</strong>{" "}
        {criticalityTranslations[maintenance.criticality]}
      </p>
      <p>
        <strong>Responsável:</strong> {maintenance.responsible_name}
      </p>
      <p>
        <strong>Progresso:</strong> {progressTranslations[maintenance.progress]}
      </p>
      <p>
        <strong>Objetivo:</strong> {maintenance.problem}
      </p>

      {maintenance.progress !== "concluded" ? (
        <button onClick={() => finishMaintenance(maintenance.id)}>
          Concluir
        </button>
      ) : null}

      {userIsAdmin && (
        <>
          <button onClick={() => editMaintenance(maintenance.id)}>
            Editar
          </button>

          <button onClick={() => deleteMaintenance(maintenance.id)}>
            Excluir
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <h1>Manutenção</h1>
      {maintenance.machine && renderMaintenance()}
    </>
  );
}
