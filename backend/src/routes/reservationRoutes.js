import express from "express";
import {
  createReservation,
  getReservations,
  checkAvailability,
} from "../controllers/reservationController.js";

const router = express.Router();

router.get("/availability", checkAvailability);
router.post("/", createReservation);
router.get("/", getReservations);

export default router;
