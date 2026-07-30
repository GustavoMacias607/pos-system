const dashboardCards = [
    { label: "Ventas del día", value: "$0.00" },
    { label: "Productos", value: "0" },
    { label: "Clientes", value: "0" },
    { label: "Stock bajo", value: "0" },
];

function DashboardPage() {
    return (
        <section className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                    Dashboard
                </h2>

                <p className="mt-1 text-slate-600">
                    Consulta un resumen general de la operación del negocio.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardCards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="text-sm font-medium text-slate-500">
                            {card.label}
                        </div>

                        <div className="mt-2 text-2xl font-bold text-slate-900">
                            {card.value}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default DashboardPage;
