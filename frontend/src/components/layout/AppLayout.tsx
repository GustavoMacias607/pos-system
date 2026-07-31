import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";


function AppLayout() {
    return (
        <div className="flex min-h-screen bg-slate-100">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header />

                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
