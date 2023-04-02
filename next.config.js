/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    MODEL_NAME: process.env.HF_MODEL_NAME
  }
}

module.exports = nextConfig
