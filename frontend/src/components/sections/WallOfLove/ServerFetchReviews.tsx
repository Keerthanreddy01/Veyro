import React, { useState } from "react";
import ReviewsGrid from "./ReviewsGrid";

interface Integrations {
  product_hunt?: {
    username: string;
  };
  twitter?: {
    username: string;
  };
}

interface Customer {
  id: string;
  name: string;
  avatar: string;
  tagline: string | null;
  integrations: Integrations;
  url: string | null;
}

interface ReviewType {
  customer: Customer;
  integration: string | undefined;
  url: string | undefined;
  html: string;
}

const fallbackReviews: ReviewType[] = [
  {
    customer: {
      id: "rev-1",
      name: "Tosin K. 🧢",
      avatar: "https://senja-io.s3.us-west-1.amazonaws.com/public/media/DqCahJV3OKRISawjOaMiVrtG.jpeg",
      tagline: "Beta Graduate — Backend Engineering",
      url: "#",
      integrations: { twitter: { username: "tosink" } },
    },
    integration: "twitter",
    url: "#",
    html: "Veyro distance learning is the best educational platform I discovered this year. The 90% video watch verification solved our cohort procrastination problem instantly.",
  },
  {
    customer: {
      id: "rev-2",
      name: "Sarah Miller",
      avatar: "/HeroSectionImages/Sarah Miller.png",
      tagline: "Lead Instructor — Distributed Systems",
      url: "#",
      integrations: { twitter: { username: "sarahmiller" } },
    },
    integration: "twitter",
    url: "#",
    html: "Super smooth curriculum authoring. The proctored assessments detect tab switches flawlessly, giving our faculty true grading confidence.",
  },
  {
    customer: {
      id: "rev-3",
      name: "David Lin",
      avatar: "/testimonials/Aria Minaei.png",
      tagline: "Student — Cloud Architecture Track",
      url: "#",
      integrations: { twitter: { username: "davidlin" } },
    },
    integration: "twitter",
    url: "#",
    html: "Just completed the Cloud Architecture track on Veyro. The instant PDF certificate with verification hash made it effortless to verify my credential.",
  },
  {
    customer: {
      id: "rev-4",
      name: "Maya Patel",
      avatar: "/testimonials/Ant Wilson.png",
      tagline: "Learner — Full-Stack Specialization",
      url: "#",
      integrations: { twitter: { username: "mayapatel" } },
    },
    integration: "twitter",
    url: "#",
    html: "I finally finished the full-stack path. Gorgeous UI, rock-solid video streaming, and authentic student credential verification.",
  },
  {
    customer: {
      id: "rev-5",
      name: "James Vance",
      avatar: "/testimonials/Guillermo Rauch.png",
      tagline: "Systems Engineer & Beta Student",
      url: "#",
      integrations: { twitter: { username: "jamesvance" } },
    },
    integration: "twitter",
    url: "#",
    html: "Veyro created a new standard around being both academically rigorous and extraordinarily well designed.",
  },
  {
    customer: {
      id: "rev-6",
      name: "Dr. Kimberly Adams",
      avatar: "/testimonials/Kent C. Dodds.png",
      tagline: "Instructor — Cybersecurity Lab",
      url: "#",
      integrations: { twitter: { username: "kimberlyadams" } },
    },
    integration: "twitter",
    url: "#",
    html: "Seamless lesson progression, fast video loading, and instant assessment grading. An absolute delight to teach and learn on.",
  },
  {
    customer: {
      id: "rev-7",
      name: "Sophia Davis",
      avatar: "/HeroSectionImages/Sophia Davis.png",
      tagline: "ML Engineer & Fellow",
      url: "#",
      integrations: { twitter: { username: "sophiadavis" } },
    },
    integration: "twitter",
    url: "#",
    html: "The anti-cheat test environment on Veyro is the cleanest I've ever experienced. No invasive software required—just clean, browser-native proctoring.",
  },
  {
    customer: {
      id: "rev-8",
      name: "Ethan Taylor",
      avatar: "/HeroSectionImages/Ethan Taylor.png",
      tagline: "Security Researcher",
      url: "#",
      integrations: { twitter: { username: "ethantaylor" } },
    },
    integration: "twitter",
    url: "#",
    html: "Cryptographic SHA-256 certificate verification is such an underrated feature. Employers can verify credentials in milliseconds without contacting anyone.",
  },
  {
    customer: {
      id: "rev-9",
      name: "John Smith",
      avatar: "/HeroSectionImages/John Smith.png",
      tagline: "DevOps Architect",
      url: "#",
      integrations: { twitter: { username: "johnsmith" } },
    },
    integration: "twitter",
    url: "#",
    html: "Being able to book 1-on-1 office hours directly inside the course view makes Veyro feel like a real university campus.",
  },
  {
    customer: {
      id: "rev-10",
      name: "Emma Brown",
      avatar: "/HeroSectionImages/Emma Brown.png",
      tagline: "Graduate Student",
      url: "#",
      integrations: { twitter: { username: "emmabrown" } },
    },
    integration: "twitter",
    url: "#",
    html: "Veyro LMS helped me finish my full-stack specialization. The milestone tracking keeps you motivated every single day.",
  },
];

const Reviews: React.FC = () => {
  const [reviewsList] = useState<ReviewType[]>(fallbackReviews);

  return <ReviewsGrid reviews={reviewsList} limit={10} />;
};

export default Reviews;

