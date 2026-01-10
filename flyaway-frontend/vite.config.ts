import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config();

console.log("VITE ENV:", process.env.VITE_API_URL)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

