"""
AI Chatbot Service for Course Recommendations, Career Guidance, and Learning Support
Uses OpenAI API to provide intelligent conversations
"""

import os
from typing import List, Dict, Any
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from .models import Course, ChatMessage, Enrollment, Category
import json

User = get_user_model()

# Try to import openai, but make it optional for development
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None


class ChatbotService:
    """Service for handling AI-powered chatbot interactions"""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.client = None
        if OPENAI_AVAILABLE and self.api_key:
            self.client = OpenAI(api_key=self.api_key)
    
    def is_available(self) -> bool:
        """Check if AI chatbot is available"""
        return OPENAI_AVAILABLE and self.client is not None
    
    def get_system_prompt(self, user: User = None) -> str:
        """Generate system prompt with LMS context"""
        user_context = ""
        if user:
            enrolled_count = Enrollment.objects.filter(user=user).count()
            completed_count = Enrollment.objects.filter(user=user, progress='COMPLETED').count()
            user_context = f"\nUser Context:\n- User: {user.username}\n- User Type: {user.user_type}\n- Enrolled in {enrolled_count} courses\n- Completed {completed_count} courses"
        
        courses = Course.objects.filter(is_deleted=False, is_active=True)
        course_list = "\n".join([f"- {c.title} ({', '.join([cat.name for cat in c.category.all()])}): {c.description[:100]}" for c in courses[:10]])
        
        return f"""You are an intelligent Learning Management System AI Assistant. Your role is to:

1. COURSE RECOMMENDATIONS: Suggest relevant courses based on user interests, skills, and goals
2. CAREER GUIDANCE: Provide career path advice and skill development recommendations
3. LEARNING SUPPORT: Answer questions about courses, help with learning strategies
4. COURSE INFORMATION: Provide detailed information about available courses

Available Courses:
{course_list}

Career Paths We Support:
- Full Stack Development: Web development, APIs, databases, frontend frameworks
- Mobile Development: Cross-platform apps, Flutter, iOS, Android
- Cloud Computing: AWS, Azure, Google Cloud, deployment, DevOps
- Data Analysis: Data science, visualization, business intelligence

{user_context}

Guidelines:
- Be friendly, encouraging, and supportive
- Provide specific course recommendations when relevant
- Ask clarifying questions to understand user needs better
- Explain how courses align with career goals
- Be enthusiastic about learning and skill development
- If unsure about specific courses, provide general guidance based on career paths
- Always mention specific course names when recommending
- Provide career progression suggestions

Remember: Your goal is to help users make informed decisions about their learning journey and career development."""
    
    def get_conversation_history(self, user: User, conversation_id: str) -> List[Dict[str, str]]:
        """Retrieve chat history for context"""
        messages = ChatMessage.objects.filter(
            user=user,
            conversation_id=conversation_id
        ).order_by('created_at')[:20]  # Last 20 messages for context
        
        return [
            {
                'role': msg.role,
                'content': msg.content
            }
            for msg in messages
        ]
    
    def save_message(self, user: User, role: str, content: str, conversation_id: str = 'default') -> ChatMessage:
        """Save a message to database"""
        return ChatMessage.objects.create(
            user=user,
            role=role,
            content=content,
            conversation_id=conversation_id
        )
    
    def get_ai_response(self, user: User, user_message: str, conversation_id: str = 'default') -> str:
        """Get AI response using OpenAI API or fallback"""
        
        if not self.is_available():
            return self.get_fallback_response(user, user_message)
        
        try:
            # Get conversation history
            conversation_history = self.get_conversation_history(user, conversation_id)
            
            # Build messages for API
            messages = [
                {'role': 'system', 'content': self.get_system_prompt(user)}
            ]
            messages.extend(conversation_history)
            messages.append({'role': 'user', 'content': user_message})
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model='gpt-3.5-turbo',
                messages=messages,
                temperature=0.7,
                max_tokens=500,
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            print(f"OpenAI API Error: {str(e)}")
            return self.get_fallback_response(user, user_message)
    
    def get_fallback_response(self, user: User, user_message: str) -> str:
        """Provide intelligent fallback responses when API is unavailable"""
        message_lower = user_message.lower()
        
        # Course recommendations
        if any(word in message_lower for word in ['recommend', 'suggest', 'what course', 'which course', 'best course']):
            courses = Course.objects.filter(is_deleted=False, is_active=True)[:3]
            if courses:
                response = "Based on our available courses, I'd recommend:\n"
                for course in courses:
                    response += f"\n📚 **{course.title}**: {course.description[:100]}..."
                response += "\n\nWould you like more information about any of these courses?"
                return response
            return "We have several great courses available! What type of skill are you interested in developing?"
        
        # Career guidance
        if any(word in message_lower for word in ['career', 'job', 'path', 'guidance', 'role', 'position']):
            return """Great question about career development! Here are some popular career paths we support:

🚀 **Full Stack Developer**: Master frontend, backend, and databases. Combine Web Development and Full Stack courses.

📱 **Mobile Developer**: Focus on cross-platform development. Start with Flutter Development course.

☁️ **Cloud Engineer**: Learn cloud infrastructure and deployment. Take Cloud Computing course.

📊 **Data Analyst**: Work with data visualization and insights. Data Analysis course is perfect.

Which path interests you most? I can recommend specific courses to get you started!"""
        
        # Learning tips
        if any(word in message_lower for word in ['tip', 'advice', 'how to learn', 'strategy', 'study']):
            return """Here are some effective learning strategies:

1. **Set Clear Goals**: Define what you want to achieve (e.g., "Build a web app", "Get hired as a developer")

2. **Choose Your Path**: Pick related courses that build on each other

3. **Practice Daily**: Spend consistent time on coding/learning

4. **Build Projects**: Apply what you learn immediately

5. **Complete Courses**: Finish courses to earn certificates

6. **Join Communities**: Engage with other learners

7. **Focus on Depth**: Master one area before jumping to another

What specific learning challenge are you facing? I'm here to help!"""
        
        # General greeting
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return f"""Hello {user.first_name or user.username}! 👋 

I'm your Learning Assistant, here to help you on your educational journey. I can:

✅ **Recommend courses** - Based on your goals and interests
✅ **Provide career guidance** - Help you plan your career path
✅ **Answer questions** - About courses, learning, and skills
✅ **Offer study tips** - Strategies for effective learning

What would you like to explore today? You can ask me about:
- Career paths and guidance
- Course recommendations
- Learning strategies
- Specific skills you want to learn"""
        
        # Help/capabilities
        if any(word in message_lower for word in ['help', 'what can you', 'capabilities', 'support']):
            return """I can assist you with:

📚 **Course Recommendations** - Get personalized course suggestions based on your interests
💼 **Career Guidance** - Explore career paths and get advice on skill development
❓ **Answer Questions** - Get information about our courses and learning
🎯 **Learning Tips** - Learn strategies for effective studying and skill mastery
📊 **Progress Tracking** - See information about your enrolled courses

Just ask me anything! Here are some example questions:
- "What courses do you recommend for a beginner developer?"
- "How do I become a data analyst?"
- "What skills should I learn first?"
- "Tell me about the Full Stack Development course"
- "How do I manage multiple courses?"

What would you like to know?"""
        
        # Default response
        return """Thanks for your question! I'm here to help you succeed in your learning journey.

I can assist you with:
- 📚 Course recommendations and information
- 💼 Career guidance and path planning
- 🎯 Learning strategies and tips
- ❓ Answering questions about our platform

Feel free to ask me about any of these topics. What would you like to explore?"""
    
    def get_course_recommendations(self, skills: List[str] = None, career_goal: str = None) -> List[Course]:
        """Get course recommendations based on skills or career goals"""
        courses = Course.objects.filter(is_deleted=False, is_active=True)
        
        if skills:
            # Filter by category based on skills
            categories = Category.objects.filter(name__icontains=skills[0])
            courses = courses.filter(category__in=categories)
        
        if career_goal:
            # Map career goals to categories
            goal_mapping = {
                'full stack': 'Full Stack',
                'flutter': 'Flutter',
                'cloud': 'Cloud Compute',
                'data': 'Data Analysis',
                'web': 'Full Stack',
                'mobile': 'Flutter',
                'analyst': 'Data Analysis',
            }
            
            for goal_key, category_name in goal_mapping.items():
                if goal_key in career_goal.lower():
                    category = Category.objects.filter(name=category_name).first()
                    if category:
                        courses = courses.filter(category=category)
                    break
        
        # Sort by rating and popularity
        courses = courses.annotate(
            avg_rating=Avg('feedback__rating'),
            student_count=Count('enrollment')
        ).order_by('-avg_rating', '-student_count')
        
        return courses[:5]


# Create singleton instance
chatbot_service = ChatbotService()
