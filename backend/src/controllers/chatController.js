
import Reservation from "../models/Reservation.js";
import { getAIResponse } from "../services/aiService.js";
import restaurantProfile from "../data/restaurantProfile.js";

// Get today's date in Indian timezone
const getTodayDate = (offset = 0) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year").value);
  const month = Number(parts.find((p) => p.type === "month").value);
  const day = Number(parts.find((p) => p.type === "day").value);

  const date = new Date(Date.UTC(year, month - 1, day + offset));

  return date.toISOString().split("T")[0];
};

// Extract booking details
const extractDetails = (message) => {
  const guests = message.match(
    /\b(\d+)\s?(people|persons|guests)?\b/i
  );

  const time = message.match(
    /\b(\d{1,2}(?::\d{2})?\s?(AM|PM))\b/i
  );

  let date = null;

  const explicitDate = message.match(
    /\b(\d{4}-\d{2}-\d{2})\b/
  );

  if (explicitDate) {
    date = explicitDate[1];
  } else if (/\btomorrow\b/i.test(message)) {
    date = getTodayDate(1);
  } else if (/\b(today|tonight)\b/i.test(message)) {
    date = getTodayDate();
  }

  return {
    guests: guests ? parseInt(guests[1]) : null,
    time: time ? time[1].toUpperCase() : null,
    date,
  };
};

export const chatHandler = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      reply: "Please enter a message.",
    });
  }

  const lowerMsg = message.toLowerCase();

  try {
    // 1. BOOKING

    const history = Array.isArray(req.body.history)
      ? req.body.history
      : [];

    const previousBotMessage = [...history]
      .reverse()
      .find((msg) => msg.sender === "bot")?.text || "";

    const isBookingContinuation =
      /what time|date.*time|number of guests|how many guests/i.test(
        previousBotMessage
      );

    const isBookingRequest =
      lowerMsg.includes("book") ||
      lowerMsg.includes("reserve") ||
      isBookingContinuation;

    if (isBookingRequest) {
      const previousUserMessages = history
        .filter((msg) => msg.sender === "user")
        .map((msg) => String(msg.text));

      const lastBookingIndex = previousUserMessages
        .map((msg, index) => ({
          msg,
          index,
        }))
        .filter(({ msg }) => /\b(book|reserve)\b/i.test(msg))
        .map(({ index }) => index)
        .pop();

      const bookingMessages =
        lastBookingIndex !== undefined
          ? previousUserMessages.slice(lastBookingIndex)
          : [];

      const bookingText = [
        ...bookingMessages,
        message,
      ].join(" ");

      const details = extractDetails(bookingText);

      // Ask only for missing information
      if (!details.date || !details.time || !details.guests) {
        if (
          details.date &&
          details.guests &&
          !details.time
        ) {
          return res.json({
            reply:
              "Of course! What time would you prefer for your reservation?",
          });
        }

        const missing = [];

        if (!details.date) missing.push("date");
        if (!details.time) missing.push("time");
        if (!details.guests) missing.push("number of guests");

        return res.json({
          reply: `Sure! Please provide your ${missing.join(", ")}.`,
        });
      }

      // Check existing reservation
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

      // Create reservation
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

    // 2. AVAILABILITY

    if (
      lowerMsg.includes("available") ||
      lowerMsg.includes("availability")
    ) {
      const details = extractDetails(message);

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

    // 3. RESTAURANT INFORMATION

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

    // 4. LOCATION

    if (
      lowerMsg.includes("location") ||
      lowerMsg.includes("address") ||
      lowerMsg.includes("where")
    ) {
      return res.json({
        reply: `📍 We are located at ${restaurantProfile.address}.`,
      });
    }

    // 5. OPENING HOURS

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

    // 6. VEGETARIAN OPTIONS

    if (
      lowerMsg.includes("veg") ||
      lowerMsg.includes("vegetarian")
    ) {
      return res.json({
        reply: restaurantProfile.vegOptions
          ? "🥗 Yes! We have delicious vegetarian options available."
          : "Currently, we do not offer vegetarian dishes.",
      });
    }

    // 7. AI FALLBACK

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

    return res.status(500).json({
      reply: "⚠️ Something went wrong on the server.",
    });
  }
};
