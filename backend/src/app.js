import express from "express";
import cors from "cors";
import reservationRoutes from "./routes/reservationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/reservations", reservationRoutes);

app.get("/", (req, res) => {
  res.send("Restaurant Reservation Chatbot Backend Running 🚀");
});

export default app;
