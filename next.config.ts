/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: "10mb", // یا 20mb
  },
};

export default nextConfig;
