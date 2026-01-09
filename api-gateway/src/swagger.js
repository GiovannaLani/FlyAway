const axios = require("axios");

async function getMergedOpenApi() {
  const usersTrips = await axios.get("http://localhost:3001/docs-json");
  const external = await axios.get("http://localhost:3002/openapi.json");

  const merged = {
    openapi: "3.0.3",
    info: {
      title: "FlyAway API",
      description: "Users, Trips and External Data API Gateway",
      version: "1.0.0"
    },
    servers: [
      { url: "http://localhost:3030" }
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