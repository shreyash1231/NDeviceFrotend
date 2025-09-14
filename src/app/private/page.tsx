"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth0 } from "@auth0/auth0-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react" // ✅ spinner icon

type UserInfo = {
  full_name: string
  phone: string
}

export default function PrivatePage() {
  const { isAuthenticated, getIdTokenClaims, logout } = useAuth0()
  const [info, setInfo] = useState<UserInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      if (!isAuthenticated) return
      try {
        const claims = await getIdTokenClaims()
        const token = claims?.__raw
        const deviceId = localStorage.getItem("ndev_device_id")

        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/api/private",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
              "x-device-id": deviceId || "",
            },
          }
        )

        if (res.status === 200) {
          const data: UserInfo = await res.json()
          setInfo(data)
        } else {
          const err = await res.json()
          if (err.detail === "logged_out_by_another_device") {
            alert(
              "You have been logged out because another device logged in. Redirecting..."
            )
            logout({
              logoutParams: {
                returnTo: window.location.origin,
              },
            })
          } else {
            router.push("/") // any other error → redirect
          }
        }
      } catch (error) {
        console.error("Error fetching private data:", error)
        router.push("/")
      }
    })()
  }, [isAuthenticated, getIdTokenClaims, logout, router])

  if (!isAuthenticated) return null

  // ✅ Show spinner while loading
  if (!info)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            Private Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Full name</p>
            <p className="text-lg font-medium text-gray-900">{info.full_name}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-lg font-medium text-gray-900">{info.phone}</p>
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <Link href="/" className="w-full">
              <Button className="w-full bg-black text-white hover:bg-gray-800">
                ← Back
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
