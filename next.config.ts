import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // nodemailer usa require dinámicos de módulos de Node (net, tls…):
  // mejor dejarlo fuera del bundle del servidor
  serverExternalPackages: ['nodemailer'],
};

export default nextConfig;
