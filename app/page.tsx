"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, HardDrive, Dam as Ram } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2F4F4F]/15 to-[#0066CC]/10">
      <main className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-20"
      >
      <div className="inline-block mb-3">
      <motion.div
        className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0066CC]/20 to-[#2F4F4F]/20 border border-[#0066CC]/30 text-[#0066CC] font-semibold text-sm shadow-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
      >
        Intelligent System Management
      </motion.div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0066CC] to-[#2F4F4F] drop-shadow-sm">
      AI Deadlock Resolver
      </h1>
      <p className="text-lg md:text-xl text-[#2F4F4F]/80 max-w-2xl mx-auto mb-10">
      Harness the power of AI to detect and resolve operating system deadlocks. 
      Visualize resource allocation and optimize system performance in real-time.
      </p>
      <Link href="/dashboard">
      <Button size="lg" className="bg-gradient-to-r from-[#0066CC] to-[#0066CC]/90 hover:from-[#0066CC]/90 hover:to-[#0066CC] text-white group px-8 py-6 rounded-xl shadow-lg shadow-[#0066CC]/30 transition-all duration-300 border border-[#0066CC]/10">
        Get Started
        <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
      </Button>
      </Link>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-24">
      {[
      {
        icon: <Cpu className="h-12 w-12" />,
        title: "CPU Monitoring",
        description: "Real-time CPU usage tracking and analysis"
      },
      {
        icon: <Ram className="h-12 w-12" />,
        title: "RAM Analysis",
        description: "Monitor memory allocation and consumption"
      },
      {
        icon: <HardDrive className="h-12 w-12" />,
        title: "Resource Tracking",
        description: "Visualize resource allocation graphs"
      }
      ].map((feature, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
        whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 102, 204, 0.25)" }}
        className="p-8 rounded-2xl bg-white/95 shadow-xl border-t-4 border-[#0066CC] hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
      >
        <div className="mb-5 p-4 bg-gradient-to-br from-[#0066CC]/15 to-[#2F4F4F]/10 rounded-xl inline-block text-[#0066CC]">
        {feature.icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-[#2F4F4F]">{feature.title}</h3>
        <p className="text-[#2F4F4F]/80">{feature.description}</p>
      </motion.div>
      ))}
      </div>

      {/* Process Illustration */}
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative h-96 md:h-[32rem] rounded-3xl overflow-hidden bg-gradient-to-br from-[#2F4F4F]/10 to-[#0066CC]/15 shadow-2xl border border-[#0066CC]/20 mb-12"
      >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>
      
      {/* Process Visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[90%] h-[85%] relative">
        {/* Animated elements */}
        <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-[#0066CC]/30 to-[#0066CC]/10 backdrop-blur-md border border-[#0066CC]/40 z-10 flex items-center justify-center"
        animate={{
          boxShadow: ['0 0 20px rgba(0, 102, 204, 0.3)', '0 0 40px rgba(0, 102, 204, 0.5)', '0 0 20px rgba(0, 102, 204, 0.3)'],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        >
        <div className="text-[#0066CC] font-bold text-lg">AI Core</div>
        </motion.div>
        
        {/* Orbiting elements */}
        {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#2F4F4F]/30 to-[#0066CC]/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
          initial={{ 
          x: 0, 
          y: 0,
          scale: 0.8 + (i * 0.05),
          }}
          animate={{
          x: Math.cos(2 * Math.PI * (i / 5)) * (150 + i * 20),
          y: Math.sin(2 * Math.PI * (i / 5)) * (150 + i * 10),
          scale: [0.8 + (i * 0.05), 0.9 + (i * 0.05), 0.8 + (i * 0.05)],
          boxShadow: ['0 0 10px rgba(0, 102, 204, 0.2)', '0 0 20px rgba(0, 102, 204, 0.4)', '0 0 10px rgba(0, 102, 204, 0.2)'],
          }}
          transition={{
          duration: 8 - i,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeInOut"
          }}
        >
          <div className="text-[#2F4F4F] font-medium text-xs">Process {i+1}</div>
        </motion.div>
        ))}
        
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full z-0">
        {[...Array(5)].map((_, i) => (
          <motion.path
          key={i}
          d={`M0,0 L${Math.cos(2 * Math.PI * (i / 5)) * 150},${Math.sin(2 * Math.PI * (i / 5)) * 150}`}
          stroke={i % 2 === 0 ? "#0066CC" : "#2F4F4F"}
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2, delay: i * 0.3 }}
          style={{ transformOrigin: 'center', translate: '50% 50%' }}
          />
        ))}
        </svg>
        
        {/* Pulse effects */}
        <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0066CC]/10"
        animate={{
          scale: [1, 2.5, 1],
          opacity: [0.1, 0, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        style={{ width: '100px', height: '100px' }}
        />
      </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        className="px-8 py-5 bg-white/90 backdrop-blur-md rounded-xl border border-[#0066CC]/30 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-[#2F4F4F] mb-2">Interactive Process Visualization</h3>
        <p className="text-[#0066CC] font-medium">Watch how AI resolves complex deadlocks in real-time</p>
        <div className="mt-3 flex space-x-2">
        {[...Array(4)].map((_, i) => (
          <motion.div 
          key={i}
          className="h-2 rounded-full bg-[#0066CC]"
          style={{ width: `${15 + i * 5}px` }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
        </div>
      </motion.div>
      </div>
      </motion.div>
      </main>
    </div>
  );
}