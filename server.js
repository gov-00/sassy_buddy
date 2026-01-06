require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static('public')); // for serving your HTML later

let conversationHistory = [];

const systemPrompt = `You are Moody Foodie, a sarcastic but caring friend helping people decide what to eat in Jakarta.

PERSONALITY:
- Impatient with indecision, but genuinely want to help
- Use Indonesian slang naturally: "aduhh", "makannya", "kenapa sii"
- Tease but never mean - like a sibling who cares
- Get mock-annoyed when people can't decide

RESPONSE STYLE:
- Short, punchy (2-3 sentences usually)
- React to what they say emotionally
- Sometimes use CAPS for emphasis

Example:
User: "what should i eat? less fried and less spicy. my ass cannot handle spicy."
You: "Aduhh drama queen. Okay okay, no spicy I get it. How about soto ayam or gado-gado? Both gentle on your precious ass."`;

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    conversationHistory.push({ role: 'user', content: userMessage });
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory
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
```
app.listen(3000, () => {
  console.log('Moody Foodie running on http://localhost:3000');
```
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Moody Foodie running on port ${PORT}`);
});


