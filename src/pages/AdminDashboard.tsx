import { Users, Activity, HardDrive, DollarSign, Settings, Bell, Shield } from "lucide-react";
import BackButton from "../components/BackButton";

export default function AdminDashboard() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#171717] text-white">
      <BackButton />
      <header className="h-14 shrink-0 flex items-center px-6 z-10 w-full pl-14 md:pl-6 border-b border-white/10">
        <h1 className="font-semibold text-lg flex items-center space-x-2">
            <Shield className="w-5 h-5 text-brand-400" />
            <span>Admin Control Panel</span>
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto w-full p-6 lg:p-10 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div>
            <h2 className="text-2xl font-medium tracking-tight mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users />} label="Total Users" value="1,248" trend="+12% this week" />
              <StatCard icon={<DollarSign />} label="MRR" value="$12,450" trend="+8% this month" />
              <StatCard icon={<Activity />} label="API Calls" value="1.2M" trend="Stable" />
              <StatCard icon={<HardDrive />} label="Storage Used" value="48.5 GB" trend="Approaching limit" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
             <div className="bg-[#212121] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-medium">Recent Users</h3>
                   <button className="text-sm text-brand-400 hover:text-brand-300">View All</button>
                </div>
                <div className="space-y-4">
                   {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                         <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-medium">
                               User
                            </div>
                            <div>
                               <p className="font-medium text-sm">user{i}@example.com</p>
                               <p className="text-xs text-gray-500">Pro Plan • Active 2m ago</p>
                            </div>
                         </div>
                         <button className="p-2 text-gray-400 hover:text-white"><Settings className="w-4 h-4" /></button>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-[#212121] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-medium">System Alerts</h3>
                   <button className="text-sm text-brand-400 hover:text-brand-300">Clear All</button>
                </div>
                <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-start space-x-3">
                         <Bell className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                         <div>
                            <p className="font-medium text-sm text-orange-200">High API Usage Detected</p>
                            <p className="text-xs text-orange-400/80 mt-1">Image generation API is experiencing unusual traffic spikes.</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-start space-x-3">
                         <HardDrive className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                         <div>
                            <p className="font-medium text-sm text-blue-200">Database Backup Complete</p>
                            <p className="text-xs text-blue-400/80 mt-1">Daily snapshot created successfully.</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="bg-[#212121] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-36">
      <div className="flex items-center space-x-3 text-gray-400">
        <div className="p-2.5 bg-white/5 rounded-xl text-brand-400">
          <div className="w-5 h-5 children-w-full children-h-full">{icon}</div>
        </div>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight text-white mb-1">{value}</p>
        <p className="text-xs text-gray-500">{trend}</p>
      </div>
    </div>
  );
}
