"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Duration from "@/components/SVGs/Hero/Duration";
import Location from "@/components/SVGs/Hero/Location";
import TimeZone from "@/components/SVGs/Hero/TimeZone";
import CalVideoLogo from "@/components/SVGs/Hero/CalVideo";
import GMeetLogo from "@/components/SVGs/Hero/GMeet";
import ZoomLogo from "@/components/SVGs/Hero/Zoom";
import Calender from "./Calender";

const HeroSectionCard = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const controlInterval: ReturnType<typeof setInterval> = setInterval(() => {
      setActive((prev) => (prev + 1) % 8);
    }, 4000);
    return () => {
      clearInterval(controlInterval);
    };
  });

  const data = [
    {
      name: "Sarah Miller",
      services: "Full-Stack System Design",
      description:
        "Architecture breakdown, microservices patterns, and scalable database sharding.",
      duration: "60 mins",
      timeZone: "America/Chicago",
      via: "Veyro Classroom",
    },
    {
      name: "John Smith",
      services: "Cloud & DevOps Lab",
      description:
        "Hands-on container orchestration, Kubernetes deployment, and automated CI/CD pipelines.",
      duration: "45 mins",
      location: "Virtual Lab Cluster #4",
      timeZone: "America/New York",
    },
    {
      name: "Oliver Wilson",
      services: "Distributed Systems Mentorship",
      description:
        "Deep dive into consensus algorithms, Paxos, Raft, and event-driven backends.",
      duration: "90 mins",
      location: "Veyro Live Sandbox",
      timeZone: "Australia/Sydney",
    },
    {
      name: "Charlotte Johnson",
      services: "Anti-Cheat Quiz Preparation",
      description:
        "Live review of proctored assessment guidelines, integrity thresholds, and core concepts.",
      duration: "30 mins",
      timeZone: "America/Los Angeles",
      via: "Veyro Classroom",
    },
    {
      name: "Isabella Moore",
      services: "UI/UX & Frontend Engineering",
      description:
        "Component composition, accessibility audit, performance budgets, and framer animations.",
      duration: "60 mins",
      location: "Studio Lab Alpha",
      timeZone: "Australia/Sydney",
    },
    {
      name: "Sophia Davis",
      services: "Machine Learning & PyTorch",
      description:
        "Model training diagnostics, loss optimization, and neural network fine-tuning.",
      duration: "45 mins",
      timeZone: "Europe/Paris",
      via: "Google Meet",
    },
    {
      name: "Ethan Taylor",
      services: "Cybersecurity & Cryptography",
      description:
        "Exploit defense, TLS handshake verification, and SHA-256 certificate validation.",
      duration: "45 mins",
      timeZone: "Asia/Singapore",
      via: "Veyro Classroom",
    },
    {
      name: "Emma Brown",
      services: "Capstone Project Defense",
      description:
        "Final milestone evaluation for accredited graduation certificate issuance.",
      duration: "60 mins",
      via: "Veyro Classroom",
      timeZone: "Europe/London",
    },
  ];

  const parentVariants = {
    initial: { opacity: 0, y: "10px" },
    animate: {
      opacity: 1,
      y: "0px",
      transition: {
        staggerChildren: 0.3,
      },
    },
  };
  const childVariants = {
    initial: { opacity: 0, y: "10px" },
    animate: { opacity: 1, y: "0px" },
  };
  return (
    <motion.div
      // style={{ transformOrigin: "75% 50%" }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ease: "easeInOut" }}
      aria-hidden
      className="bg-[#fafafa] p-1 border border-gray rounded-xl font-inter lg:w-[140%] m-auto max-lg:[transform:translateY(12%)] w-fit origin-[75%_50%]"
    >
      <div className="border border-gray bg-white rounded-xl grid md:grid-cols-[auto_1fr] max-md:grid-rows-[auto_1fr] overflow-hidden">
        <div className="space-y-5 px-5 py-6 mx-auto">
          <motion.ul
            key={active + "profile"}
            variants={parentVariants}
            initial="initial"
            animate="animate"
            className=" space-y-1"
          >
            <motion.li variants={childVariants}>
              <Image
                src={`/HeroSectionImages/${data[active].name}.png`}
                width={24}
                height={24}
                alt={data[active].name}
                className="rounded-full size-6"
                style={{ objectFit: "cover" }}
              />
            </motion.li>
            <motion.li
              variants={childVariants}
              className="text-[#6b7280] text-[13px] flex items-center gap-2"
            >
              <span>{data[active].name}</span>
              <span>•</span>
              <span className="text-[#111111] font-medium">Curriculum Lead</span>
            </motion.li>
            <motion.li
              variants={childVariants}
              className="text-[20px] text-[#101010] font-cal"
            >
              {data[active].services}
            </motion.li>
            <motion.li
              variants={childVariants}
              className="flex gap-2 items-center pt-0.5"
            >
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#059669] font-bold">
                ✓ 90% Watch Audited
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#60C5F1]/15 text-[#0369a1] font-bold">
                🔒 Anti-Cheat
              </span>
            </motion.li>
            <motion.li
              variants={childVariants}
              className=" text-[14px] text-[#374151] text-balance max-w-sm md:max-w-[250px]"
            >
              {data[active].description}
            </motion.li>
          </motion.ul>
          <motion.div
            key={active + "info"}
            initial={{ opacity: 0, y: "10px" }}
            animate={{ opacity: 1, y: "0px" }}
            className="space-y-2 text-[#374151] text-[14px] [&>div]:flex [&>div]:gap-2 [&>div]:items-center [&>div]:flex-nowrap "
          >
            {data[active].duration && (
              <div>
                <Duration className="w-5 h-6" />
                {data[active].duration}
              </div>
            )}
            {data[active].via && (
              <div>
                {data[active].via === "Veyro Classroom" ? (
                  <CalVideoLogo className="w-5 h-6" />
                ) : data[active].via === "Google Meet" ? (
                  <GMeetLogo className="w-5 h-6" />
                ) : (
                  <ZoomLogo className="w-5 h-6" />
                )}
                {data[active].via}
              </div>
            )}
            {data[active].location && (
              <div>
                <Location className="w-5 h-6" />
                {data[active].location}
              </div>
            )}
            {data[active].timeZone && (
              <div>
                <TimeZone className="w-5 h-6" />
                {data[active].timeZone}
              </div>
            )}
          </motion.div>
        </div>
        <Calender active={active} />
      </div>
    </motion.div>
  );
};

export default HeroSectionCard;
