// Single source of truth for VAULT OS information architecture.
// Four top-level buckets. Used by Navbar, homepage, evaluation router, and Eddie AI context.

import type { LucideIcon } from "lucide-react";
import { Gauge, Dumbbell, Eye, Building2 } from "lucide-react";

export type BucketKey = "assess" | "train" | "get_seen" | "scale";

export type IALink = { name: string; href: string; description?: string };

export type IABucket = {
  key: BucketKey;
  name: string;        // Top-nav label
  tagline: string;     // One-liner shown in mega menu / homepage card
  icon: LucideIcon;
  primary: IALink;     // The page we want most users to land on
  links: IALink[];     // All pages in this bucket
};

export const IA_BUCKETS: IABucket[] = [
  {
    key: "assess",
    name: "Assess",
    tagline: "Find out where your athlete actually stands.",
    icon: Gauge,
    primary: { name: "Free Evaluation", href: "/evaluate", description: "AI-powered rating in under 2 minutes." },
    links: [
      { name: "Free Evaluation", href: "/evaluate", description: "Development score, velocity potential, recommended path." },
      { name: "Prospect Grader", href: "/recruiting/prospect-grader", description: "20–80 scouting grades and OFP." },
      { name: "Velocity Baseline", href: "/velocity-baseline", description: "Lock in your starting metrics." },
      { name: "Velo-Check Analysis", href: "/products/velo-check", description: "Pro mechanical breakdown — $97." },
    ],
  },
  {
    key: "train",
    name: "Train",
    tagline: "Pillar-based programs and bundles, matched to your stage.",
    icon: Dumbbell,
    primary: { name: "All Programs", href: "/products", description: "Browse every VAULT system and bundle." },
    links: [
      { name: "All Programs", href: "/products" },
      { name: "12-Week Velocity System", href: "/products/velocity-system" },
      { name: "Velocity Accelerator", href: "/products/velocity-accelerator" },
      { name: "Longevity System", href: "/products/longevity" },
      { name: "Transfer System", href: "/products/transfer" },
      { name: "Remote Training", href: "/products/remote-training" },
      { name: "Bundles", href: "/products/bundles" },
      { name: "Book a Lesson", href: "/book-session", description: "1-on-1 with a Vault coach." },
      { name: "Lesson Packages", href: "/lesson-packages" },
      { name: "Group Sessions", href: "/group-sessions" },
    ],
  },
  {
    key: "get_seen",
    name: "Get Seen",
    tagline: "Recruiting audit, tryouts, camps and showcases.",
    icon: Eye,
    primary: { name: "Recruiting Hub", href: "/recruiting", description: "Profile, audit, checklist, college contacts." },
    links: [
      { name: "Recruiting Hub", href: "/recruiting" },
      { name: "Recruitment Audit", href: "/products/recruitment", description: "0–100 profile score and OFP review." },
      { name: "Showcase Prep", href: "/products/showcase-prep" },
      { name: "Tryouts", href: "/tryouts", description: "Free open tryouts." },
      { name: "Summer Camps", href: "/camps", description: "22M Elite development camps." },
      { name: "Wall of Wins", href: "/wall-of-wins", description: "Athletes who got there." },
    ],
  },
  {
    key: "scale",
    name: "Scale",
    tagline: "For coaches and organizations building developmental programs.",
    icon: Building2,
    primary: { name: "Scale Hub", href: "/scale", description: "Coach network, certification, and org licensing." },
    links: [
      { name: "Coach Network (Marketplace)", href: "/marketplace" },
      { name: "Find a Coach", href: "/find-coach" },
      { name: "Become a Coach", href: "/coach-register" },
      { name: "Coach Certification", href: "/products/certified-coach", description: "VAULT-Verified credential." },
      { name: "Team Licenses", href: "/products/teams" },
      { name: "Org Licensing", href: "/products/org-licensing" },
      { name: "Org Starter Pack", href: "/products/org-starter-pack" },
    ],
  },
];

// Map a pathname → bucket key. Used by Eddie AI for page-aware system prompts.
export function bucketForPath(pathname: string): BucketKey | null {
  const p = pathname.toLowerCase();
  if (p.startsWith("/evaluate") || p.startsWith("/free-evaluation") || p.startsWith("/velocity-baseline") || p.includes("prospect-grader") || p === "/products/velo-check") return "assess";
  if (p.startsWith("/recruiting") || p.startsWith("/tryouts") || p.startsWith("/camps") || p === "/products/recruitment" || p === "/products/showcase-prep" || p.startsWith("/wins")) return "get_seen";
  if (p === "/scale" || p.startsWith("/marketplace") || p.startsWith("/find-coach") || p.startsWith("/coach-register") || p === "/products/certified-coach" || p === "/products/teams" || p === "/products/org-licensing" || p === "/products/org-starter-pack") return "scale";
  if (p.startsWith("/products") || p.startsWith("/book-session") || p.startsWith("/lesson-packages") || p.startsWith("/group-sessions") || p.startsWith("/courses") || p.startsWith("/my-programs") || p.startsWith("/remote-")) return "train";
  return null;
}

// Short label per page that we feed to Eddie so he knows what the user is looking at.
export function pageContextLabel(pathname: string): string {
  const exact: Record<string, string> = {
    "/": "homepage",
    "/evaluate": "free evaluation form",
    "/free-evaluation": "free evaluation form",
    "/velocity-baseline": "velocity baseline assessment",
    "/recruiting/prospect-grader": "prospect grader (20-80 scouting grades)",
    "/products/velo-check": "Velo-Check product page",
    "/recruiting": "recruiting hub",
    "/products/recruitment": "Recruitment Audit product page",
    "/products/showcase-prep": "Showcase Prep product page",
    "/tryouts": "open tryouts list",
    "/camps": "summer camps registration",
    "/scale": "Scale Hub (coaches & orgs)",
    "/marketplace": "coach marketplace",
    "/find-coach": "find a coach",
    "/coach-register": "coach onboarding",
    "/products/certified-coach": "Coach Certification product page",
    "/products/teams": "Team Licenses product page",
    "/products/org-licensing": "Org Licensing product page",
    "/products/org-starter-pack": "Org Starter Pack product page",
    "/products/bundles": "product bundles overview",
    "/products": "all programs catalog",
    "/products/velocity-system": "12-Week Velocity System product page",
    "/products/velocity-accelerator": "Velocity Accelerator product page",
    "/products/longevity": "Longevity System product page",
    "/products/transfer": "Transfer System product page",
    "/products/remote-training": "Remote Training product page",
    "/book-session": "book a 1-on-1 lesson",
    "/lesson-packages": "lesson packages",
    "/group-sessions": "group sessions",
  };
  return exact[pathname.toLowerCase()] ?? pathname;
}
