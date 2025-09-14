"use client"

import Head from "next/head"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { loginWithRedirect, logout, isAuthenticated, user, getIdTokenClaims } =
    useAuth0()
  const [deviceId, setDeviceId] = useState("")

  useEffect(() => {
    let did = localStorage.getItem("ndev_device_id")
    if (!did) {
      did = "dev-" + Math.random().toString(36).slice(2, 9)
      localStorage.setItem("ndev_device_id", did)
    }
    setDeviceId(did)
  }, [])

  const register = async () => {
    const claims = await getIdTokenClaims()
    const token = claims?.__raw
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/register?limit=3",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: deviceId,
          device_name: navigator.userAgent,
        }),
      }
    )

    if (res.status === 200) {
      alert("Registered - you can access private page")
    } else if (res.status === 409) {
      const data = await res.json()
      const sessions = data.sessions
      const choice = window.prompt(
        "Limit reached. Enter session id to force logout or cancel:"
      )
      if (choice) {
        const f = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/api/force_logout",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ logout_session_id: parseInt(choice) }),
          }
        )
        if (f.ok) {
          alert("Session revoked. Try registering again.")
        } else {
          alert("Failed to revoke.")
        }
      }
    } else {
      const err = await res.text()
      alert("Error: " + err)
    }
  }

  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
  <Head>
    <title>N-device Auth0 Demo</title>
  </Head>

  <Card className="w-full max-w-md shadow-xl rounded-2xl">
    <CardHeader>
      <CardTitle className="text-3xl font-bold text-center text-gray-900">
        N-device Auth0 Demo
      </CardTitle>
    </CardHeader>

    <CardContent className="flex flex-col items-center gap-6">
      {!isAuthenticated && (
        <>
          <p className="text-gray-600 text-center">
            Login with <span className="font-semibold">Auth0</span> to continue
          </p>
          <Button
            className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
            onClick={() => loginWithRedirect()}
          >
            Login
          </Button>
        </>
      )}

      {isAuthenticated && (
        <div className="w-full space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Your device id: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{deviceId}</code>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-black text-white hover:bg-gray-800 transition-colors"
              onClick={register}
            >
              Register Device
            </Button>

            <Button
              variant="destructive"
              className="flex-1 transition-colors"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Logout
            </Button>
          </div>

          <div className="text-center">
            <a
              href="/private"
              className="text-blue-600 hover:underline text-sm"
            >
              ➝ Go to private page
            </a>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</div>

  )
}
