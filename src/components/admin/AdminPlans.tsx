import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, X, Percent } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_published: boolean;
  is_popular: boolean;
  display_order: number;
  discount_percent: number;
  created_at: string;
}

const AdminPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", duration_minutes: "60", discount_percent: "0" });

  const fetchPlans = async () => {
    const { data } = await supabase.from("consultation_plans").select("*").order("display_order");
    if (data) setPlans(data as Plan[]);
  };

  useEffect(() => { fetchPlans(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", duration_minutes: "60", discount_percent: "0" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      duration_minutes: String(p.duration_minutes),
      discount_percent: String(p.discount_percent),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      duration_minutes: parseInt(form.duration_minutes),
      discount_percent: parseFloat(form.discount_percent) || 0,
    };

    if (editing) {
      const { error } = await supabase.from("consultation_plans").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Plan updated" });
    } else {
      const { error } = await supabase.from("consultation_plans").insert({ ...payload, display_order: plans.length });
      if (error) toast({ title: "Insert failed", description: error.message, variant: "destructive" });
      else toast({ title: "Plan created" });
    }
    resetForm();
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await supabase.from("consultation_plans").delete().eq("id", id);
    fetchPlans();
    toast({ title: "Plan deleted" });
  };

  const togglePublish = async (p: Plan) => {
    await supabase.from("consultation_plans").update({ is_published: !p.is_published }).eq("id", p.id);
    fetchPlans();
    toast({ title: p.is_published ? "Plan unpublished" : "Plan published" });
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= plans.length) return;
    const a = plans[index];
    const b = plans[newIndex];
    await supabase.from("consultation_plans").update({ display_order: newIndex }).eq("id", a.id);
    await supabase.from("consultation_plans").update({ display_order: index }).eq("id", b.id);
    fetchPlans();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Consultation Plans</h2>
        {!showForm && <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2"><Plus size={14} />Add Plan</Button>}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{editing ? "Edit Plan" : "New Plan"}</h3>
            <button onClick={resetForm}><X size={16} className="text-muted-foreground hover:text-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-secondary border-border" /></div>
            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="bg-secondary border-border" /></div>
            <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" min="15" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className="bg-secondary border-border" /></div>
            <div className="space-y-2"><Label>Discount %</Label><Input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="bg-secondary border-border" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-secondary border-border" /></div>
            <div className="md:col-span-2"><Button type="submit">{editing ? "Update" : "Create"} Plan</Button></div>
          </form>
        </motion.div>
      )}

      {plans.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No plans yet.</p>
      ) : (
        <div className="space-y-3">
          {plans.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-4 bg-card border rounded-lg p-4 ${p.is_published ? "border-border" : "border-border/50 opacity-60"}`}>
              <div className="flex flex-col gap-0.5">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => reorder(i, -1)} disabled={i === 0}><ArrowUp size={12} /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => reorder(i, 1)} disabled={i === plans.length - 1}><ArrowDown size={12} /></Button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium text-sm">{p.name}</p>
                <p className="text-muted-foreground text-xs">${p.price} · {p.duration_minutes}min {p.discount_percent > 0 && `· ${p.discount_percent}% OFF`} {p.is_popular && "⭐ Popular"}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => togglePopular(p)} className="h-8 w-8" title={p.is_popular ? "Remove popular" : "Mark as popular"}>
                  <Star size={14} className={p.is_popular ? "text-primary fill-primary" : "text-muted-foreground"} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => togglePublish(p)} className="h-8 w-8">
                  {p.is_published ? <Eye size={14} /> : <EyeOff size={14} className="text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8"><Edit2 size={14} /></Button>
                <Button size="icon" variant="ghost" onClick={() => deletePlan(p.id)} className="h-8 w-8"><Trash2 size={14} className="text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
