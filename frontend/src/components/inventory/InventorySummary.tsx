
type InventorySummaryProps = {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
};

function InventorySummary({
    totalProducts,
    lowStockCount,
    outOfStockCount,
}: InventorySummaryProps) {
    const summaryItems = [
        {
            label: "Productos",
            value: totalProducts,
            className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        },
        {
            label: "Stock bajo",
            value: lowStockCount,
            className: "rounded-xl bg-orange-100 border border-slate-200 p-5 shadow-sm"
        },
        {
            label: "Sin stock",
            value: outOfStockCount,
            className: "rounded-xl bg-red-100 border border-slate-200 p-5 shadow-sm"
        },
    ];
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {
                summaryItems.map(item =>
                    <article key={item.label} className={item.className}>
                        <p className="text-sm font-medium text-black">
                            {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {item.value}
                        </p>
                    </article>
                )
            }
        </div >
    )
}


export default InventorySummary;
