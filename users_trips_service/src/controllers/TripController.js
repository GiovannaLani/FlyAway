const { Trip } = require('../models');
const { User } = require('../models');
const { UserTrip } = require('../models');

exports.createTrip = async (req, res) => {
    try {
        const { name, description, startDate, endDate, imageUrl, participants} = req.body;
        const trip = await Trip.create({ name, description, startDate, endDate, imageUrl});
        
        await UserTrip.create({
            userId: req.user.id,
            tripId: trip.id,
            role: "admin"
        });

        if (participants && Array.isArray(participants)) {
            const added = [];
            const skipped = [];
            for (const email of participants) {
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    skipped.push({ email, reason: "User not found" });
                    continue;
                }

                const exists = await UserTrip.findOne({
                    where: { userId: user.id, tripId: trip.id }
                });

                if (exists) {
                    skipped.push({ email, reason: "Already added" });
                    continue;
                }

                await UserTrip.create({
                    userId: user.id,
                    tripId: trip.id,
                    role: "member"
                });
                added.push(email);
            }
            console.log("Added participants:", added);
            console.log("Skipped participants:", skipped);
        }
        
        res.status(201).json({ message: 'Trip created', trip });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getTrips = async (req, res) => {
    try{
        const userTrips = await UserTrip.findAll({ where: { userId: req.user.id }, include: [{ model: Trip }]});
        res.json({ trips: userTrips.map(ut => ut.Trip) });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

exports.getTripById = async (req, res) => {
    try {
        const relation = await UserTrip.findOne({
            where: {
                userId: req.user.id,
                tripId: req.params.id
            },
            include: [{ model: Trip }]
        });

        if (!relation)
            return res.status(404).json({ message: "Trip not found or not allowed" });

        res.json({ trip: relation.Trip });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
}

exports.updateTrip = async (req, res) => {
  try {
    const { name, description, startDate, endDate, imageUrl } = req.body;
    const relation = await UserTrip.findOne({
            where: {
                userId: req.user.id,
                tripId: req.params.id,
                role: "admin"
            },
            include: [{ model: Trip }]
        });

    if (!relation)
        return res.status(403).json({ message: "Only admins can edit the trip" });

    const trip = relation.Trip;
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
      const relation = await UserTrip.findOne({
          where: {
              userId: req.user.id,
              tripId: req.params.id,
              role: "admin"
          }
      });

      if (!relation)
          return res.status(403).json({ message: "Only admins can delete the trip" });

      await Trip.destroy({ where: { id: req.params.id } });

      res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addParticipant = async (req, res) => {
    try {
        const { email } = req.body;

        const isAdmin = await UserTrip.findOne({where: { userId: req.user.id, tripId: req.params.id, role: "admin" }});
        if (!isAdmin)
            return res.status(403).json({ message: "Only admins can add participants" });

        const user = await User.findOne({ where: { email }});
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const exists = await UserTrip.findOne({ where: { userId: user.id, tripId: req.params.id } });
        if (exists)
            return res.status(400).json({ message: "User already in trip" });

        await UserTrip.create({ userId: user.id, tripId: req.params.id, role: "member" });
        res.json({ message: "Participant added", userId: user.id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeParticipant = async (req, res) => {
    try {
        const { id: tripId, userId } = req.params;

        const isAdmin = await UserTrip.findOne({where: { userId: req.user.id, tripId, role: "admin" }});
        if (!isAdmin)
            return res.status(403).json({ message: "Only admins can remove participants" });

        if (parseInt(userId) === req.user.id)
            return res.status(400).json({ message: "Admin cannot remove themselves" });

        const removed = await UserTrip.destroy({where: { userId, tripId }});
        if (!removed)
            return res.status(404).json({ message: "Participant not found" });

        res.json({ message: "Participant removed" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changeRole = async (req, res) => {
    try {
        const { id: tripId, userId } = req.params;
        const { role } = req.body;

        if (!["admin", "member"].includes(role))
            return res.status(400).json({ message: "Invalid role" });

        const isAdmin = await UserTrip.findOne({where: { userId: req.user.id, tripId, role: "admin" }});
        if (!isAdmin)
            return res.status(403).json({ message: "Only admins can change roles" });

        if (parseInt(userId) === req.user.id && role === "member")
            return res.status(400).json({ message: "Admin cannot demote themselves" });

        const relation = await UserTrip.findOne({where: { userId, tripId }});
        if (!relation)
            return res.status(404).json({ message: "User not part of trip" });

        relation.role = role;
        await relation.save();
        res.json({ message: "Role updated", userId, role });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getParticipants = async (req, res) => {
    try {
        const { id: tripId } = req.params;

        const relation = await UserTrip.findOne({where: { userId: req.user.id, tripId }});
        if (!relation)
            return res.status(403).json({ message: "Not allowed" });

        const participants = await UserTrip.findAll({where: { tripId },include: [{ model: User, attributes: ["id", "name", "email"] }]});

        res.json({
            participants: participants.map(p => ({
                id: p.User.id,
                name: p.User.name,
                email: p.User.email,
                role: p.role
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};