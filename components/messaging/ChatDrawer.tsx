"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Send, User } from "lucide-react";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type ChatDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  recipientId: string;
  recipientName: string;
};

export default function ChatDrawer({
  isOpen,
  onClose,
  orderId,
  recipientId,
  recipientName,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let channel: any;

    async function initChat() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Find or create conversation
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("order_id", orderId)
        .single();

      let convId = existingConv?.id;

      if (!convId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            order_id: orderId,
            farmer_id: user.id === recipientId ? user.id : recipientId, // Simplified for now
            buyer_id: user.id === recipientId ? recipientId : user.id, // Simplified for now
          })
          .select("id")
          .single();
        convId = newConv?.id;
      }

      if (convId) {
        setConversationId(convId);
        
        // Fetch messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });
          
        setMessages(msgs || []);

        // Subscribe to real-time messages
        channel = supabase
          .channel(`chat_${convId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` },
            (payload) => {
              setMessages((prev) => [...prev, payload.new as Message]);
            }
          )
          .subscribe();
      }
      setLoading(false);
    }

    initChat();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isOpen, orderId, recipientId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !currentUserId) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{recipientName}</h3>
              <p className="text-xs text-gray-500">Order #{orderId.slice(0, 6).toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-emerald-100/50 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="text-center text-sm text-gray-400 mt-4">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-gray-400 mt-4">
              No messages yet. Say hello to {recipientName}!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMine 
                        ? 'bg-emerald-600 text-white rounded-br-sm' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.body}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
