/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://programming-hero-assignment-10-serv-eta.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
