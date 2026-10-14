import Logo from "../../SVGs/Logo";
import Link from "next/link";
import GridTemplate from "./GridTemplate";

export default function Footer() {
  const data = [
    {
      listTitle: "Curricula",
      listItems: [
        { key: "Computer Science", href: "/courses" },
        { key: "Cloud Architecture", href: "/courses" },
        { key: "Machine Learning & AI", href: "/courses" },
        { key: "Cybersecurity Labs", href: "/courses" },
        { key: "System Design", href: "/courses" },
        { key: "Full-Stack Web Dev", href: "/courses" },
        { key: "Data Structures & Algos", href: "/courses" },
        { key: "DevOps & Containers", href: "/courses" },
      ],
    },
    {
      listTitle: "Platform",
      listItems: [
        { key: "Video Watch Auditing", href: "/courses" },
        { key: "Anti-Cheat Proctoring", href: "/dashboard" },
        { key: "Cryptographic Certificates", href: "/courses" },
        { key: "Interactive Quizzes", href: "/courses" },
        { key: "Student Dashboard", href: "/dashboard" },
        { key: "Instructor Studio", href: "/instructor/courses/new" },
        { key: "Live Mentorship", href: "#hero" },
        { key: "Verification Registry", href: "/courses" },
      ],
    },
    {
      listTitle: "Resources",
      listItems: [
        { key: "Course Catalog", href: "/courses" },
        { key: "Student Portal", href: "/dashboard" },
        { key: "Credential Verification", href: "/courses" },
        { key: "Curriculum API", href: "/dashboard" },
        { key: "Proctoring Guidelines", href: "/dashboard" },
        { key: "Academic Integrity", href: "/dashboard" },
        { key: "Developer Docs", href: "/dashboard" },
      ],
    },
    {
      listTitle: "Company",
      listItems: [
        { key: "About Veyro", href: "/" },
        { key: "Sign In", href: "/login" },
        { key: "Get Started", href: "/register" },
        { key: "Support", href: "mailto:support@veyro.com" },
        { key: "Privacy Policy", href: "#" },
        { key: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <section
      id="footer"
      className="mx-auto max-w-screen-xl flex max-md:flex-col w-full px-4 pl-8 gap-6 md:justify-between py-14 md:py-20 font-matter text-[14px] mt-12"
    >
      <div className="max-lg:mb-12">
        <Link href="/" className="flex items-center pb-2 lg:pb-7 gap-1">
          <Logo />
          <span className="-mt-1.5 font-cal">®</span>
        </Link>
        <div className=" text-[#111111] max-w-[250px]">
          Veyro™ Distance Learning & Education Platform. All rights reserved.
        </div>
        <p className="mt-5 max-w-[350px] text-sm text-[#555555] leading-relaxed">
          Our mission is to empower high-caliber engineers and lifelong learners through structured, verified technical education.
        </p>
        <p className="mt-4">
          Need Help?&nbsp;
          <Link
            href="mailto:support@veyro.com"
            className="text-[#0561A2] underline"
          >
            support@veyro.com
          </Link>
          &nbsp;or visit the&nbsp;
          <Link
            href="/dashboard"
            className="text-[#0561A2] underline"
          >
            student dashboard
          </Link>
          .
        </p>
      </div>
      <div className="max-md:w-full grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {data.map((eachData) => (
          <GridTemplate key={eachData.listTitle} {...eachData} />
        ))}
      </div>
    </section>
  );
}
