import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config();

console.log("VITE ENV:", process.env.VITE_API_URL)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'import.meta.env.VITE_ASSETS_URL': JSON.stringify(process.env.VITE_ASSETS_URL),
  }
})

