import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Kitchen from "./pages/Kitchen";
import CreateOrder from "./pages/Createorder";
import MenuManager from "./pages/Menumanager";
import Laporan from "./pages/Laporan";
import UserManager from "./pages/Usermanager";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public — tanpa auth */}
        <Route path="/"      element={<Kitchen />} />
        <Route path="/login" element={<Login />} />

        {/* Waiter + Admin */}
        <Route
          path="/order"
          element={
            <PrivateRoute roles={["admin", "waiter"]}>
              <Sidebar>
                <CreateOrder />
              </Sidebar>
            </PrivateRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/menu"
          element={
            <PrivateRoute roles={["admin"]}>
              <Sidebar>
                <MenuManager />
              </Sidebar>
            </PrivateRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <PrivateRoute roles={["admin"]}>
              <Sidebar>
                <Laporan />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route path="/users" element={
  <PrivateRoute roles={["admin"]}>
    <Sidebar><UserManager /></Sidebar>
  </PrivateRoute>
} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;