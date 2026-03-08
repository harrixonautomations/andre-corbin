import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import ConsultationChat from "@/components/ConsultationChat";
import AdminAvailability from "@/components/admin/AdminAvailability";
import AdminSamples from "@/components/admin/AdminSamples";
import AdminPlans from "@/components/admin/AdminPlans";
import AdminDiscounts from "@/components/admin/AdminDiscounts";
import AdminVideo from "@/components/admin/AdminVideo";
import {
  BookOpen, Plus, Trash2, Edit2, Calendar, LogOut, X, Upload,
  DollarSign, ShoppingCart, Users, Package, Truck, Clock, CheckCircle2,
  UserPlus, UserMinus, CalendarClock, MessageCircle, Tag, ArrowRight, FileText,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface BookRow {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  amazon_url: string;
  cover_image_url: string | null;
  page_count: number;
  created_at: string;
}

interface ConsultationRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  slot_date: string | null;
  slot_time: string | null;
  postponed_date: string | null;
  postponed_time: string | null;
  client_response: string | null;
  user_id: string | null;
}

interface OrderRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  book_id: string | null;
  total: number;
  status: string;
  created_at: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  book_title?: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
}

const PRIMARY_ADMIN_EMAIL = "harrixonautomations@gmail.com";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"overview" | "books" | "orders" | "consultations" | "availability" | "plans" | "discounts" | "samples" | "video" | "admins">("overview");
  const [books, setBooks] = useState<BookRow[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [formData, setFormData] = useState({ title: "", subtitle: "", description: "", price: "", amazon_url: "#" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [postponeData, setPostponeData] = useState<{ id: string; date: string; time: string } | null>(null);

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (data) setBooks(data);
  };

  const fetchConsultations = async () => {
    const { data } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
    if (data) setConsultations(data as ConsultationRow[]);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) {
      const bookIds = [...new Set(data.filter(o => o.book_id).map(o => o.book_id!))];
      let bookMap: Record<string, string> = {};
      if (bookIds.length > 0) {
        const { data: bData } = await supabase.from("books").select("id, title").in("id", bookIds);
        if (bData) bookMap = Object.fromEntries(bData.map(b => [b.id, b.title]));
      }
      setOrders(data.map(o => ({ ...o, book_title: o.book_id ? bookMap[o.book_id] || "Unknown" : "N/A" })));
    }
  };

  const fetchAdmins = async () => {
    const { data: roles } = await supabase.from("user_roles").select("*").eq("role", "admin");
    if (roles) {
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, email").in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
      setAdmins(roles.map(r => ({ id: r.id, user_id: r.user_id, email: profileMap.get(r.user_id) || "Unknown" })));
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchBooks();
      fetchConsultations();
      fetchOrders();
      fetchAdmins();
    }
  }, [user, isAdmin]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth?redirect=/admin" replace />;
  if (!isAdmin) return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
          <Button onClick={signOut} variant="outline" className="mt-6 gap-2"><LogOut size={16} />Sign Out</Button>
        </div>
      </section>
      <Footer />
    </main>
  );

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "completed").length;
  const pendingConsultations = consultations.filter(c => c.status === "pending" || c.status === "scheduled").length;

  const handleManuscriptChange = async (file: File) => {
    setManuscriptFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(0);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", subtitle: "", description: "", price: "", amazon_url: "#" });
    setCoverFile(null); setManuscriptFile(null); setPageCount(0); setEditingBook(null); setShowForm(false);
  };

  const openEdit = (book: BookRow) => {
    setEditingBook(book);
    setFormData({ title: book.title, subtitle: book.subtitle, description: book.description, price: String(book.price), amazon_url: book.amazon_url });
    setPageCount(book.page_count);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let coverUrl = editingBook?.cover_image_url || null;

    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("book-covers").upload(path, coverFile);
      if (uploadErr) { toast({ title: "Cover upload failed", description: uploadErr.message, variant: "destructive" }); setSubmitting(false); return; }
      const { data: urlData } = supabase.storage.from("book-covers").getPublicUrl(path);
      coverUrl = urlData.publicUrl;
    }

    let manuscriptUrl = null;
    if (manuscriptFile) {
      const path = `${Date.now()}-${manuscriptFile.name}`;
      const { error: mErr } = await supabase.storage.from("manuscripts").upload(path, manuscriptFile);
      if (mErr) { toast({ title: "Manuscript upload failed", description: mErr.message, variant: "destructive" }); setSubmitting(false); return; }
      manuscriptUrl = path;
    }

    const bookData = {
      title: formData.title, subtitle: formData.subtitle, description: formData.description,
      price: parseFloat(formData.price), amazon_url: formData.amazon_url,
      cover_image_url: coverUrl, page_count: pageCount,
      ...(manuscriptUrl ? { manuscript_url: manuscriptUrl } : {}),
    };

    if (editingBook) {
      const { error } = await supabase.from("books").update(bookData).eq("id", editingBook.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Book updated" });
    } else {
      const { error } = await supabase.from("books").insert(bookData);
      if (error) toast({ title: "Insert failed", description: error.message, variant: "destructive" });
      else toast({ title: "Book added" });
    }
    setSubmitting(false); resetForm(); fetchBooks();
  };

  const deleteBook = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    await supabase.from("books").delete().eq("id", id);
    fetchBooks();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
    toast({ title: `Order marked as ${status}` });
  };

  const updateConsultationStatus = async (id: string, status: string) => {
    await supabase.from("consultations").update({ status }).eq("id", id);
    fetchConsultations();
    toast({ title: `Booking ${status}` });
  };

  const handlePostpone = async () => {
    if (!postponeData) return;
    await supabase.from("consultations").update({
      status: "postponed",
      postponed_date: postponeData.date,
      postponed_time: postponeData.time,
      client_response: null,
    }).eq("id", postponeData.id);
    setPostponeData(null);
    fetchConsultations();
    toast({ title: "Meeting postponed", description: "Client will be notified." });
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    const currentProfile = admins.find(a => a.user_id === user?.id);
    if (currentProfile?.email !== PRIMARY_ADMIN_EMAIL) {
      toast({ title: "Only the primary admin can add others", variant: "destructive" });
      return;
    }
    const nonPrimaryAdmins = admins.filter(a => a.email !== PRIMARY_ADMIN_EMAIL);
    if (nonPrimaryAdmins.length >= 1) {
      toast({ title: "Maximum admins reached", description: "You can only add 1 additional admin.", variant: "destructive" });
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", newAdminEmail.trim()).maybeSingle();
    if (!profile) {
      toast({ title: "User not found", description: "No account with that email exists.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: profile.user_id, role: "admin" as const });
    if (error) toast({ title: "Failed to add admin", description: error.message, variant: "destructive" });
    else { toast({ title: "Admin added" }); setNewAdminEmail(""); fetchAdmins(); }
  };

  const removeAdmin = async (roleId: string, email: string | null) => {
    if (email === PRIMARY_ADMIN_EMAIL) { toast({ title: "Cannot remove primary admin", variant: "destructive" }); return; }
    if (!confirm(`Remove admin access for ${email}?`)) return;
    await supabase.from("user_roles").delete().eq("id", roleId);
    fetchAdmins();
    toast({ title: "Admin removed" });
  };

  const formatTime = (t: string) => { const [h, m] = t.split(":"); const hour = parseInt(h); return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`; };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: DollarSign },
    { key: "orders" as const, label: "Orders", icon: ShoppingCart },
    { key: "books" as const, label: "Books", icon: BookOpen },
    { key: "consultations" as const, label: "Bookings", icon: Calendar },
    { key: "availability" as const, label: "Calendar", icon: CalendarClock },
    { key: "plans" as const, label: "Plans", icon: Package },
    { key: "discounts" as const, label: "Discounts", icon: Tag },
    { key: "samples" as const, label: "Samples", icon: FileText },
    { key: "video" as const, label: "Video", icon: Upload },
    { key: "admins" as const, label: "Admins", icon: Users },
  ];

  const consultationStatuses = ["scheduled", "postponed", "confirmed", "completed", "cancelled"];

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground">Admin Cockpit</h1>
              <p className="text-muted-foreground text-sm mt-1">Andre' Corbin — Site Management</p>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="gap-2"><LogOut size={14} />Sign Out</Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-secondary rounded-lg p-1 w-fit flex-wrap">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <t.icon size={13} />{t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-400" },
                  { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-blue-400" },
                  { label: "Pending Orders", value: pendingOrders, icon: Package, color: "text-primary" },
                  { label: "Pending Bookings", value: pendingConsultations, icon: Calendar, color: "text-primary" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={16} className={stat.color} />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
              <div className="space-y-2 mb-10">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-sm font-medium">{o.first_name} {o.last_name} — {o.book_title}</p>
                      <p className="text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()} · ${Number(o.total).toFixed(2)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${o.status === "shipped" ? "bg-green-500/10 text-green-400" : o.status === "processing" ? "bg-blue-500/10 text-blue-400" : "bg-primary/10 text-primary"}`}>{o.status}</span>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">No orders yet.</p>}
              </div>

              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Bookings</h3>
              <div className="space-y-2">
                {consultations.slice(0, 5).map(c => (
                  <div key={c.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-sm font-medium">{c.name}</p>
                      <p className="text-muted-foreground text-xs">{c.email} · {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === "confirmed" || c.status === "completed" ? "bg-green-500/10 text-green-400" : c.status === "postponed" ? "bg-yellow-500/10 text-yellow-400" : "bg-primary/10 text-primary"}`}>{c.status}</span>
                  </div>
                ))}
                {consultations.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">No bookings yet.</p>}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">All Orders</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map(o => (
                    <div key={o.id} className="bg-card border border-border rounded-lg p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-foreground font-medium text-sm">{o.first_name} {o.last_name}</p>
                          <p className="text-muted-foreground text-xs">{o.email}</p>
                          <p className="text-muted-foreground text-xs mt-1">Book: {o.book_title} · ${Number(o.total).toFixed(2)}</p>
                          <p className="text-muted-foreground text-xs">{o.address}, {o.city}, {o.state} {o.zip}, {o.country}</p>
                          <p className="text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${o.status === "shipped" ? "bg-green-500/10 text-green-400" : o.status === "processing" ? "bg-blue-500/10 text-blue-400" : "bg-primary/10 text-primary"}`}>{o.status}</span>
                          {(o.status === "pending" || o.status === "completed") && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, "processing")} className="text-xs">
                              <Package size={12} className="mr-1" />Processing
                            </Button>
                          )}
                          {o.status === "processing" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, "shipped")} className="text-xs">
                              <Truck size={12} className="mr-1" />Shipped
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Books Tab */}
          {tab === "books" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-foreground">All Books</h2>
                {!showForm && <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2"><Plus size={14} />Add Book</Button>}
              </div>

              {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">{editingBook ? "Edit Book" : "Add New Book"}</h3>
                    <button onClick={resetForm}><X size={18} className="text-muted-foreground hover:text-foreground" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="bg-secondary border-border" /></div>
                    <div className="space-y-2"><Label>Subtitle</Label><Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="bg-secondary border-border" /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-secondary border-border" /></div>
                    <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="bg-secondary border-border" /></div>
                    <div className="space-y-2"><Label>Amazon Link</Label><Input value={formData.amazon_url} onChange={(e) => setFormData({ ...formData, amazon_url: e.target.value })} className="bg-secondary border-border" /></div>
                    <div className="space-y-2"><Label>Cover Image</Label><Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="bg-secondary border-border" /></div>
                    <div className="space-y-2">
                      <Label>Manuscript (PDF)</Label>
                      <Input type="file" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) handleManuscriptChange(e.target.files[0]); }} className="bg-secondary border-border" />
                      {pageCount > 0 && <p className="text-xs text-primary">{pageCount} pages detected</p>}
                    </div>
                    <div className="md:col-span-2"><Button type="submit" disabled={submitting} className="gap-2"><Upload size={14} />{submitting ? "Saving..." : editingBook ? "Update Book" : "Publish Book"}</Button></div>
                  </form>
                </motion.div>
              )}

              {books.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No books yet.</p>
              ) : (
                <div className="space-y-3">
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
                      {book.cover_image_url && <img src={book.cover_image_url} alt="" className="w-12 h-16 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium text-sm truncate">{book.title}</p>
                        <p className="text-muted-foreground text-xs">${book.price} · {book.page_count}p</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(book)}><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteBook(book.id)}><Trash2 size={14} className="text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Consultations Tab with advanced controls */}
          {tab === "consultations" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">Consultation Bookings</h2>
              {consultations.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <div key={c.id} className="bg-card border border-border rounded-lg p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{c.name}</p>
                          <p className="text-muted-foreground text-sm">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                          {c.message && <p className="text-muted-foreground text-sm mt-2">{c.message}</p>}
                          {c.slot_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Booked: {new Date(c.slot_date + "T12:00:00").toLocaleDateString()}
                              {c.slot_time && ` at ${formatTime(c.slot_time)}`}
                            </p>
                          )}
                          {c.postponed_date && (
                            <p className="text-xs text-yellow-400 mt-1">
                              Rescheduled to: {new Date(c.postponed_date + "T12:00:00").toLocaleDateString()}
                              {c.postponed_time && ` at ${formatTime(c.postponed_time)}`}
                              {c.client_response && <span className="ml-2 text-muted-foreground">({c.client_response})</span>}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            c.status === "confirmed" || c.status === "completed" ? "bg-green-500/10 text-green-400" :
                            c.status === "postponed" ? "bg-yellow-500/10 text-yellow-400" :
                            c.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                            "bg-primary/10 text-primary"
                          }`}>{c.status.replace(/_/g, " ")}</span>

                          {/* Status actions */}
                          <div className="flex flex-wrap gap-1">
                            {consultationStatuses.filter(s => s !== c.status).map(s => (
                              <Button key={s} size="sm" variant="outline" onClick={() => updateConsultationStatus(c.id, s)} className="text-[10px] px-2 py-1 h-auto">
                                {s.replace(/_/g, " ")}
                              </Button>
                            ))}
                          </div>

                          {/* Postpone */}
                          <Button size="sm" variant="outline" onClick={() => setPostponeData({ id: c.id, date: c.slot_date || "", time: c.slot_time || "" })} className="text-xs gap-1">
                            <CalendarClock size={12} /> Postpone
                          </Button>

                          {/* Chat */}
                          <Button size="sm" variant="ghost" onClick={() => setOpenChatId(openChatId === c.id ? null : c.id)} className="text-xs gap-1">
                            <MessageCircle size={12} /> Chat
                          </Button>
                        </div>
                      </div>

                      {/* Postpone form */}
                      {postponeData?.id === c.id && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm font-medium text-foreground mb-3">Reschedule to:</p>
                          <div className="flex gap-3 items-end">
                            <div className="space-y-1">
                              <Label className="text-xs">Date</Label>
                              <Input type="date" value={postponeData.date} onChange={(e) => setPostponeData({ ...postponeData, date: e.target.value })} className="bg-secondary border-border text-sm" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Time</Label>
                              <Input type="time" value={postponeData.time} onChange={(e) => setPostponeData({ ...postponeData, time: e.target.value })} className="bg-secondary border-border text-sm" />
                            </div>
                            <Button size="sm" onClick={handlePostpone} className="gap-1"><CheckCircle2 size={12} /> Confirm</Button>
                            <Button size="sm" variant="outline" onClick={() => setPostponeData(null)}><X size={12} /></Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Chat */}
                      {openChatId === c.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                          <ConsultationChat consultationId={c.id} clientName={c.name} />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {tab === "availability" && <AdminAvailability />}

          {/* Plans Tab */}
          {tab === "plans" && <AdminPlans />}

          {/* Discounts Tab */}
          {tab === "discounts" && <AdminDiscounts />}

          {/* Samples Tab */}
          {tab === "samples" && <AdminSamples />}

          {/* Admins Tab */}
          {tab === "admins" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">Admin Management</h2>
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Add New Admin</h3>
                <div className="flex gap-3">
                  <Input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="user@example.com" type="email" className="bg-secondary border-border max-w-sm" />
                  <Button onClick={addAdmin} className="gap-2"><UserPlus size={14} />Add</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">The user must have an existing account. You can add a maximum of 1 additional admin.</p>
              </div>
              <div className="space-y-3">
                {admins.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
                    <div>
                      <p className="text-foreground text-sm font-medium">{a.email}</p>
                      {a.email === PRIMARY_ADMIN_EMAIL && <span className="text-xs text-primary">Primary Admin</span>}
                    </div>
                    {a.email !== PRIMARY_ADMIN_EMAIL && (
                      <Button variant="ghost" size="sm" onClick={() => removeAdmin(a.id, a.email)} className="text-destructive gap-1">
                        <UserMinus size={14} />Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Admin;
