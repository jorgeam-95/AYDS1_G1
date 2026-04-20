import { Navigate } from "react-router-dom";

const ProtectedRoute = ( { children, rolRequerido } ) => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if ( !token ){
        return < Navigate to="/" />
    }

    if ( rolRequerido && rol != rolRequerido ){
        return < Navigate to="/" />
    }

    return children;
};

export default ProtectedRoute;