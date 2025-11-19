const express = require("express");
const router = express.Router();
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip } = require("../controllers/tripController");
const auth = require("../middleware/auth");

router.post("/", auth, createTrip);
router.get("/", auth, getTrips);
router.get("/:id", auth, getTripById);
router.put("/:id", auth, updateTrip);
router.delete("/:id", auth, deleteTrip);

module.exports = router;