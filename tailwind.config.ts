import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        surface: {
          "50": "#F7F5ED",
          "100": "#F0EBDD",
          "200": "#DBCFAF",
          "300": "#C4AF86",
          "400": "#997642",
          "500": "#6d4415",
          "600": "#633A11",
          "700": "#522C0B",
          "800": "#422107",
          "900": "#301504",
          "950": "#1F0C02",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          "50": "#f5f8fa",
          "100": "#e9eef2",
          "200": "#cfd9e3",
          "300": "#b2c0d1",
          "400": "#7f90ad",
          "500": "#56638a",
          "600": "#46537d",
          "700": "#2f3b66",
          "800": "#1e2852",
          "900": "#11193d",
          "950": "#070d29",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          "50": "#fcfafc",
          "100": "#faf5fa",
          "200": "#f2e6f2",
          "300": "#ebd5ea",
          "400": "#dbbadb",
          "500": "#cd9fcc",
          "600": "#b881b4",
          "700": "#995990",
          "800": "#7a3a6c",
          "900": "#5c204b",
          "950": "#3b0d2a",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "dark-text": {
          "50": "#f5f5f5",
          "100": "#edebec",
          "200": "#d1cdcf",
          "300": "#b3abae",
          "400": "#7a7375",
          "500": "#433d3e",
          "600": "#3b3032",
          "700": "#302123",
          "800": "#291619",
          "900": "#1f0d0f",
          "950": "#140507",
        },
        "light-text": {
          "50": "#ffffff",
          "100": "#efefef",
          "200": "#dcdcdc",
          "300": "#bdbdbd",
          "400": "#989898",
          "500": "#7c7c7c",
          "600": "#656565",
          "700": "#525252",
          "800": "#464646",
          "900": "#3d3d3d",
          "950": "#292929",
        },
        // info: '#2563eb',
        success: "#16a34a",
        warning: "#db7c0f",
        error: {
          light: "#d91353",
          normal: "#b32356",
          dark: "#512333",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;

// import { type Config } from "tailwindcss";
// import { fontFamily } from "tailwindcss/defaultTheme";

// export default {
//   darkMode: ["class"],
//   content: ["./src/**/*.tsx"],
//   prefix: "",
//   theme: {
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       fontFamily: {
//         sans: ["var(--font-sans)", ...fontFamily.sans],
//       },
//       colors: {
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         "color-scheme": "light",
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))",
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))",
//         },
//         accent: {
//           DEFAULT: "hsl(var(--accent))",
//           foreground: "hsl(var(--accent-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },

//         primary: {
//           DEFAULT: "hsl(var(--primary))",
//           foreground: "hsl(var(--primary-foreground))",

//         },
//         secondary: {
//           DEFAULT: "hsl(var(--secondary))",
//           foreground: "hsl(var(--secondary-foreground))",

//         },

//       },
//     },
//   },
//   plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
// } satisfies Config;
