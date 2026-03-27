import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Leaf, Map, FileText, ShoppingCart, 
  Smartphone, Monitor, Plus, ShieldCheck, 
  MapPin, Home, User, Clock, CheckCircle,
  Sparkles, MessageSquare, Loader2, Send,
  Store, CloudSun, Radio, ClipboardList, Menu, 
  MessageCircle, CheckSquare, Globe, Activity, TrendingUp, Search, ArrowLeft,
  RefreshCw, X
} from 'lucide-react';

// --- INITIAL MOCK DATA EXTENDED ---
const initialFarmers = [
  { id: 1, name: "Somchai Prasert", phone: "+66 81 234 5678", location: "Chiang Mai, Thailand", family: [{ name: "Somsri", relation: "Spouse" }], certifications: ["Organic Standard"] },
  { id: 2, name: "Arunee Sae-lee", phone: "+66 89 876 5432", location: "Chiang Rai, Thailand", family: [], certifications: ["Fair Trade"] }
];

const initialFields = [
  { id: 1, farmerId: 1, name: "North Valley Plot", crop: "Arabica Coffee", area: "15 Rai", polygon: "20,10 80,15 90,80 10,75", eudrStatus: 'unchecked' },
  { id: 2, farmerId: 1, name: "River Side", crop: "Rubber", area: "5 Rai", polygon: "10,20 40,10 50,60 20,80", eudrStatus: 'compliant' }
];

const initialQuotas = [
  { id: 1, farmerId: 1, stakeholderId: 1, crop: "Arabica Coffee", totalAmount: 5000, unit: "kg", usedAmount: 1500 },
  { id: 2, farmerId: 1, stakeholderId: 2, crop: "Arabica Coffee", totalAmount: 2000, unit: "kg", usedAmount: 800 },
  { id: 3, farmerId: 1, stakeholderId: 3, crop: "Rubber", totalAmount: 10000, unit: "kg", usedAmount: 0 }
];

const initialTransactions = [
  { id: 1, farmerId: 1, stakeholderId: 1, date: "2026-02-15", amount: 1500, unit: "kg" },
  { id: 2, farmerId: 1, stakeholderId: 2, date: "2026-02-28", amount: 800, unit: "kg" }
];

// New Mock Data for advanced features
const initialConnections = [
  { farmerId: 1, stakeholderId: 1, status: 'connected' },
  { farmerId: 1, stakeholderId: 2, status: 'connected' },
  { farmerId: 1, stakeholderId: 3, status: 'pending' },
  { farmerId: 2, stakeholderId: 1, status: 'connected' }
];

// Helper map for buyer names
const buyerNames = {
  1: "Acme Buyers Co.",
  2: "Global Roast Inc.",
  3: "Thai Rubber Syndicate"
};

const initialMessages = [
  { id: 1, senderId: 's_1', receiverId: 'f_1', text: 'Hello Khun Somchai, how is the harvest looking?', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
  { id: 2, senderId: 'f_1', receiverId: 's_1', text: 'Looking good! We expect to start harvesting next week.', timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
];

const initialAnnouncements = [
  { id: 1, stakeholderId: 1, title: 'Upcoming Quality Inspection', content: 'Our agronomists will be visiting fields in the northern region next month. Please ensure records are updated.', date: '2026-03-01' }
];

const initialSurveys = [
  { id: 1, stakeholderId: 1, title: 'Q2 Crop Yield Estimation', question: 'What is your estimated total yield (in kg) for the upcoming harvest?' }
];

const initialSurveyResponses = []; // { surveyId, farmerId, answer, date }

const marketItems = [
  { id: 1, name: 'Urea Fertilizer 46-0-0', type: 'Product', provider: 'AgriSupply Co.', distance: '2.5 km', price: '฿850/sack' },
  { id: 2, name: 'Drone Spraying Service', type: 'Service', provider: 'SkyFarm Tech', distance: '5.0 km', price: '฿120/Rai' },
  { id: 3, name: 'Harvester Rental', type: 'Machinery', provider: 'Local Co-op', distance: '12.0 km', price: '฿800/Rai' },
];

// --- GEMINI API HELPER ---
async function fetchGemini(prompt) {
  const apiKey = ""; 
  if (!apiKey) return "API Key is not configured. This is a simulated response for preview purposes.";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  let retries = 0;
  const delays = [1000, 2000, 4000, 8000, 16000];

  while (retries < 5) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (retries === 4) return `Error generating content: ${error.message}`;
      await new Promise(res => setTimeout(res, delays[retries]));
      retries++;
    }
  }
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [viewMode, setViewMode] = useState('stakeholder'); 
  
  // Shared Global State
  const [farmers, setFarmers] = useState(initialFarmers);
  const [fields, setFields] = useState(initialFields);
  const [quotas, setQuotas] = useState(initialQuotas);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [messages, setMessages] = useState(initialMessages);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [surveys, setSurveys] = useState(initialSurveys);
  const [surveyResponses, setSurveyResponses] = useState(initialSurveyResponses);
  const [connections, setConnections] = useState(initialConnections);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
      `}} />
      <div className="min-h-screen bg-[#F4F5F7] font-inter text-[#00222B] flex flex-col">
        {/* Top App Switcher - Farmforce Connect Theme */}
        <div className="bg-[#00222B] text-white p-3 sm:p-4 shadow-md z-20 flex flex-col sm:flex-row justify-between items-center border-b border-[#003B40] gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className="bg-[#FFC107] p-1.5 rounded-lg">
              <Leaf className="h-5 w-5 text-[#00222B]" />
            </div>
            <span className="text-xl font-bold tracking-wide">Farmforce<span className="font-medium opacity-80 ml-1">Connect</span></span>
          </div>
          <div className="flex space-x-2 bg-[#003B40] rounded-full p-1 border border-[#00505E] w-full sm:w-auto justify-center">
            <button 
              onClick={() => setViewMode('stakeholder')}
              className={`flex-1 sm:flex-none flex justify-center items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${viewMode === 'stakeholder' ? 'bg-[#FFC107] text-[#00222B] shadow-sm' : 'text-gray-300 hover:bg-[#00222B]'}`}
            >
              <Monitor className="w-4 h-4 mr-2" /> Web (Buyer)
            </button>
            <button 
              onClick={() => setViewMode('farmer')}
              className={`flex-1 sm:flex-none flex justify-center items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${viewMode === 'farmer' ? 'bg-[#FFC107] text-[#00222B] shadow-sm' : 'text-gray-300 hover:bg-[#00222B]'}`}
            >
              <Smartphone className="w-4 h-4 mr-2" /> Mobile (Farmer)
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'stakeholder' ? (
            <StakeholderPortal 
              farmers={farmers} fields={fields} quotas={quotas} transactions={transactions}
              messages={messages} announcements={announcements} surveys={surveys} surveyResponses={surveyResponses}
              connections={connections}
              setFarmers={setFarmers} setQuotas={setQuotas} setMessages={setMessages} 
              setAnnouncements={setAnnouncements} setSurveys={setSurveys}
            />
          ) : (
            <FarmerApp 
              farmers={farmers} fields={fields} quotas={quotas} transactions={transactions}
              messages={messages} announcements={announcements} surveys={surveys} surveyResponses={surveyResponses}
              connections={connections} marketItems={marketItems}
              setFields={setFields} setTransactions={setTransactions} setQuotas={setQuotas} 
              setMessages={setMessages} setSurveyResponses={setSurveyResponses} setConnections={setConnections}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ==========================================
// STAKEHOLDER WEB PORTAL (DESKTOP)
// ==========================================
function StakeholderPortal({ farmers, fields, quotas, transactions, messages, announcements, surveys, surveyResponses, connections, setFarmers, setQuotas, setMessages, setAnnouncements, setSurveys }) {
  const stakeholderId = 1; // Mock current user
  const [activeNav, setActiveNav] = useState('dashboard'); // dashboard, chat, broadcasts, surveys
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || null);
  const [farmerSearchQuery, setFarmerSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  
  // Dashboard State
  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId);
  const farmerFields = fields.filter(f => f.farmerId === selectedFarmerId);
  const farmerQuotas = quotas.filter(q => q.farmerId === selectedFarmerId);
  const farmerTransactions = transactions.filter(t => t.farmerId === selectedFarmerId);
  
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [newQuota, setNewQuota] = useState({ crop: '', amount: '' });
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [insightsText, setInsightsText] = useState("");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const chatMessages = messages.filter(m => (m.senderId === `s_${stakeholderId}` && m.receiverId === `f_${selectedFarmerId}`) || (m.senderId === `f_${selectedFarmerId}` && m.receiverId === `s_${stakeholderId}`));

  // Broadcast State
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  // Survey State
  const [newSurvey, setNewSurvey] = useState({ title: '', question: '' });

  // Handlers
  const generateFarmerInsights = async () => {
    setShowInsightsModal(true);
    setIsGeneratingInsights(true);
    const prompt = `You are an AI assistant. Generate a brief summary for a stakeholder reviewing a farmer.
    Farmer: ${selectedFarmer.name}, Location: ${selectedFarmer.location}, Crops: ${farmerFields.map(f => f.crop).join(', ')}
    Provide 2-sentence performance summary and a short, polite draft message to check in.`;
    const response = await fetchGemini(prompt);
    setInsightsText(response);
    setIsGeneratingInsights(false);
  };

  const handleAssignQuota = () => {
    if (!newQuota.crop || !newQuota.amount) return;
    setQuotas([...quotas, { id: Date.now(), farmerId: selectedFarmerId, stakeholderId, crop: newQuota.crop, totalAmount: parseInt(newQuota.amount), unit: 'kg', usedAmount: 0 }]);
    setShowQuotaModal(false); setNewQuota({ crop: '', amount: '' });
  };

  const handleAssignCert = () => {
    const certName = prompt("Enter certification name:");
    if (certName) {
      setFarmers(farmers.map(f => f.id === selectedFarmerId ? { ...f, certifications: [...f.certifications, certName] } : f));
    }
  };

  const handleSendMessage = () => {
    if(!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now(), senderId: `s_${stakeholderId}`, receiverId: `f_${selectedFarmerId}`, text: chatInput, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatInput("");
  };

  const handleSendBroadcast = () => {
    if(!newAnnouncement.title || !newAnnouncement.content) return;
    setAnnouncements([{ id: Date.now(), stakeholderId, title: newAnnouncement.title, content: newAnnouncement.content, date: new Date().toISOString().split('T')[0] }, ...announcements]);
    setNewAnnouncement({ title: '', content: '' });
  };

  const handleCreateSurvey = () => {
    if(!newSurvey.title || !newSurvey.question) return;
    setSurveys([{ id: Date.now(), stakeholderId, title: newSurvey.title, question: newSurvey.question }, ...surveys]);
    setNewSurvey({ title: '', question: '' });
  };

  const handleNavClick = (nav) => {
    setActiveNav(nav);
    setIsSidebarOpen(false);
  };

  const handleFarmerSelect = (id) => {
    setSelectedFarmerId(id);
    setActiveNav(activeNav === 'dashboard' || activeNav === 'chat' ? activeNav : 'dashboard');
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if(activeNav === 'chat' && chatEndRef.current) chatEndRef.current.scrollIntoView();
  }, [chatMessages, activeNav]);

  return (
    <div className="flex w-full h-full bg-[#F4F5F7] overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-[#00222B]/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Deep Teal Panel */}
      <div className={`w-64 bg-[#00222B] text-white flex flex-col z-30 shadow-2xl md:shadow-lg absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out`}>
        <div className="p-6 border-b border-[#003B40] flex justify-between items-center">
          <div>
            <h2 className="text-xs uppercase font-bold text-[#FFC107] tracking-widest">Acme Buyers Co.</h2>
            <p className="font-semibold text-white mt-1">Stakeholder Portal</p>
          </div>
          <button className="md:hidden p-1 text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <button onClick={() => handleNavClick('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeNav === 'dashboard' ? 'bg-[#003B40] text-white border-l-4 border-[#FFC107]' : 'text-gray-400 hover:bg-[#003B40] hover:text-white border-l-4 border-transparent'}`}><Activity className="w-4 h-4 mr-3" /> Dashboard</button>
          <button onClick={() => handleNavClick('chat')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeNav === 'chat' ? 'bg-[#003B40] text-white border-l-4 border-[#FFC107]' : 'text-gray-400 hover:bg-[#003B40] hover:text-white border-l-4 border-transparent'}`}><MessageCircle className="w-4 h-4 mr-3" /> Direct Chat</button>
          <button onClick={() => handleNavClick('broadcasts')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeNav === 'broadcasts' ? 'bg-[#003B40] text-white border-l-4 border-[#FFC107]' : 'text-gray-400 hover:bg-[#003B40] hover:text-white border-l-4 border-transparent'}`}><Radio className="w-4 h-4 mr-3" /> Broadcasts</button>
          <button onClick={() => handleNavClick('surveys')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeNav === 'surveys' ? 'bg-[#003B40] text-white border-l-4 border-[#FFC107]' : 'text-gray-400 hover:bg-[#003B40] hover:text-white border-l-4 border-transparent'}`}><ClipboardList className="w-4 h-4 mr-3" /> Surveys</button>
          
          <div className="pt-8 pb-3">
            <div className="text-xs font-bold text-[#FFC107] uppercase px-4 mb-3 tracking-widest">Linked Farmers ({farmers.length})</div>
            <div className="px-4 mb-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search farmers..." 
                  value={farmerSearchQuery}
                  onChange={(e) => setFarmerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#003B40] border border-[#00505E] text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FFC107]"
                />
              </div>
            </div>
          </div>
          {farmers.filter(f => f.name.toLowerCase().includes(farmerSearchQuery.toLowerCase())).map(f => (
            <button key={f.id} onClick={() => handleFarmerSelect(f.id)}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors ${selectedFarmerId === f.id ? 'bg-[#003B40] text-white font-semibold' : 'text-gray-400 hover:bg-[#003B40] hover:text-white'}`}
            >
              <User className="w-4 h-4 mr-3 opacity-60" /> {f.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative w-full">
        
        {/* Mobile Header for Sidebar Toggle */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white p-3.5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#E6F0F1] rounded-lg text-[#003B40]">
              <Menu className="w-5 h-5" />
            </button>
            <span className="ml-3 font-bold text-[#00222B] text-lg capitalize">{activeNav}</span>
          </div>
          {selectedFarmer && (activeNav === 'dashboard' || activeNav === 'chat') && (
             <div className="text-xs font-bold bg-[#FFC107]/20 text-[#003B40] px-3 py-1.5 rounded-full">
               {selectedFarmer.name.split(' ')[0]}
             </div>
          )}
        </div>
        
        {/* VIEW: DASHBOARD */}
        {activeNav === 'dashboard' && selectedFarmer && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
            {/* Header section */}
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#00222B]">{selectedFarmer.name}</h1>
                <p className="text-gray-500 flex items-center mt-2 font-medium text-sm sm:text-base"><MapPin className="w-4 h-4 mr-1 text-[#003B40]" /> {selectedFarmer.location} <span className="mx-2">•</span> {selectedFarmer.phone}</p>
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                  {selectedFarmer.certifications.map((cert, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E6F0F1] text-[#003B40] border border-[#00505E]/20">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> {cert}
                    </span>
                  ))}
                  <button onClick={handleAssignCert} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#003B40] hover:bg-gray-50 border border-gray-300 transition-colors">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Assign Cert
                  </button>
                  <button onClick={generateFarmerInsights} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFC107]/10 text-[#003B40] hover:bg-[#FFC107]/20 border border-[#FFC107]/50 shadow-sm transition-colors cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#F5A623]" /> ✨ AI Insights
                  </button>
                </div>
              </div>
              <button onClick={() => setShowQuotaModal(true)} className="w-full md:w-auto bg-[#FFC107] hover:bg-[#F5A623] text-[#00222B] px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" /> Assign Quota
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Fields Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-[#00222B] mb-5 flex items-center"><Map className="w-5 h-5 mr-2 text-[#003B40]" /> Registered Fields & Polygons</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {farmerFields.map(field => (
                      <div key={field.id} className="border border-gray-200 rounded-xl p-5 bg-[#F8F9FA]">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-[#00222B]">{field.name}</h4>
                          <span className="text-xs bg-white border border-gray-200 text-[#003B40] px-2.5 py-1 rounded-md font-semibold">{field.area}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4 text-sm">
                          <span className="text-gray-600 font-medium">Crop: <span className="font-bold text-[#003B40]">{field.crop}</span></span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${field.eudrStatus === 'compliant' ? 'bg-[#E6F4EA] text-[#137333]' : field.eudrStatus === 'unchecked' ? 'bg-gray-200 text-gray-600' : 'bg-[#FCE8E6] text-[#C5221F]'}`}>
                            {field.eudrStatus === 'compliant' ? 'EUDR Pass' : field.eudrStatus === 'unchecked' ? 'EUDR Unchecked' : 'EUDR Fail'}
                          </span>
                        </div>
                        {/* Farmforce styled map polygon */}
                        <div className="w-full h-32 bg-white rounded-lg border border-gray-200 relative overflow-hidden flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full opacity-90">
                            <polygon points={field.polygon} fill="#E6F0F1" stroke="#003B40" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                          <span className="absolute bottom-2 right-2 text-[10px] text-[#003B40] bg-white/90 font-medium px-1.5 py-0.5 rounded shadow-sm">GPS Data</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transactions Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-[#00222B] mb-5 flex items-center"><FileText className="w-5 h-5 mr-2 text-[#003B40]" /> Recent Transactions</h3>
                  <div className="overflow-x-auto pb-2 custom-scrollbar">
                    <table className="min-w-full text-sm text-left whitespace-nowrap">
                      <thead className="text-xs text-gray-500 uppercase bg-[#F8F9FA] border-b border-gray-200">
                        <tr><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Crop</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Status</th></tr>
                      </thead>
                      <tbody>
                        {farmerTransactions.map(t => (
                          <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-600">{t.date}</td>
                            <td className="px-4 py-3 font-medium text-[#003B40]">{farmerQuotas.find(q=>q.farmerId === t.farmerId)?.crop || 'Unknown'}</td>
                            <td className="px-4 py-3 font-bold text-[#00222B]">{t.amount} {t.unit}</td>
                            <td className="px-4 py-3"><span className="text-[#137333] flex items-center text-xs font-bold"><CheckCircle className="w-3.5 h-3.5 mr-1.5"/> Completed</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Quotas */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-[#00222B] mb-5 flex items-center"><ShoppingCart className="w-5 h-5 mr-2 text-[#003B40]" /> Active Quotas</h3>
                  <div className="space-y-4">
                    {farmerQuotas.map(q => {
                      const remaining = q.totalAmount - q.usedAmount;
                      const percentage = (q.usedAmount / q.totalAmount) * 100;
                      return (
                        <div key={q.id} className="p-4 border border-[#E6F0F1] bg-[#F8F9FA] rounded-xl">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-[#00222B]">{q.crop}</span>
                            <span className="text-xs font-bold text-[#003B40] bg-[#E6F0F1] px-2 py-1 rounded">{remaining} {q.unit} left</span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium mb-3">Total: {q.totalAmount} {q.unit} <span className="mx-1">•</span> Used: {q.usedAmount} {q.unit}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#003B40] h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Family */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-[#00222B] mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-[#003B40]" /> Household Profile</h3>
                  <ul className="space-y-3">
                    {selectedFarmer.family.map((member, i) => (
                      <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <span className="font-semibold text-[#00222B]">{member.name}</span>
                        <span className="text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium">{member.relation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CHAT */}
        {activeNav === 'chat' && (
          <div className="h-[calc(100vh-140px)] md:h-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col animate-in fade-in">
            <div className="p-4 border-b border-gray-100 flex items-center bg-[#F8F9FA] rounded-t-xl">
              <User className="w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-2.5 bg-[#E6F0F1] text-[#003B40] rounded-full mr-3 sm:mr-4" />
              <div>
                <h2 className="font-bold text-base sm:text-lg text-[#00222B]">{selectedFarmer.name}</h2>
                <p className="text-xs text-[#137333] font-semibold flex items-center mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#137333] mr-1.5"></span> Connected • {selectedFarmer.phone}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {chatMessages.length === 0 && <div className="text-center text-gray-400 font-medium mt-10">Start a conversation with {selectedFarmer.name}</div>}
              {chatMessages.map(m => {
                const isMe = m.senderId === `s_${stakeholderId}`;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm font-medium leading-snug ${isMe ? 'bg-[#003B40] text-white rounded-br-sm shadow-sm' : 'bg-white border border-gray-200 text-[#00222B] rounded-bl-sm shadow-sm'}`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-1.5 mx-1">{m.timestamp}</span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 sm:p-4 bg-white border-t border-gray-100 rounded-b-xl flex items-center">
              <input type="text" value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 bg-gray-100 border-none rounded-full px-4 sm:px-5 py-3 focus:ring-2 focus:ring-[#003B40] outline-none text-sm font-medium" />
              <button onClick={handleSendMessage} className="ml-2 sm:ml-3 w-12 h-12 flex-shrink-0 bg-[#FFC107] hover:bg-[#F5A623] text-[#00222B] rounded-full flex items-center justify-center transition shadow-sm"><Send className="w-5 h-5 ml-0.5" /></button>
            </div>
          </div>
        )}

        {/* VIEW: BROADCASTS */}
        {activeNav === 'broadcasts' && (
          <div className="max-w-4xl mx-auto animate-in fade-in space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-[#00222B] mb-6 flex items-center"><Radio className="w-6 h-6 mr-3 text-[#003B40]"/> Send Broadcast Announcement</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Announcement Title" value={newAnnouncement.title} onChange={e=>setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-[#003B40] outline-none font-medium text-sm sm:text-base" />
                <textarea placeholder="Message content..." value={newAnnouncement.content} onChange={e=>setNewAnnouncement({...newAnnouncement, content: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3.5 h-32 focus:ring-2 focus:ring-[#003B40] outline-none resize-none font-medium text-sm sm:text-base"></textarea>
                <div className="flex justify-end pt-2">
                  <button onClick={handleSendBroadcast} className="w-full sm:w-auto bg-[#FFC107] hover:bg-[#F5A623] text-[#00222B] px-8 py-3 rounded-full font-bold shadow-sm transition flex items-center justify-center"><Send className="w-4 h-4 mr-2"/> Send to All Farmers</button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-[#003B40] uppercase tracking-wide text-xs sm:text-sm">Past Broadcasts</h3>
              {announcements.map(a => (
                <div key={a.id} className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2 sm:gap-0">
                    <h4 className="font-bold text-[#00222B] text-base sm:text-lg">{a.title}</h4>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">{a.date}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SURVEYS */}
        {activeNav === 'surveys' && (
          <div className="max-w-4xl mx-auto animate-in fade-in space-y-6">
             <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-[#00222B] mb-6 flex items-center"><ClipboardList className="w-6 h-6 mr-3 text-[#003B40]"/> Create New Survey</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Survey Title" value={newSurvey.title} onChange={e=>setNewSurvey({...newSurvey, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-[#003B40] outline-none font-medium text-sm sm:text-base" />
                <input type="text" placeholder="Primary Question (e.g., Estimated yield?)" value={newSurvey.question} onChange={e=>setNewSurvey({...newSurvey, question: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-[#003B40] outline-none font-medium text-sm sm:text-base" />
                <div className="flex justify-end pt-2">
                  <button onClick={handleCreateSurvey} className="w-full sm:w-auto bg-[#FFC107] hover:bg-[#F5A623] text-[#00222B] px-8 py-3 rounded-full font-bold shadow-sm transition flex items-center justify-center"><CheckSquare className="w-4 h-4 mr-2"/> Publish Survey</button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-[#003B40] uppercase tracking-wide text-xs sm:text-sm">Active Surveys & Responses</h3>
              {surveys.map(s => {
                const responses = surveyResponses.filter(r => r.surveyId === s.id);
                const totalFarmers = farmers.length;
                const completionRate = (responses.length / totalFarmers) * 100;
                return (
                  <div key={s.id} className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-5 gap-4 sm:gap-0">
                      <div><h4 className="font-bold text-[#00222B] text-base sm:text-lg">{s.title}</h4><p className="text-sm font-medium text-gray-500 mt-1">Q: {s.question}</p></div>
                      <div className="text-right bg-[#F8F9FA] px-4 py-2 rounded-lg border border-gray-100 self-start">
                        <div className="text-xl sm:text-2xl font-bold text-[#003B40]">{responses.length}/{totalFarmers}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Responses</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2"><div className="bg-[#003B40] h-2.5 rounded-full" style={{width: `${completionRate}%`}}></div></div>
                    {responses.length > 0 && (
                      <div className="mt-5 border-t border-gray-100 pt-5 text-sm">
                        <p className="font-bold text-[#00222B] mb-3">Individual Answers:</p>
                        {responses.map((r, i) => {
                          const f = farmers.find(farm=>farm.id === r.farmerId);
                          return <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-gray-600"><span className="font-medium">{f?.name || 'Unknown'}</span><span className="font-bold text-[#00222B] bg-[#E6F0F1] px-2 py-0.5 rounded">{r.answer}</span></div>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Modals for Dashboard */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-[#00222B]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-[#00222B]">Assign Purchase Quota</h3>
            <div className="space-y-4">
              <input type="text" value={newQuota.crop} onChange={e => setNewQuota({...newQuota, crop: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3.5 font-medium outline-none focus:border-[#003B40] focus:ring-1 focus:ring-[#003B40]" placeholder="Crop (e.g., Arabica Coffee)" />
              <input type="number" value={newQuota.amount} onChange={e => setNewQuota({...newQuota, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3.5 font-medium outline-none focus:border-[#003B40] focus:ring-1 focus:ring-[#003B40]" placeholder="Amount (kg)" />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button onClick={() => setShowQuotaModal(false)} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-full transition-colors">Cancel</button>
              <button onClick={handleAssignQuota} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-[#FFC107] text-[#00222B] font-bold rounded-full shadow-sm hover:bg-[#F5A623] transition-colors">Assign Quota</button>
            </div>
          </div>
        </div>
      )}

      {showInsightsModal && (
        <div className="fixed inset-0 bg-[#00222B]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <h3 className="text-xl sm:text-2xl font-bold mb-5 flex items-center text-[#00222B]"><Sparkles className="w-6 h-6 mr-3 text-[#F5A623]" /> AI Insights</h3>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F8F9FA] rounded-xl border border-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-medium text-gray-700">
              {isGeneratingInsights ? <div className="flex flex-col items-center justify-center h-32 text-[#003B40]"><Loader2 className="w-8 h-8 animate-spin mb-3" /><p>Analyzing agricultural data...</p></div> : insightsText}
            </div>
            <div className="mt-6 sm:mt-8 flex justify-end">
              <button onClick={() => setShowInsightsModal(false)} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-gray-200 text-[#00222B] font-bold rounded-full hover:bg-gray-300 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// FARMER MOBILE APP (SIMULATED PHONE VIEW)
// ==========================================
function FarmerApp({ farmers, fields, quotas, transactions, messages, announcements, surveys, surveyResponses, connections, marketItems, setFields, setTransactions, setQuotas, setMessages, setSurveyResponses, setConnections }) {
  const [activeTab, setActiveTab] = useState('home'); // home, fields, market, chat, menu, quotas, connections
  const myFarmerId = 1; 
  const me = farmers.find(f => f.id === myFarmerId);
  const myFields = fields.filter(f => f.farmerId === myFarmerId);
  const myQuotas = quotas.filter(q => q.farmerId === myFarmerId);
  const myConnections = connections.filter(c => c.farmerId === myFarmerId);
  
  // Pending Surveys
  const pendingSurveys = surveys.filter(s => !surveyResponses.find(r => r.surveyId === s.id && r.farmerId === myFarmerId));

  // Chat State
  const stakeholderIdToChat = 1; // Defaulting to the main buyer
  const [chatInput, setChatInput] = useState("");
  const myChatMessages = messages.filter(m => (m.senderId === `f_${myFarmerId}` && m.receiverId === `s_${stakeholderIdToChat}`) || (m.senderId === `s_${stakeholderIdToChat}` && m.receiverId === `f_${myFarmerId}`));
  const chatEndRef = useRef(null);

  // Survey Answering State
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [surveyAnswer, setSurveyAnswer] = useState("");

  // EUDR Checking state
  const [checkingFieldId, setCheckingFieldId] = useState(null);

  // AI Advisor State
  const [advisorQuery, setAdvisorQuery] = useState("");
  const [advisorMessages, setAdvisorMessages] = useState([
    { role: 'assistant', text: `Hello! I'm your Farmforce AI Advisor. I see you're currently growing ${myFields.map(f => f.crop).join(' and ')}. How can I help you manage your crops today?` }
  ]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const advisorEndRef = useRef(null);

  // Handlers
  const handleSendMessage = () => {
    if(!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now(), senderId: `f_${myFarmerId}`, receiverId: `s_${stakeholderIdToChat}`, text: chatInput, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatInput("");
  };

  const submitSurvey = () => {
    if(!surveyAnswer) return;
    setSurveyResponses([...surveyResponses, { surveyId: activeSurvey.id, farmerId: myFarmerId, answer: surveyAnswer, date: new Date().toISOString().split('T')[0] }]);
    setActiveSurvey(null);
    setSurveyAnswer("");
  };

  const handleEUDRCheck = (fieldId) => {
    setCheckingFieldId(fieldId);
    setTimeout(() => {
      setFields(fields.map(f => f.id === fieldId ? { ...f, eudrStatus: 'compliant' } : f));
      setCheckingFieldId(null);
    }, 2500);
  };

  useEffect(() => {
    if(activeTab === 'chat' && chatEndRef.current) chatEndRef.current.scrollIntoView();
  }, [myChatMessages, activeTab]);

  useEffect(() => {
    if(activeTab === 'advisor' && advisorEndRef.current) advisorEndRef.current.scrollIntoView();
  }, [advisorMessages, activeTab]);

  const handleAskAdvisor = async () => {
    if (!advisorQuery.trim()) return;

    const query = advisorQuery;
    setAdvisorQuery("");
    const newMessages = [...advisorMessages, { role: 'user', text: query }];
    setAdvisorMessages(newMessages);
    setIsAdvisorLoading(true);

    const prompt = `You are an expert AI agricultural advisor helping a farmer using the Farmforce application.
    The farmer currently grows: ${myFields.map(f => f.crop).join(', ')}.
    Farmer's Question: "${query}"
    Provide a concise, practical, and helpful answer (3-4 sentences maximum). Be friendly and encouraging.`;

    const response = await fetchGemini(prompt);
    
    setAdvisorMessages([...newMessages, { role: 'assistant', text: response }]);
    setIsAdvisorLoading(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200 py-6">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-[375px] h-[812px] bg-[#F4F5F7] rounded-[3rem] shadow-2xl border-[12px] border-[#00222B] relative overflow-hidden flex flex-col font-inter">
        
        {/* Status Bar Mock */}
        <div className="w-full h-7 bg-[#003B40] flex justify-between items-center px-6 text-[11px] text-white font-semibold z-20">
          <span>9:41</span><div className="flex space-x-1 items-center"><div className="w-3.5 h-3.5 bg-white rounded-full opacity-90"></div><div className="w-4.5 h-3.5 bg-white rounded-sm opacity-90"></div></div>
        </div>
        
        {/* Top Header - Connect Mobile Theme */}
        <div className="bg-[#003B40] text-white pt-5 pb-5 px-5 relative z-10 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Farmforce<span className="font-medium opacity-80 ml-1">Connect</span></h1>
            {/* Offline First Metric from PDF */}
            <div className="flex items-center bg-[#FFC107] text-[#00222B] px-2 py-1 rounded-full text-[10px] font-bold shadow-sm">
               <RefreshCw className="w-3 h-3 mr-1" /> 2 Unsynced
            </div>
          </div>
          <p className="text-[#E6F0F1] text-sm font-medium opacity-90">Hi {me.name.split(' ')[0]}</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="p-4 space-y-4 animate-in fade-in">
              {/* Weather Widget */}
              <div className="bg-[#00505E] rounded-xl p-5 text-white shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#E6F0F1] mb-1.5 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1"/> {me.location}</p>
                  <h3 className="text-3xl font-bold">32°C</h3>
                  <p className="text-sm font-medium mt-1">Partly Cloudy • Humidity 65%</p>
                </div>
                <CloudSun className="w-14 h-14 text-[#FFC107] opacity-90" />
              </div>

              {/* Pending Actions (Surveys) */}
              {pendingSurveys.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#003B40] uppercase tracking-wider mb-2.5 px-1">Tasks Required</h3>
                  {pendingSurveys.map(s => (
                    <div key={s.id} onClick={() => setActiveSurvey(s)} className="bg-white border border-[#FFC107] border-l-4 rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer mb-3">
                      <div className="flex items-center"><ClipboardList className="w-6 h-6 text-[#FFC107] mr-3"/><div><p className="font-bold text-[#00222B] text-sm">{s.title}</p><p className="text-xs text-gray-500 font-medium mt-0.5">Tap to complete survey</p></div></div>
                      <div className="bg-[#C5221F] text-white text-[10px] font-bold px-2 py-1 rounded-md animate-pulse">NEW</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Announcements */}
              <div>
                <h3 className="text-xs font-bold text-[#003B40] uppercase tracking-wider mb-2.5 px-1">Announcements</h3>
                {announcements.slice(0, 2).map(a => (
                  <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-3">
                    <div className="flex items-center text-[11px] text-[#003B40] mb-2 font-bold"><Radio className="w-3.5 h-3.5 mr-1"/> {a.date}</div>
                    <h4 className="font-bold text-[#00222B] text-sm mb-1.5">{a.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIELDS TAB (with EUDR) */}
          {activeTab === 'fields' && (
            <div className="p-4 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-2xl font-bold text-[#00222B]">My Fields</h2>
                <button className="bg-[#FFC107] text-[#00222B] p-2 rounded-full shadow-sm"><Plus size={20} strokeWidth={2.5}/></button>
              </div>
              {myFields.map(field => (
                <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-32 bg-[#F8F9FA] relative border-b border-gray-200 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80"><polygon points={field.polygon} fill="#E6F0F1" stroke="#003B40" strokeWidth="2" strokeLinejoin="round" /></svg>
                    <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-md text-[10px] font-bold text-[#003B40] shadow-sm flex items-center"><MapPin className="w-3.5 h-3.5 mr-1"/> Mapped</div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1.5"><h3 className="font-bold text-[#00222B] text-lg leading-tight">{field.name}</h3><span className="bg-[#F4F5F7] border border-gray-200 text-[#003B40] text-xs px-2.5 py-1 rounded-md font-bold">{field.area}</span></div>
                    <p className="text-gray-500 text-sm flex items-center mt-2 mb-5 font-medium"><Leaf className="w-4 h-4 mr-1.5 text-[#00505E]"/> Crop: <span className="font-bold text-[#00222B] ml-1">{field.crop}</span></p>
                    
                    {/* EUDR API Section */}
                    <div className="border-t border-gray-100 pt-4">
                      {field.eudrStatus === 'unchecked' && (
                        <button onClick={() => handleEUDRCheck(field.id)} className="w-full py-2.5 bg-white text-[#003B40] rounded-full text-sm font-bold border border-[#003B40] flex items-center justify-center shadow-sm"><Globe className="w-4 h-4 mr-2"/> Check EUDR Compliance</button>
                      )}
                      {checkingFieldId === field.id && (
                        <div className="w-full py-2.5 bg-[#F4F5F7] text-gray-600 rounded-full text-sm font-bold flex items-center justify-center border border-gray-200"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Checking GFW PRO Data...</div>
                      )}
                      {field.eudrStatus === 'compliant' && checkingFieldId !== field.id && (
                        <div className="w-full py-2.5 bg-[#E6F4EA] text-[#137333] rounded-full text-sm font-bold flex items-center justify-center border border-[#137333]/30"><CheckCircle className="w-4 h-4 mr-2"/> EUDR Compliant</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MARKET TAB */}
          {activeTab === 'market' && (
            <div className="p-4 space-y-4 animate-in fade-in">
              <h2 className="text-2xl font-bold text-[#00222B] px-1 mb-2">Local Market</h2>
              <div className="flex space-x-2 overflow-x-auto pb-2 px-1 hide-scrollbar">
                {['All', 'Products', 'Services', 'Machinery'].map(cat => <span key={cat} className="bg-white border border-gray-300 px-4 py-1.5 rounded-full text-xs font-bold text-[#003B40] whitespace-nowrap shadow-sm">{cat}</span>)}
              </div>
              <div className="space-y-3 mt-2">
                {marketItems.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center">
                    <div className="w-12 h-12 bg-[#E6F0F1] rounded-lg flex items-center justify-center mr-4">
                      {item.type === 'Product' ? <Leaf className="text-[#003B40]" /> : item.type === 'Service' ? <Activity className="text-[#00505E]" /> : <TrendingUp className="text-[#F5A623]" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#00222B] text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500 font-medium mb-1.5">{item.provider} • {item.distance}</p>
                      <p className="text-sm font-bold text-[#00505E]">{item.price}</p>
                    </div>
                    <button className="bg-[#F4F5F7] p-2.5 rounded-full text-[#003B40] border border-gray-200 font-bold"><Plus size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="h-[calc(100vh-140px)] flex flex-col bg-[#F4F5F7] animate-in fade-in">
              <div className="bg-white p-4 border-b border-gray-200 flex items-center sticky top-0 z-10 shadow-sm">
                <div className="w-10 h-10 bg-[#E6F0F1] text-[#003B40] rounded-full flex items-center justify-center mr-3 font-bold"><Store size={18}/></div>
                <div><p className="font-bold text-[15px] text-[#00222B]">Acme Buyers Co.</p><p className="text-[11px] font-bold text-[#137333] flex items-center mt-0.5"><span className="w-1.5 h-1.5 bg-[#137333] rounded-full mr-1.5"></span> Online</p></div>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-6 custom-scrollbar">
                {myChatMessages.map(m => {
                  const isMe = m.senderId === `f_${myFarmerId}`;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm font-medium leading-snug ${isMe ? 'bg-[#003B40] text-white rounded-br-sm shadow-sm' : 'bg-white border border-gray-200 text-[#00222B] rounded-bl-sm shadow-sm'}`}>{m.text}</div>
                      <span className="text-[10px] font-bold text-gray-400 mt-1.5 mx-1">{m.timestamp}</span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 bg-white border-t border-gray-200 flex items-center sticky bottom-0 z-10 shadow-lg">
                <input type="text" value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder="Message buyer..." className="flex-1 bg-[#F8F9FA] border border-gray-300 rounded-full px-4 py-2.5 outline-none text-sm font-medium focus:border-[#003B40]" />
                <button onClick={handleSendMessage} className="ml-2.5 w-10 h-10 bg-[#FFC107] text-[#00222B] rounded-full flex items-center justify-center shadow-sm"><Send className="w-4 h-4 ml-0.5" /></button>
              </div>
            </div>
          )}

          {/* MENU / MORE TAB */}
          {activeTab === 'menu' && (
            <div className="p-4 space-y-4 animate-in fade-in">
              <h2 className="text-2xl font-bold text-[#00222B] px-1 mb-3">More Options</h2>
              
              {/* Profile Block */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center mb-5">
                <div className="w-14 h-14 bg-[#003B40] text-white rounded-full flex items-center justify-center mr-4 shadow-inner"><User size={28} /></div>
                <div><h3 className="font-bold text-lg text-[#00222B]">{me.name}</h3><p className="text-xs font-bold text-[#00505E] mt-0.5 uppercase tracking-wide">View Profile</p></div>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div onClick={() => setActiveTab('quotas')} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-[#E6F0F1] flex items-center justify-center mb-3">
                    <ShoppingCart className="text-[#003B40] w-5 h-5"/>
                  </div>
                  <span className="font-bold text-[#00222B] text-sm">Quotas</span>
                  <span className="text-[10px] font-medium text-gray-500 mt-0.5">Sales & targets</span>
                </div>
                <div onClick={() => setActiveTab('connections')} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-[#E6F0F1] flex items-center justify-center mb-3">
                    <Users className="text-[#003B40] w-5 h-5"/>
                  </div>
                  <span className="font-bold text-[#00222B] text-sm">Connections</span>
                  <span className="text-[10px] font-medium text-gray-500 mt-0.5">Manage buyers</span>
                </div>
                <div onClick={() => setActiveTab('advisor')} className="bg-[#00222B] p-5 rounded-xl shadow-md flex flex-col items-center justify-center text-center cursor-pointer col-span-2 active:scale-95 transition-transform">
                  <Sparkles className="text-[#FFC107] mb-2 w-6 h-6"/>
                  <span className="font-bold text-white text-sm">AI Crop Advisor</span>
                  <span className="text-[11px] font-medium text-gray-300 mt-0.5">Ask questions about your farm</span>
                </div>
              </div>
            </div>
          )}

          {/* QUOTAS TAB */}
          {activeTab === 'quotas' && (
            <div className="p-4 space-y-4 animate-in fade-in">
              <div className="flex items-center mb-5">
                <button onClick={() => setActiveTab('menu')} className="mr-3 p-2 bg-white rounded-full shadow-sm border border-gray-200"><ArrowLeft size={20} className="text-[#00222B]" /></button>
                <h2 className="text-2xl font-bold text-[#00222B]">My Quotas</h2>
              </div>
              
              {myQuotas.length === 0 ? (
                <p className="text-center text-gray-500 font-medium mt-10">No active quotas assigned.</p>
              ) : (
                <div className="space-y-4">
                  {myQuotas.map(q => {
                    const remaining = q.totalAmount - q.usedAmount;
                    const pct = (q.usedAmount / q.totalAmount) * 100;
                    return (
                      <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-[#00222B] text-lg">{q.crop}</h4>
                            <p className="text-xs font-semibold text-gray-500 mt-0.5">Buyer: <span className="text-[#003B40]">{buyerNames[q.stakeholderId] || `Buyer #${q.stakeholderId}`}</span></p>
                          </div>
                          <span className="bg-[#E6F0F1] text-[#003B40] text-xs px-2.5 py-1 rounded-md font-bold border border-[#00505E]/10">{remaining} {q.unit} left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 mt-5">
                          <div className="bg-[#003B40] h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          <span>Sold: {q.usedAmount}</span>
                          <span>Target: {q.totalAmount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CONNECTIONS TAB */}
          {activeTab === 'connections' && (
            <div className="p-4 space-y-4 animate-in fade-in">
              <div className="flex items-center mb-5">
                <button onClick={() => setActiveTab('menu')} className="mr-3 p-2 bg-white rounded-full shadow-sm border border-gray-200"><ArrowLeft size={20} className="text-[#00222B]" /></button>
                <h2 className="text-2xl font-bold text-[#00222B]">Connections</h2>
              </div>
              
              {myConnections.length === 0 ? (
                <p className="text-center text-gray-500 font-medium mt-10">No active connections.</p>
              ) : (
                <div className="space-y-3">
                  {myConnections.map(c => (
                    <div key={c.stakeholderId} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#E6F0F1] text-[#003B40] rounded-full flex items-center justify-center mr-3"><Store size={22}/></div>
                        <div>
                          <h4 className="font-bold text-[#00222B] text-sm">{buyerNames[c.stakeholderId] || `Buyer #${c.stakeholderId}`}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block ${c.status === 'connected' ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FFF3E0] text-[#E65100]'}`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('chat')} className="p-3 bg-[#F8F9FA] text-[#003B40] border border-gray-200 rounded-full shadow-sm"><MessageCircle size={18}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI ADVISOR TAB */}
          {activeTab === 'advisor' && (
            <div className="h-[calc(100vh-140px)] flex flex-col bg-[#F4F5F7] animate-in fade-in">
              <div className="bg-white p-4 border-b border-gray-200 flex items-center sticky top-0 z-10 shadow-sm">
                <button onClick={() => setActiveTab('menu')} className="mr-3 p-2 bg-gray-50 rounded-full shadow-sm border border-gray-200 hover:bg-gray-100"><ArrowLeft size={20} className="text-[#00222B]" /></button>
                <div className="w-10 h-10 bg-[#FFC107]/20 text-[#F5A623] rounded-full flex items-center justify-center mr-3 font-bold"><Sparkles size={18}/></div>
                <div>
                  <h2 className="font-bold text-[15px] text-[#00222B]">AI Crop Advisor</h2>
                  <p className="text-[11px] font-bold text-[#003B40] flex items-center mt-0.5">Farmforce Assistant</p>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-6 custom-scrollbar">
                {advisorMessages.map((m, idx) => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-medium leading-snug shadow-sm ${isUser ? 'bg-[#003B40] text-white rounded-br-sm' : 'bg-white border border-gray-200 text-[#00222B] rounded-bl-sm'}`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {isAdvisorLoading && (
                   <div className="flex flex-col items-start animate-pulse">
                     <div className="max-w-[85%] p-3.5 rounded-2xl text-sm font-bold bg-white border border-gray-200 text-[#00222B] rounded-bl-sm shadow-sm flex items-center">
                       <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#F5A623]" /> Processing...
                     </div>
                   </div>
                )}
                <div ref={advisorEndRef} />
              </div>
              <div className="p-3 bg-white border-t border-gray-200 flex items-center sticky bottom-0 z-10 shadow-lg">
                <input type="text" value={advisorQuery} onChange={(e)=>setAdvisorQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()} disabled={isAdvisorLoading} placeholder="Ask about your crops..." className="flex-1 bg-[#F8F9FA] border border-gray-300 rounded-full px-4 py-2.5 outline-none text-sm font-medium focus:border-[#003B40] disabled:opacity-50" />
                <button onClick={handleAskAdvisor} disabled={isAdvisorLoading || !advisorQuery.trim()} className="ml-2.5 w-10 h-10 bg-[#FFC107] text-[#00222B] rounded-full flex items-center justify-center shadow-sm disabled:opacity-50 transition-opacity"><Send className="w-4 h-4 ml-0.5" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Survey Modal Overlay */}
        {activeSurvey && (
          <div className="absolute inset-0 bg-[#00222B]/70 backdrop-blur-sm z-40 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-[2rem] p-7 shadow-2xl animate-in slide-in-from-bottom border-t border-gray-200">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-[#00222B]">{activeSurvey.title}</h3>
                <button onClick={()=>setActiveSurvey(null)} className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Close</button>
              </div>
              <div className="bg-[#F8F9FA] p-5 rounded-xl mb-6 border border-gray-200">
                <p className="font-bold text-[#00222B] text-sm mb-3">{activeSurvey.question}</p>
                <input type="text" value={surveyAnswer} onChange={e=>setSurveyAnswer(e.target.value)} placeholder="Type your answer here..." className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-sm font-medium focus:ring-2 focus:ring-[#003B40] outline-none" />
              </div>
              <button onClick={submitSurvey} className="w-full py-4 bg-[#FFC107] text-[#00222B] rounded-full font-bold text-sm shadow-sm flex items-center justify-center active:bg-[#F5A623] transition-colors"><CheckSquare className="w-5 h-5 mr-2"/> Submit Response</button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 w-full h-20 bg-white border-t border-gray-200 flex justify-around items-center px-1 pb-4 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-30">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 relative w-16 ${activeTab === 'home' ? 'text-[#003B40]' : 'text-gray-400'}`}>
            {activeTab === 'home' && <div className="absolute top-0 w-8 h-1 bg-[#003B40] rounded-b-full"></div>}
            <Home className="w-6 h-6 mb-1 mt-1" /><span className="text-[10px] font-bold">Home</span>
          </button>
          <button onClick={() => setActiveTab('fields')} className={`flex flex-col items-center p-2 relative w-16 ${activeTab === 'fields' ? 'text-[#003B40]' : 'text-gray-400'}`}>
            {activeTab === 'fields' && <div className="absolute top-0 w-8 h-1 bg-[#003B40] rounded-b-full"></div>}
            <Map className="w-6 h-6 mb-1 mt-1" /><span className="text-[10px] font-bold">Fields</span>
          </button>
          <button onClick={() => setActiveTab('market')} className={`flex flex-col items-center p-2 relative w-16 ${activeTab === 'market' ? 'text-[#003B40]' : 'text-gray-400'}`}>
            {activeTab === 'market' && <div className="absolute top-0 w-8 h-1 bg-[#003B40] rounded-b-full"></div>}
            <Store className="w-6 h-6 mb-1 mt-1" /><span className="text-[10px] font-bold">Market</span>
          </button>
          <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center p-2 relative w-16 ${activeTab === 'chat' ? 'text-[#003B40]' : 'text-gray-400'}`}>
            {activeTab === 'chat' && <div className="absolute top-0 w-8 h-1 bg-[#003B40] rounded-b-full"></div>}
            <MessageCircle className="w-6 h-6 mb-1 mt-1" />
            <span className="text-[10px] font-bold">Chat</span>
            <div className="absolute top-2 right-3 w-2.5 h-2.5 bg-[#C5221F] rounded-full border-2 border-white"></div>
          </button>
          <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center p-2 relative w-16 ${activeTab === 'menu' ? 'text-[#003B40]' : 'text-gray-400'}`}>
            {activeTab === 'menu' && <div className="absolute top-0 w-8 h-1 bg-[#003B40] rounded-b-full"></div>}
            <Menu className="w-6 h-6 mb-1 mt-1" /><span className="text-[10px] font-bold">More</span>
          </button>
        </div>
        <div className="absolute bottom-1 w-full flex justify-center z-30"><div className="w-36 h-1 bg-gray-400 rounded-full"></div></div>
      </div>
    </div>
  );
}
