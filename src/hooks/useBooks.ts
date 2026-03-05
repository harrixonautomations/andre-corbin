import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookWithRating {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  amazon_url: string;
  cover_image_url: string | null;
  page_count: number;
  created_at: string;
  avgRating: number;
  reviewCount: number;
  discount_percent: number;
  discount_active: boolean;
  discount_start: string | null;
  discount_end: string | null;
  effectivePrice: number;
  isDiscounted: boolean;
}

const isDiscountActive = (b: { discount_active: boolean; discount_percent: number; discount_start: string | null; discount_end: string | null }) => {
  if (!b.discount_active || b.discount_percent <= 0) return false;
  const now = new Date();
  if (b.discount_start && new Date(b.discount_start) > now) return false;
  if (b.discount_end && new Date(b.discount_end) < now) return false;
  return true;
};

export const useBooks = () => {
  return useQuery({
    queryKey: ["books"],
    queryFn: async (): Promise<BookWithRating[]> => {
      const { data: books, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!books || books.length === 0) return [];

      const { data: reviews } = await supabase.from("reviews").select("book_id, rating");
      const ratingMap: Record<string, { sum: number; count: number }> = {};
      (reviews || []).forEach((r) => {
        if (!r.book_id) return;
        if (!ratingMap[r.book_id]) ratingMap[r.book_id] = { sum: 0, count: 0 };
        ratingMap[r.book_id].sum += r.rating;
        ratingMap[r.book_id].count++;
      });

      return books.map((b) => {
        const discounted = isDiscountActive(b);
        return {
          ...b,
          avgRating: ratingMap[b.id] ? Math.round((ratingMap[b.id].sum / ratingMap[b.id].count) * 10) / 10 : 0,
          reviewCount: ratingMap[b.id]?.count || 0,
          isDiscounted: discounted,
          effectivePrice: discounted ? b.price * (1 - b.discount_percent / 100) : b.price,
        };
      });
    },
  });
};

export const useBook = (bookId: string | undefined) => {
  return useQuery({
    queryKey: ["book", bookId],
    enabled: !!bookId,
    queryFn: async (): Promise<BookWithRating | null> => {
      if (!bookId) return null;
      const { data: book, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .maybeSingle();
      if (error) throw error;
      if (!book) return null;

      const { data: reviews } = await supabase.from("reviews").select("rating").eq("book_id", bookId);
      const count = reviews?.length || 0;
      const sum = (reviews || []).reduce((a, r) => a + r.rating, 0);
      const discounted = isDiscountActive(book);

      return {
        ...book,
        avgRating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
        reviewCount: count,
        isDiscounted: discounted,
        effectivePrice: discounted ? book.price * (1 - book.discount_percent / 100) : book.price,
      };
    },
  });
};
