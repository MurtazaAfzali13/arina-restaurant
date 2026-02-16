import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    // Force 'tailwindcss' to resolve from this project's node_modules (fixes
    // resolution in E:\Project when PostCSS/Webpack context is wrong)
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules", "tailwindcss"),
    },
  },
  webpack: (config, { dir }) => {
    const root = path.resolve(dir ?? projectRoot);
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(root, "node_modules", "tailwindcss"),
    };
    return config;
  },
};

export default nextConfig;
