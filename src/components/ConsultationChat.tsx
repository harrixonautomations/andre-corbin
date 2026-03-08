import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Reply, X, Video, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  message: string;
  reply_to_id: string | null;
  created_at: string;
  reply_to_message?: string;
  reply_to_sender?: string;
}

interface ConsultationChatProps {
  consultationId: string;
  clientName?: string;
  slotDate?: string | null;
  slotTime?: string | null;
  onRescheduleRequested?: () => void;
}

const ConsultationChat = ({ consultationId, clientName, slotDate, slotTime, onRescheduleRequested }: ConsultationChatProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("consultation_id", consultationId)
      .order("created_at", { ascending: true });

    if (data) {
      const enriched: ChatMessage[] = data.map((msg) => {
        const replyMsg = msg.reply_to_id ? data.find((m) => m.id === msg.reply_to_id) : null;
        return {
          ...msg,
          reply_to_message: replyMsg?.message,
          reply_to_sender: replyMsg?.sender_id === user?.id ? "You" : (clientName || "Client"),
        };
      });
      setMessages(enriched);
      scrollToBottom();
    }
  }, [consultationId, user?.id, clientName, scrollToBottom]);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`chat-${consultationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `consultation_id=eq.${consultationId}` }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [consultationId, fetchMessages]);

  const handleSend = async (messageOverride?: string) => {
    const text = messageOverride || input.trim();
    if (!text || !user) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      consultation_id: consultationId,
      sender_id: user.id,
      message: text,
      reply_to_id: replyTo?.id || null,
    });
    if (!messageOverride) setInput("");
    setReplyTo(null);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const logAction = async (action: string, details: string) => {
    if (!user) return;
    await supabase.from("consultation_logs").insert({
      consultation_id: consultationId,
      user_id: user.id,
      action,
      details,
    });
  };

  const handleInviteToMeeting = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["zoom_meeting_id", "zoom_password", "zoom_meeting_link"]);

    if (!data || data.length === 0) return;
    const settings: Record<string, string> = {};
    data.forEach((s) => { settings[s.key] = s.value; });
    const meetingId = settings["zoom_meeting_id"];
    const password = settings["zoom_password"];
    const meetingLink = settings["zoom_meeting_link"];
    if (!meetingId) return;

    const name = clientName || "there";
    let timeRemainingText = "soon";
    if (slotDate && slotTime) {
      const sessionDate = new Date(`${slotDate}T${slotTime}`);
      const now = new Date();
      const minutesLeft = differenceInMinutes(sessionDate, now);
      const hoursLeft = differenceInHours(sessionDate, now);
      if (minutesLeft <= 0) timeRemainingText = "now";
      else if (minutesLeft < 60) timeRemainingText = `${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}`;
      else {
        const remainingMins = minutesLeft % 60;
        timeRemainingText = `${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}${remainingMins > 0 ? ` and ${remainingMins} minute${remainingMins !== 1 ? "s" : ""}` : ""}`;
      }
    }

    let message = `Hi ${name}, I am inviting you to our consultation meeting which is due in ${timeRemainingText}.\n\n📋 Meeting ID: ${meetingId}\n🔑 Password: ${password}`;
    if (meetingLink) message += `\n🔗 Join Link: ${meetingLink}`;
    if (timeRemainingText !== "now") message += `\n\nThe meeting starts in ${timeRemainingText}. See you there!`;
    else message += `\n\nThe meeting is starting now. Join when you're ready!`;

    await handleSend(message);
    await logAction("meeting_invite", `Meeting invite sent to ${name}`);
  };

  const handleRescheduleRequest = async () => {
    if (!rescheduleDate || !rescheduleTime || !user) return;

    const requestedBy = isAdmin ? "admin" : "client";
    const formattedDate = new Date(rescheduleDate + "T12:00:00").toLocaleDateString();
    const [h, m] = rescheduleTime.split(":");
    const hour = parseInt(h);
    const formattedTime = `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;

    // Update consultation with reschedule proposal
    await supabase.from("consultations").update({
      status: "reschedule_pending",
      reschedule_requested_by: requestedBy,
      reschedule_proposed_date: rescheduleDate,
      reschedule_proposed_time: rescheduleTime,
      client_response: null,
    }).eq("id", consultationId);

    // Send chat message
    const senderName = isAdmin ? "Andre'" : (clientName || "Client");
    const recipientLabel = isAdmin ? (clientName || "Client") : "Andre'";
    const message = `📅 Reschedule Request\n\n${senderName} has requested to reschedule this consultation to ${formattedDate} at ${formattedTime}.\n\n${recipientLabel}, please accept or decline this request from your dashboard.`;
    await handleSend(message);

    // Log the action
    await logAction("reschedule_requested", `${requestedBy} requested reschedule to ${formattedDate} at ${formattedTime}`);

    setShowReschedule(false);
    setRescheduleDate("");
    setRescheduleTime("");
    toast({ title: "Reschedule request sent" });
    onRescheduleRequested?.();
  };

  return (
    <div className="flex flex-col h-[400px] bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {isAdmin ? `Chat with ${clientName || "Client"}` : "Chat with Andre'"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Consultation Thread</p>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReschedule(!showReschedule)}
            className="text-xs gap-1.5 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
          >
            <CalendarClock size={13} /> Reschedule
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleInviteToMeeting}
              className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Video size={13} /> Invite to Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Reschedule form */}
      {showReschedule && (
        <div className="px-4 py-3 border-b border-border bg-yellow-500/5">
          <p className="text-xs font-medium text-foreground mb-2">Propose a new date & time:</p>
          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1">
              <Label className="text-[10px]">Date</Label>
              <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="bg-secondary border-border text-xs h-8" />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-[10px]">Time</Label>
              <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="bg-secondary border-border text-xs h-8" />
            </div>
            <Button size="sm" onClick={handleRescheduleRequest} disabled={!rescheduleDate || !rescheduleTime} className="text-xs h-8">
              Send Request
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReschedule(false)} className="h-8">
              <X size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            {isAdmin ? "Start the conversation..." : "Waiting for Andre' to start the chat..."}
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] space-y-0.5 group")}>
                {msg.reply_to_message && (
                  <div className={cn(
                    "text-[10px] px-2.5 py-1 rounded-t-md border-l-2",
                    isMine ? "bg-primary/10 border-primary text-primary/70" : "bg-secondary border-muted-foreground text-muted-foreground"
                  )}>
                    <span className="font-medium">{msg.reply_to_sender}</span>
                    <p className="truncate">{msg.reply_to_message}</p>
                  </div>
                )}
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm relative",
                  isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"
                )}>
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className={cn("flex items-center gap-2 mt-1", isMine ? "justify-end" : "justify-start")}>
                    <span className={cn("text-[9px]", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {format(new Date(msg.created_at), "h:mm a")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 mt-0.5"
                >
                  <Reply size={10} /> Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply bar */}
      {replyTo && (
        <div className="px-4 py-2 bg-secondary/50 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground truncate flex-1">
            <span className="text-primary font-medium">Replying: </span>{replyTo.message}
          </div>
          <button onClick={() => setReplyTo(null)}><X size={14} className="text-muted-foreground hover:text-foreground" /></button>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-border flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="bg-secondary border-border text-sm"
        />
        <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || sending} className="shrink-0">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ConsultationChat;
