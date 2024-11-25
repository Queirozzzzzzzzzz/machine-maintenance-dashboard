import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useUser } from "pages/interface";
import { toast } from "sonner";
import UsersSelectInput from "components/inputs/usersSelectInput";

export default function Maintenance() {
  const router = useRouter();
  const { user, isLoadingUser, userIsAdmin } = useUser();
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);
  const [maintenance, setMaintenance] = useState({});

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push("/login");
  }, [user, router, isLoadingUser]);

  useEffect(() => {
    if (router.query.id) fetchMaintenance(router.query.id);
  }, [router.query.id, isLoadingMaintenance]);

  function formatDate(isoDate) {
    const date = new Date(isoDate);

    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth() + 1;
    const utcDay = date.getUTCDate();

    return `${utcYear}-${utcMonth.toString().padStart(2, "0")}-${utcDay.toString().padStart(2, "0")}`;
  }

  const fetchMaintenance = async (maintenanceId) => {
    const res = await fetch(`/api/v1/maintenances/${maintenanceId}`);
    const resBody = await res.json();

    if (res.status == 200) {
      resBody.expires_at = formatDate(resBody.expires_at);
      setFormData(resBody);
      setIsLoadingMaintenance(false);
      setMaintenance(resBody);
    } else {
      toast.error(resBody.message, {
        className: "alert error",
        duration: 2000,
      });
      router.push("/maintenances");
    }
  };

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      machine: null,
      responsible: null,
      problem: null,
      role: null,
      criticality: null,
      expires_at: null,
      price: null,
    },
  });

  const setFormData = (data) => {
    const IGNORED_FIELDS = [
      "machine",
      "responsible",
      "problem",
      "role",
      "criticality",
      "expires_at",
      "price",
    ];

    if (data) {
      Object.keys(data).forEach((key) => {
        if (IGNORED_FIELDS.includes(key)) {
          setValue(key, data[key]);
        }
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ]),
      );

      const res = await fetch(`/api/v1/maintenances/${maintenance.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      });

      if (res.status == 200) {
        toast.success("Manutenção atualizada com sucesso.", {
          className: "alert success",
          duration: 2000,
        });

        window.location.reload();
      } else {
        const resBody = await res.json();
        toast.error(resBody.message, {
          className: "alert error",
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("Houve uma falha ao criar a manutenção.");
    }
  };

  if (isLoadingUser || isLoadingMaintenance) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Editar Manutenção</h1>

      {maintenance && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="machine">Nome da máquina:</label>
              <input {...register("machine")} id="machine" />
            </div>

            <UsersSelectInput
              register={register}
              name="responsible"
              label="Responsável:"
            />

            <div>
              <label htmlFor="problem">Objetivo:</label>
              <textarea {...register("problem")} id="problem" rows="3" />
            </div>

            <div>
              <label htmlFor="role">Tipo de manutenção:</label>
              <select {...register("role")}>
                <option value="">Nulo</option>
                <option value="corrective">Corretiva</option>
                <option value="preventive">Preventiva</option>
                <option value="predictive">Preditiva</option>
              </select>
            </div>

            <div>
              <label htmlFor="criticality">Criticidade da manutenção:</label>
              <select {...register("criticality")}>
                <option value="">Nulo</option>
                <option value="light">Leve</option>
                <option value="moderate">Moderada</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div>
              <label htmlFor="expires_at">Data esperada para realização:</label>
              <input type="date" {...register("expires_at")} id="expires_at" />
            </div>

            <div>
              <label htmlFor="price">Preço:</label>
              <input
                type="number"
                step="0.01"
                {...register("price")}
                id="price"
              />
            </div>

            <button type="submit">Salvar</button>
          </form>
        </>
      )}
    </>
  );
}