import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { useUser } from "pages/interface";

export default function Header({ children }) {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();
  const [sidebar, setSidebar] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    if (router && !user && !isLoadingUser) router.push(`/login`);

    if (user && user.features.includes("admin")) setUserIsAdmin(true);
  }, [user, router, isLoadingUser]);

  async function handleLogoutSubmit() {
    await fetch("/api/v1/sessions", { method: "DELETE" });
    window.location = "/login";
  }

  const toggleSidebar = () => {
    setSidebar((prev) => !prev);
  };

  const loadPage = (url) => {
    window.location = url;
  };

  return (
    <>
      <div className="grid-container">
        {/* Header */}
        <header className="header">
          <div className="menu-icon" onClick={toggleSidebar}>
            <span
              style={{ cursor: "pointer" }}
              className="material-icons-outlined"
            >
              menu
            </span>
          </div>
          <div className="header-left">
            <span className="material-icons-outlined">search</span>
          </div>
        </header>

        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`sidebar ${sidebar ? "sidebar-responsive" : ""}`}
        >
          <div className="sidebar-title">
            <div className="sidebar-brand">
              <span className="material-icons-outlined">construction</span>
              FixHub
            </div>
            <span
              onClick={toggleSidebar}
              className="material-icons-outlined"
              style={{ cursor: "pointer" }}
            >
              close
            </span>
          </div>

          <ul className="sidebar-list">
            {userIsAdmin && (
              <>
                <li
                  className="sidebar-list-item"
                  onClick={() => loadPage("/manager/dashboard")}
                >
                  <a>
                    <span className="material-icons-outlined">dashboard</span>{" "}
                    Dashboard
                  </a>
                </li>

                {/* <li
                  className="sidebar-list-item"
                  onClick={() => loadPage("/manager/users")}
                >
                  <a>
                    <span className="material-icons-outlined">person</span>{" "}
                    Usuários
                  </a>
                </li> */}

                <li
                  className="sidebar-list-item"
                  onClick={() => loadPage("/manager/signups")}
                >
                  <a>
                    <span className="material-icons-outlined">
                      person_add_alt
                    </span>{" "}
                    Cadastros pendentes
                  </a>
                </li>

                <li
                  className="sidebar-list-item"
                  onClick={() => loadPage("/manager/maintenances/new")}
                >
                  <a>
                    <span className="material-icons-outlined">post_add</span>{" "}
                    Nova Manutenção
                  </a>
                </li>

                <li
                  className="sidebar-list-item"
                  onClick={() => loadPage("/manager/maintenances/pending")}
                >
                  <a>
                    <span className="material-icons-outlined">
                      pending_actions
                    </span>
                    Manut. Solicitadas
                  </a>
                </li>
              </>
            )}

            <li
              className="sidebar-list-item"
              onClick={() => loadPage("/maintenances")}
            >
              <a>
                <span className="material-icons-outlined">build_circle</span>{" "}
                Manutenções
              </a>
            </li>

            {!userIsAdmin && (
              <>
                <li
                  className="sidebar-list-item"
                  onClick={() => loadPage("/maintenances/request")}
                >
                  <a>
                    <span className="material-icons-outlined">post_add</span>{" "}
                    Solicitar Manutenção
                  </a>
                </li>
              </>
            )}

            <li className="sidebar-list-item" onClick={handleLogoutSubmit}>
              <a>
                <span className="material-icons-outlined">arrow_back</span> Sair
              </a>
            </li>
          </ul>
        </aside>

        <main className="main-container">{children}</main>
      </div>
    </>
  );
}
