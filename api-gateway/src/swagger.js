const axios = require("axios");

const USERS_TRIPS_URL = process.env.USERS_TRIPS_SERVICE;
const EXTERNAL_DATA_URL = process.env.EXTERNAL_DATA_SERVICE;

async function getMergedOpenApi() {
  const usersTrips = await axios.get(`${USERS_TRIPS_URL}/docs-json`);
  const external = await axios.get(`${EXTERNAL_DATA_URL}/openapi.json`);

  const merged = {
    openapi: "3.0.3",
    info: {
      title: "FlyAway API",
      description: "Users, Trips and External Data API Gateway",
      version: "1.0.0"
    },
    servers: [
      { url: process.env.GATEWAY_URL || "http://localhost:3030" }
    ],
    paths: {
      ...usersTrips.data.paths,
      ...external.data.paths
    },
    components: {
      schemas: {
        ...(usersTrips.data.components?.schemas || {}),
        ...(external.data.components?.schemas || {})
      },
      securitySchemes: {
        ...(usersTrips.data.components?.securitySchemes || {})
      }
    },
    security: usersTrips.data.security || []
  };

  return merged;
}

module.exports = { getMergedOpenApi };