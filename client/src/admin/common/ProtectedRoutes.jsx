import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "./Loader";
import { toast } from "react-toastify";

export default function ProtectedRoutes({ children }) {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // console.log({user, isAuthenticated, isLoading})
  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    toast.error("Please login first");
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "CINEMA" ) {
    return <Navigate to="/" replace />;
  }
  


  return children;
}