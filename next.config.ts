import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const HOSTS_ANTIGOS = ['cade.diegoruas.com.br', 'www.cadeufpel.com'];

const movidoPara = (source: string, destination: string) => ({
  source,
  destination,
  permanent: true,
});

const noindex = [{ key: 'X-Robots-Tag', value: 'noindex' }];

const config: NextConfig = {
  experimental: { globalNotFound: true },
  images: { remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }] },
  async redirects() {
    return [
      ...HOSTS_ANTIGOS.map((value) => ({
        source: '/:path*',
        has: [{ type: 'host' as const, value }],
        destination: 'https://cadeufpel.com/:path*',
        permanent: true,
      })),
      movidoPara('/index.html', '/'),
      movidoPara('/sobre.html', '/sobre'),
      movidoPara('/contato.html', '/contato'),
      movidoPara('/privacidade.html', '/privacidade'),
      movidoPara('/galeria.html', '/galeria'),
      movidoPara('/about', '/sobre'),
      movidoPara('/contact', '/contato'),
      movidoPara('/privacy', '/privacidade'),
      movidoPara('/privacy-policy', '/privacidade'),
      movidoPara('/politica-de-privacidade', '/privacidade'),
      movidoPara('/gallery', '/galeria'),
    ];
  },


  async headers() {
    return [
      {
        source: '/assets/font/:font([A-Za-z-]+\\.[0-9a-f]{12}\\.woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/assets/:image(.*\\.(?:webp|png|svg))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/:path*',
        headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
      },
      { source: '/admin', headers: noindex },
      { source: '/admin/:path*', headers: noindex },
    ];
  },
};

export default withPayload(config);
