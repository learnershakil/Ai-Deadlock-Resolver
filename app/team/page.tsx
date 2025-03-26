"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import Cutie from "@/public/cutie.png"; 
import Image from "next/image";

const team = [
  {
    name: "Gurbaksh Kaur",
    role: "NOOOB Leader",
    image: Cutie,
    bio: "Expert in distributed systems and AI algorithms",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Alex Rodriguez",
    role: "Senior OS Engineer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&fit=crop",
    bio: "Specializes in operating system optimization",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Dr. Emily Watson",
    role: "System Architect",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=400&fit=crop",
    bio: "Expert in distributed computing and system design",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  }
];

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC]/5 via-white to-[#2F4F4F]/10 p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-64 h-64 rounded-full bg-[#0066CC]/10 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#2F4F4F]/10 blur-3xl"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full border-8 border-[#0066CC]/20"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full border-8 border-[#2F4F4F]/20"></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl font-extrabold mb-3 text-center bg-gradient-to-r from-[#0066CC] to-[#2F4F4F] text-transparent bg-clip-text"
        >
          Meet Our Experts
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-xl text-center text-gray-600 max-w-2xl mx-auto mb-16"
        >
          The brilliant minds behind our innovation and success
        </motion.p>
        
        <div className="grid md:grid-cols-3 gap-10">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="h-full"
            >
              <Card className="overflow-hidden rounded-xl h-full border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-lg">
                <div className="relative h-72 w-full group">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0066CC] to-[#2F4F4F]/80 z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <motion.div 
                    className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-white font-medium px-6 text-center">{member.bio}</p>
                  </motion.div>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0066CC] to-[#2F4F4F]"></div>
                </div>
                <div className="p-6 relative">
                  <div className="absolute -top-6 right-6 w-12 h-12 rounded-full bg-[#0066CC] shadow-lg flex items-center justify-center text-white">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-[#2F4F4F]">{member.name}</h3>
                  <p className="text-[#0066CC] font-semibold mb-4 inline-block px-3 py-1 bg-[#0066CC]/10 rounded-full">{member.role}</p>
                  
                  <div className="flex gap-4 mt-6">
                    {Object.entries(member.social).map(([platform, url], i) => (
                      <motion.a 
                        key={platform}
                        href={url} 
                        whileHover={{ y: -5, scale: 1.2 }}
                        className="text-[#2F4F4F] hover:text-[#0066CC] transition-all"
                      >
                        {platform === 'twitter' && <Twitter className="h-5 w-5" />}
                        {platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                        {platform === 'github' && <Github className="h-5 w-5" />}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}