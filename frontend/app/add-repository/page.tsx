"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddDepot() {
  const router = useRouter();

  const [form, setForm] = useState({
    nom: "", // URL SSH ou HTTPS du repo GitLab
    url_branche_principale: "", // juste le nom de la branche, ex: "main"
    url_branche_developpement: "", // juste le nom de la branche, ex: "dev2"
    token_gitlab: "",
    proprietaire_id: Number(localStorage.getItem("user_id")),
  });

const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      // 1️⃣ Création du dépôt dans la DB
      const res = await fetch("http://127.0.0.1:8000/depots/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout du dépôt");

      const depot = await res.json();

      // 2️⃣ Comparer les branches juste après création
      const compareRes = await fetch(
        `http://127.0.0.1:8000/depots/${depot.id}/compare`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!compareRes.ok) {
        const errText = await compareRes.text();
        throw new Error(`Erreur comparaison: ${errText}`);
      }

      const compareData = await compareRes.json();
      console.log("Résultat comparaison:", compareData);

      // 3️⃣ Redirection vers la page /difference avec les données
      router.push(`/difference?data=${encodeURIComponent(JSON.stringify(compareData))}`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0d0e12", padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#111218", padding: "36px", borderRadius: "14px", width: "100%", maxWidth: "480px", color: "#fff" }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>Ajouter un dépôt GitLab</h2>

        <label>Nom du dépôt (SSH ou HTTPS)</label>
        <input
          type="text"
          placeholder="git@gitlab.com:user/projet.git"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #1c1d26", background: "#0d0e12", color: "#fff" }}
          required
        />

        <label>Branche principale</label>
        <input
          type="text"
          placeholder="main"
          value={form.url_branche_principale}
          onChange={(e) => setForm({ ...form, url_branche_principale: e.target.value })}
          style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #1c1d26", background: "#0d0e12", color: "#fff" }}
          required
        />

        <label>Branche développement</label>
        <input
          type="text"
          placeholder="dev2"
          value={form.url_branche_developpement}
          onChange={(e) => setForm({ ...form, url_branche_developpement: e.target.value })}
          style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #1c1d26", background: "#0d0e12", color: "#fff" }}
          required
        />

        <label>Token GitLab</label>
        <input
          type="password"
          placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
          value={form.token_gitlab}
          onChange={(e) => setForm({ ...form, token_gitlab: e.target.value })}
          style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #1c1d26", background: "#0d0e12", color: "#fff" }}
          required
        />

        <button type="submit" style={{ width: "100%", padding: "12px", background: "#6c63ff", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer" }}>
          Comparer
        </button>
      </form>
    </div>
  );
}