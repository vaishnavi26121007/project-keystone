import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import { Loading } from "./components/UI.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clients from "./pages/Clients.jsx";
import ClientDetails from "./pages/ClientDetails.jsx";
import Sites from "./pages/Sites.jsx";
import Assets from "./pages/Assets.jsx";
import Technicians from "./pages/Technicians.jsx";
import Parts from "./pages/Parts.jsx";
import WorkOrders from "./pages/WorkOrders.jsx";
import WorkOrderCreate from "./pages/WorkOrderCreate.jsx";
import WorkOrderDetails from "./pages/WorkOrderDetails.jsx";
import Overdue from "./pages/Overdue.jsx";
import NotFound from "./pages/NotFound.jsx";

const HOME_BY_ROLE = {
  ADMIN: "/app/dashboard",
  DISPATCHER: "/app/dashboard",
  TECHNICIAN: "/app/work-orders",
  CLIENT: "/app/work-orders",
};

function RoleHome() {
  const { role } = useAuth();
  return <Navigate to={HOME_BY_ROLE[role] || "/app/work-orders"} replace />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <Loading label="Loading Keystone..." />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleHome />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<RoleHome />} />

          <Route element={<RoleRoute allow={["ADMIN", "DISPATCHER"]} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="sites" element={<Sites />} />
            <Route path="assets" element={<Assets />} />
            <Route path="parts" element={<Parts />} />
            <Route path="overdue" element={<Overdue />} />
          </Route>

          <Route element={<RoleRoute allow={["ADMIN", "DISPATCHER", "TECHNICIAN"]} />}>
            <Route path="technicians" element={<Technicians />} />
          </Route>

          <Route element={<RoleRoute allow={["ADMIN", "DISPATCHER", "CLIENT"]} />}>
            <Route path="work-orders/new" element={<WorkOrderCreate />} />
          </Route>

          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="work-orders/:id" element={<WorkOrderDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
