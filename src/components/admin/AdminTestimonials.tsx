import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, X, Save, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  display_order: number;
}

const AdminTestimonials = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ quote: "", name: "", title: "", company: "" });

  const fetch_ = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("display_order");
    if (data) setTestimonials(data as Testimonial[]);
  };

  useEffect(() => { fetch_(); }, []);

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({ quote: t.quote, name: t.name, title: t.title, company: t.company });
    setShowAdd(false);
  };

  const cancelEdit = () => { setEditingId(null); setForm({ quote: "", name: "", title: "", company: "" }); };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("testimonials").update({ quote: form.quote, name: form.name, title: form.title, company: form.company } as any).eq("id", editingId);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Testimonial updated" }); cancelEdit(); fetch_(); }
  };

  const addNew = async () => {
    const { error } = await supabase.from("testimonials").insert({ quote: form.quote, name: form.name, title: form.title, company: form.company, display_order: testimonials.length } as any);
    if (error) toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    else { toast({ title: "Testimonial added" }); setShowAdd(false); setForm({ quote: "", name: "", title: "", company: "" }); fetch_(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    fetch_();
    toast({ title: "Testimonial deleted" });
  };

  const formatTitle = (title: string, company: string) => {
    if (title && company) return `${title}, ${company}`;
    return title || company;
  };

  const FormFields = () => (
    <div className="space-y-3">
      <div className="space-y-1"><Label className="text-xs">Quote</Label><Textarea value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} rows={3} className="bg-secondary border-border" /></div>
      <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. CEO" className="bg-secondary border-border" /></div>
        <div className="space-y-1"><Label className="text-xs">Company</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. Acme Inc." className="bg-secondary border-border" /></div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Testimonials</h2>
        {!showAdd && <Button onClick={() => { cancelEdit(); setShowAdd(true); setForm({ quote: "", name: "", title: "", company: "" }); }} className="gap-2"><Plus size={14} />Add</Button>}
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">New Testimonial</h3>
            <button onClick={() => setShowAdd(false)}><X size={16} className="text-muted-foreground hover:text-foreground" /></button>
          </div>
          <FormFields />
          <Button onClick={addNew} className="gap-2 mt-3"><Save size={14} />Save</Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {testimonials.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-lg p-5">
            {editingId === t.id ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <FormFields />
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={saveEdit} className="gap-1"><Save size={12} />Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-start gap-4">
                <Quote className="w-6 h-6 text-primary/30 shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-secondary-foreground text-sm leading-relaxed mb-2">"{t.quote}"</p>
                  <p className="text-foreground font-medium text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{formatTitle(t.title, t.company)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(t)}><Edit2 size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {testimonials.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">No testimonials yet.</p>}
      </div>
    </div>
  );
};

export default AdminTestimonials;
