const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Trip = sequelize.define("Trip", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    startDate: { type: DataTypes.DATE },
    endDate: { type: DataTypes.DATE },
    imageUrl: { type: DataTypes.STRING }
}, {
  tableName: "trips",
  timestamps: true
});

module.exports = Trip;