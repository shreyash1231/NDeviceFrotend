"use client"

import { Auth0Provider } from "@auth0/auth0-react"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider
          domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
          clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
          authorizationParams={{
            redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
          }}
          useRefreshTokens={true}
          cacheLocation="localstorage"
        >
          {children}
        </Auth0Provider>
      </body>
    </html>
  )
}
