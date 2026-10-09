import Image from "next/image";
import Logo from "../../SVGs/Logo";
import Link from "next/link";
import {
  XLogo,
  GithubLogo,
  YoutubeLogo,
  InstagramLogo,
  DiscussionsLogo,
  ProductHuntLogo,
  YCombinatorLogo,
} from "./SocialPlatforms";
import GridTemplate from "./GridTemplate";

export default function Footer() {
  const Socials = [
    {
      label: "x",
      href: "https://x.com",
      Logo: <XLogo />,
    },
    {
      label: "github",
      href: "https://github.com",
      Logo: <GithubLogo />,
    },
    {
      label: "youtube",
      href: "https://youtube.com",
      Logo: <YoutubeLogo />,
    },
    {
      label: "instagram",
      href: "https://instagram.com",
      Logo: <InstagramLogo />,
    },

    {
      label: "discussions",
      href: "/dashboard",
      Logo: <DiscussionsLogo />,
    },
    {
      label: "product_hunt",
      href: "https://producthunt.com",
      Logo: <ProductHuntLogo />,
    },
    {
      label: "hacker_news",
      href: "https://news.ycombinator.com",
      Logo: <YCombinatorLogo />,
    },
  ];
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
        { key: "Cryptographic Certificates", href: "/verify/VY-DEMO-2026" },
        { key: "Interactive Quizzes", href: "/courses" },
        { key: "Student Dashboard", href: "/dashboard" },
        { key: "Instructor Studio", href: "/instructor/courses/new" },
        { key: "Live Mentorship", href: "#hero" },
        { key: "Verification Registry", href: "/verify/VY-DEMO-2026" },
      ],
    },
    {
      listTitle: "Resources",
      listItems: [
        { key: "Course Catalog", href: "/courses" },
        { key: "Student Portal", href: "/dashboard" },
        { key: "Credential Verification", href: "/verify/VY-DEMO-2026" },
        { key: "Curriculum API", href: "/dashboard" },
        { key: "Proctoring Guidelines", href: "/dashboard" },
        { key: "Academic Integrity", href: "/verify/VY-DEMO-2026" },
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
        { key: "Security & SOC2", href: "#" },
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
        <div className="flex gap-3 mt-6">
          {[
            "/Footer/ISO 27001.svg",
            "/Footer/SOC2.svg",
            "/Footer/CCPA.svg",
            "/Footer/GDPR.svg",
            "/Footer/HIPAA.svg",
          ].map((eachLogo, i) => (
            <Image
              key={"security-logo-" + (i + 1)}
              src={eachLogo}
              alt={"security-logo-" + (i + 1)}
              height={48}
              width={48}
              className="h-12 w-fit opacity-80 hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
        <nav aria-label="socials" className="flex mt-6 items-center">
          {Socials.map((eachSocial) => (
            <Link
              key={eachSocial.label}
              className="hover:invert p-2"
              aria-label={eachSocial.label}
              href={eachSocial.href}
            >
              {eachSocial.Logo}
            </Link>
          ))}
        </nav>
        <p className="mt-2 max-w-[350px] text-base">
          Our mission is to empower high-caliber engineers and lifelong learners through verified, proctored education.
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
