const { Trip } = require('../models');

exports.createTrip = async (req, res) => {
    try {
        const { name, description, startDate, endDate, imageUrl } = req.body;
        const trip = await Trip.create({ name, description, startDate, endDate, imageUrl, userId: req.user.id });
        res.status(201).json({ message: 'Trip created', trip });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getTrips = async (req, res) => {
    try{
        const trips = await Trip.findAll({ where: { userId: req.user.id } });
        res.json({ trips });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json({ trip });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
}

exports.updateTrip = async (req, res) => {
  try {
    const { name, description, startDate, endDate, imageUrl } = req.body;
    const trip = await Trip.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    trip.name = name ?? trip.name;
    trip.description = description ?? trip.description;
    trip.startDate = startDate ?? trip.startDate;
    trip.endDate = endDate ?? trip.endDate;
    trip.imageUrl = imageUrl ?? trip.imageUrl;

    await trip.save();
    res.json({ message: "Trip updated", trip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.destroy();
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};