"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node,
  Position,
  MarkerType
} from 'react-flow-renderer';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useState, useEffect, useMemo } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Plus, X, Info, Activity, Cpu, HardDrive, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

// Simulated data
const generateRandomData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    time: i,
    cpu: Math.floor(Math.random() * 100),
    ram: Math.floor(Math.random() * 100),
    storage: Math.floor(Math.random() * 100),
  }));
};

interface Process {
  id: string;
  resources: string[];
  status: "Running" | "Waiting" | "Blocked";
}

const processNodeStyle = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #555',
  width: 150,
  fontSize: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const resourceNodeStyle = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #555',
  width: 100,
  fontSize: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

export default function Dashboard() {
  const [data, setData] = useState(generateRandomData(10));
  const [hasDeadlock, setHasDeadlock] = useState(false);
  const [deadlockCycle, setDeadlockCycle] = useState<string[]>([]);
  const [processes, setProcesses] = useState<Process[]>([
    { id: "P1", resources: ["R1", "R2"], status: "Running" },
    { id: "P2", resources: ["R2", "R3"], status: "Waiting" },
    { id: "P3", resources: ["R3", "R4"], status: "Running" },
    { id: "P4", resources: ["R1", "R4"], status: "Blocked" },
  ]);
  const [newProcess, setNewProcess] = useState<Process>({
    id: "",
    resources: [],
    status: "Running"
  });
  const [newResource, setNewResource] = useState("");
  const [simulationSpeed, setSimulationSpeed] = useState(2000);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("allocation");
  
  // Gemini API integration states
  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiSuggestions, setGeminiSuggestions] = useState<string[]>([]);

  // Generate resource mapping (which process holds which resource)
  const resourceAllocation = useMemo(() => {
    const allocation: Record<string, string[]> = {};
    
    processes.forEach(process => {
      process.resources.forEach(resource => {
        if (!allocation[resource]) {
          allocation[resource] = [];
        }
        allocation[resource].push(process.id);
      });
    });
    
    return allocation;
  }, [processes]);

  // Generate nodes and edges for the resource allocation graph
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const resourceSet = new Set<string>();

    // Collect all unique resources
    processes.forEach(process => {
      process.resources.forEach(resource => resourceSet.add(resource));
    });

    // Add process nodes
    processes.forEach((process, index) => {
      nodes.push({
        id: process.id,
        type: 'default',
        data: { 
          label: (
            <div>
              <div className="font-semibold">{process.id}</div>
              <div className={`text-xs ${
                process.status === "Running" 
                  ? "text-green-500" 
                  : process.status === "Waiting"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}>
                {process.status}
              </div>
            </div>
          )
        },
        position: { x: 50 + (index % 2) * 300, y: 50 + Math.floor(index / 2) * 200 },
        style: {
          ...processNodeStyle,
          background: process.status === "Blocked" 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2))' 
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))',
        },
      });
    });

    // Add resource nodes
    Array.from(resourceSet).forEach((resource, index) => {
      nodes.push({
        id: resource,
        type: 'default',
        data: { label: resource },
        position: { x: 200 + (index % 2) * 200, y: 150 + Math.floor(index / 2) * 200 },
        style: {
          ...resourceNodeStyle,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.2))',
        },
      });
    });

    // Add edges
    processes.forEach(process => {
      process.resources.forEach(resource => {
        edges.push({
          id: `${process.id}-${resource}`,
          source: process.id,
          target: resource,
          type: 'smoothstep',
          animated: process.status === "Blocked",
          style: { 
            stroke: process.status === "Blocked" ? '#ef4444' : '#3b82f6',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: process.status === "Blocked" ? '#ef4444' : '#3b82f6',
          },
        });
      });
    });

    return { nodes, edges };
  }, [processes]);

  // Generate Wait-For Graph
  const waitForGraph = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Create nodes in a circle with enough spacing to avoid overlaps
    const radius = 200; // Increased radius for more space
    const centerX = 225;
    const centerY = 225;
    
    // Create process nodes in a circle
    processes.forEach((process, index) => {
      const angle = (index / processes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      nodes.push({
        id: process.id,
        type: 'default',
        data: { 
          label: process.id
        },
        position: { x, y },
        style: {
          ...processNodeStyle,
          background: deadlockCycle.includes(process.id)
            ? 'rgba(239, 68, 68, 0.2)'
            : 'rgba(14, 165, 233, 0.2)',
          borderColor: deadlockCycle.includes(process.id) ? '#ef4444' : '#555',
        },
      });
    });

    // Create wait-for relationships
    processes.forEach(waitingProcess => {
      // Only blocked or waiting processes can wait for others
      if (waitingProcess.status !== "Blocked" && waitingProcess.status !== "Waiting") {
        return;
      }
      
      // Track which processes this process is waiting for
      const waitingFor = new Set<string>();
      
      // Find resources this process needs
      waitingProcess.resources.forEach(resource => {
        // Find processes holding these resources
        const holdingProcesses = resourceAllocation[resource] || [];
        
        // Add holders (except self) to waiting set
        holdingProcesses
          .filter(holderId => holderId !== waitingProcess.id)
          .forEach(holderId => waitingFor.add(holderId));
      });

      // Create edges for wait relationships
      waitingFor.forEach(targetId => {
        // Check if this edge is part of the deadlock cycle
        const isDeadlockEdge = 
          deadlockCycle.length > 0 && 
          deadlockCycle.includes(waitingProcess.id) && 
          deadlockCycle.includes(targetId) &&
          deadlockCycle.indexOf(waitingProcess.id) === 
            (deadlockCycle.indexOf(targetId) - 1 + deadlockCycle.length) % deadlockCycle.length;
            
        // Calculate curvature to avoid edges crossing through nodes
        // Edges will curve differently based on their position in the graph
        const sourceIdx = processes.findIndex(p => p.id === waitingProcess.id);
        const targetIdx = processes.findIndex(p => p.id === targetId);
        const nodeDistance = Math.abs(sourceIdx - targetIdx);
        // Higher curvature for edges spanning across the graph
        const curvature = nodeDistance > processes.length / 2 ? 0.7 : 0.3;
        
        edges.push({
          id: `wait-${waitingProcess.id}-${targetId}`,
          source: waitingProcess.id,
          target: targetId,
          type: 'bezier', // Changed from smoothstep to bezier for better routing
          animated: isDeadlockEdge,
          style: { 
            stroke: isDeadlockEdge ? '#ef4444' : '#0ea5e9',
            strokeWidth: isDeadlockEdge ? 3 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDeadlockEdge ? '#ef4444' : '#0ea5e9',
          },
          curvature: curvature, // Add curvature to bend the edges around nodes
        });
      });
    });

    return { nodes, edges };
  }, [processes, resourceAllocation, deadlockCycle]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => [
        ...prev.slice(1),
        {
          time: prev[prev.length - 1].time + 1,
          cpu: Math.floor(Math.random() * 100),
          ram: Math.floor(Math.random() * 100),
          storage: Math.floor(Math.random() * 100),
        }
      ]);
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [simulationSpeed]);

  // Function to detect circular wait (find cycles in the wait-for graph)
  const findCycles = () => {
    // Create adjacency list for the wait-for graph
    const adjacencyList: Record<string, string[]> = {};
    processes.forEach(p => {
      adjacencyList[p.id] = [];
    });
    
    // Build adjacency list of which process is waiting for which other process
    processes.forEach(process => {
      if (process.status === "Blocked" || process.status === "Waiting") {
        process.resources.forEach(resource => {
          const holdingProcesses = resourceAllocation[resource] || [];
          
          holdingProcesses
            .filter(holderId => holderId !== process.id) // Avoid self-loops
            .forEach(holderId => {
              adjacencyList[process.id].push(holderId);
            });
        });
      }
    });
    
    // DFS to find cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    let cycleFound = false;
    let detectedCycle: string[] = [];
    
    const dfs = (node: string, path: string[] = []) => {
      if (cycleFound) return;
      
      visited.add(node);
      recursionStack.add(node);
      
      const currentPath = [...path, node];
      
      for (const neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, currentPath);
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          cycleFound = true;
          const cycleStartIndex = currentPath.indexOf(neighbor);
          detectedCycle = [...currentPath.slice(cycleStartIndex), neighbor];
          return;
        }
      }
      
      recursionStack.delete(node);
    };
    
    // Run DFS from each node to find cycles
    for (const processId of Object.keys(adjacencyList)) {
      if (!visited.has(processId) && !cycleFound) {
        dfs(processId);
      }
    }
    
    return { hasCycle: cycleFound, cycle: detectedCycle };
  };

  const checkForDeadlock = () => {
    const { hasCycle, cycle } = findCycles();
    setHasDeadlock(hasCycle);
    setDeadlockCycle(cycle);
    
    if (hasCycle) {
      // Auto-switch to Wait-For graph tab to visualize the deadlock
      setActiveTab("waitfor");
    }
  };

  // Gemini API integration for AI-powered deadlock analysis
  const analyzeDeadlockWithGemini = async () => {
    setIsGeminiLoading(true);
    try {
      // Initialize Gemini API (you'll need to get an API key from Google AI Studio)
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Prepare data for Gemini
      const processData = JSON.stringify(processes, null, 2);
      const resourceAllocationData = JSON.stringify(resourceAllocation, null, 2);
      
      // Create prompt
      const prompt = `
        Analyze this system for deadlocks:
        
        Processes:
        ${processData}
        
        Resource Allocation:
        ${resourceAllocationData}
        
        Please provide:
        1. Whether a deadlock exists and which processes are involved
        2. The exact circular wait chain if a deadlock exists
        3. Three specific suggestions to resolve the deadlock
        4. What would happen if we don't resolve this deadlock
        5. Potential future deadlock scenarios based on the current allocation pattern
        
        Format your response in markdown.
      `;

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Process response - extract suggestions
      const suggestions = extractSuggestions(response);
      
      setGeminiResponse(response);
      setGeminiSuggestions(suggestions);
      
      // If Gemini found a deadlock (inferred from suggestions)
      if (suggestions.length > 0 && !hasDeadlock) {
        // Run our local detection to visualize it
        checkForDeadlock();
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setGeminiResponse("Failed to analyze with Gemini API. Please check your API key and try again.");
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Helper function to extract suggestions from Gemini response
  const extractSuggestions = (response: string): string[] => {
    // Simple regex to extract numbered suggestions
    const suggestionPattern = /(\d+\.\s+[^\n]+)/g;
    const matches = response.match(suggestionPattern) || [];
    return matches.slice(0, 3); // Return top 3 suggestions
  };

  // Apply a suggestion from Gemini (example implementation - terminate a process)
  const applySuggestion = (suggestion: string) => {
    // Simple heuristic to extract process IDs from suggestions
    const processIdMatch = suggestion.match(/(?:terminate|kill|remove)\s+(\w+)/i);
    if (processIdMatch && processIdMatch[1]) {
      const processId = processIdMatch[1];
      removeProcess(processId);
      return;
    }
    
    // Add more suggestion parsing/application logic here
    alert(`Suggestion applied: ${suggestion}`);
  };

  const addProcess = () => {
    if (newProcess.id && newProcess.resources.length > 0) {
      setProcesses([...processes, newProcess]);
      setNewProcess({ id: "", resources: [], status: "Running" });
      setIsDialogOpen(false);
      
      // Reset Gemini analysis when system state changes
      setGeminiResponse("");
      setGeminiSuggestions([]);
    }
  };

  const addResourceToProcess = () => {
    if (newResource) {
      setNewProcess({
        ...newProcess,
        resources: [...newProcess.resources, newResource]
      });
      setNewResource("");
    }
  };

  const removeResource = (index: number) => {
    setNewProcess({
      ...newProcess,
      resources: newProcess.resources.filter((_, i) => i !== index)
    });
  };

  const removeProcess = (processId: string) => {
    setProcesses(processes.filter(p => p.id !== processId));
    // Reset deadlock state when a process is removed
    if (deadlockCycle.includes(processId)) {
      setHasDeadlock(false);
      setDeadlockCycle([]);
    }
    // Reset Gemini analysis when system state changes
    setGeminiResponse("");
    setGeminiSuggestions([]);
  };

  // Calculate utilization for pie chart
  const utilizationData = useMemo(() => {
    const latest = data[data.length - 1];
    return [
      { name: 'CPU', value: latest.cpu, color: '#0088FE' },
      { name: 'RAM', value: latest.ram, color: '#00C49F' },
      { name: 'Storage', value: latest.storage, color: '#FFBB28' },
    ];
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c2e4a] to-[#0c1829] p-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-[#0088FE] bg-[#0088FE]/10 p-2 rounded-full"
            >
              <Activity className="h-8 w-8" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0088FE] to-[#00C49F]">
              System Dashboard
            </h1>
          </div>
          <div className="flex gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0088FE] to-[#00C49F] hover:from-[#0088FE]/90 hover:to-[#00C49F]/90 text-white border-none">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Process
                </Button>
              </DialogTrigger>
              <DialogContent className="border-[#0088FE]/20 bg-[#1c2e4a] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Process</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Create a new process with resources and status.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="processId" className="text-white">Process ID</Label>
                    <Input
                      id="processId"
                      value={newProcess.id}
                      onChange={(e) => setNewProcess({ ...newProcess, id: e.target.value })}
                      placeholder="Enter process ID (e.g., P5)"
                      className="bg-[#0c1829] border-[#304060] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Resources</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newResource}
                        onChange={(e) => setNewResource(e.target.value)}
                        placeholder="Enter resource (e.g., R1)"
                        className="bg-[#0c1829] border-[#304060] text-white"
                      />
                      <Button 
                        onClick={addResourceToProcess} 
                        type="button"
                        className="bg-[#0088FE] hover:bg-[#0088FE]/90"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newProcess.resources.map((resource, index) => (
                        <Badge
                          key={index}
                          className="bg-[#304060] text-white flex items-center gap-1"
                        >
                          {resource}
                          <button
                            onClick={() => removeResource(index)}
                            className="hover:text-[#FF6B6B]"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-white">Status</Label>
                    <Select
                      value={newProcess.status}
                      onValueChange={(value: "Running" | "Waiting" | "Blocked") => 
                        setNewProcess({ ...newProcess, status: value })
                      }
                    >
                      <SelectTrigger className="bg-[#0c1829] border-[#304060] text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c2e4a] border-[#304060] text-white">
                        <SelectItem value="Running" className="text-green-400">Running</SelectItem>
                        <SelectItem value="Waiting" className="text-yellow-400">Waiting</SelectItem>
                        <SelectItem value="Blocked" className="text-red-400">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={addProcess} 
                    className="w-full bg-gradient-to-r from-[#0088FE] to-[#00C49F]"
                  >
                    Create Process
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="flex gap-2">
              <Button 
                onClick={checkForDeadlock}
                size="default"
                className="bg-gradient-to-r from-[#FF6B6B] to-[#FFBB28] hover:opacity-90 text-white"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Quick Deadlock Check
              </Button>
              
              <Button 
                onClick={analyzeDeadlockWithGemini}
                size="default"
                className="bg-gradient-to-r from-[#8884d8] to-[#0088FE] hover:opacity-90 text-white"
                disabled={isGeminiLoading}
              >
                {isGeminiLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Deadlock Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {hasDeadlock && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="bg-red-500/20 border-red-500 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Deadlock Detected!</AlertTitle>
                <AlertDescription className="text-white/90">
                  A circular wait condition has been detected between processes: 
                  <span className="font-bold ml-1">
                    {deadlockCycle.join(" → ")} → {deadlockCycle[0]}
                  </span>. 
                  Consider terminating one of the blocked processes to resolve the deadlock.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Gemini Analysis Results */}
        <AnimatePresence>
          {geminiResponse && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-[#1c2e4a]/70 backdrop-blur-sm border-[#304060]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-[#8884d8]" />
                    AI Deadlock Analysis
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setGeminiResponse("");
                      setGeminiSuggestions([]);
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-white/90"
                    dangerouslySetInnerHTML={{ __html: marked.parse(geminiResponse) }} 
                  />
                </div>
                
                {geminiSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-white">Quick Resolution Options</h3>
                    <div className="flex flex-wrap gap-2">
                      {geminiSuggestions.map((suggestion, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-[#8884d8]/20 text-[#8884d8] p-2 text-sm cursor-pointer hover:bg-[#8884d8]/30"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="p-4 bg-gradient-to-br from-[#0088FE]/20 to-[#0088FE]/5 backdrop-blur-sm border-[#0088FE]/30">
              <div className="flex items-center space-x-3">
                <div className="bg-[#0088FE]/20 p-2 rounded-full">
                  <Cpu className="h-5 w-5 text-[#0088FE]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/70">CPU Usage</h3>
                  <p className="text-2xl font-bold text-white">{data[data.length - 1].cpu}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="p-4 bg-gradient-to-br from-[#00C49F]/20 to-[#00C49F]/5 backdrop-blur-sm border-[#00C49F]/30">
              <div className="flex items-center space-x-3">
                <div className="bg-[#00C49F]/20 p-2 rounded-full">
                  <Activity className="h-5 w-5 text-[#00C49F]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/70">RAM Usage</h3>
                  <p className="text-2xl font-bold text-white">{data[data.length - 1].ram}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="p-4 bg-gradient-to-br from-[#FFBB28]/20 to-[#FFBB28]/5 backdrop-blur-sm border-[#FFBB28]/30">
              <div className="flex items-center space-x-3">
                <div className="bg-[#FFBB28]/20 p-2 rounded-full">
                  <HardDrive className="h-5 w-5 text-[#FFBB28]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/70">Storage Usage</h3>
                  <p className="text-2xl font-bold text-white">{data[data.length - 1].storage}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Simulation Controls */}
        <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <Info className="mr-2 h-5 w-5 text-[#0088FE]" />
            Simulation Controls
          </h2>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="speed" className="text-white/70">Update Interval (ms)</Label>
              <Input
                id="speed"
                type="number"
                min="500"
                max="5000"
                step="500"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="bg-[#0c1829] border-[#304060] text-white"
              />
            </div>
            <Button 
              onClick={() => setData(generateRandomData(10))} 
              className="bg-[#304060] hover:bg-[#405070] text-white"
            >
              Reset Data
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* CPU Usage Chart */}
          <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060] col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-white">CPU Usage</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                </linearGradient>
                </defs>
                <defs>
                <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FFBB28" stopOpacity={0} />
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#304060" />
                <XAxis dataKey="time" stroke="#ffffff70" />
                <YAxis stroke="#ffffff70" />
                <Tooltip
                contentStyle={{ 
                  backgroundColor: "#1c2e4a", 
                  borderColor: "#304060", 
                  color: "white" 
                }}
                />
                <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#0088FE" 
                fillOpacity={1} 
                fill="url(#cpuGradient)" 
                />
                <Area 
                type="monotone" 
                dataKey="ram" 
                stroke="#00C49F" 
                fillOpacity={1} 
                fill="url(#ramGradient)" 
                />
                <Area 
                type="monotone" 
                dataKey="storage" 
                stroke="#FFBB28" 
                fillOpacity={1} 
                fill="url(#storageGradient)" 
                />
              </AreaChart>
              </ResponsiveContainer>
            </div>
            </Card>

            {/* Resource Utilization Pie Chart */}
            <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
            <h2 className="text-xl font-semibold mb-4 text-white">Resource Utilization</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                data={utilizationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                >
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip 
                formatter={(value) => [`${value}%`, 'Usage']}
                contentStyle={{ 
                  backgroundColor: "#1c2e4a", 
                  borderColor: "#304060", 
                  color: "white" 
                }}
                />
              </PieChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </div>

          {/* Process Table and Graphs */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Process Table */}
            <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
            <h2 className="text-xl font-semibold mb-4 text-white">Processes</h2>
            <Table>
              <TableHeader>
              <TableRow className="border-[#304060]">
                <TableHead className="text-white">Process ID</TableHead>
                <TableHead className="text-white">Resources</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {processes.map((process) => (
                <TableRow key={process.id} className="border-[#304060]">
                <TableCell className="font-medium text-white">{process.id}</TableCell>
                <TableCell className="text-white">
                  <div className="flex flex-wrap gap-1">
                  {process.resources.map((resource, idx) => (
                    <Badge key={idx} className="bg-[#304060] text-white">
                    {resource}
                    </Badge>
                  ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`
                  ${process.status === "Running" 
                    ? "bg-green-500/20 text-green-500" 
                    : process.status === "Waiting"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-red-500/20 text-red-500"
                  }
                  `}>
                  {process.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-white/70 hover:text-red-500" 
                  onClick={() => removeProcess(process.id)}
                  >
                  <X className="h-4 w-4" />
                  </Button>
                </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
            </Card>

            {/* Resource Allocation Statistics */}
            <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
            <h2 className="text-xl font-semibold mb-4 text-white">Resource Allocation</h2>
            <Table>
              <TableHeader>
              <TableRow className="border-[#304060]">
                <TableHead className="text-white">Resource</TableHead>
                <TableHead className="text-white">Allocated to</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {Object.entries(resourceAllocation).map(([resource, processIds]) => (
                <TableRow key={resource} className="border-[#304060]">
                <TableCell className="font-medium text-white">{resource}</TableCell>
                <TableCell className="text-white">
                  <div className="flex flex-wrap gap-1">
                  {processIds.map((processId, idx) => (
                    <Badge 
                    key={idx} 
                    className={`
                      ${deadlockCycle.includes(processId) 
                      ? "bg-red-500/20 text-red-500" 
                      : "bg-[#304060] text-white"
                      }
                    `}
                    >
                    {processId}
                    </Badge>
                  ))}
                  </div>
                </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
            </Card>
          </div>

          {/* Resource Graphs */}
          <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
            <Tabs defaultValue="allocation" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-[#0088FE]" />
                  Resource Graphs
                </h2>
                <TabsList className="bg-[#0c1829] w-full sm:w-auto">
                  <TabsTrigger value="allocation" className="flex-1 sm:flex-none data-[state=active]:bg-[#0088FE] data-[state=active]:text-white">
                    Allocation Graph
                  </TabsTrigger>
                  <TabsTrigger value="waitfor" className="flex-1 sm:flex-none data-[state=active]:bg-[#FF6B6B] data-[state=active]:text-white">
                    Wait-For Graph
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="allocation" className="mt-0">
                <div className="mb-2 text-white/70 text-sm p-2 bg-[#0c1829]/50 rounded-md border border-[#304060]">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-[#0088FE]" /> 
                    <span>Shows allocation relationships between processes (circles) and resources (squares). Arrows indicate which processes are using which resources.</span>
                  </div>
                </div>
                <div className="h-[450px] bg-[#0c1829]/80 rounded-md border border-[#304060] overflow-hidden">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    fitView
                    minZoom={0.5}
                    maxZoom={2}
                  >
                    <Background color="#304060" gap={16} variant="dots" />
                    <Controls 
                      className="bg-[#1c2e4a] text-white border-[#304060]"
                      showInteractive={false}
                      position="bottom-right"
                    />
                    <div className="absolute top-3 right-3 bg-[#1c2e4a] p-3 rounded-md border border-[#304060] text-xs">
                      <div className="font-semibold text-white mb-2">Legend</div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-[#3b82f6] mr-2"></div>
                          <span className="text-white">Active Process</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-[#ef4444] mr-2"></div>
                          <span className="text-white">Blocked Process</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-sm bg-[#99a2f1] mr-2"></div>
                          <span className="text-white">Resource</span>
                        </div>
                      </div>
                    </div>
                  </ReactFlow>
                </div>
                <div className="mt-2 flex items-center justify-center text-white/70 text-xs p-1">
                  <div className="flex items-center gap-2">
                    <span>🖱️ Drag to move</span>
                    <span>|</span>
                    <span>⚙️ Scroll to zoom</span>
                    <span>|</span>
                    <span>🌐 Grab empty space to pan</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="waitfor" className="mt-0">
                <div className="mb-2 text-white/70 text-sm p-2 bg-[#0c1829]/50 rounded-md border border-[#304060]">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-[#FF6B6B]" /> 
                    <span>Shows wait dependencies between processes. An arrow from P1 to P2 means P1 is waiting for P2 to release resources. Red cycles indicate deadlocks.</span>
                  </div>
                </div>
                <div className="h-[450px] bg-[#0c1829]/80 rounded-md border border-[#304060] overflow-hidden">
                  <ReactFlow
                    nodes={waitForGraph.nodes}
                    edges={waitForGraph.edges}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    fitView
                    minZoom={0.5}
                    maxZoom={2}
                  >
                    <Background 
                      color="#304060" 
                      gap={16} 
                      variant="dots" 
                    />
                    <Controls 
                      className="bg-[#1c2e4a] text-white border-[#304060]"
                      showInteractive={false}
                      position="bottom-right"
                    />
                    
                    {hasDeadlock && (
                      <div className="absolute top-3 left-3 bg-red-500/20 p-2 rounded-md border border-red-500/50 text-xs text-white font-medium max-w-xs">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1 text-red-500 flex-shrink-0" />
                          <span>Deadlock detected: {deadlockCycle.join(" → ")} → {deadlockCycle[0]}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 bg-[#1c2e4a] p-3 rounded-md border border-[#304060] text-xs">
                      <div className="font-semibold text-white mb-2">Legend</div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="h-2 w-6 bg-[#0ea5e9] rounded-sm mr-2"></div>
                          <span className="text-white">Wait Dependency</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-2 w-6 bg-[#ef4444] rounded-sm mr-2"></div>
                          <span className="text-white">Deadlock Chain</span>
                        </div>
                      </div>
                    </div>
                  </ReactFlow>
                </div>
                
                {hasDeadlock ? (
                  <div className="mt-2 bg-red-500/10 text-red-400 text-xs p-2 rounded border border-red-500/20 flex items-center">
                    <span className="mr-1">💡</span> Tip: Select one of the processes in the deadlock cycle to terminate and resolve the deadlock.
                  </div>
                ) : (
                  <div className="mt-2 text-white/70 text-xs p-1 text-center">
                    No deadlocks detected in the current system state.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          <footer className="text-center text-white/60 text-sm mt-8">
            <p>AI Deadlock Resolver Dashboard • Powered by React, Framer Motion & Gemini AI</p>
          </footer>
          </motion.div>
        </div>
        );
      }