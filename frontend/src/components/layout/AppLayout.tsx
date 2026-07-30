import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
    children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen bg-slate-100">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header />

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
