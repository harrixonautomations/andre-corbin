import bookMockup from "@/assets/book-mockup.jpg";

export interface BookData {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  description: string;
  price: number;
  amazonUrl: string;
  coverImage: string;
  rating: number;
  pages: number;
}

const books: BookData[] = [
  {
    id: "lead-with-conviction",
    title: "Lead with Conviction",
    subtitle: "A Playbook for Founders Who Refuse to Settle",
    year: 2024,
    description:
      "A distillation of everything Andre has learned coaching hundreds of founders and executives. It's not theory—it's a battle-tested playbook for leaders who want to build extraordinary companies without sacrificing their health, relationships, or integrity.",
    price: 24.99,
    amazonUrl: "#",
    coverImage: bookMockup,
    rating: 4.9,
    pages: 312,
  },
  {
    id: "the-founders-mindset",
    title: "The Founder's Mindset",
    subtitle: "Mental Models for Scaling Beyond Yourself",
    year: 2022,
    description:
      "Explores the psychological shifts every founder must make to transition from operator to visionary. Packed with frameworks for decision-making under uncertainty, managing energy, and building resilient teams.",
    price: 19.99,
    amazonUrl: "#",
    coverImage: bookMockup,
    rating: 4.8,
    pages: 274,
  },
  {
    id: "beyond-the-title",
    title: "Beyond the Title",
    subtitle: "What Executive Presence Really Means",
    year: 2020,
    description:
      "Strips away the clichés of leadership and reveals what truly separates transformative executives from the rest. A candid, no-nonsense guide to commanding respect, driving culture, and leading with authenticity.",
    price: 17.99,
    amazonUrl: "#",
    coverImage: bookMockup,
    rating: 4.7,
    pages: 248,
  },
];

export default books;
