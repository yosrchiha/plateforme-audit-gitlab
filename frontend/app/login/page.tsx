"use client";
import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginUser } from "../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Mot de passe oublié */}
        <div className="text-right mb-4">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit">Se connecter</Button>

        {/* Register link */}
        <p className="text-center mt-6 text-sm">
          Vous n'avez pas de compte ?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            S'inscrire
          </Link>
        </p>
        <button
  type="button"
  onClick={() => {
    window.location.href = "http://127.0.0.1:8000/auth/gitlab/login"
  }}
color="blue"
>
  Se connecter avec GitLab
</button>
      </form>
    </div>
  );
}