import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import CategoriesPage from "./pages/CategoriesPage";
import ClientsPage from "./pages/ClientsPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import SuppliersPage from "./pages/SuppliersPage";
import UsersPage from "./pages/UsersPage";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
