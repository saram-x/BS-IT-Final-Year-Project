import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, MessageCircle, X } from "lucide-react";
import { sendMessage, getMessages, markMessagesAsRead } from "@/api/apiMessages";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@clerk/clerk-react";

const MessagingComponent = ({ application, isOpen, onClose, isCandidate = false }) => {
  const { user } = useUser();
  const { session } = useSession();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages function
  const fetchMessages = async () => {
    if (!application?.id || !session) return;
    
    try {
      setIsLoading(true);
      const token = await session.getToken({ template: "supabase" });
      const fetchedMessages = await getMessages(token, { application_id: application.id });
      setMessages(fetchedMessages || []);
      console.log("📨 Fetched messages:", fetchedMessages);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message function
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !application?.id || !session || !user?.id) {
      console.log("❌ Cannot send message - missing data:", {
        hasMessage: !!newMessage.trim(),
        hasApplicationId: !!application?.id,
        hasSession: !!session,
        hasUserId: !!user?.id
      });
      return;
    }
    
    console.log("🔄 Attempting to send message:", {
      applicationId: application.id,
      senderId: user.id,
      isCandidate: isCandidate,
      messageLength: newMessage.trim().length
    });
    
    try {
      setIsSending(true);
      const token = await session.getToken({ template: "supabase" });
      
      const messageData = {
        application_id: application.id,
        sender_id: user.id,
        sender_name: user.firstName + " " + (user.lastName || ""),
        content: newMessage.trim()
      };
      
      console.log("📨 Sending message data:", messageData);
      
      await sendMessage(token, {}, messageData);
      
      setNewMessage("");
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
      
      console.log("✅ Message sent successfully");
      
      // Fetch messages again to show the new message
      await fetchMessages();
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message: " + error.message
      });
    } finally {
      setIsSending(false);
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!application?.id || !session || !user?.id) return;
    
    try {
      const token = await session.getToken({ template: "supabase" });
      await markMessagesAsRead(token, { 
        application_id: application.id,
        user_id: user.id 
      });
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
    }
  };

  // Fetch messages when component opens
  useEffect(() => {
    if (isOpen && application?.id) {
      console.log("🔄 Messaging component opened for application:", application.id);
      fetchMessages();
      markAsRead();
      
      // Set up polling for new messages every 5 seconds
      const messagePolling = setInterval(() => {
        if (isOpen) {
          fetchMessages();
        }
      }, 5000);
      
      return () => clearInterval(messagePolling);
    }
  }, [isOpen, application?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl h-[600px] m-4 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle size={20} />
            {isCandidate 
              ? 'Chat with Recruiter'
              : 'Chat with Candidate'
            }
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 pr-4 mb-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageCircle size={40} className="mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  return (
                    <div
                      key={index}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="text-xs">
                            {isOwnMessage 
                              ? user?.firstName?.[0] || 'U'
                              : (isCandidate ? 'R' : 'C')
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
              className="px-3"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingComponent;

// milestone: Prepared the project foundation and local environment setup

// milestone 3: Tuned list filtering logic for location and role preferences
