const fonts = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
    j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
    s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
};

const axios = require('axios');

let lastResponseMessageID = null;

async function handleCommand(api, event, args, message) {
    try {
        const question = args.join(" ").trim();

        if (!question) {
            return message.reply("Please provide a question to get an answer.");
        }

        const { response, messageID } = await getAIResponse(question, event.senderID, event.messageID);
        lastResponseMessageID = messageID;

        api.sendMessage(`🟢 𝘼𝙀-𝙎𝙏𝙃𝙀𝙍 ⚪ :\n━━━━━━━━━━━━━━━━\n${formatText(response)} 🟡`, event.threadID, messageID);
    } catch (error) {
        console.error("Error in handleCommand:", error.message);
        message.reply("An error occurred while processing your request.");
    }
}

async function getAnswerFromAI(question) {
    try {
        const services = [
            { url: 'https://markdevs-last-api.onrender.com/gpt4', params: { prompt: question, uid: 'your-uid-here' } },
            { url: 'http://markdevs-last-api.onrender.com/api/v2/gpt4', params: { query: question } },
            { url: 'https://markdevs-last-api.onrender.com/api/v3/gpt4', params: { ask: question } }
        ];

        for (const service of services) {
            const data = await fetchFromAI(service.url, service.params);
            if (data) return data;
        }

        throw new Error("No valid response from any AI service");
    } catch (error) {
        console.error("Error in getAnswerFromAI:", error.message);
        throw new Error("Failed to get AI response");
    }
}

async function fetchFromAI(url, params) {
    try {
        const { data } = await axios.get(url, { params });
        if (data && (data.gpt4 || data.reply || data.response || data.answer || data.message)) {
            return data.gpt4 || data.reply || data.response || data.answer || data.message;
        } else {
            throw new Error("No valid response from AI");
        }
    } catch (error) {
        console.error("Error fetching from AI:", error.message);
        return null;
    }
}

async function getAIResponse(input, userId, messageID) {
    const query = input.trim() || "hi";
    try {
        const response = await getAnswerFromAI(query);
        return { response, messageID };
    } catch (error) {
        console.error("Error in getAIResponse:", error.message);
        throw error;
    }
}

// Function to format text with custom fonts
function formatText(text) {
    return text.split('').map(char => fonts[char] || char).join('');
}

module.exports = {
    config: {
        name: 'ai',
        author: 'aesther',
        role: 0,
        category: 'ai',
        shortDescription: 'AI to answer any question',
    },
    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        try {
            const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
            lastResponseMessageID = messageID;
            api.sendMessage(`🟢 𝘼𝙀-𝙎𝙏𝙃𝙀𝙍 ⚪ :\n━━━━━━━━━━━━━━━━\n${formatText(response)} 🟡`, event.threadID, messageID);
        } catch (error) {
            console.error("Error in onStart:", error.message);
            api.sendMessage("An error occurred while processing your request.", event.threadID);
        }
    },
    onChat: async function ({ event, api }) {
        const messageContent = event.body.trim().toLowerCase();

        // Check if the message is a reply to the bot's message or starts with "ai"
        if ((event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) || messageContent.startsWith("ai ")) {
            const input = messageContent.replace(/^ai\s*/, "").trim();
            try {
                const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
                lastResponseMessageID = messageID;
                api.sendMessage(`🟢 𝘼𝙀-𝙎𝙏𝙃𝙀𝙍 ⚪ :\n━━━━━━━━━━━━━━━━\n${formatText(response)} 🟡`, event.threadID, messageID);
                api.setMessageReaction("🟢", event.messageID, () => {}, true);
            } catch (error) {
                console.error("Error in onChat:", error.message);
                api.sendMessage("An error occurred while processing your request.", event.threadID);
            }
        }
    },
    handleCommand // Export the handleCommand function for command-based interactions
};
