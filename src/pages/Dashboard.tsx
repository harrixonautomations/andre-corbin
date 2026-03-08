import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";
import ConsultationChat from "@/components/ConsultationChat";
import { motion } from "framer-motion";
import { LogOut, Package, Calendar, BookOpen, Clock, Truck, CheckCircle2, MessageCircle, X, AlertCircle, Check } from "lucide-react";

interface OrderRow {
  id: string;
  book_id: string | null;
  total: number;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  book_title?: string;
}

interface ConsultationRow {
  id: string;
  name: string;
  email: string;
  message: string | null;
  phone: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  slot_date: string | null;
  slot_time: string | null;
  postponed_date: string | null;
  postponed_time: string | null;
  client_response: string | null;
}

const statusIcon = (status: string) => {
  switch (status) {
    case "pending": return <Clock size={14} className="text-primary" />;
    case "scheduled": return <Calendar size={14} className="text-primary" />;
    case "processing": return <Package size={14} className="text-blue-400" />;
    case "shipped": return <Truck size={14} className="text-green-400" />;
    case "completed": return <CheckCircle2 size={14} className="text-green-400" />;
    case "confirmed": return <CheckCircle2 size={14} className="text-green-400" />;
    case "postponed": return <AlertCircle size={14} className="text-yellow-400" />;
    case "cancelled": return <X size={14} className="text-destructive" />;
    default: return <Clock size={14} className="text-muted-foreground" />;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-primary/10 text-primary";
    case "scheduled": return "bg-primary/10 text-primary";
    case "processing": return "bg-blue-500/10 text-blue-400";
    case "shipped": return "bg-green-500/10 text-green-400";
    case "completed": return "bg-green-500/10 text-green-400";
    case "confirmed": return "bg-green-500/10 text-green-400";
    case "postponed": return "bg-yellow-500/10 text-yellow-400";
    case "cancelled": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

const formatTime = (t: string) => {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [tab, setTab] = useState<"orders" | "bookings">("orders");
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersData) {
        const bookIds = [...new Set(ordersData.filter(o => o.book_id).map(o => o.book_id!))];
        let bookMap: Record<string, string> = {};
        if (bookIds.length > 0) {
          const { data: booksData } = await supabase.from("books").select("id, title").in("id", bookIds);
          if (booksData) bookMap = Object.fromEntries(booksData.map(b => [b.id, b.title]));
        }
        setOrders(ordersData.map(o => ({ ...o, book_title: o.book_id ? bookMap[o.book_id] || "Unknown" : "N/A" })));
      }

      const { data: consultData } = await supabase
        .from("consultations")
        .select("*");
      if (consultData) {
        const now = new Date();
        const sorted = (consultData as ConsultationRow[]).sort((a, b) => {
          const dateA = a.slot_date ? new Date(`${a.slot_date}T${a.slot_time || "00:00"}`) : null;
          const dateB = b.slot_date ? new Date(`${b.slot_date}T${b.slot_time || "00:00"}`) : null;
          if (!dateA && !dateB) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          if (!dateA) return 1;
          if (!dateB) return -1;
          const diffA = dateA.getTime() - now.getTime();
          const diffB = dateB.getTime() - now.getTime();
          if (diffA >= 0 && diffB >= 0) return diffA - diffB;
          if (diffA >= 0) return -1;
          if (diffB >= 0) return 1;
          return diffB - diffA;
        });
        setConsultations(sorted);
      }
    };
    fetchData();
  }, [user]);

  const respondToPostpone = async (id: string, accept: boolean) => {
    const update = accept
      ? { status: "confirmed", client_response: "accepted" }
      : { status: "reschedule_required", client_response: "rejected" };
    await supabase.from("consultations").update(update).eq("id", id);
    // Refresh
    const { data } = await supabase.from("consultations").select("*");
    if (data) {
      const now = new Date();
      const sorted = (data as ConsultationRow[]).sort((a, b) => {
        const dateA = a.slot_date ? new Date(`${a.slot_date}T${a.slot_time || "00:00"}`) : null;
        const dateB = b.slot_date ? new Date(`${b.slot_date}T${b.slot_time || "00:00"}`) : null;
        if (!dateA && !dateB) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (!dateA) return 1;
        if (!dateB) return -1;
        const diffA = dateA.getTime() - now.getTime();
        const diffB = dateB.getTime() - now.getTime();
        if (diffA >= 0 && diffB >= 0) return diffA - diffB;
        if (diffA >= 0) return -1;
        if (diffB >= 0) return 1;
        return diffB - diffA;
      });
      setConsultations(sorted);
    }
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth?redirect=/dashboard" replace />;

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground">My Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Track your orders and bookings</p>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="gap-2"><LogOut size={14} />Sign Out</Button>
          </div>

          <div className="flex gap-1 mb-8 bg-secondary rounded-lg p-1 w-fit">
            <button onClick={() => setTab("orders")} className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Package size={14} className="inline mr-2" />My Orders
            </button>
            <button onClick={() => setTab("bookings")} className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === "bookings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Calendar size={14} className="inline mr-2" />My Bookings
            </button>
          </div>

          {tab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen size={40} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No orders yet.</p>
                  <Link to="/book" className="text-primary hover:underline text-sm">Browse books →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-medium text-sm">{order.book_title}</p>
                          <p className="text-muted-foreground text-xs mt-1">
                            {new Date(order.created_at).toLocaleDateString()} · ${Number(order.total).toFixed(2)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${statusColor(order.status)}`}>
                          {statusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "bookings" && (
            <div>
              {consultations.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar size={40} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No bookings yet.</p>
                  <Link to="/coaching" className="text-primary hover:underline text-sm">Book a session →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map((c) => {
                    const displayDate = c.status === "postponed" && c.postponed_date ? c.postponed_date : c.slot_date;
                    const displayTime = c.status === "postponed" && c.postponed_time ? c.postponed_time : c.slot_time;
                    const showCountdown = ["scheduled", "confirmed"].includes(c.status) && displayDate;
                    const needsResponse = c.status === "postponed" && c.client_response !== "accepted" && c.client_response !== "rejected";

                    return (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-foreground font-medium text-sm">{c.name}</p>
                            <p className="text-muted-foreground text-xs mt-1">
                              {new Date(c.created_at).toLocaleDateString()}
                              {displayDate && ` · ${new Date(displayDate + "T12:00:00").toLocaleDateString()}`}
                              {displayTime && ` at ${formatTime(displayTime)}`}
                            </p>
                            {c.message && <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{c.message}</p>}

                            {/* Countdown */}
                            {showCountdown && displayDate && (
                              <div className="mt-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Session in</p>
                                <CountdownTimer targetDate={displayDate} targetTime={displayTime || undefined} />
                              </div>
                            )}

                            {/* Postpone response */}
                            {needsResponse && (
                              <div className="mt-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-md">
                                <p className="text-yellow-400 text-xs font-medium mb-2">
                                  Andre' has proposed a new time: {c.postponed_date && new Date(c.postponed_date + "T12:00:00").toLocaleDateString()}
                                  {c.postponed_time && ` at ${formatTime(c.postponed_time)}`}
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => respondToPostpone(c.id, true)} className="gap-1 text-xs">
                                    <Check size={12} /> Accept
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => respondToPostpone(c.id, false)} className="gap-1 text-xs">
                                    <X size={12} /> Decline
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${statusColor(c.status)}`}>
                              {statusIcon(c.status)}
                              {c.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setOpenChatId(openChatId === c.id ? null : c.id)}
                              className="gap-1 text-xs"
                            >
                              <MessageCircle size={13} />
                              Chat
                            </Button>
                          </div>
                        </div>

                        {/* Chat */}
                        {openChatId === c.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                            <ConsultationChat consultationId={c.id} clientName={c.name} />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Dashboard;
