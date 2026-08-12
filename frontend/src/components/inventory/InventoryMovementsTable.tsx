import type {
    InventoryMovement,
    InventoryMovementType,
} from "../../types/inventory";

type InventoryMovementsTableProps = {
    movements: InventoryMovement[];
};

const movementTypeLabels: Record<InventoryMovementType, string> = {
    PURCHASE: "Entrada",
    SALE: "Venta",
    WASTE: "Merma",
    SUPPLIER_RETURN: "Devolución a proveedor",
    CUSTOMER_RETURN: "Devolución de cliente",
    MANUAL_ADJUSTMENT: "Ajuste manual",
};

function InventoryMovementsTable({ movements }: InventoryMovementsTableProps) {
    return (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Fecha
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Producto
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Tipo
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Cantidad
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Motivo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {movements.map((movement) => {
                            const isStockIncrease = movement.quantity > 0;
                            return (
                                <tr key={movement.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <p className="text-slate-900">
                                            {new Date(movement.created_at).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-4 font-medium py-3 text-sm text-slate-600">
                                        {movement.product_name ?? "Sin producto"}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-left text-sm">
                                        {movementTypeLabels[movement.type]}
                                    </td>

                                    <td
                                        className={
                                            isStockIncrease
                                                ? "whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-green-700"
                                                : "whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-red-700"
                                        }
                                    >
                                        {isStockIncrease
                                            ? `+${movement.quantity}`
                                            : movement.quantity}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-left text-sm text-slate-700">
                                        {movement.reason ?? "Sin motivo"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InventoryMovementsTable;
