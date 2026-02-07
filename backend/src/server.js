import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";


dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();
app.use("/api/chat", chatRoutes);
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
