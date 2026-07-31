import { useState, type SubmitEvent } from "react";

import { useNavigate } from "react-router-dom";

import { saveAuthSession } from "../services/auth-storage.service";
import { login } from "../services/auth.service";


const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setErrorMessage("");
        setIsSubmitting(true);


        try {
            const response = await login({
                email,
                password
            })

            if ("requiresTwoFactor" in response.data) {
                setErrorMessage("La cuenta requiere verificación en dos pasos.");
                return;
            }
            saveAuthSession(response.data);
            navigate("/", { replace: true });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado")
        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        POS System
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-slate-900">
                        Iniciar sesión
                    </h1>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    {errorMessage && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {errorMessage}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

            </section>
        </main>
    )
}

export default LoginPage
