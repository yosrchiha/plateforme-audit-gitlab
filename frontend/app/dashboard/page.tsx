"use client"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function Dashboard() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      localStorage.setItem("token", token)
    }
  }, [])

  return <div>Bienvenue sur le Dashboard</div>
}