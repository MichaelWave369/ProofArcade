import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Proof Arcade";
const BASE_URL = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const IS_PAGES = import.meta.env.MODE === "pages";
const assetUrl = (path: string) => `${BASE_URL}${path.replace(/^\/+/, "")}`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "A laboratory of math and physics games. Bubble Proof leads eighteen stations, including Vector Drift, Balance Lab, Fraction Forge, Wave Lab, and a gravity orbit. Scores stay on this device." },
      { name: "theme-color", content: "#07080d" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: assetUrl("favicon.svg") },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Syne:wght@500;700;800&display=swap",
      },
      {
        rel: "manifest",
        href: IS_PAGES ? assetUrl("manifest.webmanifest") : "/__grok/manifest.webmanifest",
      },
      {
        rel: "apple-touch-icon",
        href: IS_PAGES ? assetUrl("__grok/icon-180.png") : "/__grok/icon-180.png",
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
