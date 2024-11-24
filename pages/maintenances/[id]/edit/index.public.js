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

  const fetchMaintenance = async (maintenanceId) => {
    const res = await fetch(`/api/v1/maintenances/${maintenanceId}`);
    const resBody = await res.json();

    if (res.status == 200) {
      setMaintenance(resBody);
    } else {
      toast.error(resBody.message, {
        className: "alert error",
        duration: 2000,
      });
      router.push("/maintenances");
    }
  };

  const saveMaintenance = async (id) => {
    try {
      const res = await fetch(`/api/v1/maintenances/${id}`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Ocorreu um erro ao concluir a manutenção.");

      toast.success("Manutenção concluida com sucesso!", {
        className: "alert success",
        duration: 2000,
      });

      router.push("/maintenances");
    } catch (err) {
      toast.error(err.message || "Ocorreu um erro ao concluir a manutenção!", {
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

  return (
    <>
      <h1>Editar Manutenção</h1>
    </>
  );
}
