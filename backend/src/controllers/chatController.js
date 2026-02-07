import Reservation from "../models/Reservation.js";
import { getAIResponse } from "../services/aiService.js";
import restaurantProfile from "../data/restaurantProfile.js";

// Extract booking details
const extractDetails = (message) => {
  const guests = message.match(/\b(\d+)\s?(people|persons|guests)?\b/i);
  const time = message.match(/\b(\d{1,2}(:\d{2})?\s?(AM|PM|am|pm))\b/);
  const date =
    message.match(/\b(\d{4}-\d{2}-\d{2})\b/) ||
    message.match(/\b(today|tomorrow)\b/i);

  return {
    guests: guests ? parseInt(guests[1]) : null,
    time: time ? time[1] : null,
    date: date ? date[1] : null,
  };
};

export const chatHandler = async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();
  const details = extractDetails(message);

  try {
    // 1️⃣ BOOKING
    if (lowerMsg.includes("book") || lowerMsg.includes("reserve")) {
      if (!details.date || !details.time || !details.guests) {
        return res.json({
          reply:
            "Sure 🙂 Please tell me the date, time, and number of guests to book a table.",
        });
      }

      const existing = await Reservation.findOne({
        date: details.date,
        time: details.time,
      });

      if (existing) {
        return res.json({
          reply:
            "❌ Sorry, that slot is already booked. Please choose another time.",
        });
      }

      await Reservation.create({
        name: "Guest",
        phone: "Not provided",
        date: details.date,
        time: details.time,
        guests: details.guests,
      });

      return res.json({
        reply:
          "✅ Your table has been booked successfully! We look forward to serving you 🍽️",
      });
    }

    // 2️⃣ AVAILABILITY
    if (lowerMsg.includes("available") || lowerMsg.includes("availability")) {
      if (!details.date || !details.time) {
        return res.json({
          reply: "Please provide date and time to check availability.",
        });
      }

      const existing = await Reservation.findOne({
        date: details.date,
        time: details.time,
      });

      return res.json({
        reply: existing
          ? "❌ That slot is already booked."
          : "🎉 Yes! That slot is available.",
      });
    }

    // 3️⃣ RESTAURANT INFO
    if (
      lowerMsg.includes("restaurant") ||
      lowerMsg.includes("about") ||
      lowerMsg.includes("food") ||
      lowerMsg.includes("cuisine")
    ) {
      return res.json({
        reply: `🍽️ Welcome to ${restaurantProfile.name}!
We serve ${restaurantProfile.cuisine}.
⭐ Our specialties include: ${restaurantProfile.specialties.join(", ")}.`,
      });
    }

    // 4️⃣ LOCATION
    if (
      lowerMsg.includes("location") ||
      lowerMsg.includes("address") ||
      lowerMsg.includes("where")
    ) {
      return res.json({
        reply: `📍 We are located at ${restaurantProfile.address}.`,
      });
    }

    // 5️⃣ OPENING HOURS
    if (
      lowerMsg.includes("open") ||
      lowerMsg.includes("timing") ||
      lowerMsg.includes("hours")
    ) {
      return res.json({
        reply: `⏰ Opening Hours:
Weekdays: ${restaurantProfile.openingHours.weekdays}
Weekends: ${restaurantProfile.openingHours.weekends}`,
      });
    }

    // 6️⃣ VEG OPTIONS
    if (lowerMsg.includes("veg") || lowerMsg.includes("vegetarian")) {
      return res.json({
        reply: restaurantProfile.vegOptions
          ? "🥗 Yes! We have delicious vegetarian options available."
          : "Currently, we do not offer vegetarian dishes.",
      });
    }

    // 7️⃣ AI FALLBACK (SMART CHAT & RECOMMENDATIONS)
    const aiPrompt = `
You are a restaurant assistant for ${restaurantProfile.name}.
Cuisine: ${restaurantProfile.cuisine}
Specialties: ${restaurantProfile.specialties.join(", ")}

User: ${message}
Assistant:
`;

    const aiResponse = await getAIResponse(aiPrompt);

    return res.json({
      reply: aiResponse.reply,
    });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({
      reply: "⚠️ Something went wrong on the server.",
    });
  }
};