import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AutoX Parts Store",
    short_name: "AutoX",
    description: "Genuine motorcycle and three wheeler parts in Sri Lanka.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ED1C24",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
