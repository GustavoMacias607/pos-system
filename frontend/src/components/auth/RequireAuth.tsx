import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getAuthSession } from "../../services/auth-storage.service";

function RequireAuth() {
    const location = useLocation();
    const session = getAuthSession();

    if (!session) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}

export default RequireAuth;
