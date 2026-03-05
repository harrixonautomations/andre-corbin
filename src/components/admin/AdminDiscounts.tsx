import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Percent, Check, X } from "lucide-react";

interface BookDiscount {
  id: string;
  title: string;
  price: number;
  discount_percent: number;
  discount_active: boolean;
  discount_start: string | null;
  discount_end: string | null;
  cover_image_url: string | null;
}

const AdminDiscounts = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<BookDiscount[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ discount_percent: "0", discount_start: "", discount_end: "" });

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("id, title, price, discount_percent, discount_active, discount_start, discount_end, cover_image_url")
      .order("created_at", { ascending: false });
    if (data) setBooks(data as BookDiscount[]);
  };

  useEffect(() => { fetchBooks(); }, []);

  const openEdit = (b: BookDiscount) => {
    setEditingId(b.id);
    setForm({
      discount_percent: String(b.discount_percent),
      discount_start: b.discount_start ? b.discount_start.split("T")[0] : "",
      discount_end: b.discount_end ? b.discount_end.split("T")[0] : "",
    });
  };

  const saveDiscount = async (bookId: string) => {
    const { error } = await supabase.from("books").update({
      discount_percent: parseFloat(form.discount_percent) || 0,
      discount_start: form.discount_start ? new Date(form.discount_start).toISOString() : null,
      discount_end: form.discount_end ? new Date(form.discount_end).toISOString() : null,
    }).eq("id", bookId);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else toast({ title: "Discount updated" });
    setEditingId(null);
    fetchBooks();
  };

  const toggleActive = async (b: BookDiscount) => {
    await supabase.from("books").update({ discount_active: !b.discount_active }).eq("id", b.id);
    fetchBooks();
    toast({ title: b.discount_active ? "Discount disabled" : "Discount enabled" });
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-6">Book Discounts</h2>
      {books.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No books to manage.</p>
      ) : (
        <div className="space-y-3">
          {books.map((b) => (
            <motion.div key={b.id} layout className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-4">
                {b.cover_image_url && <img src={b.cover_image_url} alt="" className="w-10 h-14 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-sm truncate">{b.title}</p>
                  <p className="text-muted-foreground text-xs">
                    ${b.price}
                    {b.discount_active && b.discount_percent > 0 && (
                      <span className="text-primary ml-2">→ ${(b.price * (1 - b.discount_percent / 100)).toFixed(2)} ({b.discount_percent}% OFF)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={b.discount_active ? "default" : "outline"}
                    onClick={() => toggleActive(b)}
                    className="text-xs gap-1"
                  >
                    <Percent size={12} />
                    {b.discount_active ? "Active" : "Inactive"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(b)} className="text-xs">Edit</Button>
                </div>
              </div>

              {editingId === b.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Discount %</Label>
                      <Input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="bg-secondary border-border text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Start Date</Label>
                      <Input type="date" value={form.discount_start} onChange={(e) => setForm({ ...form, discount_start: e.target.value })} className="bg-secondary border-border text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Date</Label>
                      <Input type="date" value={form.discount_end} onChange={(e) => setForm({ ...form, discount_end: e.target.value })} className="bg-secondary border-border text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => saveDiscount(b.id)} className="gap-1"><Check size={12} /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="gap-1"><X size={12} /> Cancel</Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;
