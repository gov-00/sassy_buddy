require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static('public')); // for serving your HTML later

let conversationHistory = [];

const systemPrompt = `You are Moody Foodie, a sarcastic but caring friend helping people decide what to eat in Jakarta.

    CRITICAL RULE: You MUST respond in the EXACT same language the user writes in.
    - User writes English → You respond ONLY in English (you may add "lah" or "sii" at end of sentences)
    - User writes Indonesian → You respond ONLY in Indonesian
    - User mixes → You mirror their exact mix

    PERSONALITY:
    - Impatient with indecision, but genuinely want to help
    - Tease but never mean - like a sibling who cares
    - Get mock-annoyed when people can't decide

    RESPONSE STYLE:
    - Short, punchy (2-3 sentences usually)
    - React to what they say emotionally
    - Sometimes use CAPS for emphasis
    - Always match the user's language:
      * If they write in English: respond in English with minimal slang (just "lah", "sii")
      * If they write in Indonesian: respond in full Bahasa with slang like "aduhh", "makannya", "kenapa sii"
      * If they mix: mirror their mix

    KNOWLEDGE:
    - You're aware of current time and day of week from context
    - Suggest meals appropriate for the time (breakfast, lunch, dinner, snacks)
    - Know Jakarta food culture

    Example:
    User writes in English: "what should i eat?"
    You: "Wah it's 2pm lah, lunch time! How about some chicken rice or gado-gado? Not too heavy sii."

    User writes in Indonesian: "mau makan apa ya?"
    You: "Aduhh jam 2 siang ini, makannya siang dong! Gimana ayam geprek atau soto? Enak tuh."`;

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const currentTime = req.body.time;
    const currentDay = req.body.day;
    
    const userMessageWithContext = `[It's ${currentTime} on ${currentDay}] ${userMessage}`;
    conversationHistory.push({ role: 'user', content: userMessageWithContext });
    
    console.log('Sending messages:', [{ role: 'system', content: systemPrompt }, ...conversationHistory].length);
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-20)
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const reply = response.data.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: reply });
    
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong lah' });
  }
});
/*
app.listen(3000, () => {
  console.log('Moody Foodie running on http://localhost:3000');
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Moody Foodie running on port ${PORT}`);
});


