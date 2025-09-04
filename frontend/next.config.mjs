/** @type {import('next').NextConfig} */
const nextConfig = {
	devIndicators: false,
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: 'http://localhost:3333/:path*',
			},
		];
	},
};

export default nextConfig;
