import React from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  Clipboard, 
  ArrowLeft, 
  Linkedin, 
  BarChart3,
  Cpu,
  Activity,
  Layers
} from 'lucide-react';

const App = () => {
  return (
    // BACKGROUND: Deep Gradient based on #00008B but darker (blended with black)
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#000045] via-[#000025] to-[#000010] text-slate-200 font-sans selection:bg-[#2AAF7F] selection:text-white overflow-x-hidden flex items-center justify-center py-16 px-6 relative">
      
      {/* --- AMBIENT GLOW EFFECTS (The 3 Accent Colors) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glow 1: Deep Purple (#76007D) - Top Left - Represents Strategy/AI */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#76007D]/20 rounded-full blur-[120px] opacity-60 mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Glow 2: Teal (#1E94A5) - Center Right - Represents Flow/Data */}
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-[#1E94A5]/15 rounded-full blur-[120px] opacity-50 mix-blend-screen" />

        {/* Glow 3: Sea Green (#2AAF7F) - Bottom Left - Represents Success/Growth */}
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[400px] bg-[#2AAF7F]/10 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- MAIN GLASS CONTAINER --- */}
      <div className="relative z-10 w-full max-w-4xl">
        
        {/* Glass Effect Card */}
        <div className="relative bg-[#000022]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden shadow-[0_0_60px_rgba(30,148,165,0.15)]">
          
          {/* Top Gradient Border Line (Purple to Teal) */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
          
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="flex items-center gap-3 mb-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(118,0,125,0.2)]">
              <Terminal className="w-4 h-4 text-[#1E94A5]" /> 
              <span className="text-xs font-mono tracking-widest text-slate-300">SYSTEM ARCHITECTURE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-4">
              BENEDEK<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E94A5] to-[#2AAF7F]">.SYS</span>
            </h1>
          </div>
          
          {/* Success Status - Using the Green Accent (#2AAF7F) */}
          <div className="text-center mb-12 relative">
            {/* Glowing Success Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#2AAF7F] blur-2xl opacity-20 rounded-full"></div>
              <CheckCircle2 className="relative w-20 h-20 mx-auto text-[#2AAF7F] drop-shadow-[0_0_20px_rgba(42,175,127,0.4)]" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Programare <span className="text-[#2AAF7F]">Confirmată.</span>
            </h2>
            <p className="text-lg text-slate-400 font-light">
              Analiza arhitecturală a sistemului tău a fost securizată.
            </p>
          </div>

          <div className="mb-10 mx-auto w-full max-w-2xl">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(30,148,165,0.20)] hover:shadow-[0_0_60px_rgba(30,148,165,0.33)] transition-transform">
              <div className="aspect-video">
                <iframe
                  title="Thank You Video"
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/A_kyJov6HDE?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1&mute=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Bento Grid Layout for Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            
            {/* Left Col: Next Steps (Teal Accent) */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] transition-colors group relative overflow-hidden">
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E94A5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <div className="p-1.5 rounded bg-[#1E94A5]/10 text-[#1E94A5]">
                  <Activity size={18}/> 
                </div>
                Pași Imediați
              </h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-4 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Mail size={18} className="mt-0.5 text-[#1E94A5] shrink-0" />
                  <span>Vei primi un email automat cu detaliile întâlnirii și link-ul de acces.</span>
                </li>
                <li className="flex items-start gap-4 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Calendar size={18} className="mt-0.5 text-[#1E94A5] shrink-0" />
                  <span>Invitația a fost adăugată în calendar. Verifică folderul Spam dacă lipsește.</span>
                </li>
              </ul>
            </div>

            {/* Right Col: The Deliverable (Green/Emerald Accent) */}
            <div className="bg-gradient-to-br from-[#2AAF7F]/[0.05] to-transparent border border-[#2AAF7F]/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-[#2AAF7F]">
                <Layers size={80} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                 <span className="text-[#2AAF7F]">LIVRABILUL APELULUI</span>
              </h3>
              <div className="h-px w-full bg-gradient-to-r from-[#2AAF7F]/50 to-transparent mb-4"></div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Nu pleci cu "sfaturi". Pleci cu un <strong className="text-white border-b border-[#2AAF7F]/40">Blueprint de Ineficiență</strong> și primele <strong className="text-white border-b border-[#2AAF7F]/40">3 Instrucțiuni de Optimizare</strong> pentru a debloca venituri imediat.
              </p>
            </div>
          </div>

          {/* Bottom Section: Preparation (Full Width - Purple Accent) */}
          <div className="bg-[#000022]/40 border border-[#76007D]/20 rounded-2xl p-8 mb-10 relative group overflow-hidden">
             {/* Hover Glow Effect */}
             <div className="absolute -inset-0.5 bg-gradient-to-r from-[#76007D] to-[#1E94A5] rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
             
             <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Cpu size={20} className="text-[#76007D]" /> 
                  Pregătire Tehnică (Input Required)
                </h3>
                <p className="text-sm text-slate-500 mb-6 font-mono">
                  // Maximizează ROI-ul celor 30 de minute
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[#76007D]/[0.05] border border-[#76007D]/20 hover:border-[#76007D]/40 transition-colors">
                    <div className="text-[#D0A6FF] text-xs font-bold mb-2 uppercase tracking-wider">01. Flow</div>
                    <p className="text-sm text-slate-300">O schiță a procesului actual.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#76007D]/[0.05] border border-[#76007D]/20 hover:border-[#76007D]/40 transition-colors">
                    <div className="text-[#D0A6FF] text-xs font-bold mb-2 uppercase tracking-wider">02. Bottlenecks</div>
                    <p className="text-sm text-slate-300">Lista punctelor unde pierzi bani.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#76007D]/[0.05] border border-[#76007D]/20 hover:border-[#76007D]/40 transition-colors">
                    <div className="text-[#D0A6FF] text-xs font-bold mb-2 uppercase tracking-wider">03. Acces</div>
                    <p className="text-sm text-slate-300">Disponibilitate Share Screen.</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/5 gap-6">
            <div className="flex gap-6">
                <a href="https://www.linkedin.com/in/benedek-robert/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-[#0077b5] transition-colors text-sm font-medium group">
                    <Linkedin size={16} /> 
                    <span className="group-hover:text-white transition-colors">Conectează-te pe LinkedIn</span>
                </a>
            </div>

            <a href="/" className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all hover:border-[#1E94A5]/50">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#1E94A5]" />
                Înapoi la Site
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
