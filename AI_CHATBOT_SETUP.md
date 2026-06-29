# AI Chatbot Integration Guide

## Overview

The LMS now features an AI-powered **Learning Assistant Chatbot** that helps students:

- 📚 **Get Course Recommendations** - Personalized course suggestions based on interests and skills
- 💼 **Receive Career Guidance** - Career path planning and skill development advice
- ❓ **Answer Questions** - Get information about courses, learning strategies, and skills
- 🎯 **Study Support** - Learning tips, study strategies, and motivation

## Features

### 1. **Course Recommendations**
- Intelligent suggestions based on user goals
- Ranked by popularity and ratings
- Links to specific course information

### 2. **Career Guidance**
- Career path exploration
- Skill progression recommendations
- Role-based learning pathways
- Industry insights

### 3. **Learning Support**
- Study strategy recommendations
- Time management tips
- Motivation and encouragement
- Q&A about course content

### 4. **Conversation Management**
- Multiple concurrent conversations
- Persistent chat history (saved to database)
- Search within conversations
- Clear conversation option

## Setup Instructions

### Backend Setup

#### 1. Install Dependencies

```bash
cd lms_project
pip install -r requirements.txt
```

The `openai==1.3.0` package is already included in requirements.txt

#### 2. Configure OpenAI API Key

**Get your API key:**
1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create a new API key
3. Copy the key

**Set environment variable:**

Create a `.env` file in the `lms_project` directory:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
```

Or set as system environment variable:

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sk-your-api-key"
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sk-your-api-key"
```

#### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

This creates the `ChatMessage` table for storing chat history.

#### 4. Start Django Server

```bash
python manage.py runserver
```

### Frontend Setup

The ChatBot component is already integrated into the StudentLayout. It appears as a:
- 💬 **Floating Action Button (FAB)** in the bottom-right corner of the student dashboard
- **Dialog** that opens when clicked

#### 1. Dependencies

The ChatBot uses Material-UI components (already installed):
- `@mui/material`
- `@mui/icons-material`

#### 2. Start React Frontend

```bash
cd ../lms-frontend
npm start
```

## API Endpoints

### Chat Endpoints

All endpoints require authentication (JWT token in header).

#### Send Message & Get Response
```
POST /api/chat/send_message/
Content-Type: application/json

{
  "message": "What courses do you recommend?",
  "conversation_id": "default"
}

Response:
{
  "user_message": { /* ChatMessage object */ },
  "ai_response": { /* ChatMessage object */ },
  "chatbot_available": true
}
```

#### Get Conversation History
```
GET /api/chat/conversation_history/?conversation_id=default

Response:
{
  "conversation_id": "default",
  "messages": [ /* array of ChatMessage objects */ ],
  "count": 10
}
```

#### List All Conversations
```
GET /api/chat/conversations/

Response:
{
  "conversations": [
    {
      "id": "default",
      "last_message": "What skills should I learn?",
      "last_updated": "2024-01-15T10:30:00Z",
      "message_count": 5
    }
  ],
  "count": 3
}
```

#### Clear Conversation
```
DELETE /api/chat/clear_conversation/?conversation_id=default

Response:
{
  "message": "Deleted 10 messages",
  "deleted_count": 10
}
```

#### Check Chatbot Status
```
GET /api/chat/status/

Response:
{
  "available": true,
  "message": "AI Chatbot is ready!"
}
```

## Fallback Mode

If the OpenAI API is not configured or unavailable, the chatbot automatically switches to **Fallback Mode**:

- ✅ Still provides intelligent, contextual responses
- ✅ Makes course recommendations
- ✅ Provides career guidance
- ✅ Answers learning questions
- ⚠️ Responses are pre-defined but comprehensive

**To enable Fallback Mode:**
1. Don't set `OPENAI_API_KEY` environment variable
2. Or the API key is invalid
3. Chatbot UI shows "Fallback Mode" badge

## Available Courses for Recommendations

The chatbot can recommend from these courses:

1. **Full Stack Development**
   - Frontend, Backend, Databases
   - Web Applications

2. **Flutter Development**
   - Mobile App Development
   - Cross-platform Apps

3. **Cloud Computing Fundamentals**
   - AWS, Azure, Google Cloud
   - Deployment, DevOps

4. **Data Analysis & Visualization**
   - Data Science, Python
   - Business Intelligence

## Database Schema

### ChatMessage Model

```python
class ChatMessage(models.Model):
    user = ForeignKey(User)  # User who sent/received message
    role = CharField()  # 'user' or 'assistant'
    content = TextField()  # Message content
    created_at = DateTimeField()  # Auto-set to current time
    conversation_id = CharField()  # Group messages by conversation
    
    Meta:
        ordering = ['created_at']
        indexes = [('user', 'conversation_id', '-created_at')]
```

## Usage Examples

### Example 1: Get Career Guidance

**User:** "How do I become a data analyst?"

**Expected Response:**
```
Great question about career development! Here are some popular career paths we support:

📊 **Data Analyst**: Learn data visualization and insights. Data Analysis course is perfect.

**Recommended Path:**
1. Start with Data Analysis & Visualization course
2. Master Python and Pandas
3. Learn data visualization tools
4. Complete real-world projects

Would you like more information about the Data Analysis course?
```

### Example 2: Course Recommendation

**User:** "I want to build web applications"

**Expected Response:**
```
Based on your interest in web development, I recommend:

📚 **Full Stack Development**: Master frontend, backend, and databases. 
Learn HTML, CSS, JavaScript, React, Node.js, and databases.

This comprehensive course will teach you:
- Frontend frameworks (React)
- Backend APIs (Node.js, Django)
- Database design
- Project deployment

Get started with Full Stack Development course now!
```

### Example 3: Study Tips

**User:** "How do I manage multiple courses?"

**Expected Response:**
```
Here are some effective learning strategies for managing multiple courses:

1. **Set Clear Goals**: Define what you want to achieve

2. **Create a Schedule**: Dedicate specific times for each course

3. **Practice Daily**: Spend consistent time on coding/learning

4. **Build Projects**: Apply what you learn immediately

5. **Complete One Course**: Finish one before starting another (max 2 active)

6. **Join Communities**: Engage with other learners

7. **Track Progress**: Use credit points to measure achievement

Which course management strategy would you like to know more about?
```

## Troubleshooting

### Issue: "Chatbot unavailable" error

**Solutions:**
1. Check OpenAI API key is set correctly
2. Verify API key has available credits/quota
3. Check internet connectivity
4. Look at Django logs for errors

### Issue: Responses are slow

**Solutions:**
1. OpenAI API latency - wait a moment
2. Check internet connection
3. Verify API key is valid
4. Consider rate limits if many requests

### Issue: Can't see ChatBot button

**Solutions:**
1. Make sure you're logged in as a STUDENT or EMPLOYEE
2. Refresh the page
3. Check browser console for JavaScript errors
4. Verify student_layout.js includes ChatBot import

### Issue: Chat history not saving

**Solutions:**
1. Verify database migration ran: `python manage.py migrate`
2. Check ChatMessage model is registered in admin
3. Verify user is authenticated

## Admin Interface

### Manage Chat Messages

Access via Django admin at: `http://localhost:8000/admin/`

Navigate to: **Chat Messages**

Features:
- View all conversations by user
- Search messages by content
- Filter by role (user/assistant)
- Filter by conversation
- View message timestamps
- Delete conversations

## Advanced Configuration

### Custom System Prompt

Edit `lms_backend/chatbot_service.py` and modify `get_system_prompt()` method to customize:

- Career paths offered
- Available courses
- Personality/tone of bot
- Specific guidance offered

### Custom Fallback Responses

Edit `get_fallback_response()` method in `chatbot_service.py` to add:

- More question patterns
- Additional career paths
- Custom responses

### Change AI Model

In `.env` or `settings.py`:

```python
OPENAI_MODEL=gpt-4  # Use GPT-4 instead of GPT-3.5-turbo
```

Note: GPT-4 requires access and has different pricing.

## Pricing (OpenAI)

**GPT-3.5-turbo (recommended):**
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- Typical conversation: $0.001 - $0.005

**Estimate:** 1000 conversations ≈ $1-5

## Privacy & Security

- ✅ Chat history saved to database (encrypted at rest if using SSL)
- ✅ Only authenticated users can access chatbot
- ✅ Users only see their own conversations
- ✅ OpenAI API calls don't permanently store data (by default)
- ✅ Set OPENAI_API_KEY securely (never in version control)

## Future Enhancements

Potential improvements:

1. **Vector Embeddings** - Search similar past conversations
2. **Multi-language Support** - Support multiple languages
3. **Custom Knowledge Base** - Train on course-specific content
4. **Real-time Typing** - Stream responses as they generate
5. **File Upload** - Upload course materials for analysis
6. **Integration** - Connect to external learning resources
7. **Analytics** - Track popular questions and topics
8. **Ratings** - Allow users to rate response quality

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review Django logs: `tail -f lms.log`
3. Check browser console for errors
4. Verify environment variables are set
5. Test API endpoints manually with curl or Postman

---

**Last Updated:** January 2024
**Chatbot Version:** 1.0.0
**API Version:** v1
