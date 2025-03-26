"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, Cpu, HardDrive, Dam as Ram } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#0066CC]/5 to-[#2F4F4F]/10 p-8 relative overflow-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#0066CC]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#2F4F4F]/15 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#0066CC]/10 rounded-full blur-3xl" style={{animationDuration: '15s'}}></div>
      
      {/* Decorative tech pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNNTkuOTYgMEw2MCA2MGgtLjA0TDAgNjBWMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNjZDQyIgc3Ryb2tlLXdpZHRoPSIuNSIvPjwvc3ZnPg==')]"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-6xl font-bold mb-3 text-[#2F4F4F] drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-[#2F4F4F] to-[#2F4F4F]/80">About</h1>
          <h2 className="text-3xl font-medium mb-2 text-[#0066CC] bg-clip-text text-transparent bg-gradient-to-r from-[#0066CC] to-[#0066CC]/80">AI Deadlock Resolver</h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-[#0066CC] to-[#2F4F4F]"></div>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="p-8 mb-12 bg-white/95 backdrop-blur-md border-0 shadow-[0_10px_50px_rgba(0,102,204,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/10 via-transparent to-[#2F4F4F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#0066CC] to-[#2F4F4F]"></div>
            <div className="flex items-start gap-6">
              <div className="p-3 bg-[#0066CC]/10 rounded-xl shadow-inner flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-[#0066CC]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4 text-[#2F4F4F]">Understanding Deadlocks</h2>
                <p className="text-[#2F4F4F]/80 mb-4 leading-relaxed text-lg">
                  A deadlock occurs when two or more processes are unable to proceed because each is waiting for resources held by another process. Our AI-powered system helps detect and resolve these situations before they impact system performance.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-[#0066CC]">Key Features</h2>
          <div className="h-0.5 flex-grow bg-gradient-to-r from-[#0066CC] to-transparent"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: <Cpu className="h-8 w-8" />,
              title: "Resource Allocation Graph",
              description: "Visualize the relationships between processes and resources to identify potential deadlock situations."
            },
            {
              icon: <Ram className="h-8 w-8" />,
              title: "RAM Usage Monitoring",
              description: "Track memory allocation and usage patterns in real-time to optimize system performance."
            },
            {
              icon: <HardDrive className="h-8 w-8" />,
              title: "Storage Analysis",
              description: "Monitor disk usage and I/O operations to prevent resource conflicts."
            },
            {
              icon: <Cpu className="h-8 w-8" />,
              title: "CPU Monitoring",
              description: "Real-time tracking of processor utilization and process scheduling."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + index * 0.15 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <Card className="p-6 h-full bg-gradient-to-br from-white to-[#0066CC]/5 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#0066CC]/50 to-[#2F4F4F]/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-gradient-to-br from-[#0066CC]/20 to-[#2F4F4F]/10 rounded-lg shadow-inner">
                    <div className="text-[#0066CC]">{feature.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-[#2F4F4F]">{feature.title}</h3>
                    <p className="text-[#2F4F4F]/80 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0066CC]/70 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}