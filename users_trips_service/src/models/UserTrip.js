const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserTrip = sequelize.define("UserTrip", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    role: {
        type: DataTypes.ENUM("admin", "member"),
        defaultValue: "member"
    }

}, {
    tableName: "user_trips",
    timestamps: true
});

module.exports = UserTrip;