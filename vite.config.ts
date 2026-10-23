import { defineConfig, type ConfigEnv, type UserConfig } from 'vite';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const isDevelopment: boolean = mode === 'development';

  return {
    // relative asset paths, so the same build works on GitHub Pages under /alchemists-cauldron/
    base: './',
    build: {
      sourcemap: isDevelopment,
      minify: !isDevelopment,
    },
  };
});
