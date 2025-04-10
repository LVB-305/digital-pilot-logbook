import { ContactConfig, SiteConfig } from "@/schemas"

/* ==================== [> WEBSITE CONFIG <] ==================== */

const baseUrl = "http://localhost:3000/";

export const siteConfig: SiteConfig = {
    name: "Digital Pilot Logbook",
    author: "LVB-305",
    description:
      "App description to be filled in",
    keywords: [],
    url: {
      base: baseUrl,
      author: "https://github.com/LVB-305/digital-pilot-logbook",
    },
    ogImage: `${baseUrl}/og.jpg`,
}

export const contactConfig: ContactConfig = {
    email: "78275518+LVB-305@users.noreply.github.com"
}