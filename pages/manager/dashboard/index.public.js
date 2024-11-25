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

  const [barChartOptions, setBarChartOptions] = useState({
    series: [],
    chart: { type: "bar" },
  });

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

    return filteredMaintenances;
  };

  useEffect(() => {
    if (maintenances.length > 0) {
      const filteredMaintenances = applyFilters(maintenances);
      setShowingMaintenances(filteredMaintenances);
    }
  }, [dateFilter, monthFilter, yearFilter, responsibleFilter, roleFilter]);

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
        height: 300,
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
              height: 350,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };

    setBarChartOptions(progressOptions);
  }, [showingMaintenances]);

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

  if (isLoadingUser || isLoadingMaintenances) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <select
        value={responsibleFilter}
        onChange={(e) => setResponsibleFilter(e.target.value)}
      >
        <option value="">Responsável</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.full_name}
          </option>
        ))}
      </select>

      <div className="charts">
        {barChartOptions && (
          <div className="charts-card">
            <p className="chart-title">Progresso das Manutenções</p>
            <div id="bar-chart">
              <Chart
                options={barChartOptions}
                series={barChartOptions.series}
                type="bar"
                height={350}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
