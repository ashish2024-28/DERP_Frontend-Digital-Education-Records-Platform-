import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    CalendarCheck,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight
} from "lucide-react";

import "./erp.css";


export default function ERPLayout({
    role,
    user,
    menu = [],
    children
}) {

    const { domain } = useParams();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] =
        useState(true);

    const logout = () => {

        localStorage.clear();

        navigate(`/${domain}/login`);
    };


    const icons = {
        dashboard: LayoutDashboard,
        students: Users,
        faculty: GraduationCap,
        courses: BookOpen,
        attendance: CalendarCheck,
        reports: FileText,
        settings: Settings,
    };


    return (
        <div className="erp-app">

            {/* SIDEBAR */}

            <aside
                className={`erp-sidebar ${
                    sidebarOpen
                        ? "erp-sidebar-open"
                        : "erp-sidebar-closed"
                }`}
            >

                <div className="erp-brand">

                    <div className="erp-brand-icon">
                        D
                    </div>

                    {sidebarOpen && (
                        <div>
                            <strong>DERP</strong>
                            <span>
                                Digital Education
                            </span>
                        </div>
                    )}

                </div>


                <div className="erp-user-mini">

                    <div className="erp-avatar">
                        {user?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                    </div>

                    {sidebarOpen && (
                        <div>
                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <small>
                                {role}
                            </small>
                        </div>
                    )}

                </div>


                <nav className="erp-nav">

                    {menu.map((item) => {

                        const Icon =
                            icons[item.icon] ||
                            LayoutDashboard;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `erp-nav-item ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                <Icon size={19} />

                                {sidebarOpen && (
                                    <>
                                        <span>
                                            {item.label}
                                        </span>

                                        <ChevronRight
                                            className="erp-nav-arrow"
                                            size={15}
                                        />
                                    </>
                                )}

                            </NavLink>
                        );

                    })}

                </nav>


                <button
                    className="erp-logout"
                    onClick={logout}
                >
                    <LogOut size={19} />

                    {sidebarOpen && (
                        <span>Logout</span>
                    )}
                </button>

            </aside>


            {/* MAIN */}

            <section className="erp-main">

                <header className="erp-topbar">

                    <button
                        className="erp-menu-button"
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                    >
                        {sidebarOpen
                            ? <X size={21} />
                            : <Menu size={21} />
                        }
                    </button>


                    <div className="erp-topbar-title">
                        <strong>
                            {role} Dashboard
                        </strong>

                        <span>
                            {domain}
                        </span>
                    </div>


                    <div className="erp-topbar-user">

                        <div className="erp-avatar small">
                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </div>

                        <span>
                            {user?.name || "User"}
                        </span>

                    </div>

                </header>


                <main className="erp-content">

                    {children}

                </main>

            </section>

        </div>
    );
}