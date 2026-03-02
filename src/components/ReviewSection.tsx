import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

const ReviewSection = ({ bookId }: { bookId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, review_text, created_at, user_id")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    // Get profile names
    if (data && data.length > 0) {
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const profileMap: Record<string, string> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = p.full_name || "Anonymous"; });
      setReviews(data.map((r) => ({ ...r, profiles: { full_name: profileMap[r.user_id] || "Anonymous" } })));
    } else {
      setReviews([]);
    }
  };

  const checkEligibility = async () => {
    if (!user) { setCanReview(false); return; }
    // Check if user has a completed order for this book
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .eq("status", "completed")
      .limit(1);
    const hasPurchased = (orders?.length || 0) > 0;

    // Check if already reviewed
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .limit(1);
    const alreadyReviewed = (existing?.length || 0) > 0;

    setCanReview(hasPurchased && !alreadyReviewed);
    setHasReviewed(alreadyReviewed);
  };

  useEffect(() => { fetchReviews(); checkEligibility(); }, [bookId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      book_id: bookId,
      rating,
      review_text: text,
    });
    if (error) {
      toast({ title: "Review failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setText("");
      setCanReview(false);
      setHasReviewed(true);
      fetchReviews();
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-12">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare size={18} className="text-primary" />
        Reviews {reviews.length > 0 && <span className="text-muted-foreground text-sm font-normal">({reviews.length})</span>}
      </h3>

      {canReview && (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5 mb-6">
          <p className="text-sm text-foreground font-medium mb-3">Leave your review</p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
                <Star size={20} className={`transition-colors ${s <= (hover || rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your thoughts..." rows={3} className="bg-secondary border-border mb-3" />
          <Button type="submit" disabled={submitting} size="sm">{submitting ? "Submitting..." : "Submit Review"}</Button>
        </motion.form>
      )}

      {hasReviewed && !canReview && (
        <p className="text-sm text-muted-foreground mb-4">You've already reviewed this book.</p>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review after purchasing!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-foreground text-sm font-medium">{r.profiles?.full_name || "Anonymous"}</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className={s <= r.rating ? "fill-primary text-primary" : "text-muted-foreground"} />
                  ))}
                </div>
              </div>
              {r.review_text && <p className="text-muted-foreground text-sm">{r.review_text}</p>}
              <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
