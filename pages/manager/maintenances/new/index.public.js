import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUser } from "pages/interface";
import UsersSelectInput from "components/inputs/usersSelectInput";

export default function MaintenancesNew() {
  const router = useRouter();
  const { user, isLoadingUser, userIsAdmin } = useUser();
  const [availabledays, setAvailabledays] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [isPreventive, setIsPreventive] = useState(false);

  useEffect(() => {
    if (router && !user && !isLoadingUser) {
      router.push(`/login`);
    }

    if (router && user && !isLoadingUser && !userIsAdmin) {
      router.push("/");
    }

    if (availabledays.length <= 0) fetchAvailabledays();
  }, [user, router, isLoadingUser, userIsAdmin]);

  async function fetchAvailabledays() {
    const res = await fetch("/api/v1/availabledays");
    const resBody = await res.json();

    const availableDatesValue = resBody.map(
      (day) => new Date(day.date).toISOString().split("T")[0],
    );

    setAvailableDates(availableDatesValue);
    setAvailabledays(resBody);
  }

  const { register, handleSubmit, reset, formState } = useForm({
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

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setIsPreventive(role === "preventive");
  };

  const onSubmit = async (data) => {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ]),
      );

      if (filteredData.role === "preventive") {
        const selectedDate = filteredData.expires_at;
        if (!availableDates.includes(selectedDate)) {
          toast.error(
            "A data selecionada não está disponível para manutenção preventiva.",
            {
              className: "alert error",
              duration: 2000,
            },
          );
          return;
        }
      }

      const res = await fetch("/api/v1/maintenances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      });

      if (res.status == 201) {
        toast.success("Manutenção criada com sucesso.", {
          className: "alert success",
          duration: 2000,
        });

        reset();
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

  return (
    <>
      <h1>Nova Manutenção</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="input-section">
          <label htmlFor="machine">Nome da máquina:</label>
          <input {...register("machine")} id="machine" />
        </div>

        <UsersSelectInput
          register={register}
          name="responsible"
          label="Responsável:"
        />

        <div className="input-section">
          <label htmlFor="problem">Objetivo:</label>
          <textarea {...register("problem")} id="problem" rows="3" />
        </div>

        <div className="input-section">
          <label htmlFor="role">Tipo de manutenção:</label>
          <select {...register("role")} onChange={handleRoleChange}>
            <option value="">Nulo</option>
            <option value="corrective">Corretiva</option>
            <option value="preventive">Preventiva</option>
            <option value="predictive">Preditiva</option>
          </select>
        </div>

        <div className="input-section">
          <label htmlFor="criticality">Criticidade da manutenção:</label>
          <select {...register("criticality")}>
            <option value="">Nulo</option>
            <option value="light">Leve</option>
            <option value="moderate">Moderada</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>

        <div className="input-section">
          <label htmlFor="expires_at">Data esperada para realização:</label>
          {isPreventive ? (
            <select {...register("expires_at")} id="expires_at">
              <option value="">Selecione uma data</option>
              {availabledays.map((day) => (
                <option
                  key={day.id}
                  value={new Date(day.date).toISOString().split("T")[0]}
                >
                  {new Date(day.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          ) : (
            <input type="date" {...register("expires_at")} id="expires_at" />
          )}
        </div>

        <div className="input-section">
          <label htmlFor="price">Preço:</label>
          <input type="number" step="0.01" {...register("price")} id="price" />
        </div>

        <button type="submit">Enviar</button>
      </form>
    </>
  );
}
