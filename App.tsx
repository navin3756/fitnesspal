import React, { useState, useEffect } from 'react';
// Main App Component
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ruler, Utensils, Clock, Moon, Brain, 
  Droplet, Scale, Dumbbell, Calendar as CalendarIcon, Users,
  Trophy, Flame, CheckCircle2, Circle,
  ChevronDown, ChevronUp, Target, ListChecks, Medal,
  MessageSquare, HeartPulse, MessageCircle, Bell, Send, AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

const COMMANDMENTS = [
  {
    id: 1,
    title: "The Tape Measure Truth",
    shortTitle: "Waist Circumference",
    icon: Ruler,
    description: "Asian Men: < 90 cm | Asian Women: < 80 cm",
    funnyDesc: "Your belly shouldn't enter the room before you do! Abdominal fat is like that one guest who overstays their welcome and ruins your insulin resistance.",
    points: 10,
  },
  {
    id: 2,
    title: "You Can't Outrun a Bad Diet",
    shortTitle: "Diet (80%) > Exercise (20%)",
    icon: Utensils,
    description: "Nutritional quality and portion control are king.",
    funnyDesc: "Doing 50 burpees doesn't magically erase that family-sized biryani you inhaled. Abs are made in the kitchen, not just by crying on a yoga mat.",
    points: 10,
  },
  {
    id: 3,
    title: "The Kitchen is CLOSED",
    shortTitle: "Time-Restricted Eating",
    icon: Clock,
    description: "Eat between 7 AM – 7 PM.",
    funnyDesc: "Your fridge needs to sleep too! Late-night snacking is just your brain being bored, not hungry. Step away from the midnight snacks!",
    points: 10,
  },
  {
    id: 4,
    title: "Catch Those Zzz's",
    shortTitle: "Sleep Hygiene",
    icon: Moon,
    description: "Men: ≥ 7 hours | Women: ≥ 8 hours",
    funnyDesc: "Sleep deprivation makes you crave sugar like a zombie craves brains. Go to bed, your Netflix show will still be there tomorrow.",
    points: 10,
  },
  {
    id: 5,
    title: "Chill Pill (Meditation)",
    shortTitle: "Stress Management",
    icon: Brain,
    description: "Minimum 7 Minutes Daily Meditation",
    funnyDesc: "Close your eyes and ignore the world for 7 minutes. High cortisol makes you store belly fat. Literally, stressing makes you fat. Relax!",
    points: 10,
  },
  {
    id: 6,
    title: "Water You Doing?",
    shortTitle: "Hydration",
    icon: Droplet,
    description: "Minimum 2 liters of water daily",
    funnyDesc: "You are essentially a complicated houseplant with emotions. Water yourself! (Unless your doctor said no, then listen to them).",
    points: 10,
  },
  {
    id: 7,
    title: "Rice Rice Baby (But Less)",
    shortTitle: "Portion Control",
    icon: Scale,
    description: "Limit cooked red rice to ~150g per meal.",
    funnyDesc: "A mountain of rice is not a portion, it's a geographical feature. Swap to whole grains and keep it reasonable!",
    points: 10,
  },
  {
    id: 8,
    title: "Move It or Lose It",
    shortTitle: "Daily Physical Activity",
    icon: Dumbbell,
    description: "Minimum 20 Minutes (60-70% Max Heart Rate)",
    funnyDesc: "If you can sing while exercising, you're not working hard enough. If you can't speak a sentence, you're dying. Find the sweet spot!",
    points: 10,
  },
  {
    id: 9,
    title: "The 90-Day Reality Check",
    shortTitle: "Accountability",
    icon: CalendarIcon,
    description: "Reassess weight, waist, BP, and glucose every 90 days.",
    funnyDesc: "Numbers don't lie, even if your stretchy pants do. Check your stats every 3 months before things get out of hand!",
    points: 10,
  },
  {
    id: 10,
    title: "The Ultimate Guilt Trip",
    shortTitle: "Responsibility",
    icon: Users,
    description: "If you have dependents, it's your duty to stay healthy.",
    funnyDesc: "Got kids under 18? A family? Congratulations, you are no longer allowed to be unhealthy. Your health is their wealth. No pressure!",
    points: 10,
  }
];

interface CommandmentCardProps {
  cmd: typeof COMMANDMENTS[0];
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  disabled: boolean;
}

const CommandmentCard: React.FC<CommandmentCardProps> = ({ cmd, isCompleted, onToggle, isExpanded, onExpand, disabled }) => {
  const Icon = cmd.icon;
  return (
    <motion.div 
      layout
      className={`p-4 rounded-2xl border-2 transition-colors cursor-pointer ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-100'} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      onClick={onExpand}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          disabled={disabled}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-500'}`}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${isCompleted ? 'text-emerald-800 line-through opacity-70' : 'text-slate-800'}`}>
            {cmd.id}. {cmd.shortTitle}
          </h3>
        </div>
        <div className="shrink-0 text-slate-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 pl-12 pb-2">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{cmd.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{cmd.description}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative mt-4">
                <div className="absolute -top-3 -left-2 text-2xl">😂</div>
                <p className="text-sm text-slate-700 italic pl-4">
                  "{cmd.funnyDesc}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loginName, setLoginName] = useState("");
  const [activeTab, setActiveTab] = useState<'checklist' | 'leaderboard' | 'calendar' | 'coach' | 'reality' | 'fails'>('checklist');
  
  const [completed, setCompleted] = useState<number[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [goalInput, setGoalInput] = useState("");
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const WATER_GOAL = 2000;

  // AI Coach State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Reality Check State
  const [realityStats, setRealityStats] = useState({
    weight: "", waist: "", bp_sys: "", bp_dia: "", glucose: ""
  });

  // Community Fails State
  const [fails, setFails] = useState<any[]>([]);
  const [failInput, setFailInput] = useState("");

  // Nudges State
  const [nudges, setNudges] = useState<any[]>([]);

  // Calendar Enhancements State
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  const getLocalTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getLocalTodayStr();

  useEffect(() => {
    const savedUser = localStorage.getItem('drpal_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setGoalInput(parsed.goal || "");
      setRealityStats({
        weight: parsed.weight || "",
        waist: parsed.waist || "",
        bp_sys: parsed.bp_sys || "",
        bp_dia: parsed.bp_dia || "",
        glucose: parsed.glucose || ""
      });
      fetchHistory(parsed.id);
      fetchNudges(parsed.id);
      requestNotificationPermission();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (activeTab === 'fails') {
      fetchFails();
    }
  }, [activeTab]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const fetchNudges = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/nudges/${userId}`);
      const data = await res.json();
      setNudges(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFails = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/fails`);
      const data = await res.json();
      setFails(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostFail = async () => {
    if (!user || !failInput.trim()) return;
    try {
      await fetch(`${API_BASE}/api/fails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userName: user.name, content: failInput })
      });
      setFailInput("");
      fetchFails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNudge = async (toUserId: number) => {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user.id, toUserId })
      });
      alert("Nudge sent! Peer pressure activated! 😂");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRealityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/reality-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          ...realityStats,
          date: todayStr 
        })
      });
      const updatedUser = { ...user, ...realityStats, last_reality_check: todayStr };
      setUser(updatedUser);
      localStorage.setItem('drpal_user', JSON.stringify(updatedUser));
      alert("Reality Check saved! Numbers don't lie! 🩺");
    } catch (err) {
      console.error(err);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are Dr. Pal, a funny, direct, and health-conscious Indian doctor. You believe in the 10 Commandments of health (waist < 90/80cm, 7-7 eating, sleep, meditation, water, portion control, exercise, accountability). Use humor, light sarcasm, and medical wisdom. Keep responses concise and encouraging but firm. User says: ${userMsg}` }] }
        ],
      });
      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "My gut feeling is confused. Try again!" }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Even my medical degree can't fix this connection error. Try again!" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName.trim() })
      });
      const data = await res.json();
      setUser(data);
      setGoalInput(data.goal || "");
      localStorage.setItem('drpal_user', JSON.stringify(data));
      fetchHistory(data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/history/${userId}`);
      const data = await res.json();
      const parsedData = data.map((h: any) => ({
        ...h,
        completed_ids: h.completed_ids ? JSON.parse(h.completed_ids) : []
      }));
      setHistory(parsedData);
      if (parsedData.length > 0 && parsedData[0].date === todayStr) {
        if (parsedData[0].score > 0) {
          setIsSubmittedToday(true);
          setCompleted(parsedData[0].completed_ids);
        } else {
          setIsSubmittedToday(false);
          setCompleted([]);
        }
        setWaterIntake(parsedData[0].water_intake || 0);
      } else {
        setIsSubmittedToday(false);
        setCompleted([]);
        setWaterIntake(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWater = async (amount: number) => {
    if (!user) return;
    setWaterIntake(prev => prev + amount);
    try {
      const res = await fetch(`${API_BASE}/api/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, date: todayStr, amount })
      });
      const data = await res.json();
      if (data.success) {
        setWaterIntake(data.waterIntake);
      }
    } catch (err) {
      console.error(err);
      setWaterIntake(prev => prev - amount);
    }
  };

  const handleUpdateGoal = async () => {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, goal: goalInput })
      });
      const updatedUser = { ...user, goal: goalInput };
      setUser(updatedUser);
      localStorage.setItem('drpal_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitDay = async () => {
    if (!user || isSubmittedToday || completed.length === 0) return;
    const score = completed.length * 10;
    try {
      const res = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, date: todayStr, score, completedIds: completed })
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmittedToday(true);
        const updatedUser = { 
          ...user, 
          total_score: user.total_score + score,
          streak: data.newStreak,
          last_active_date: todayStr
        };
        setUser(updatedUser);
        localStorage.setItem('drpal_user', JSON.stringify(updatedUser));
        fetchHistory(user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCommandment = (id: number) => {
    if (isSubmittedToday) return;
    if (completed.includes(id)) {
      setCompleted(completed.filter(c => c !== id));
    } else {
      setCompleted([...completed, id]);
    }
  };

  const dailyPoints = completed.length * 10;
  const lifetimePoints = user ? user.total_score + (isSubmittedToday ? 0 : dailyPoints) : 0;

  const getLevel = (pts: number) => {
    if (pts < 100) return "Health Recruit 🌱";
    if (pts < 500) return "Wellness Apprentice 🧘";
    if (pts < 1500) return "Metabolic Master ⚡";
    if (pts < 3000) return "Longevity Legend 👑";
    return "Dr. Pal's Immortal 💎";
  };

  const getBadges = () => {
    const badges = [];
    if (user.streak >= 7) badges.push({ name: "Kitchen Closer", icon: "🚪", desc: "7 Day Streak" });
    if (waterIntake >= WATER_GOAL) badges.push({ name: "Houseplant", icon: "🪴", desc: "Hydrated Today" });
    if (user.total_score >= 1000) badges.push({ name: "Metabolic Beast", icon: "🦁", desc: "1000+ XP" });
    if (user.last_reality_check) badges.push({ name: "Truth Seeker", icon: "🔍", desc: "Reality Checked" });
    return badges;
  };

  const getDailyStatus = () => {
    if (dailyPoints === 0) return "Couch Potato 🥔";
    if (dailyPoints <= 30) return "Warming Up 🐢";
    if (dailyPoints <= 60) return "On Fire! 🔥";
    if (dailyPoints <= 90) return "Health Hero ⚔️";
    return "Perfect Day! 🏆";
  };

  // Generate calendar days for viewing month
  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const log = history.find(h => h.date === dateStr);
      days.push({ day: i, dateStr, score: log ? log.score : null, log });
    }
    return days;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const getHeatmapColor = (score: number | null) => {
    if (score === null) return 'bg-slate-50 text-slate-400';
    if (score === 0) return 'bg-slate-100 text-slate-400';
    if (score <= 30) return 'bg-emerald-100 text-emerald-800';
    if (score <= 60) return 'bg-emerald-200 text-emerald-900';
    if (score <= 90) return 'bg-emerald-400 text-white';
    return 'bg-emerald-600 text-white';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🩺
            </div>
            <h1 className="text-2xl font-black text-slate-800">Dr. Pal's 10 Commandments</h1>
            <p className="text-slate-500 mt-2">Join the health revolution. Enter your name to start tracking.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <input 
                type="text" 
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. Health Warrior"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Start My Journey
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 lg:w-2/5 bg-emerald-600 text-white p-6 md:p-8 flex flex-col md:sticky top-0 md:h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black tracking-tight leading-tight">Dr. Pal's<br/>Commandments</h1>
          <button 
            onClick={() => { localStorage.removeItem('drpal_user'); setUser(null); }}
            className="text-emerald-200 hover:text-white text-sm font-medium bg-emerald-700/50 px-3 py-1 rounded-full"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-emerald-700/50 rounded-3xl p-6 mb-6 backdrop-blur-sm border border-emerald-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold border-2 border-emerald-400">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-emerald-200 text-sm">{getLevel(lifetimePoints)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-800/40 p-3 rounded-2xl border border-emerald-400/20">
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-bold mb-1">Lifetime XP</div>
              <div className="text-2xl font-black flex items-center gap-1">
                <Trophy size={20} className="text-amber-400" />
                {lifetimePoints}
              </div>
            </div>
            <div className="bg-emerald-800/40 p-3 rounded-2xl border border-emerald-400/20">
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-bold mb-1">Streak</div>
              <div className="text-2xl font-black flex items-center gap-1">
                <Flame size={20} className="text-orange-400" fill="currentColor" />
                {user.streak} <span className="text-sm font-normal text-emerald-200">days</span>
              </div>
            </div>
          </div>

          {getBadges().length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-bold mb-2">Badges Unlocked</div>
              <div className="flex flex-wrap gap-2">
                {getBadges().map(b => (
                  <div key={b.name} className="bg-emerald-500/50 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold border border-emerald-400/30" title={b.desc}>
                    <span>{b.icon}</span> {b.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-2">
            <label className="text-xs text-emerald-200 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
              <Target size={14} /> My Fitness Goal
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Lose 5kg, Run 5k..."
                className="flex-1 bg-emerald-800/40 border border-emerald-400/20 rounded-xl px-3 py-2 text-sm text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-400"
              />
              <button 
                onClick={handleUpdateGoal}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Right Content */}
      <div className="w-full md:w-2/3 lg:w-3/5 flex flex-col h-screen">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
          <button 
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'checklist' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <ListChecks size={18} /> Daily Checklist
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'leaderboard' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Medal size={18} /> Leaderboard
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'calendar' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarIcon size={18} /> Calendar
          </button>
          <button 
            onClick={() => setActiveTab('coach')}
            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'coach' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <MessageSquare size={18} /> AI Coach
          </button>
          <button 
            onClick={() => setActiveTab('reality')}
            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'reality' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <HeartPulse size={18} /> Reality
          </button>
          <button 
            onClick={() => setActiveTab('fails')}
            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'fails' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <MessageCircle size={18} /> Fails
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {nudges.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-amber-800">
                  <Bell className="animate-bounce" />
                  <span className="font-bold">{nudges[0].from_user_name} nudged you! Time to move! 🏃‍♂️</span>
                </div>
                <button onClick={() => {
                  fetch(`${API_BASE}/api/nudges/read`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId: user.id}) });
                  setNudges([]);
                }} className="text-xs font-bold text-amber-600 underline">Dismiss</button>
              </div>
            )}
            
            {/* CHECKLIST TAB */}
            {activeTab === 'checklist' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Today's Mission</h2>
                    <p className="text-slate-500 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-600">{dailyPoints}/100</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{getDailyStatus()}</div>
                  </div>
                </div>
                
                {isSubmittedToday && (
                  <div className="mb-6 p-4 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                    <CheckCircle2 className="shrink-0" />
                    <div>
                      <h4 className="font-bold">Day Completed!</h4>
                      <p className="text-sm">You've locked in your points for today. See you tomorrow!</p>
                    </div>
                  </div>
                )}
                
                {/* WATER TRACKER */}
                <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
                        <Droplet size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Daily Water Intake</h3>
                        <p className="text-xs text-slate-500">Goal: 2 Liters (2000ml)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-blue-600 text-xl">{waterIntake} <span className="text-sm text-slate-400 font-medium">/ 2000 ml</span></div>
                    </div>
                  </div>
                  
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-6 relative">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (waterIntake / WATER_GOAL) * 100)}%` }}
                      transition={{ type: "spring", bounce: 0.2 }}
                    />
                    {waterIntake >= WATER_GOAL && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-widest">
                        Goal Reached!
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddWater(250)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      + 250ml 💧
                    </button>
                    <button 
                      onClick={() => handleAddWater(500)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      + 500ml 🚰
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pb-8">
                  {COMMANDMENTS.map(cmd => (
                    <CommandmentCard 
                      key={cmd.id}
                      cmd={cmd}
                      isCompleted={completed.includes(cmd.id)}
                      isExpanded={expandedId === cmd.id}
                      onToggle={() => toggleCommandment(cmd.id)}
                      onExpand={() => setExpandedId(expandedId === cmd.id ? null : cmd.id)}
                      disabled={isSubmittedToday}
                    />
                  ))}
                </div>

                {!isSubmittedToday && (
                  <button 
                    onClick={handleSubmitDay}
                    disabled={completed.length === 0}
                    className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${completed.length > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <CheckCircle2 /> Lock In Today's Points ({dailyPoints})
                  </button>
                )}
              </motion.div>
            )}

            {/* LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Global Leaderboard</h2>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  {leaderboard.map((lUser, idx) => (
                    <div key={lUser.id} className={`flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 ${lUser.id === user.id ? 'bg-emerald-50' : ''}`}>
                      <div className="w-8 text-center font-black text-slate-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {lUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {lUser.name} {lUser.id === user.id && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">Goal: {lUser.goal || 'No goal set'}</div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-black text-emerald-600">{lUser.total_score} XP</div>
                          <div className="text-xs text-orange-500 font-bold flex items-center justify-end gap-1">
                            <Flame size={12} fill="currentColor" /> {lUser.streak}
                          </div>
                        </div>
                        {lUser.id !== user.id && (
                          <button 
                            onClick={() => handleNudge(lUser.id)}
                            className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-400 hover:text-amber-600 rounded-full transition-colors"
                            title="Nudge this person!"
                          >
                            <Bell size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No participants yet. Be the first!</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">My History</h2>
                    <p className="text-slate-500">Track your consistency over time.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><ChevronDown className="rotate-90" size={20} /></button>
                    <span className="font-bold text-sm min-w-[100px] text-center">
                      {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><ChevronDown className="-rotate-90" size={20} /></button>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth().map((dayObj, idx) => {
                      if (!dayObj) return <div key={`empty-${idx}`} className="aspect-square rounded-xl bg-slate-50/50"></div>;
                      
                      const isToday = dayObj.dateStr === todayStr;
                      const hasScore = dayObj.score !== null;
                      
                      return (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={dayObj.day} 
                          onClick={() => setSelectedDay(dayObj)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center relative border-2 transition-all ${isToday ? 'border-emerald-400' : 'border-transparent'} ${getHeatmapColor(dayObj.score)}`}
                        >
                          <span className="font-bold text-sm">{dayObj.day}</span>
                          {hasScore && dayObj.score > 0 && <span className="text-[10px] font-black mt-1">{dayObj.score}</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedDay && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 relative"
                    >
                      <button 
                        onClick={() => setSelectedDay(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                      >
                        <Circle size={20} className="rotate-45" />
                      </button>
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CalendarIcon size={18} className="text-emerald-600" />
                        Details for {new Date(selectedDay.dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </h3>
                      
                      {selectedDay.log ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                              <div className="text-xs text-emerald-600 font-bold uppercase mb-1">Score</div>
                              <div className="text-2xl font-black text-emerald-700">{selectedDay.log.score} XP</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                              <div className="text-xs text-blue-600 font-bold uppercase mb-1">Hydration</div>
                              <div className="text-2xl font-black text-blue-700">{selectedDay.log.water_intake || 0} ml</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-slate-400 font-bold uppercase mb-2">Commandments Completed</div>
                            <div className="space-y-2">
                              {selectedDay.log.completed_ids && selectedDay.log.completed_ids.length > 0 ? (
                                selectedDay.log.completed_ids.map((id: number) => {
                                  const cmd = COMMANDMENTS.find(c => c.id === id);
                                  return (
                                    <div key={id} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">
                                      <CheckCircle2 size={14} className="text-emerald-500" />
                                      {cmd?.shortTitle}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-sm text-slate-400 italic">No commandments logged for this day.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400 italic">
                          No data logged for this day.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="mt-8">
                  <h3 className="font-bold text-slate-800 mb-4">Recent Logs</h3>
                  <div className="space-y-3">
                    {history.slice(0, 5).map(log => (
                      <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CalendarIcon size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                            <div className="text-xs text-slate-500">Daily Log</div>
                          </div>
                        </div>
                        <div className="font-black text-emerald-600">+{log.score} XP</div>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <div className="text-center text-slate-500 py-4">No history yet. Submit your first day!</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI COACH TAB */}
            {activeTab === 'coach' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[600px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl">🩺</div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dr. Pal AI Coach</h2>
                    <p className="text-sm text-slate-500">Ask me anything about your health journey!</p>
                  </div>
                </div>
                
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                        <p>"Your gut feeling is telling you to start a conversation. Go ahead!"</p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                          <div className="markdown-body">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleChat} className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask Dr. Pal..."
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button type="submit" disabled={isChatLoading} className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors">
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* REALITY CHECK TAB */}
            {activeTab === 'reality' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl">🔍</div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">The 90-Day Reality Check</h2>
                    <p className="text-sm text-slate-500">Numbers don't lie, even if your stretchy pants do!</p>
                  </div>
                </div>

                <form onSubmit={handleRealityCheck} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Weight (kg)</label>
                      <input 
                        type="number" step="0.1"
                        value={realityStats.weight}
                        onChange={(e) => setRealityStats({...realityStats, weight: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="e.g. 75.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Waist Circumference (cm)</label>
                      <input 
                        type="number"
                        value={realityStats.waist}
                        onChange={(e) => setRealityStats({...realityStats, waist: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="e.g. 88"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Blood Pressure (Systolic)</label>
                      <input 
                        type="number"
                        value={realityStats.bp_sys}
                        onChange={(e) => setRealityStats({...realityStats, bp_sys: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="e.g. 120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Blood Pressure (Diastolic)</label>
                      <input 
                        type="number"
                        value={realityStats.bp_dia}
                        onChange={(e) => setRealityStats({...realityStats, bp_dia: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="e.g. 80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fasting Glucose (mg/dL)</label>
                      <input 
                        type="number"
                        value={realityStats.glucose}
                        onChange={(e) => setRealityStats({...realityStats, glucose: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="e.g. 95"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-200">
                      Lock In Reality Check
                    </button>
                    {user.last_reality_check && (
                      <p className="text-center text-xs text-slate-400 mt-4">Last checked on: {user.last_reality_check}</p>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {/* COMMUNITY FAILS TAB */}
            {activeTab === 'fails' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl">🤦‍♂️</div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Funny Fail Feed</h2>
                    <p className="text-sm text-slate-500">Shared struggles make the journey easier!</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
                  <textarea 
                    value={failInput}
                    onChange={(e) => setFailInput(e.target.value)}
                    placeholder="Share your health fail... (e.g. 'I accidentally ate a whole pizza while watching Dr. Pal')"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none h-24 resize-none mb-4"
                  />
                  <button onClick={handlePostFail} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl transition-colors">
                    Post My Fail
                  </button>
                </div>

                <div className="space-y-4">
                  {fails.map(fail => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={fail.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {fail.user_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{fail.user_name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(fail.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-slate-600 text-sm italic">"{fail.content}"</p>
                    </motion.div>
                  ))}
                  {fails.length === 0 && (
                    <div className="text-center py-12 text-slate-400 italic">No fails yet. Everyone is being too perfect!</div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
