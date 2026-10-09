import DropDownTemplate from "@/components/layout/NavBar/DropDownTemplate";

const Developer = () => {
  const data = [
    {
      href: "/dashboard",
      icon: "📄",
      title: "Developer Documentation",
      description: "Architecture and guides for the Veyro Distance Learning platform",
    },
    {
      href: "/dashboard",
      icon: "🔒",
      title: "Anti-Cheat Engine",
      description: "Server-authoritative proctoring, focus loss detection & integrity checks",
    },
    {
      href: "/verify/VY-DEMO-2026",
      icon: "📜",
      title: "Certificate Engine",
      description:
        "Cryptographic SHA-256 tamper-proof PDF generation & public verification",
    },
    {
      href: "/courses",
      icon: "🚀",
      title: "Curriculum REST API",
      description: "APIs for lesson ingestion, video position sync & quiz submissions",
    },
  ];

  return <DropDownTemplate data={data} key="Developer" />;
};

export default Developer;

