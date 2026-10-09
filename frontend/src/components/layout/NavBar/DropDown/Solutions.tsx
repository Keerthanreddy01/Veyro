import DropDownTemplate from "../DropDownTemplate";

const Solutions = () => {
  const data = [
    [
      {
        href: "/courses",
        title: "For Students",
        description: "Self-paced video modules, labs & verified credentials",
        icon: "🎓",
      },
      {
        href: "/instructor/courses/new",
        title: "For Instructors",
        description: "Author curricula, upload lessons & grade cohorts",
        icon: "🧑‍🏫",
      },
      {
        href: "/register",
        title: "For Universities",
        description: "Institutional progress tracking & proctored exams",
        icon: "🏛️",
      },
      {
        href: "/dashboard",
        title: "For Developers",
        description: "Full REST APIs, Webhooks & Anti-Cheat engine",
        icon: "💻",
      },
    ],
    [
      {
        href: "/courses",
        title: "Computer Science",
        icon: "⚡",
      },
      {
        href: "/courses",
        title: "Cloud & DevOps",
        icon: "☁️",
      },
      {
        href: "/courses",
        title: "Cybersecurity Labs",
        icon: "🛡️",
      },
      {
        href: "/courses",
        title: "AI & Machine Learning",
        icon: "🤖",
      },
      {
        href: "/courses",
        title: "Full-Stack Web Dev",
        icon: "🌐",
      },
      {
        href: "/verify/VY-DEMO-2026",
        title: "Tamper-Proof Certificates",
        icon: "📜",
      },
      {
        href: "/dashboard",
        title: "Anti-Cheat Assessments",
        icon: "🔒",
      },
      {
        href: "/courses",
        title: "Video Watch Auditing",
        icon: "🎥",
      },
    ],
  ];

  return (
    <div className="grid grid-cols-2 grid-rows-[auto-auto]">
      <div className="[text-indent:16px] text-sm opacity-80">by audience</div>
      <div className="[text-indent:16px] text-sm opacity-80">by domain & tools</div>
      {data.map((eachData, i) => (
        <DropDownTemplate data={eachData} key={"Solutions-" + i} />
      ))}
    </div>
  );
};

export default Solutions;

