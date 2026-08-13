"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Send, User, MessageSquare } from "lucide-react";

export type Message = {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_name?: string;
};

export type ChatDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentUserId: string;
  recipientName?: string;
};

export default function ChatDrawer({
  isOpen,
  onClose,
  orderId,
  currentUserId,
  recipientName = "Order Chat",
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch messages and subscribe to Realtime ─────────────────────────────
  useEffect(() => {
    if (!isOpen || !orderId || !currentUserId) return;

    let channel: any;

    async function initChat() {
      setLoading(true);

      // 1. Fetch existing messages for order
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages((msgs as Message[]) || []);
      }

      // 2. Mark unread messages from other user as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("order_id", orderId)
        .neq("sender_id", currentUserId)
        .eq("read", false);

      setLoading(false);

      // 3. Realtime subscription for incoming messages
      channel = supabase
        .channel(`chat_order_${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `order_id=eq.${orderId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Mark as read in DB if drawer is open and message is from recipient
            if (newMsg.sender_id !== currentUserId) {
              supabase
                .from("messages")
                .update({ read: true })
                .eq("id", newMsg.id)
                .then();
            }
          }
        )
        .subscribe();
    }

    initChat();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isOpen, orderId, currentUserId, supabase]);

  // ── Smooth scroll to bottom ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // ── Send Message ─────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !orderId || !currentUserId || sending) return;

    setSending(true);
    const { data: insertedMsg, error } = await supabase
      .from("messages")
      .insert({
        order_id: orderId,
        sender_id: currentUserId,
        content: content,
        read: false,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error sending message:", error);
    } else if (insertedMsg) {
      setNewMessage("");
      setMessages((prev) => {
        if (prev.some((m) => m.id === insertedMsg.id)) return prev;
        return [...prev, insertedMsg as Message];
      });
    }

    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{recipientName}</h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Order #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">No messages yet</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Send a message to discuss delivery details, produce quality, or questions about this order.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      isMine
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMine && (
                      <span className="ml-1 text-[10px]">
                        {msg.read ? "✓✓ Read" : "✓ Sent"}
                      </span>
                    )}
                  </div>
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors flex-shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

