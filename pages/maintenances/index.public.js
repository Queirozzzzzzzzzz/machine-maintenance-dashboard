import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUser } from "pages/interface";
import { toast } from "sonner";

export default function Maintenances() {
  const router = useRouter();
  const { user, isLoadingUser, userIsAdmin } = useUser();
  const [maintenances, setMaintenances] = useState([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  const [isLoadingMaintenances, setIsLoadingMaintenances] = useState(true);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push("/login");

    if (router && user) {
      fetchMaintenances();
    }
  }, [user, router, isLoadingUser]);

  useEffect(() => {
    applyDateFilter();
  }, [dateFilter, maintenances]);

  const fetchMaintenances = async () => {
    try {
      setIsLoadingMaintenances(true);
      const res = await fetch("/api/v1/maintenances", { method: "GET" });
      if (!res.ok)
        throw new Error("Ocorreu um erro ao carregar as manutenções");

      const resBody = await res.json();
      setMaintenances(resBody);
      setFilteredMaintenances(resBody);
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

  const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const formatDate = (date) => date.toISOString().split("T")[0];

    return {
      start: formatDate(sunday),
      end: formatDate(saturday),
    };
  };

  useEffect(() => {
    const weekRange = getCurrentWeekRange();
    setDateFilter(weekRange);
  }, []);

  const applyDateFilter = () => {
    const { start, end } = dateFilter;

    if (!start && !end) {
      setFilteredMaintenances(maintenances);
      return;
    }

    const filtered = maintenances.filter((maintenance) => {
      const maintenanceDate = new Date(maintenance.expires_at);
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;

      return (
        (!startDate || maintenanceDate >= startDate) &&
        (!endDate || maintenanceDate <= endDate)
      );
    });

    setFilteredMaintenances(filtered);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({ ...prev, [name]: value }));
  };

  const renderMaintenance = (maintenance) => (
    <div className={`card ${maintenance.criticality}`} key={maintenance.id}>
      <div className="card-inner">
        <p className="text-primary font-weight-bold">{maintenance.machine}</p>
      </div>
      <span className="text-secondary">
        <b>Prazo:</b> {formatDate(maintenance.expires_at)}
      </span>
      <span className="text-secondary">
        <b>Criticidade:</b> {criticalityTranslations[maintenance.criticality]}
      </span>
      {maintenance.responsible_name && (
        <span className="text-secondary">
          <b>Responsável:</b> {maintenance.responsible_name}
        </span>
      )}
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

  function formatDate(isoDate) {
    const date = new Date(isoDate);

    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth() + 1;
    const utcDay = date.getUTCDate();

    return `${utcDay.toString().padStart(2, "0")}/${utcMonth.toString().padStart(2, "0")}/${utcYear}`;
  }

  const criticalityTranslations = {
    light: "Leve",
    moderate: "Moderado",
    high: "Alto",
    critical: "Crítico",
  };

  const clearFilters = () => {
    setDateFilter({ start: "", end: "" });
    setFilteredMaintenances(maintenances);
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

  if (isLoadingUser || isLoadingMaintenances) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Manutenções</h1>

      <div className="filter-container">
        <label>
          Data de Início:
          <input
            type="date"
            name="start"
            value={dateFilter.start}
            onChange={handleDateChange}
          />
        </label>
        <label>
          Data de Fim:
          <input
            type="date"
            name="end"
            value={dateFilter.end}
            onChange={handleDateChange}
          />
        </label>

        <button onClick={clearFilters}>Limpar Filtros</button>
      </div>

      <div className="main-cards">
        {filteredMaintenances.length > 0 ? (
          filteredMaintenances.map(renderMaintenance)
        ) : (
          <p>Não há manutenções para exibir.</p>
        )}
      </div>
    </>
  );
}
