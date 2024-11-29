import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useUser } from "pages/interface";
import { toast } from "sonner";
import { useRouter } from "next/router";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();
  const [maintenances, setMaintenances] = useState([]);
  const [showingMaintenances, setShowingMaintenances] = useState([]);
  const [isLoadingMaintenances, setIsLoadingMaintenances] = useState(true);

  const [users, setUsers] = useState([]);

  const [responsibleFilter, setResponsibleFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const [progressData, setProgressData] = useState({
    series: [],
    chart: { type: "bar" },
  });
  const [roleData, setRoleData] = useState([]);
  const [maintenanceCountData, setMaintenanceCountData] = useState([]);

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push("/");

    if (router && user) {
      if (!user.features.includes("admin")) router.push("/");
      else if (maintenances.length <= 0) {
        setIsLoadingMaintenances(true);
        fetchUsers();
        fetchMaintenances();
      }
    }
  }, [user, router, isLoadingUser]);

  const applyFilters = (maintenances) => {
    let filteredMaintenances = [...maintenances];

    if (responsibleFilter) {
      filteredMaintenances = filteredMaintenances.filter(
        (m) => m.responsible === responsibleFilter,
      );
    }

    if (yearFilter !== null) {
      filteredMaintenances = filteredMaintenances.filter((m) => {
        const maintenanceYear = new Date(m.expires_at).getFullYear();
        return maintenanceYear === yearFilter;
      });
    }

    return filteredMaintenances;
  };

  useEffect(() => {
    if (maintenances.length > 0) {
      const filteredMaintenances = applyFilters(maintenances);
      setShowingMaintenances(filteredMaintenances);
    }
  }, [responsibleFilter, yearFilter]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/users");
      const resBody = await res.json();

      if (res.status == 200) {
        setUsers(resBody);
      } else {
        toast.error(resBody.message, {
          className: "alert error",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMaintenances = async () => {
    try {
      const res = await fetch("/api/v1/maintenances", { method: "GET" });
      if (!res.ok)
        throw new Error("Ocorreu um erro ao carregar as manutenções");

      const resBody = await res.json();

      if (res.status == 200) {
        setMaintenances(resBody);
        setShowingMaintenances(resBody);
      } else {
        toast.error(resBody.message, {
          className: "alert error",
          duration: 2000,
        });
      }
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

  useEffect(() => {
    if (maintenances.length <= 0) return;

    // Progress
    const countProgressValues = () =>
      showingMaintenances.reduce(
        (statuses, { progress }) => {
          if (progress === "ongoing") statuses.ongoing++;
          if (progress === "concluded") statuses.concluded++;
          if (progress === "aborted") statuses.aborted++;
          return statuses;
        },
        { ongoing: 0, concluded: 0, aborted: 0 },
      );

    const progressValues = countProgressValues();

    const progressOptions = {
      series: [
        {
          name: "Manutenções",
          data: [
            progressValues.ongoing,
            progressValues.concluded,
            progressValues.aborted,
          ],
        },
      ],
      chart: {
        type: "bar",
        height: 380,
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        },
      },
      xaxis: {
        categories: ["Em Andamento", "Concluído", "Cancelado"],
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 380,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };

    setProgressData(progressOptions);

    // Role
    const countRoleValues = () =>
      showingMaintenances.reduce(
        (statuses, { role }) => {
          if (role === "preventive") statuses.preventive++;
          if (role === "predictive") statuses.predictive++;
          if (role === "corrective") statuses.corrective++;
          return statuses;
        },
        { preventive: 0, predictive: 0, corrective: 0 },
      );

    const roleValues = countRoleValues();

    var roleOptions = {
      series: [
        roleValues.preventive,
        roleValues.predictive,
        roleValues.corrective,
      ],
      chart: {
        type: "pie",
        width: "100%",
        height: "400px",
      },
      labels: ["Preventiva", "Preditiva", "Corretiva"],
      legend: {
        position: "bottom",
        fontSize: "14px",
        formatter: (val, opts) =>
          `${val} (${opts.w.globals.series[opts.seriesIndex]})`,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: "350px",
            },
            legend: {
              position: "bottom",
              fontSize: "12px",
              markers: {
                width: 12,
                height: 12,
              },
            },
            plotOptions: {
              pie: {
                dataLabels: {
                  offsetY: -20,
                  style: {
                    fontSize: "10px",
                  },
                },
              },
            },
          },
        },
      ],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
        style: {
          fontSize: "12px",
        },
      },
    };

    setRoleData(roleOptions);

    // Quantity
    const countMaintenancesPerMonth = () => {
      const counts = Array(12).fill(0);

      showingMaintenances.forEach(({ expires_at }) => {
        const date = new Date(expires_at);
        const month = date.getMonth();
        counts[month]++;
      });

      return counts;
    };

    const maintenanceCounts = countMaintenancesPerMonth();

    const maintenanceOptions = {
      series: [
        {
          name: "Manutenções",
          data: maintenanceCounts,
        },
      ],
      chart: {
        type: "line",
        height: 380,
      },
      xaxis: {
        categories: [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ],
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };

    setMaintenanceCountData(maintenanceOptions);
  }, [showingMaintenances]);

  const clearFilters = () => {
    setResponsibleFilter(null);
    setYearFilter(null);
    setShowingMaintenances(maintenances);
  };

  if (isLoadingUser || isLoadingMaintenances) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="filter-container">
        {users && (
          <label>
            Responsável
            <select
              value={responsibleFilter || ""}
              onChange={(e) => setResponsibleFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Ano
          <select
            value={yearFilter || "all"}
            onChange={(e) =>
              setYearFilter(
                e.target.value === "all" ? null : parseInt(e.target.value),
              )
            }
          >
            <option value="all">Todos os Anos</option>
            {Array.from({ length: 11 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </label>

        <button onClick={clearFilters}>Limpar Filtros</button>
      </div>

      <div className="charts">
        {progressData.series && (
          <div className="charts-card">
            <p className="chart-title">Progresso das Manutenções</p>
            <div id="bar-chart">
              <Chart
                options={progressData}
                series={progressData.series}
                type="bar"
                height={350}
              />
            </div>
          </div>
        )}

        {roleData.series && (
          <div className="charts-card">
            <p className="chart-title">Tipos das Manutenções</p>
            <div id="pie-chart">
              <Chart
                options={roleData}
                series={roleData.series}
                type="pie"
                height={350}
              />
            </div>
          </div>
        )}

        {maintenanceCountData.series && (
          <div className="charts-card">
            <p className="chart-title">Quantidade de Manutenções por Mês</p>
            <div id="line-chart">
              <Chart
                options={maintenanceCountData}
                series={maintenanceCountData.series}
                type="line"
                height={350}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
