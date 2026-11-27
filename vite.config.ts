import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export function forwardApiCookieHeader(
  proxyRequest: { setHeader: (name: string, value: string) => void },
  incomingRequest: { headers: { cookie?: string } },
) {
  const cookie = incomingRequest.headers.cookie
  if (cookie) proxyRequest.setHeader('Cookie', cookie)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7081',
        changeOrigin: true,
        secure: false,
        configure(proxy) {
          proxy.on('proxyReq', (proxyRequest, incomingRequest) => {
            forwardApiCookieHeader(proxyRequest, incomingRequest)
            proxyRequest.setHeader('Origin', 'https://localhost:7081')
            proxyRequest.setHeader('Referer', 'https://localhost:7081/swagger/index.html')
          })
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
