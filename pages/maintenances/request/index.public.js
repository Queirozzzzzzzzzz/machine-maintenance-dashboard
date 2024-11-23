import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUser } from "pages/interface";

export default function MaintenancesRequest() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();

  useEffect(() => {
    if (router && !user && !isLoadingUser) {
      router.push(`/login`);
    }
  }, [user, router, isLoadingUser]);

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      machine: null,
      problem: null,
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

      const res = await fetch("/api/v1/maintenances/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      });

      if (res.status == 201) {
        toast.success("Manutenção solicitada com sucesso.", {
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
      toast.error("Houve uma falha ao solicitar a manutenção.");
    }
  };

  return (
    <>
      <h1>Solicitar Manutenção</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="machine">Nome da máquina:</label>
          <input {...register("machine")} id="machine" />
        </div>

        <div>
          <label htmlFor="problem">Problema:</label>
          <textarea {...register("problem")} id="problem" rows="3" />
        </div>

        <button type="submit">Enviar</button>
      </form>
    </>
  );
}
