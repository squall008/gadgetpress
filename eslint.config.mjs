import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'eslint.ssr.config.mjs',
      'prisma/**',
      'scripts/**',
    ],
  },
  ...nextVitals,
];

export default config;
