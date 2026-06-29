# 🚀 Quick Reference - AI Chatbot Feature

## Installation (2 Minutes)

```bash
# 1. Backend setup
cd lms_project
pip install -r requirements.txt

# 2. (Optional) Set OpenAI API Key
# Create/edit .env file with:
# OPENAI_API_KEY=sk-your-key-here

# 3. Run migrations
python manage.py migrate

# 4. Start backend
python manage.py runserver

# 5. Start frontend (in another terminal)
cd ../lms-frontend
npm start
```

---

## What You Get

| Feature | Details |
|---------|---------|
| 💬 **Chatbot UI** | Floating button in bottom-right corner |
| 🎯 **Course Recommendations** | AI suggests courses based on goals |
| 💼 **Career Guidance** | Personalized career path advice |
| 📚 **Learning Support** | Study tips and strategies |
| 🔄 **Multi-Conversations** | Switch between different chats |
| 💾 **Chat History** | Persistent storage in database |
| ⚡ **Fallback Mode** | Works without API key! |

---

## How to Use

### As a Student:

1. **Login** to your account
2. **Click** 💬 icon (bottom-right)
3. **Type** your question
4. **Press** Send or Enter
5. **Get** AI-powered response

### Sample Questions:

- "What courses do you recommend?"
- "How do I become a data analyst?"
- "What's the best learning strategy?"
- "Tell me about the Full Stack course"
- "How do I manage 2 courses at once?"

---

## API Endpoints (For Developers)

```bash
# Send message
POST /api/chat/send_message/
Body: { "message": "...", "conversation_id": "default" }

# Get history
GET /api/chat/conversation_history/?conversation_id=default

# List conversations
GET /api/chat/conversations/

# Clear conversation
DELETE /api/chat/clear_conversation/?conversation_id=default

# Check status
GET /api/chat/status/
```

---

## Configuration

### `.env` File (Optional)

```bash
OPENAI_API_KEY=sk-your-api-key  # Get from: https://platform.openai.com/api-keys
OPENAI_MODEL=gpt-3.5-turbo       # AI model to use
OPENAI_MAX_TOKENS=500            # Max response length
```

### Without API Key?

✅ **Still works!** Uses intelligent fallback responses.

---

## File Structure

```
lms_project/
├── lms_backend/
│   ├── models.py                  # ChatMessage model
│   ├── serializers.py            # ChatMessageSerializer
│   ├── admin.py                  # ChatMessage admin
│   ├── urls.py                   # Chat routes
│   ├── chatbot_service.py        # ✨ AI Logic
│   ├── chatbot_views.py          # ✨ API endpoints
│   └── migrations/
│       └── 0037_*.py             # Database migration
└── settings.py                   # OpenAI config

lms-frontend/src/
├── components/
│   ├── ChatBot.js               # ✨ Chatbot component
│   └── layouts/
│       └── StudentLayout.js     # Integrated ChatBot
```

---

## Database

**ChatMessage Model:**
- Stores: user, role, content, timestamp
- Indexed for fast queries
- Persists across sessions
- Viewable in Django Admin

---

## Features in Detail

### 1️⃣ Course Recommendations
```
Input: "I want to learn web development"
Output: Full Stack Development course recommended
         with description, skills, curriculum
```

### 2️⃣ Career Guidance
```
Input: "What's a good career path?"
Output: Full Stack Developer → Steps → Courses → Skills
```

### 3️⃣ Study Support
```
Input: "How do I stay motivated?"
Output: Study strategies + tips + motivation
```

### 4️⃣ Q&A
```
Input: "Tell me about the Flutter course"
Output: Course description, skills, projects
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No chatbot button | Login as Student/Employee |
| API unavailable | Check OPENAI_API_KEY in .env |
| Slow responses | Normal OpenAI latency (2-5 sec) |
| Migration failed | `python manage.py migrate` |
| Import errors | `pip install -r requirements.txt` |

---

## Admin Management

**View Conversations:**
1. Go to: http://localhost:8000/admin/
2. Click: "Chat Messages"
3. Search by user or content
4. Filter by role or conversation

---

## Performance

**Response Time:**
- AI Response: 2-5 seconds
- Database Query: <100ms
- UI Update: Instant

**Storage:**
- ~1KB per message
- 1000 messages ≈ 1MB

**API Cost:**
- ~$0.001-0.005 per conversation
- 1000 conversations ≈ $1-5

---

## Security

✅ Authentication required
✅ User data isolation
✅ Environment variable protection
✅ SQL injection prevention
✅ CORS enabled

---

## Key Files Modified

```
✨ New Files:
- lms_backend/chatbot_service.py
- lms_backend/chatbot_views.py
- lms-frontend/src/components/ChatBot.js
- AI_CHATBOT_SETUP.md

📝 Modified Files:
- lms_backend/models.py (added ChatMessage)
- lms_backend/serializers.py (added serializer)
- lms_backend/urls.py (added routes)
- lms_backend/admin.py (registered model)
- requirements.txt (added openai)
- lms_project/settings.py (added config)
- lms-frontend/src/components/layouts/StudentLayout.js (integrated UI)
```

---

## Testing Checklist

- [ ] npm start (frontend)
- [ ] python manage.py runserver (backend)
- [ ] Login as Student
- [ ] See ChatBot icon (💬)
- [ ] Click icon - dialog opens
- [ ] Type message
- [ ] Send message
- [ ] Get response (2-5 sec)
- [ ] Multiple messages work
- [ ] Conversation history saved
- [ ] Can clear conversation

---

## One-Liner Commands

```bash
# Full setup
pip install -r requirements.txt && python manage.py migrate && python manage.py runserver

# Fresh database
python manage.py flush && python manage.py migrate

# Create admin
python manage.py createsuperuser

# View logs
tail -f lms.log

# Test API
curl http://localhost:8000/api/chat/status/
```

---

## Conversation Starters

Help your students get started:

1. "Hi! 👋 What would you like to learn today?"
2. "Ask me about our courses!"
3. "Want career guidance?"
4. "Need study tips?"
5. "Curious about Full Stack Development?"

---

## Support Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **Django Docs:** https://docs.djangoproject.com
- **React Docs:** https://react.dev
- **Material-UI:** https://mui.com

---

## Next Steps

1. ✅ Install and test
2. 📝 Set OPENAI_API_KEY (optional)
3. 📊 Monitor usage
4. 📢 Tell students about feature
5. 🚀 Gather feedback
6. 🔧 Customize as needed

---

**Ready to go?** Start with the installation commands above!

Need help? Check `AI_CHATBOT_SETUP.md` for detailed guide.

🎉 **Enjoy your AI-powered Learning Management System!**
