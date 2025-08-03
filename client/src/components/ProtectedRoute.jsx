import React from "react";
import { Navigate } from 'react-router-dom';
import useUserStore from "../store/userStore";

function PortectedRoute({children}) {
    const { isLoggedIn } = useUserStore();

    return isLoggedIn ? children : <Navigate to="/login" />
}

export default PortectedRoute;