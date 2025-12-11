import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Send, 
  Sparkles, 
  Download, 
  User, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Loader2,
  LayoutTemplate,
  Palette,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// --- Initial Mock Data ---
const initialResumeData = {
  personalInfo: {
    name: "李明",
    title: "应届毕业生 / 产品助理",
    email: "liming@example.com",
    phone: "138-0000-0000",
    location: "北京",
    website: "linkedin.com/in/liming"
  },
  // Default Order Configuration
  sectionOrder: ['summary', 'education', 'experience', 'skills'],
  
  summary: "具备扎实的计算机基础，热爱互联网产品。在校期间曾独立负责校园二手交易平台的产品设计，拥有良好的逻辑思维能力和数据分析意识。寻求一份产品经理助理的工作机会。",
  experience: [
    {
      id: 1,
      company: "某知名互联网大厂",
      role: "产品运营实习生",
      period: "2023.06 - 2023.09",
      description: "协助负责UGC社区的内容审核与推荐策略优化。\n通过分析用户点击数据，调整推荐算法权重，使内容点击率提升10%。\n撰写竞品分析报告，为新功能上线提供决策支持。"
    }
  ],
  education: [
    {
      id: 1,
      school: "北京科技大学",
      degree: "计算机科学与技术 学士",
      period: "2020.09 - 2024.06",
      notes: "GPA: 3.8/4.0 (专业前5%)\n主修课程：数据结构、操作系统、软件工程、人机交互\n荣誉奖项：2022年全国大学生数学建模竞赛一等奖、校级三好学生\n社团职务：校学生会科技部部长，组织过“黑客马拉松”大赛。"
    }
  ],
  skills: ["Axure RP", "XMind", "SQL", "Python (Pandas)", "Figma", "用户调研"]
};

// --- API Helpers ---
const callLLM = async (prompt, currentData, systemInstruction = "", apiKey, apiUrl, modelName = "deepseek-ai/DeepSeek-V3.2") => {
  // 构建更详细的 prompt
  const fullPrompt = `
    ${systemInstruction}
    \nCurrent Resume JSON Data:
    ${JSON.stringify(currentData)}
    \nUser Request: ${prompt}
    \nREQUIREMENTS:
    1. Analyze the request.
    2. If the user wants to update the resume, return a VALID JSON object matching the structure.
    3. IMPROVE the content based on professional resume standards.
    4. You can also reorder sections if the user asks (e.g. "put education first") by modifying the "sectionOrder" array in the JSON.
    \nRESPONSE FORMAT (Strict JSON):
    {
      "data": { ...updated resume object... },
      "analysis": "Brief explanation...",
      "suggestions": ["Suggestion 1", "Suggestion 2"]
    }
  `;

  const messages = [
    { role: "user", content: fullPrompt }
  ];

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName, // 使用用户自定义模型名
        messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });
    if (!response.ok) throw new Error("API call failed");
    const result = await response.json();
    // 兼容 OpenAI 格式
    const text = result.choices?.[0]?.message?.content || "";
    // 去除 markdown 代码块包裹
    const cleanText = text.replace(/^```json\s*|```$/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("LLM API Error:", error);
    throw error;
  }
};

// --- Components ---

const ResumePreview = ({ data, template }) => {
  const templateStyles = {
    modern: {
      container: "font-sans text-slate-800",
      header: "bg-slate-900 text-white p-8",
      name: "text-4xl font-bold mb-2",
      title: "text-xl text-slate-300 mb-4",
      sectionTitle: "text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 mb-4 pb-1 mt-6",
      meta: "flex flex-wrap gap-4 text-sm text-slate-400",
      expItem: "mb-6",
      expHeader: "flex justify-between items-baseline mb-1",
      expRole: "font-bold text-lg",
      expCompany: "font-medium text-slate-600",
      expDate: "text-sm text-slate-500 italic",
      desc: "text-sm leading-relaxed whitespace-pre-wrap text-slate-700",
      notes: "text-sm text-slate-500 mt-2 pl-4 border-l-2 border-slate-200 italic whitespace-pre-wrap"
    },
    classic: {
      container: "font-serif text-gray-900",
      header: "text-center border-b-2 border-gray-300 pb-6 mb-6 pt-6 px-6",
      name: "text-3xl font-bold mb-2 uppercase tracking-wide",
      title: "text-lg text-gray-600 italic mb-2",
      sectionTitle: "text-center text-lg font-bold uppercase text-gray-800 border-b border-gray-200 mb-4 pb-1 mt-6",
      meta: "flex justify-center flex-wrap gap-4 text-sm text-gray-600",
      expItem: "mb-5",
      expHeader: "flex justify-between items-baseline border-b border-dotted border-gray-300 pb-1 mb-2",
      expRole: "font-bold text-lg",
      expCompany: "font-semibold text-gray-700",
      expDate: "text-sm text-gray-600",
      desc: "text-sm leading-relaxed whitespace-pre-wrap text-gray-800",
      notes: "text-sm text-gray-600 mt-1 italic whitespace-pre-wrap"
    },
    minimal: {
      container: "font-sans text-neutral-800",
      header: "p-6 pb-0",
      name: "text-5xl font-thin tracking-tighter mb-2 text-indigo-600",
      title: "text-xl text-neutral-500 mb-6",
      sectionTitle: "text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4 mt-8",
      meta: "grid grid-cols-2 gap-2 text-sm text-neutral-500 mb-8 border-l-2 border-indigo-100 pl-4",
      expItem: "mb-8 relative pl-6 border-l border-neutral-200",
      expHeader: "mb-2",
      expRole: "font-bold text-lg text-neutral-800",
      expCompany: "text-indigo-600 font-medium",
      expDate: "text-xs text-neutral-400 block mb-1",
      desc: "text-sm leading-relaxed text-neutral-600",
      notes: "text-xs text-neutral-400 mt-2 whitespace-pre-wrap"
    }
  };

  const s = templateStyles[template] || templateStyles.modern;

  // Helper to render specific sections based on order
  const renderSectionContent = (sectionKey) => {
    switch(sectionKey) {
      case 'summary':
        return data.summary && (
          <div key="summary" className="mb-6">
            <h2 className={s.sectionTitle}>个人简介</h2>
            <p className={s.desc}>{data.summary}</p>
          </div>
        );
      case 'experience':
        return data.experience.length > 0 && (
          <div key="experience">
            <h2 className={s.sectionTitle}>工作经历</h2>
            {data.experience.map(exp => (
              <div key={exp.id} className={s.expItem}>
                <div className={s.expHeader}>
                  <div>
                    <div className={s.expRole}>{exp.role}</div>
                    <div className={s.expCompany}>{exp.company}</div>
                  </div>
                  <div className={s.expDate}>{exp.period}</div>
                </div>
                <p className={s.desc}>{exp.description}</p>
              </div>
            ))}
          </div>
        );
      case 'education':
        return data.education.length > 0 && (
          <div key="education">
            <h2 className={s.sectionTitle}>教育背景</h2>
            {data.education.map(edu => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-800">{edu.school}</span>
                  <span className="text-sm text-gray-500 italic">{edu.period}</span>
                </div>
                <div className="text-sm text-gray-600 font-medium">{edu.degree}</div>
                {edu.notes && (
                  <div className={s.notes}>{edu.notes}</div>
                )}
              </div>
            ))}
          </div>
        );
      case 'skills':
        return data.skills.length > 0 && (
          <div key="skills">
            <h2 className={s.sectionTitle}>技能专长</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="resume-preview" className={`bg-white shadow-2xl w-full mx-auto min-h-[1123px] max-w-[794px] overflow-hidden ${s.container}`}>
      {/* Header (Always Top) */}
      <div className={s.header}>
        <h1 className={s.name}>{data.personalInfo.name}</h1>
        <p className={s.title}>{data.personalInfo.title}</p>
        <div className={s.meta}>
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Dynamic Sections */}
        {(data.sectionOrder || ['summary', 'education', 'experience', 'skills']).map(key => renderSectionContent(key))}
      </div>
    </div>
  );
};

const ChatInterface = ({ onOptimize, isProcessing, chatHistory, setShowApiConfig }) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onOptimize(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI 简历优化助手
        </h3>
        <button
          onClick={() => setShowApiConfig(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold shadow-sm transition-all"
          title="设置大模型 API Key"
        >
          <Settings className="w-4 h-4" />
          设置大模型
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {chatHistory.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>我可以帮你润色经历、调整模块顺序、或者针对特定职位（JD）定制简历。</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => onOptimize("我是应届生，请把教育背景放在最前面")} className="text-xs bg-white border border-slate-200 px-3 py-2 rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-slate-600">
                🎓 调整顺序：教育背景优先
              </button>
              <button onClick={() => onOptimize("帮我优化一下教育背景里的‘荣誉奖项’描述")} className="text-xs bg-white border border-slate-200 px-3 py-2 rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-slate-600">
                ✨ 润色在校经历
              </button>
            </div>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
            }`}>
              {msg.role === 'ai' && <div className="text-xs font-bold text-indigo-500 mb-1">AI 建议</div>}
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              正在分析您的简历...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入指令..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            disabled={isProcessing}
            className={`p-2 rounded-lg text-white transition-colors ${isProcessing ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- API Key Config Modal ---
function ApiConfigModal({ show, onClose, apiKey, setApiKey, apiUrl, setApiUrl, modelName, setModelName }) {
  const [key, setKey] = useState(apiKey || "sk-bgeqblmourfwapodlkvlmlskxymdweztafwqgokhktmpigea");
  const [url, setUrl] = useState(apiUrl || "https://api.siliconflow.cn/v1/chat/completions");
  const [model, setModel] = useState(modelName || "deepseek-ai/DeepSeek-V3.2");

  useEffect(() => {
    setKey(apiKey || "sk-bgeqblmourfwapodlkvlmlskxymdweztafwqgokhktmpigea");
    setUrl(apiUrl || "https://api.siliconflow.cn/v1/chat/completions");
    setModel(modelName || "deepseek-ai/DeepSeek-V3.2");
  }, [apiKey, apiUrl, modelName, show]);

  const handleSave = () => {
    setApiKey(key);
    setApiUrl(url);
    setModelName(model);
    localStorage.setItem("resume_api_key", key);
    localStorage.setItem("resume_api_url", url);
    localStorage.setItem("resume_model_name", model);
    onClose();
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          LLM API Key 配置
        </h3>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">API Key</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-... 或 moonshot-... 或 azure-..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">API 地址</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.siliconflow.cn/v1/chat/completions"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">Model Name</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            type="text"
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="deepseek-ai/DeepSeek-V3.2 或 moonshot-v1 或 azure-model 等"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200">保存</button>
        </div>
        <div className="mt-4 text-xs text-slate-400">
          支持 OpenAI、Azure、Moonshot、智谱等兼容接口。Key、地址和模型名仅保存在本地浏览器。
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [activeTab, setActiveTab] = useState('editor'); // editor | chat
  const [template, setTemplate] = useState('modern');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [showJobModal, setShowJobModal] = useState(false);
  // 新增 API Key/API URL/Model Name 状态
  const [apiKey, setApiKey] = useState(localStorage.getItem("resume_api_key") || "sk-bgeqblmourfwapodlkvlmlskxymdweztafwqgokhktmpigea");
  const [apiUrl, setApiUrl] = useState(localStorage.getItem("resume_api_url") || "https://api.siliconflow.cn/v1/chat/completions");
  const [modelName, setModelName] = useState(localStorage.getItem("resume_model_name") || "deepseek-ai/DeepSeek-V3.2");
  const [showApiConfig, setShowApiConfig] = useState(false);

  // 每次弹窗关闭时自动同步最新 localStorage
  useEffect(() => {
    if (!showApiConfig) {
      setApiKey(localStorage.getItem("resume_api_key") || "sk-bgeqblmourfwapodlkvlmlskxymdweztafwqgokhktmpigea");
      setApiUrl(localStorage.getItem("resume_api_url") || "https://api.siliconflow.cn/v1/chat/completions");
      setModelName(localStorage.getItem("resume_model_name") || "deepseek-ai/DeepSeek-V3.2");
    }
  }, [showApiConfig]);

  // Handle AI Optimization Request
  const handleOptimize = async (promptText) => {
    if (!promptText) return;
    setChatHistory(prev => [...prev, { role: 'user', content: promptText }]);
    setIsProcessing(true);
    try {
      let context = "";
      if (jobDescription) {
        context = `The user is applying for this job description: \"${jobDescription}\". Tailor the resume keywords and tone to match.`;
      }
      const result = await callLLM(promptText, resumeData, context, apiKey, apiUrl, modelName);
      if (result.analysis) {
        setChatHistory(prev => [...prev, { role: 'ai', content: result.analysis }]);
      }
      if (result.data) {
        if (!result.data.sectionOrder) {
          result.data.sectionOrder = resumeData.sectionOrder || ['summary', 'education', 'experience', 'skills'];
        }
        setResumeData(result.data);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "抱歉，连接 LLM 服务时出现问题。请检查 API Key 或接口地址。" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualChange = (section, field, value, index = null) => {
    setResumeData(prev => {
      const newData = { ...prev };
      if (index !== null) {
        newData[section] = [...prev[section]];
        newData[section][index] = { ...newData[section][index], [field]: value };
      } else if (section === 'skills') {
        newData.skills = value.split(',').map(s => s.trim());
      } else if (typeof prev[section] === 'object' && !Array.isArray(prev[section])) {
        newData[section] = { ...prev[section], [field]: value };
      } else {
        newData[section] = value;
      }
      return newData;
    });
  };

  const addItem = (section) => {
    setResumeData(prev => {
      const newData = { ...prev };
      const newId = Date.now();
      if (section === 'experience') {
        newData.experience = [
          ...prev.experience, 
          { id: newId, company: "", role: "", period: "", description: "" }
        ];
      } else if (section === 'education') {
        newData.education = [
          ...prev.education,
          { id: newId, school: "", degree: "", period: "", notes: "" }
        ];
      }
      return newData;
    });
  };

  const deleteItem = (section, index) => {
    setResumeData(prev => {
      const newData = { ...prev };
      newData[section] = prev[section].filter((_, i) => i !== index);
      return newData;
    });
  };

  const moveSection = (index, direction) => {
    setResumeData(prev => {
      const newOrder = [...(prev.sectionOrder || ['summary', 'education', 'experience', 'skills'])];
      if (direction === 'up' && index > 0) {
        [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      return { ...prev, sectionOrder: newOrder };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Maps section keys to display names and icons for the editor
  const sectionConfig = {
    summary: { title: "个人简介", icon: <FileText className="w-4 h-4" /> },
    experience: { title: "工作经历", icon: <Briefcase className="w-4 h-4" /> },
    education: { title: "教育背景", icon: <GraduationCap className="w-4 h-4" /> },
    skills: { title: "技能专长", icon: <CheckCircle className="w-4 h-4" /> }
  };

  // Helper to render editor sections dynamically based on order
  const renderEditorSection = (key, index) => {
    const isFirst = index === 0;
    const isLast = index === (resumeData.sectionOrder?.length || 4) - 1;

    const headerControl = (
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          {sectionConfig[key].icon} {sectionConfig[key].title}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={() => moveSection(index, 'up')} 
            disabled={isFirst}
            className={`p-1 rounded hover:bg-slate-100 ${isFirst ? 'text-slate-200' : 'text-slate-500'}`}
            title="上移模块"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button 
            onClick={() => moveSection(index, 'down')} 
            disabled={isLast}
            className={`p-1 rounded hover:bg-slate-100 ${isLast ? 'text-slate-200' : 'text-slate-500'}`}
            title="下移模块"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );

    switch(key) {
      case 'summary':
        return (
          <section key={key} className="pb-6 border-b border-slate-100 last:border-0">
            {headerControl}
            <textarea 
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              value={resumeData.summary}
              onChange={(e) => handleManualChange('summary', null, e.target.value)}
            />
            <button 
              onClick={() => { setActiveTab('chat'); handleOptimize("请优化我的个人简介，使其更具吸引力"); }}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> 使用 AI 润色简介
            </button>
          </section>
        );
      case 'experience':
        return (
          <section key={key} className="pb-6 border-b border-slate-100 last:border-0">
            {headerControl}
            <div className="space-y-6">
              {resumeData.experience.map((exp, idx) => (
                <div key={exp.id} className="relative p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:border-indigo-300 transition-colors group">
                  <button 
                    onClick={() => deleteItem('experience', idx)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="删除此经历"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2 mb-2 pr-6">
                    <input 
                      placeholder="公司名称"
                      className="bg-white border border-slate-200 rounded p-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={exp.company}
                      onChange={(e) => handleManualChange('experience', 'company', e.target.value, idx)}
                    />
                      <input 
                      placeholder="职位"
                      className="bg-white border border-slate-200 rounded p-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={exp.role}
                      onChange={(e) => handleManualChange('experience', 'role', e.target.value, idx)}
                    />
                  </div>
                  <input 
                      placeholder="时间段 (如: 2021.06 - 至今)"
                      className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-500 mb-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={exp.period}
                      onChange={(e) => handleManualChange('experience', 'period', e.target.value, idx)}
                    />
                  <textarea 
                    placeholder="工作描述 (建议使用STAR法则描述)"
                    className="w-full h-24 bg-white border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={exp.description}
                    onChange={(e) => handleManualChange('experience', 'description', e.target.value, idx)}
                  />
                </div>
              ))}
              <button 
                onClick={() => addItem('experience')}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> 添加工作经历
              </button>
            </div>
          </section>
        );
      case 'education':
        return (
          <section key={key} className="pb-6 border-b border-slate-100 last:border-0">
            {headerControl}
            <div className="space-y-4">
              {resumeData.education.map((edu, idx) => (
                <div key={edu.id} className="relative p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:border-indigo-300 transition-colors group">
                    <button 
                    onClick={() => deleteItem('education', idx)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="删除此教育经历"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="mb-2 pr-6">
                    <label className="block text-xs font-medium text-slate-500 mb-1">学校</label>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded p-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={edu.school}
                      onChange={(e) => handleManualChange('education', 'school', e.target.value, idx)}
                    />
                  </div>
                  <div className="mb-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">学位/专业</label>
                      <input 
                      className="w-full bg-white border border-slate-200 rounded p-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={edu.degree}
                      onChange={(e) => handleManualChange('education', 'degree', e.target.value, idx)}
                    />
                  </div>
                  <div className="mb-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">时间段</label>
                      <input 
                      className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={edu.period}
                      onChange={(e) => handleManualChange('education', 'period', e.target.value, idx)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">在校经历 / 荣誉 / 备注 (可选)</label>
                    <textarea 
                      placeholder="例如：GPA 3.8、获得国家奖学金、担任学生会主席..."
                      className="w-full h-16 bg-white border border-slate-200 rounded p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      value={edu.notes || ''}
                      onChange={(e) => handleManualChange('education', 'notes', e.target.value, idx)}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => addItem('education')}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> 添加教育背景
              </button>
            </div>
          </section>
        );
      case 'skills':
        return (
          <section key={key} className="pb-6 border-b border-slate-100 last:border-0">
            {headerControl}
            <textarea 
              className="w-full h-20 bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={resumeData.skills.join(', ')}
              onChange={(e) => handleManualChange('skills', null, e.target.value)}
            />
          </section>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans overflow-hidden text-slate-800">
      
      {/* Left Sidebar: Navigation & Tools */}
      <div className="w-16 bg-slate-900 flex flex-col items-center py-6 gap-6 z-20 relative" style={{minHeight: '100vh'}}>
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-indigo-500/30">
          R
        </div>
        
        <button 
          onClick={() => setActiveTab('editor')} 
          className={`p-3 rounded-xl transition-all ${activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="编辑资料"
        >
          <User className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="AI 优化"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setShowJobModal(true)} 
          className={`p-3 rounded-xl transition-all ${jobDescription ? 'text-indigo-400' : 'text-slate-400'} hover:text-white hover:bg-slate-800`}
          title="目标职位设置"
        >
          <Briefcase className="w-5 h-5" />
        </button>

        {/* --- 设置按钮恢复到底部 --- */}
        <div className="mt-auto w-full flex flex-col items-center gap-4 pb-2">
          <div className="w-full border-t border-slate-800 mb-2"></div>
          <button 
            onClick={handlePrint} 
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="导出 PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Editor Panel (Conditional) */}
        {activeTab === 'editor' && (
          <div className="w-[450px] bg-white border-r border-slate-200 flex flex-col h-full animate-in slide-in-from-left-5 duration-300">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">编辑简历</h2>
              <p className="text-sm text-slate-500 mt-1">
                点击模块右上角箭头 <ArrowUp className="w-3 h-3 inline" /> 可调整顺序
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {/* Personal Info (Always First) */}
              <section className="pb-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> 基本信息
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">姓名</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={resumeData.personalInfo.name}
                      onChange={(e) => handleManualChange('personalInfo', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">当前职位 / 求职意向</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={resumeData.personalInfo.title}
                      onChange={(e) => handleManualChange('personalInfo', 'title', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      placeholder="邮箱"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={resumeData.personalInfo.email}
                      onChange={(e) => handleManualChange('personalInfo', 'email', e.target.value)}
                    />
                    <input 
                      placeholder="电话"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => handleManualChange('personalInfo', 'phone', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Dynamic Reorderable Sections */}
              {(resumeData.sectionOrder || ['summary', 'education', 'experience', 'skills']).map((key, index) => 
                renderEditorSection(key, index)
              )}
            </div>
          </div>
        )}

        {/* AI Chat Panel (Conditional) */}
        {activeTab === 'chat' && (
          <div className="w-[450px] flex-none h-full animate-in slide-in-from-left-5 duration-300 z-10">
            <ChatInterface 
              onOptimize={handleOptimize} 
              isProcessing={isProcessing} 
              chatHistory={chatHistory} 
              setShowApiConfig={setShowApiConfig}
            />
          </div>
        )}

        {/* Preview Area (Always Visible) */}
        <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex flex-col items-center">
          
          {/* Toolbar */}
          <div className="bg-white rounded-full shadow-sm p-1.5 flex gap-2 mb-8 items-center border border-slate-200 sticky top-0 z-10">
            <span className="text-xs font-bold text-slate-400 px-3 flex items-center gap-1">
              <Palette className="w-3 h-3" /> 风格
            </span>
            {[
              { id: 'modern', label: '现代蓝' },
              { id: 'classic', label: '经典白' },
              { id: 'minimal', label: '极简紫' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  template === t.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="origin-top scale-[0.8] md:scale-[0.9] lg:scale-100 transition-transform">
             <ResumePreview data={resumeData} template={template} />
          </div>
          
        </div>

      </div>

      {/* Job Description Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                设置目标职位 (JD)
              </h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              粘贴你想要申请的职位描述（JD）。AI 将根据这份描述，针对性地优化你的简历关键词和经历重点。
            </p>
            <textarea
              className="w-full h-40 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-4"
              placeholder="例如：我们需要一名资深产品经理，负责SaaS平台，要求有5年以上经验，熟悉敏捷开发..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setJobDescription(""); setShowJobModal(false); }} 
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                清除
              </button>
              <button 
                onClick={() => setShowJobModal(false)} 
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key 配置弹窗 */}
      <ApiConfigModal 
        show={showApiConfig} 
        onClose={() => setShowApiConfig(false)} 
        apiKey={apiKey} setApiKey={setApiKey}
        apiUrl={apiUrl} setApiUrl={setApiUrl}
        modelName={modelName} setModelName={setModelName}
      />

      {/* Mobile Overlay Warning */}
      <div className="lg:hidden fixed inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur">
        <LayoutTemplate className="w-12 h-12 mb-4 text-indigo-400" />
        <h2 className="text-xl font-bold mb-2">请使用桌面端访问</h2>
        <p className="text-slate-300">简历编辑与实时预览需要更大的屏幕空间以获得最佳体验。</p>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible; }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            background: white;
          }
        }
      `}</style>
    </div>
  );
}