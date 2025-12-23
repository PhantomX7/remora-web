import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                hostname: "imagedelivery.net",
            },
            {
                hostname: "sgp1.digitaloceanspaces.com",
            },
            {
                hostname: "res.cloudinary.com",
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
};

export default nextConfig;
