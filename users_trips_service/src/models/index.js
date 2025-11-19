const sequelize = require("../config/db");
const User = require("./User");
const Trip = require("./Trip");

User.hasMany(Trip, { foreignKey: "userId", as: "trips" });
Trip.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, User, Trip };