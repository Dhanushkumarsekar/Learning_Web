"""
Chatbot API Views
Handles chatbot conversations and AI-powered assistance
"""

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .chatbot_service import chatbot_service


class ChatViewSet(viewsets.ModelViewSet):
    """ViewSet for chatbot messages"""
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get only current user's messages"""
        return ChatMessage.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """Send a message and get AI response"""
        try:
            user = request.user
            message_text = request.data.get('message', '').strip()
            conversation_id = request.data.get('conversation_id', 'default')
            
            if not message_text:
                return Response(
                    {'error': 'Message cannot be empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save user message
            user_msg = chatbot_service.save_message(
                user=user,
                role='user',
                content=message_text,
                conversation_id=conversation_id
            )
            
            # Get AI response
            ai_response = chatbot_service.get_ai_response(
                user=user,
                user_message=message_text,
                conversation_id=conversation_id
            )
            
            # Save AI response
            ai_msg = chatbot_service.save_message(
                user=user,
                role='assistant',
                content=ai_response,
                conversation_id=conversation_id
            )
            
            return Response({
                'user_message': ChatMessageSerializer(user_msg).data,
                'ai_response': ChatMessageSerializer(ai_msg).data,
                'chatbot_available': chatbot_service.is_available()
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': f'Error processing message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def conversation_history(self, request):
        """Get conversation history"""
        try:
            conversation_id = request.query_params.get('conversation_id', 'default')
            messages = ChatMessage.objects.filter(
                user=request.user,
                conversation_id=conversation_id
            ).order_by('created_at')
            
            serializer = self.get_serializer(messages, many=True)
            return Response({
                'conversation_id': conversation_id,
                'messages': serializer.data,
                'count': messages.count()
            })
        except Exception as e:
            return Response(
                {'error': f'Error fetching history: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get all distinct conversations for user"""
        try:
            conversations = ChatMessage.objects.filter(
                user=request.user
            ).values_list('conversation_id', flat=True).distinct()
            
            conv_data = []
            for conv_id in conversations:
                last_msg = ChatMessage.objects.filter(
                    user=request.user,
                    conversation_id=conv_id
                ).order_by('-created_at').first()
                
                if last_msg:
                    conv_data.append({
                        'id': conv_id,
                        'last_message': last_msg.content[:50],
                        'last_updated': last_msg.created_at,
                        'message_count': ChatMessage.objects.filter(
                            user=request.user,
                            conversation_id=conv_id
                        ).count()
                    })
            
            return Response({
                'conversations': conv_data,
                'count': len(conv_data)
            })
        except Exception as e:
            return Response(
                {'error': f'Error fetching conversations: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'])
    def clear_conversation(self, request):
        """Clear a conversation"""
        try:
            conversation_id = request.query_params.get('conversation_id', 'default')
            deleted_count, _ = ChatMessage.objects.filter(
                user=request.user,
                conversation_id=conversation_id
            ).delete()
            
            return Response({
                'message': f'Deleted {deleted_count} messages',
                'deleted_count': deleted_count
            })
        except Exception as e:
            return Response(
                {'error': f'Error clearing conversation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Check if chatbot is available"""
        return Response({
            'available': chatbot_service.is_available(),
            'message': 'AI Chatbot is ready!' if chatbot_service.is_available() else 'AI Chatbot using fallback responses (configure OPENAI_API_KEY for full functionality)'
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_chat(request):
    """Quick chat endpoint (simplified)"""
    try:
        message = request.data.get('message', '').strip()
        if not message:
            return Response(
                {'error': 'Message required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = chatbot_service.get_ai_response(
            user=request.user,
            user_message=message,
            conversation_id='quick_chat'
        )
        
        return Response({
            'message': message,
            'response': response,
            'chatbot_available': chatbot_service.is_available()
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
