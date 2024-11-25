import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUser } from "pages/interface";
import UsersSelectInput from "components/inputs/usersSelectInput";

export default function MaintenancesNew() {
  const router = useRouter();
  const { user, isLoadingUser, userIsAdmin } = useUser();

  useEffect(() => {
    if (router && !user && !isLoadingUser) {
      router.push(`/login`);
    }

    if (router && user && !isLoadingUser && !userIsAdmin) {
      router.push("/");
    }
  }, [user, router, isLoadingUser, userIsAdmin]);

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

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset();
    }
  }, [formState, reset]);

  const onSubmit = async (data) => {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ]),
      );

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
          <select {...register("role")}>
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
          <input type="date" {...register("expires_at")} id="expires_at" />
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
