import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const templateRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(templateRoot);
const rawTextLoader = `${templateRoot}/loaders/raw-text-loader.cjs`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      use: [rawTextLoader],
    });
    return config;
  },
  turbopack: {
    root: repoRoot,
    rules: {
      "*.md": {
        loaders: [rawTextLoader],
        as: "*.js",
      },
    },
  },
  experimental: {
    externalDir: true,
  },
  env: {
    NEXT_PUBLIC_ENABLE_REVIEW:
      process.env.NEXT_PUBLIC_ENABLE_REVIEW || process.env.VITE_ENABLE_REVIEW || "",
  },
};

export default nextConfig;
