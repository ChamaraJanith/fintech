import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  Bell,
  User,
  Settings,
  Search,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MilestoneStepper from './MilestoneStepper';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for tailwind class merging
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { supabase } from '../lib/supabase';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [role, setRole] = useState('client'); // 'client' or 'freelancer'
  const [contract, setContract] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch the active contract (taking the first one for this demo)
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (contractError) throw contractError;
      setContract(contractData);

      // Fetch activity logs
      const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('contract_id', contractData.id)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;
      setTimelineData(logsData);
    } catch (err) {
      console.error('Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addActivityLog = async (contractId, type, title) => {
    await supabase.from('activity_logs').insert({
      contract_id: contractId,
      type,
      title,
      user_name: role === 'client' ? 'Client' : 'Freelancer'
    });
  };

  const handleReleaseFunds = async () => {
    if (!contract) return;
    
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'released' })
      .eq('id', contract.id);

    if (!error) {
      await addActivityLog(contract.id, 'release', 'Funds Released to Freelancer');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10b981', '#059669', '#34d399', '#ffffff']
      });
    }
  };

  const handleSubmitWork = async () => {
    if (!contract) return;

    const { error } = await supabase
      .from('contracts')
      .update({ status: 'in_review' })
      .eq('id', contract.id);

    if (!error) {
      await addActivityLog(contract.id, 'verification', 'Work Submitted for Review');
    }
  };

  if (loading && !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const status = contract?.status || 'funded';

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                SafeGuard <span className="text-slate-500 font-light italic">Secure</span>
              </h1>
            </div>
            <p className="text-slate-500 text-xs font-medium ml-12 tracking-wide uppercase">Institutional Escrow protocol</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* Role Toggle */}
            <div className="flex p-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl">
              <button
                onClick={() => setRole('client')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-semibold transition-all duration-300",
                  role === 'client' ? "bg-slate-800 text-slate-100 shadow-xl border border-slate-700/50" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Client View
              </button>
              <button
                onClick={() => setRole('freelancer')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-semibold transition-all duration-300",
                  role === 'freelancer' ? "bg-slate-800 text-slate-100 shadow-xl border border-slate-700/50" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Freelancer View
              </button>
            </div>
            <button className="p-3 rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-100 transition-all hover:scale-105 active:scale-95">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-slate-900 border border-slate-800/50 flex items-center justify-center shadow-lg group cursor-pointer hover:border-emerald-500/30 transition-colors">
              <User className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </motion.div>
        </header>

        {/* Global Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Verified ID', status: 'Active', icon: ShieldCheck, color: 'text-emerald-500' },
            { label: 'Agreement', status: 'Electronic', icon: FileText, color: 'text-slate-400' },
            { label: 'Tax Residency', status: 'Global', icon: Search, color: 'text-slate-400' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className="p-2 bg-slate-950/50 border border-slate-800/50 rounded-xl">
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-semibold text-slate-200">{item.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contract Details & Milestone */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Contract Detail Card */}
            <motion.div 
              layout
              className="glass-card p-6 md:p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-emerald-500/10 transition-all duration-700" />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 relative z-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Active Smart Escrow</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
                    {contract?.title || 'Loading Contract...'}
                  </h2>
                  <div className="flex items-center gap-6 text-slate-400 text-xs font-medium">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/40 rounded-lg border border-slate-800/50">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{contract?.contract_number || '---'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {contract?.expires_at ? `Closes ${new Date(contract.expires_at).toLocaleDateString()}` : 'No date set'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-4 min-w-[200px]">
                  <div className="flex flex-col md:items-end">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Locked Value</span>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                      <span className="text-emerald-500 text-xl font-medium">$</span>
                      {contract?.budget?.toLocaleString() || '0.00'}
                    </div>
                  </div>
                  {/* Escrow Status Badge */}
                  <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border transition-all duration-500 self-start md:self-end",
                    status === 'in_review' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 breathing-glow" : 
                    status === 'released' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                    "bg-slate-950/50 border-slate-800 text-slate-500"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", status === 'in_review' ? "bg-emerald-500 animate-pulse" : status === 'released' ? "bg-emerald-500" : "bg-slate-700")} />
                    Status: {status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <MilestoneStepper currentStep={status} />
              
              {/* Actions Layer */}
              <div className="mt-12 flex flex-wrap items-center gap-5 pt-10 border-t border-slate-800/40 relative z-10">
                {role === 'client' && (
                  <button
                    disabled={status !== 'in_review'}
                    onClick={handleReleaseFunds}
                    className={cn(
                      "flex-1 md:flex-none px-10 py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800/50 disabled:text-slate-600 text-slate-950 font-bold rounded-2xl transition-all duration-500 shadow-[0_0_30px_theme('colors.emerald.500/10')] hover:shadow-[0_0_40px_theme('colors.emerald.500/20')] flex items-center justify-center gap-3 group active:scale-95",
                      status === 'released' && "shadow-none"
                    )}
                  >
                    {status === 'released' ? 'Milestone Completed' : 'Release Funds to Agent'}
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                )}
                
                {role === 'freelancer' && (
                  <button
                    disabled={status !== 'funded'}
                    onClick={handleSubmitWork}
                    className="flex-1 md:flex-none px-10 py-5 bg-slate-100 hover:bg-white disabled:bg-slate-800/50 disabled:text-slate-600 text-slate-950 font-bold rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 border-b-4 border-slate-300 disabled:border-transparent"
                  >
                    {status === 'funded' ? 'Submit Work for Review' : status === 'in_review' ? 'Awaiting Approval' : 'Review Finished'}
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}

                <button className="flex-1 md:flex-none px-10 py-5 bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-2xl transition-all duration-300">
                  Open Chat
                </button>
              </div>
            </motion.div>

            {/* Activity Timeline */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-3 text-slate-200">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  Audit Trail
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
              </div>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {timelineData.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="flex items-center gap-6 p-5 glass-card hover:bg-slate-900/60 transition-all duration-300 cursor-pointer border-l-4 border-l-transparent hover:border-l-emerald-500/40"
                  >
                    <div className="p-3 bg-slate-950 border border-slate-800/50 rounded-2xl ring-4 ring-slate-900/30">
                      {item.type === 'deposit' ? <DollarSign className="w-4 h-4 text-emerald-500" /> : 
                       item.type === 'contract' ? <FileText className="w-4 h-4 text-slate-400" /> : 
                       item.type === 'release' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                       <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500 font-medium">Authored by <span className="text-slate-400">{item.user_name}</span> via Ledger</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-tighter">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        <span className="text-[8px] text-emerald-500/80 font-bold uppercase">Verified</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right Column: Collateral Cards */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Node Resilience</h4>
              <div className="space-y-8">
                {[
                  { label: 'Network Security', value: '99.9%', progress: 99 },
                  { label: 'Avg. Consensus Time', value: '0.8s', progress: 85 },
                  { label: 'Platform Trust Index', value: 'Prime', progress: 92 },
                ].map((stat, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between text-[11px] mb-3">
                      <span className="text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                      <span className="text-emerald-400 font-mono font-bold">{stat.value}</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.2, ease: "circOut" }}
                        className="h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800/30">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Real-time network validation powered by <br />
                  <span className="text-slate-400 font-bold">Proof of Interaction</span> consensus.
                </p>
              </div>
            </div>

            <div className="glass-card p-8 border-dashed border-slate-800/50 hover:border-emerald-500/30 transition-all duration-500 group cursor-pointer bg-slate-950/20">
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-5">
                <div className="w-14 h-14 rounded-3xl border-2 border-dashed border-slate-800 flex items-center justify-center group-hover:bg-emerald-500/5 group-hover:border-emerald-500/50 transition-all duration-500">
                  <Plus className="w-6 h-6 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Add Scope Extension</p>
                  <p className="text-[10px] text-slate-500 mt-2 max-w-[180px] leading-relaxed">Modify deliverables or increase milestone budget liquidity.</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocol Settings</span>
              </div>
              <ul className="space-y-3">
                {['Automatic Releases', 'Dispute Protection', 'ID Shielding'].map((item, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{item}</span>
                    <div className="w-6 h-3 bg-emerald-500/20 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

