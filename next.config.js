/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ['@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react'],
};

module.exports = nextConfig; 
