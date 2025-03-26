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
import { AlertCircle, Plus, X, Info, Activity, Cpu, HardDrive } from "lucide-react";
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
    const processIds = processes.map(p => p.id);
    
    // Create a node for each process
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
        position: { 
          x: 150 + Math.cos(index * (2 * Math.PI / processIds.length)) * 200, 
          y: 200 + Math.sin(index * (2 * Math.PI / processIds.length)) * 200 
        },
        style: {
          ...processNodeStyle,
          background: deadlockCycle.includes(process.id)
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.3))'
            : 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.3))',
          borderWidth: deadlockCycle.includes(process.id) ? '2px' : '1px',
          borderColor: deadlockCycle.includes(process.id) ? '#ef4444' : '#555',
        },
      });
    });

    // Add edges where one process is waiting for a resource held by another
    processes.forEach(process => {
      if (process.status === "Blocked" || process.status === "Waiting") {
        // Find which processes this process is waiting for
        process.resources.forEach(resource => {
          const holdingProcesses = resourceAllocation[resource] || [];
          
          holdingProcesses
            .filter(holderId => holderId !== process.id) // Don't create self-loops
            .forEach(holderId => {
              const isDeadlockEdge = deadlockCycle.includes(process.id) && 
                                    deadlockCycle.includes(holderId);
              
              edges.push({
                id: `wait-${process.id}-${holderId}`,
                source: process.id,
                target: holderId,
                type: 'smoothstep',
                animated: true,
                style: { 
                  stroke: isDeadlockEdge ? '#ef4444' : '#0ea5e9',
                  strokeWidth: isDeadlockEdge ? 3 : 2,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: isDeadlockEdge ? '#ef4444' : '#0ea5e9',
                },
                label: isDeadlockEdge ? "Deadlock" : "Waiting",
                labelStyle: { fill: isDeadlockEdge ? '#ef4444' : '#0ea5e9', fontWeight: 'bold' },
                labelBgStyle: { fill: 'rgba(255, 255, 255, 0.8)', fillOpacity: 0.8 },
              });
            });
        });
      }
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

  const addProcess = () => {
    if (newProcess.id && newProcess.resources.length > 0) {
      setProcesses([...processes, newProcess]);
      setNewProcess({ id: "", resources: [], status: "Running" });
      setIsDialogOpen(false);
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
            <Button 
              onClick={checkForDeadlock}
              size="default"
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FFBB28] hover:opacity-90 text-white"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Check for Deadlock
            </Button>
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
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-[#304060]" />
                  <XAxis dataKey="time" className="text-white/70" />
                  <YAxis className="text-white/70" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1c2e4a",
                      border: "1px solid #304060",
                      color: "white",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#0088FE" 
                    fill="url(#colorCpu)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Resource Utilization Pie Chart */}
          <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
            <h2 className="text-xl font-semibold mb-4 text-white">Resource Utilization</h2>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={utilizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {utilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#1c2e4a",
                      border: "1px solid #304060",
                      color: "white",
                      borderRadius: "8px"
                    }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* RAM Usage Chart */}
        <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
          <h2 className="text-xl font-semibold mb-4 text-white">RAM Usage</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <defs>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[#304060]" />
                <XAxis dataKey="time" className="text-white/70" />
                <YAxis className="text-white/70" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1c2e4a",
                    border: "1px solid #304060",
                    color: "white",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ram" 
                  stroke="#00C49F" 
                  strokeWidth={3}
                  dot={{ stroke: '#00C49F', fill: '#1c2e4a', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#00C49F', fill: '#00C49F', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Process Table */}
        <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <Info className="mr-2 h-5 w-5 text-[#0088FE]" />
            Active Processes
          </h2>
          <div className="overflow-x-auto">
            <Table className="text-white">
              <TableHeader className="bg-[#0c1829]">
                <TableRow>
                  <TableHead className="text-white">Process ID</TableHead>
                  <TableHead className="text-white">Allocated Resources</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id} className={deadlockCycle.includes(process.id) ? "bg-red-500/10" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {deadlockCycle.includes(process.id) && (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        {process.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {process.resources.map((resource, index) => (
                          <Badge key={index} className="bg-[#304060] text-white">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          process.status === "Running" 
                            ? "bg-green-500/20 text-green-400" 
                            : process.status === "Waiting"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {process.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProcess(process.id)}
                        className="text-red-400 hover:text-red-400/90 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Resource & Wait-For Graphs */}
        <Card className="p-6 bg-[#1c2e4a]/50 backdrop-blur-sm border-[#304060]">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Resource Visualization</h2>
              <TabsList className="bg-[#0c1829]">
                <TabsTrigger value="allocation" className="data-[state=active]:bg-[#0088FE]/80 data-[state=active]:text-white">
                  Resource Allocation
                </TabsTrigger>
                <TabsTrigger value="waitfor" className="data-[state=active]:bg-[#0088FE]/80 data-[state=active]:text-white">
                  Wait-For Graph
                </TabsTrigger>
              </TabsList>
            </div>
            
            <Separator className="mb-4 bg-[#304060]" />
            
            <TabsContent value="allocation" className="mt-0">
              <div className="h-[500px] rounded-lg overflow-hidden border border-[#304060] bg-[#0c1829]/50">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                >
                  <Background color="#304060" gap={16} />
                  <Controls className="bg-[#1c2e4a] text-white border-[#304060]" />
                </ReactFlow>
              </div>
              <div className="mt-4 text-white/70 flex flex-col space-y-2">
                <p className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-[#3b82f6] mr-2 rounded-full"></span>
                  Process to Resource: Process is requesting or holding the resource
                </p>
                <p className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-[#ef4444] mr-2 rounded-full"></span>
                  Animated Edge: Process is blocked waiting for the resource
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="waitfor" className="mt-0">
              <div className="h-[500px] rounded-lg overflow-hidden border border-[#304060] bg-[#0c1829]/50">
                <ReactFlow
                  nodes={waitForGraph.nodes}
                  edges={waitForGraph.edges}
                  fitView
                >
                  <Background color="#304060" gap={16} variant="dots" />
                  <Controls className="bg-[#1c2e4a] text-white border-[#304060]" />
                </ReactFlow>
              </div>
              <div className="mt-4 text-white/70 flex flex-col space-y-2">
                <p className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-[#0ea5e9] mr-2 rounded-full"></span>
                  Process to Process: Process is waiting for a resource held by another process
                </p>
                {hasDeadlock && (
                  <p className="flex items-center text-red-400">
                    <span className="inline-block w-3 h-3 bg-[#ef4444] mr-2 rounded-full"></span>
                    Red Cycle: Detected deadlock path ({deadlockCycle.join(" → ")} → {deadlockCycle[0]})
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}