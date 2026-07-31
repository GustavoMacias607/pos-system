import { Navigate, Outlet } from "react-router-dom";

import { getAuthSession } from "../../services/auth-storage.service";

function RequireGuest() {
    const session = getAuthSession();

    if (session) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default RequireGuest;
