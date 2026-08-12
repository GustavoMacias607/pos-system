import { useEffect, useState } from "react";

import { getAuthSession } from "../services/auth-storage.service";

import { getProducts } from "../services/product.service";
import { getLowStockProducts, getInventoryMovements } from "../services/inventory.service";

import type { Product } from "../types/product";
import type { LowStockProduct, InventoryMovement } from "../types/inventory";

import InventorySummary from "../components/inventory/InventorySummary";
import LowStockTable from "../components/inventory/LowStockTable";
import InventoryMovementsTable from "../components/inventory/InventoryMovementsTable";

function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState("");

    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [isMovementsLoading, setIsMovementsLoading] = useState(false);
    const [movementsErrorMessage, setMovementsErrorMessage] = useState("");

    const session = getAuthSession();
    const canViewMovements =
        session?.user.role === "ADMIN" ||
        session?.user.role === "SUPERVISOR";

    useEffect(() => {
        const loadInventory = async () => {
            try {
                setIsLoading(true);
                setLoadErrorMessage("");

                const [productsResponse, lowStockResponse] = await Promise.all([
                    getProducts(),
                    getLowStockProducts(),
                ]);

                setProducts(productsResponse.data);
                setLowStockProducts(lowStockResponse.data);
            } catch (error) {
                setLoadErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "No fue posible cargar el inventario"
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadInventory();
    }, []);

    useEffect(() => {
        if (!canViewMovements) {
            return;
        }

        const loadMovements = async () => {
            try {
                setIsMovementsLoading(true);
                setMovementsErrorMessage("");

                const response = await getInventoryMovements();

                setMovements(response.data);
            } catch (error) {
                setMovementsErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "No fue posible cargar el historial de inventario"
                );
            } finally {
                setIsMovementsLoading(false);
            }
        };

        void loadMovements();
    }, [canViewMovements]);

    const totalProducts = products.filter(product => product.active).length;
    const lowStockCount = lowStockProducts.filter(product => product.stock > 0).length;
    const outOfStockCount = lowStockProducts.filter(product => product.stock === 0).length;

    return (
        <section className="p-6">
            <h2 className="text-2xl font-bold text-slate-900">
                Inventario
            </h2>
            <p className="mt-1 text-slate-600">
                Aquí se administrará el inventario.
            </p>

            {isLoading && (
                <p className="mt-6 text-slate-600">
                    Cargando inventario...
                </p>
            )}

            {!isLoading && loadErrorMessage && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {loadErrorMessage}
                </p>
            )}

            {!isLoading && !loadErrorMessage && (
                <>
                    <InventorySummary
                        totalProducts={totalProducts}
                        lowStockCount={lowStockCount}
                        outOfStockCount={outOfStockCount}
                    />
                    {lowStockProducts.length === 0 ? (
                        <p className="mt-6 text-slate-600">
                            No hay productos con stock bajo o sin existencias.
                        </p>
                    ) : (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Productos con stock bajo
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                                Productos que alcanzaron o están por debajo de su stock mínimo.
                            </p>
                            <LowStockTable products={lowStockProducts} />
                        </div>
                    )}

                </>
            )}

            {canViewMovements && (
                <div className="mt-10">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Historial de movimientos
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                        Consulta los cambios registrados en el inventario.
                    </p>

                    {isMovementsLoading && (
                        <p className="mt-6 text-slate-600">
                            Cargando historial...
                        </p>
                    )}

                    {!isMovementsLoading && movementsErrorMessage && (
                        <p
                            role="alert"
                            className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {movementsErrorMessage}
                        </p>
                    )}
                    {!isMovementsLoading && !movementsErrorMessage && (
                        movements.length === 0 ? (
                            <p className="mt-6 text-slate-600">
                                No hay movimientos de inventario registrados.
                            </p>
                        ) : (
                            <InventoryMovementsTable movements={movements} />
                        )

                    )}
                </div>
            )}
        </section>
    );
}

export default InventoryPage;
