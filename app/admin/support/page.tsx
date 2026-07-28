'use client';

// app/admin/support/page.tsx
// Dummy support chat interface — wire to a real tickets/messages table later.

import { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  User,
  Headphones,
} from 'lucide-react';

// ── Demo Data ─────────────────────────────────────────────────────────────────

const DUMMY_TICKETS = [
  {
    id: 'TKT-001',
    user: 'Ama Osei',
    role: 'farmer',
    subject: 'Cannot upload verification document',
    preview: 'I keep getting an error when I try to upload my Ghana Card...',
    status: 'open',
    priority: 'high',
    createdAt: '2026-07-28T08:12:00Z',
    messages: [
      { from: 'user',  name: 'Ama Osei',        text: 'Hi, I keep getting an error when I try to upload my Ghana Card for verification. It just spins and then fails.', time: '08:12' },
      { from: 'admin', name: 'Support Agent',    text: 'Hello Ama, sorry to hear that! Could you let me know what file format you\'re trying to upload? We accept JPG, PNG and PDF.', time: '08:35' },
      { from: 'user',  name: 'Ama Osei',        text: 'I\'m using a JPG photo I took with my phone. It\'s about 3MB.', time: '08:41' },
    ],
  },
  {
    id: 'TKT-002',
    user: 'Kwame Asante',
    role: 'buyer',
    subject: 'Order not delivered after 5 days',
    preview: 'My order #AB-7481 was marked in transit 5 days ago...',
    status: 'open',
    priority: 'high',
    createdAt: '2026-07-27T14:20:00Z',
    messages: [
      { from: 'user',  name: 'Kwame Asante',    text: 'My order #AB-7481 was marked in transit 5 days ago but I still haven\'t received it. The farmer isn\'t responding to calls.', time: '14:20' },
      { from: 'admin', name: 'Support Agent',    text: 'Hi Kwame, I\'m sorry for the inconvenience. Let me check the order details with the farmer and logistics team.', time: '14:55' },
    ],
  },
  {
    id: 'TKT-003',
    user: 'Abena Mensah',
    role: 'farmer',
    subject: 'Subscription payment went through but account still free',
    preview: 'I paid GH₵120 for the premium plan...',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2026-07-26T10:05:00Z',
    messages: [
      { from: 'user',  name: 'Abena Mensah',    text: 'I paid GH₵120 for the premium plan but my account still shows as free tier.', time: '10:05' },
      { from: 'admin', name: 'Support Agent',    text: 'Hi Abena! I can see the payment came through. The webhook may have been delayed. I\'ve manually upgraded your account now — please refresh.', time: '10:22' },
      { from: 'user',  name: 'Abena Mensah',    text: 'It works now! Thank you so much!', time: '10:30' },
    ],
  },
  {
    id: 'TKT-004',
    user: 'Kofi Boateng',
    role: 'farmer',
    subject: 'AI scan showing wrong disease',
    preview: 'The AI diagnosed my tomatoes with blight but I think it\'s...',
    status: 'open',
    priority: 'low',
    createdAt: '2026-07-28T06:50:00Z',
    messages: [
      { from: 'user',  name: 'Kofi Boateng',    text: 'The AI diagnosed my tomatoes with early blight but looking at the symptoms I think it might be leaf miner damage. Can someone double-check?', time: '06:50' },
    ],
  },
  {
    id: 'TKT-005',
    user: 'Adwoa Frimpong',
    role: 'buyer',
    subject: 'Refund request for cancelled order',
    preview: 'I cancelled order #AB-7430 within 2 hours...',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2026-07-25T16:00:00Z',
    messages: [
      { from: 'user',  name: 'Adwoa Frimpong',  text: 'I cancelled order #AB-7430 within 2 hours of placing it. When will I get my refund?', time: '16:00' },
      { from: 'admin', name: 'Support Agent',    text: 'Hi Adwoa, refunds are processed within 3-5 business days back to your original payment method. Your refund of GH₵85 is being processed.', time: '16:15' },
    ],
  },
];

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  open:     { label: 'Open',     cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  resolved: { label: 'Resolved', cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
};

const priorityColor: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-600',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SupportChatPage() {
  const [activeTicket, setActiveTicket] = useState(DUMMY_TICKETS[0]);
  const [messages, setMessages] = useState<typeof DUMMY_TICKETS[0]['messages']>(DUMMY_TICKETS[0].messages);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState(DUMMY_TICKETS);

  const filtered = tickets.filter((t) =>
    t.user.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const openTicket = (ticket: typeof DUMMY_TICKETS[0]) => {
    setActiveTicket(ticket);
    setMessages(ticket.messages);
    setInput('');
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { from: 'admin' as const, name: 'Support Agent', text: input.trim(), time: new Date().toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' }) };
    const updated = [...messages, newMsg];
    setMessages(updated);
    // Sync back to tickets state
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicket.id ? { ...t, messages: updated } : t
      )
    );
    setInput('');
  };

  const resolveTicket = () => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicket.id ? { ...t, status: 'resolved' } : t
      )
    );
    setActiveTicket((prev) => ({ ...prev, status: 'resolved' }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Headphones className="w-6 h-6 text-purple-500" />
          Support Chat
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Respond to farmer and buyer support requests.</p>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 gap-5 overflow-hidden min-h-0">

        {/* Ticket List */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="bg-transparent text-sm focus:outline-none w-full placeholder-gray-400"
              />
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex border-b border-gray-100">
            <div className="flex-1 text-center py-2.5">
              <p className="text-lg font-bold text-amber-600">{tickets.filter((t) => t.status === 'open').length}</p>
              <p className="text-[10px] text-gray-400">Open</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1 text-center py-2.5">
              <p className="text-lg font-bold text-green-600">{tickets.filter((t) => t.status === 'resolved').length}</p>
              <p className="text-[10px] text-gray-400">Resolved</p>
            </div>
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.map((ticket) => {
              const isActive = ticket.id === activeTicket.id;
              const ui = statusConfig[ticket.status] ?? statusConfig['open'];
              const Icon = ui.icon;
              return (
                <button
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className={`w-full text-left px-4 py-3.5 transition-colors ${
                    isActive ? 'bg-purple-50 border-l-2 border-purple-500' : 'hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{ticket.user}</p>
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${ticket.status === 'resolved' ? 'text-green-500' : 'text-amber-500'}`} />
                  </div>
                  <p className="text-xs text-gray-500 truncate">{ticket.subject}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${priorityColor[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] text-gray-400 capitalize">{ticket.role}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0">
          {/* Ticket Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-gray-400">{activeTicket.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[activeTicket.status]?.cls}`}>
                  {statusConfig[activeTicket.status]?.label}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${priorityColor[activeTicket.priority]}`}>
                  {activeTicket.priority} priority
                </span>
              </div>
              <p className="text-base font-bold text-gray-900">{activeTicket.subject}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeTicket.user} · <span className="capitalize">{activeTicket.role}</span> ·{' '}
                {new Date(activeTicket.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {activeTicket.status === 'open' && (
              <button
                onClick={resolveTicket}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex-shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg, i) => {
              const isAdmin = msg.from === 'admin';
              return (
                <div key={i} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isAdmin ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isAdmin ? 'A' : msg.name[0]}
                  </div>
                  <div className={`max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isAdmin
                        ? 'bg-purple-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-gray-400">{msg.time} · {msg.name}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100">
            {activeTicket.status === 'resolved' ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-green-600 bg-green-50 rounded-xl">
                <CheckCircle className="w-4 h-4" />
                This ticket has been resolved.
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:border-purple-300 transition-all">
                  <textarea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    placeholder="Type your reply… (Enter to send, Shift+Enter for newline)"
                    className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
