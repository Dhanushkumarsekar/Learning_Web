import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  ScrollArea,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Forum as ForumIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import api from '../api';

const ChatBot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState('default');
  const [showConversationList, setShowConversationList] = useState(false);
  const [chatbotAvailable, setChatbotAvailable] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      fetchConversationHistory();
      checkChatbotStatus();
    }
  }, [open, currentConversationId]);

  const checkChatbotStatus = async () => {
    try {
      const response = await api.get('/chat/status/');
      setChatbotAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking chatbot status:', error);
    }
  };

  const fetchConversationHistory = async () => {
    try {
      const response = await api.get('/chat/conversation_history/', {
        params: { conversation_id: currentConversationId },
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations/');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.post('/chat/send_message/', {
        message: userMessage,
        conversation_id: currentConversationId,
      });

      setMessages((prev) => [
        ...prev,
        response.data.user_message,
        response.data.ai_response,
      ]);
      setChatbotAvailable(response.data.chatbot_available);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: null,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = async () => {
    try {
      await api.delete('/chat/clear_conversation/', {
        params: { conversation_id: currentConversationId },
      });
      setMessages([]);
      fetchConversations();
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setShowConversationList(false);
  };

  const handleNewConversation = () => {
    const newId = `conversation_${Date.now()}`;
    setCurrentConversationId(newId);
    setMessages([]);
    setShowConversationList(false);
  };

  const suggestedQuestions = [
    'What courses would you recommend for me?',
    'How do I become a full stack developer?',
    'Tell me about cloud computing courses',
    'What is the best learning strategy?',
    'How do I get career guidance?',
    'What skills should I learn first?',
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: '80vh',
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ForumIcon sx={{ color: '#FCD980' }} />
          <Typography variant="h6">Learning Assistant</Typography>
          {!chatbotAvailable && (
            <Chip label="Fallback Mode" size="small" variant="outlined" color="warning" />
          )}
        </Box>
        <Box>
          <Tooltip title="Conversations">
            <IconButton size="small" onClick={() => {
              setShowConversationList(true);
              fetchConversations();
            }}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Messages Area */}
      <DialogContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          py: 2,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ForumIcon sx={{ fontSize: 48, color: '#FCD980', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Welcome to Learning Assistant!</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Ask me about courses, career guidance, or learning strategies.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ mb: 1, fontWeight: 600 }}>Suggested Questions:</Typography>
              {suggestedQuestions.slice(0, 3).map((question, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setInputValue(question);
                  }}
                  sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                >
                  {question}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              sx={{
                maxWidth: '85%',
                p: 1.5,
                borderRadius: 2,
                backgroundColor: message.role === 'user' ? '#FCD980' : '#E8E8E8',
                color: message.role === 'user' ? '#282938' : '#000',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                {new Date(message.created_at).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
            <CircularProgress size={24} sx={{ color: '#FCD980' }} />
            <Typography variant="body2" color="textSecondary">
              Assistant is thinking...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </DialogContent>

      <Divider />

      {/* Input Area */}
      <DialogActions sx={{ p: 0 }}>
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: 'flex',
            gap: 1,
            p: 1.5,
            width: '100%',
            backgroundColor: '#f5f5f5',
            borderRadius: '0 0 8px 8px',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            multiline
            maxRows={3}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
          <Tooltip title="Clear conversation">
            <IconButton
              size="small"
              onClick={handleClearConversation}
              disabled={loading || messages.length === 0}
              sx={{ color: '#999' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            type="submit"
            disabled={!inputValue.trim() || loading}
            sx={{
              backgroundColor: '#FCD980',
              color: '#282938',
              '&:hover': { backgroundColor: '#FBD570' },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogActions>

      {/* Conversations Dialog */}
      <Dialog open={showConversationList} onClose={() => setShowConversationList(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Conversations</DialogTitle>
        <DialogContent>
          <Button
            fullWidth
            variant="contained"
            onClick={handleNewConversation}
            sx={{ mb: 2, mt: 1, backgroundColor: '#FCD980', color: '#282938' }}
          >
            Start New Conversation
          </Button>
          <List>
            {conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                selected={conv.id === currentConversationId}
              >
                <ListItemText
                  primary={`${conv.id.replace('conversation_', '').slice(0, 8)}...`}
                  secondary={`${conv.message_count} messages • ${new Date(conv.last_updated).toLocaleDateString()}`}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConversationList(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ChatBot;
