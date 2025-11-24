const express = require("express");
const router = express.Router();
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip, addParticipant, removeParticipant, changeRole, getParticipants } = require("../controllers/TripController");
const auth = require("../middleware/auth");

router.post("/", auth, createTrip);
router.get("/", auth, getTrips);
router.get("/:id", auth, getTripById);
router.put("/:id", auth, updateTrip);
router.delete("/:id", auth, deleteTrip);

router.post("/:id/participants", auth, addParticipant);
router.delete("/:id/participants/:userId", auth, removeParticipant);
router.patch("/:id/participants/:userId/role", auth, changeRole);
router.get("/:id/participants", auth, getParticipants);

module.exports = router;