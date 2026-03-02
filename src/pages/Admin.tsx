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
import {
  BookOpen, Plus, Trash2, Edit2, Calendar, LogOut, X, Upload,
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
  message: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"books" | "consultations">("books");
  const [books, setBooks] = useState<BookRow[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRow | null>(null);
  const [formData, setFormData] = useState({ title: "", subtitle: "", description: "", price: "", amazon_url: "#" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (data) setBooks(data);
  };

  const fetchConsultations = async () => {
    const { data } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
    if (data) setConsultations(data);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchBooks();
      fetchConsultations();
    }
  }, [user, isAdmin]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
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

  const handleManuscriptChange = async (file: File) => {
    setManuscriptFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(0);
      toast({ title: "Could not read PDF", description: "Page count set to 0.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", subtitle: "", description: "", price: "", amazon_url: "#" });
    setCoverFile(null);
    setManuscriptFile(null);
    setPageCount(0);
    setEditingBook(null);
    setShowForm(false);
  };

  const openEdit = (book: BookRow) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      subtitle: book.subtitle,
      description: book.description,
      price: String(book.price),
      amazon_url: book.amazon_url,
    });
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
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      price: parseFloat(formData.price),
      amazon_url: formData.amazon_url,
      cover_image_url: coverUrl,
      page_count: pageCount,
      ...(manuscriptUrl ? { manuscript_url: manuscriptUrl } : {}),
    };

    if (editingBook) {
      const { error } = await supabase.from("books").update(bookData).eq("id", editingBook.id);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Book updated" }); }
    } else {
      const { error } = await supabase.from("books").insert(bookData);
      if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Book added" }); }
    }

    setSubmitting(false);
    resetForm();
    fetchBooks();
  };

  const deleteBook = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    await supabase.from("books").delete().eq("id", id);
    fetchBooks();
  };

  const updateConsultationStatus = async (id: string, status: string) => {
    await supabase.from("consultations").update({ status }).eq("id", id);
    fetchConsultations();
  };

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage books and consultations</p>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="gap-2"><LogOut size={14} />Sign Out</Button>
          </div>

          <div className="flex gap-1 mb-8 bg-secondary rounded-lg p-1 w-fit">
            <button onClick={() => setTab("books")} className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === "books" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <BookOpen size={14} className="inline mr-2" />Books
            </button>
            <button onClick={() => setTab("consultations")} className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === "consultations" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Calendar size={14} className="inline mr-2" />Consultations
            </button>
          </div>

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
                    <div className="space-y-2 md:col-span-2"><Label>Short Summary</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-secondary border-border" /></div>
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
                <p className="text-muted-foreground text-center py-12">No books yet. Add your first book.</p>
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

          {tab === "consultations" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">Consultation Requests</h2>
              {consultations.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No consultation requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <div key={c.id} className="bg-card border border-border rounded-lg p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-foreground font-medium">{c.name}</p>
                          <p className="text-muted-foreground text-sm">{c.email}</p>
                          {c.message && <p className="text-muted-foreground text-sm mt-2">{c.message}</p>}
                          {c.preferred_date && <p className="text-xs text-muted-foreground mt-1">Preferred: {new Date(c.preferred_date).toLocaleDateString()}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            c.status === "pending" ? "bg-primary/10 text-primary" :
                            c.status === "confirmed" ? "bg-green-500/10 text-green-400" :
                            "bg-muted text-muted-foreground"
                          }`}>{c.status}</span>
                          {c.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => updateConsultationStatus(c.id, "confirmed")}>Confirm</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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

export default Admin;
