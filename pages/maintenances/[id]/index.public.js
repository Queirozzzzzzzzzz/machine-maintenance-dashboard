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
        body: JSON.stringify({
          progress: "concluded",
          concluded_at: new Date().toISOString(),
        }),
      });

      if (res.status === 200) {
        const updatedMaintenance = {
          ...maintenance,
          progress: "concluded",
          concluded_at: new Date().toISOString(),
        };

        setMaintenance(updatedMaintenance);

        toast.success("Manutenção concluída com sucesso!", {
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

  const abortMaintenance = async (id) => {
    try {
      const res = await fetch(`/api/v1/maintenances/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: "aborted",
          concluded_at: new Date().toISOString(),
        }),
      });

      if (res.status === 200) {
        const updatedMaintenance = {
          ...maintenance,
          progress: "aborted",
          concluded_at: new Date().toISOString(),
        };

        setMaintenance(updatedMaintenance);

        toast.success("Manutenção cancelada com sucesso!", {
          className: "alert success",
          duration: 2000,
        });
      } else {
        const resBody = await res.json();
        console.error(resBody);
        throw new Error("Ocorreu um erro ao cancelar a manutenção.");
      }
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro ao cancelar a manutenção!", {
        className: "alert error",
        duration: 2000,
      });
    }
  };

  const deleteMaintenance = async (id) => {
    try {
      const res = await fetch(`/api/v1/maintenances/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Manutenção excluída com sucesso!", {
          className: "alert success",
          duration: 2000,
        });

        router.push("/maintenances");
      } else {
        throw new Error("Ocorreu um erro ao excluir a manutenção.");
      }
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro ao excluir a manutenção!", {
        className: "alert error",
        duration: 2000,
      });
    }
  };

  const editMaintenance = async (id) => {
    router.push(`/maintenances/${id}/edit`);
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

  function formatDate(isoDate) {
    const date = new Date(isoDate);

    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth() + 1;
    const utcDay = date.getUTCDate();

    return `${utcDay.toString().padStart(2, "0")}/${utcMonth.toString().padStart(2, "0")}/${utcYear}`;
  }

  const renderMaintenance = () => (
    <div key={maintenance.id}>
      <h3>{maintenance.machine}</h3>
      <p>
        <strong>Data:</strong> {formatDate(maintenance.expires_at)}
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
      {maintenance.progress === "concluded" ? (
        <p>
          <strong>Concuída em:</strong> {formatDate(maintenance.concluded_at)}
        </p>
      ) : null}

      {maintenance.progress !== "concluded" &&
        maintenance.progress !== "aborted" &&
        maintenance.expires_at && (
          <>
            <button onClick={() => finishMaintenance(maintenance.id)}>
              Concluir
            </button>

            <button onClick={() => abortMaintenance(maintenance.id)}>
              Cancelar
            </button>
          </>
        )}

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
