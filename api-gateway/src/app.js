require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());
app.use(morgan("dev"));

const PORT = process.env.PORT || 3030;
const USERS_TRIPS = process.env.USERS_TRIPS_SERVICE || "http://localhost:3001";

function proxyTo(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq(proxyReq, req) {
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },
    onError(err, req, res) {
      console.error("Proxy error:", err.message);
      res.status(502).json({ error: "Bad gateway", details: err.message });
    }
  });
}

app.use("/api/auth", proxyTo(USERS_TRIPS));
app.use("/api/users", proxyTo(USERS_TRIPS));
app.use("/api/trips", proxyTo(USERS_TRIPS));
app.use("/api/itinerary", proxyTo(USERS_TRIPS));

app.get("/health", (req, res) => res.json({ status: "ok", service: "api-gateway" }));

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`- users_trips -> ${USERS_TRIPS}`);
});