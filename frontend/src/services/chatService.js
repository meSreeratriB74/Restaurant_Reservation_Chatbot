import api from "./api";
export const sendMessage = async (message) => {
const res = await api.post("/chat", { message });
return res.data.reply;
};
