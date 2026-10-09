import DropDownTemplate from "@/components/layout/NavBar/DropDownTemplate";

const Resources = () => {
  const data = [
    {
      title: "Course Catalog",
      description: "Browse accredited technical curriculums",
      href: "/courses",
      icon: "📚",
    },
    {
      title: "Credential Verification",
      description: "Verify authentic certificates in real-time",
      href: "/verify/VY-DEMO-2026",
      icon: "📜",
    },
    {
      title: "Student Dashboard",
      description: "Track watch auditing, courses & grades",
      href: "/dashboard",
      icon: "📊",
    },
    {
      title: "Instructor Studio",
      description: "Author courses, upload lessons & manage quizzes",
      href: "/instructor/courses/new",
      icon: "🎓",
    },
    {
      title: "Anti-Cheat Guidelines",
      description: "Integrity thresholds & proctored quiz rules",
      href: "/dashboard",
      icon: "🔒",
    },
    {
      title: "Video Watch Auditing",
      description: "90% watch threshold enforcement details",
      href: "/courses",
      icon: "🎥",
    },
    {
      title: "Interactive Quizzes",
      description: "Time limits, attempt tracking & instant grading",
      href: "/courses",
      icon: "⚡",
    },
    {
      title: "Live Mentorship",
      description: "Schedule 1-on-1 code reviews with instructors",
      href: "#hero",
      icon: "💬",
    },
    {
      title: "Cohort Management",
      description: "Institutional tracking for bootcamp squads",
      href: "/register",
      icon: "👥",
    },
    {
      title: "Developer REST API",
      description: "Integrate Veyro LMS into external platforms",
      href: "/dashboard",
      icon: "🧩",
    },
    {
      title: "Curriculum Ingestion",
      description: "Markdown & video module structuring",
      href: "/instructor/courses/new",
      icon: "📝",
    },
    {
      title: "Academic Integrity",
      description: "Cryptographic SHA-256 certificate hashing",
      href: "/verify/VY-DEMO-2026",
      icon: "🛡️",
    },
  ];

  return <DropDownTemplate data={data} key="Resources" />;
};

export default Resources;

