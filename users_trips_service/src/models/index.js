const sequelize = require("../config/db");
const User = require("./User");
const Trip = require("./Trip");
const UserTrip = require("./UserTrip");

User.belongsToMany(Trip, { through: UserTrip, foreignKey: "userId" });
Trip.belongsToMany(User, { through: UserTrip, foreignKey: "tripId" });

UserTrip.belongsTo(Trip, { foreignKey: "tripId" });
UserTrip.belongsTo(User, { foreignKey: "userId" });

module.exports = { sequelize, User, Trip, UserTrip};