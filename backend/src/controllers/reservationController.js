import Reservation from "../models/Reservation.js";

// Check availability
export const checkAvailability = async (req, res) => {
  const { date, time } = req.query;

  try {
    const existing = await Reservation.findOne({ date, time });

    if (existing) {
      return res.json({
        available: false,
        message: "Sorry, this slot is already booked.",
      });
    }

    res.json({
      available: true,
      message: "Yes! Table is available 🎉",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create reservation
export const createReservation = async (req, res) => {
  try {
    const { date, time } = req.body;

    const existing = await Reservation.findOne({ date, time });
    if (existing) {
      return res.status(400).json({
        message: "This slot is already booked.",
      });
    }

    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all reservations
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
