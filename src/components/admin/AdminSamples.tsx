import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, Check, Clock, BookOpen, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SampleRequest {
  id: string;
  email: string;
  book_id: string | null;
  status: string;
  created_at: string;
  book_title?: string;
}

interface BookSample {
  id: string;
  title: string;
  sample_chapter_url: string | null;
}

const AdminSamples = () => {
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [books, setBooks] = useState<BookSample[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("sample_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const items = data as any[];
      const bookIds = [...new Set(items.filter((r: any) => r.book_id).map((r: any) => r.book_id!))];
      let bookMap: Record<string, string> = {};
      if (bookIds.length > 0) {
        const { data: bData } = await supabase.from("books").select("id, title").in("id", bookIds);
        if (bData) bookMap = Object.fromEntries(bData.map(b => [b.id, b.title]));
      }
      setRequests(items.map((r: any) => ({
        ...r,
        book_title: r.book_id ? bookMap[r.book_id] || "Unknown" : "Not specified",
      })));
    }
  };

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("id, title, sample_chapter_url" as any);
    if (data) setBooks(data as any as BookSample[]);
  };

  useEffect(() => {
    fetchRequests();
    fetchBooks();
  }, []);

  const handleUploadSample = async (bookId: string, file: File) => {
    setUploading(bookId);
    const path = `${bookId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("sample-chapters").upload(path, file);
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(null);
      return;
    }
    await supabase.from("books").update({ sample_chapter_url: path } as any).eq("id", bookId);
    toast({ title: "Sample chapter uploaded" });
    setUploading(null);
    fetchBooks();
  };

  const sendSample = async (requestId: string) => {
    setSending(requestId);
    try {
      const { data, error } = await supabase.functions.invoke("send-sample-chapter", {
        body: { requestId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Sample sent!", description: "Email delivered successfully." });
      fetchRequests();
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
    setSending(null);
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div>
      {/* Upload sample chapters per book */}
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">Sample Chapters by Book</h2>
      <p className="text-muted-foreground text-sm mb-4">Upload a sample chapter PDF for each book. This file will be sent to users who request a free chapter.</p>
      <div className="space-y-3 mb-10">
        {books.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No books yet. Add a book first.</p>
        ) : (
          books.map(book => (
            <div key={book.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen size={16} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{book.title}</p>
                  <p className={`text-xs ${book.sample_chapter_url ? "text-green-400" : "text-muted-foreground"}`}>
                    {book.sample_chapter_url ? "✓ Sample uploaded" : "No sample uploaded"}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <Label htmlFor={`sample-${book.id}`} className="cursor-pointer">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors ${uploading === book.id ? "opacity-50 pointer-events-none" : ""}`}>
                    <Upload size={12} />
                    {uploading === book.id ? "Uploading..." : book.sample_chapter_url ? "Replace" : "Upload PDF"}
                  </div>
                </Label>
                <Input
                  id={`sample-${book.id}`}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled={uploading === book.id}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUploadSample(book.id, e.target.files[0]);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sample requests */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Sample Requests</h2>
        {pendingCount > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
            {pendingCount} pending
          </span>
        )}
      </div>
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-12">No sample requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-foreground text-sm font-medium">{r.email}</p>
                <p className="text-muted-foreground text-xs">
                  {r.book_title} · {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  r.status === "sent" ? "bg-green-500/10 text-green-400" : "bg-primary/10 text-primary"
                }`}>
                  <span className="inline-flex items-center gap-1">
                    {r.status === "sent" ? <><Check size={10} />Sent</> : <><Clock size={10} />Pending</>}
                  </span>
                </span>
                {r.status === "pending" && r.book_id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendSample(r.id)}
                    disabled={sending === r.id}
                    className="text-xs gap-1"
                  >
                    <Send size={12} />
                    {sending === r.id ? "Sending..." : "Send Sample"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSamples;
