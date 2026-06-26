import React, { useState, useEffect } from 'react';
import { Moon, Settings, Clock, ShieldAlert, Unlock, Plus, Trash2, BarChart, Power, X, Check, AlertCircle } from 'lucide-react';

// --- 模拟数据 ---
const MOCK_SITES = ['youtube.com', 'bilibili.com', 'reddit.com', 'v2ex.com'];

// --- 1. 插件弹窗 Popup UI ---
const PopupView = ({ navigate }) => (
  <div className="w-80 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col font-sans">
    {/* Header */}
    <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
      <div className="flex items-center gap-2">
        <Moon className="w-5 h-5 text-indigo-400" />
        <span className="font-bold text-base tracking-wide">晚安守护</span>
      </div>
      <button onClick={() => navigate('settings')} className="text-slate-400 hover:text-white transition-colors">
        <Settings className="w-5 h-5" />
      </button>
    </div>

    {/* Status Card */}
    <div className="p-5 flex flex-col items-center border-b border-slate-800">
      <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
        <Clock className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-1">晚安模式未开启</h2>
      <p className="text-sm text-slate-400">距离开始还有 <span className="text-indigo-400 font-medium">1 小时 24 分钟</span></p>
      
      <div className="flex gap-4 mt-4 w-full">
        <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400 mb-1">今日阻断</div>
          <div className="text-lg font-bold text-white">0</div>
        </div>
        <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400 mb-1">临时解锁</div>
          <div className="text-lg font-bold text-white">0</div>
        </div>
      </div>
    </div>

    {/* Current Site Action */}
    <div className="p-4 bg-slate-800/50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">当前网站</div>
          <div className="text-sm font-medium text-slate-200 truncate w-48">youtube.com</div>
        </div>
        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-md border border-emerald-500/30">未限制</span>
      </div>
      <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        加入睡眠阻断列表
      </button>
    </div>

    {/* Quick Actions */}
    <div className="p-4 flex justify-between items-center">
      <button className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
        <Power className="w-4 h-4" />
        暂停 15 分钟
      </button>
      <button onClick={() => navigate('block')} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
        预览阻断页 &rarr;
      </button>
    </div>
  </div>
);

// --- 2. 阻断页 Block Page UI ---
const BlockPageView = ({ navigate }) => {
  const [unlockStep, setUnlockStep] = useState(0); // 0: initial, 1: countdown, 2: input
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer;
    if (unlockStep === 1 && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (unlockStep === 1 && countdown === 0) {
      setUnlockStep(2);
    }
    return () => clearTimeout(timer);
  }, [unlockStep, countdown]);

  const handleUnlockClick = () => {
    setUnlockStep(1);
    setCountdown(5); // Demo 缩短为 5 秒
  };

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-8 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 max-w-2xl w-full flex flex-col items-center text-center">
        <Moon className="w-16 h-16 text-indigo-400 mb-6" />
        
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">现在是晚安时间</h1>
        <p className="text-xl text-slate-400 mb-8">23:48</p>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 w-full mb-8 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-rose-400 mb-4">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-medium">已拦截访问：youtube.com</span>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-slate-500 mb-2">这是白天的你为今晚设置的边界：</p>
            <p className="text-lg font-medium text-indigo-200 italic">“明天早上的我，会感谢现在睡觉的我。”</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-800 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> 现在睡觉的好处
              </h3>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• 明天早晨更清醒</li>
                <li>• 情绪更加稳定</li>
                <li>• 保护视力和皮肤</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" /> 继续熬夜的代价
              </h3>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• 起床极其困难</li>
                <li>• 明天注意力下降</li>
                <li>• 容易陷入拖延焦虑</li>
              </ul>
            </div>
          </div>
        </div>

        {unlockStep === 0 && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-medium rounded-xl shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-105">
              关掉网页，我去睡了
            </button>
            <button onClick={handleUnlockClick} className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
              <Unlock className="w-4 h-4" />
              临时解锁 10 分钟
            </button>
          </div>
        )}

        {unlockStep === 1 && (
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 text-center animate-pulse">
            <p className="text-slate-300 mb-2">请深呼吸，冷静一下...</p>
            <p className="text-3xl font-bold text-indigo-400">{countdown}s</p>
          </div>
        )}

        {unlockStep === 2 && (
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 text-left shadow-2xl">
            <p className="text-sm text-slate-300 mb-3">为了确认你真的需要解锁，请在下方输入：</p>
            <p className="text-sm font-medium text-indigo-300 bg-slate-950 p-3 rounded-lg mb-4 select-all">
              我知道熬夜不好，但我选择解锁
            </p>
            <input 
              type="text" 
              placeholder="请输入上方文字..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setUnlockStep(0)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                算了，去睡
              </button>
              <button className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 text-sm font-medium rounded-lg transition-colors">
                确认解锁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 3. 设置页 Options UI ---
const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex font-sans" style={{ minHeight: '600px' }}>
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Moon className="w-6 h-6 text-indigo-400" />
          <span className="font-bold text-lg text-white">晚安守护</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'schedule', icon: Clock, label: '睡眠计划' },
            { id: 'websites', icon: ShieldAlert, label: '网站规则' },
            { id: 'unlock', icon: Unlock, label: '解锁设置' },
            { id: 'stats', icon: BarChart, label: '数据统计' },
            { id: 'advanced', icon: Settings, label: '高级选项' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-900 p-8 overflow-y-auto">
        {activeTab === 'schedule' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">睡眠计划</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">日常作息</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">晚安模式开启 (睡觉时间)</label>
                    <input type="time" defaultValue="23:30" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">晚安模式结束 (起床时间)</label>
                    <input type="time" defaultValue="07:00" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">睡前提醒</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-slate-200">提前发送通知提醒</div>
                    <div className="text-xs text-slate-500 mt-1">在正式阻断前提醒你收尾当前网页</div>
                  </div>
                  <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none">
                    <option>提前 15 分钟</option>
                    <option selected>提前 30 分钟</option>
                    <option>提前 60 分钟</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'websites' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">网站规则</h2>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">添加要限制的网站</h3>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="例如: youtube.com" 
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                  添加
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
                <h3 className="text-sm font-medium text-slate-200">黑名单列表 ({MOCK_SITES.length})</h3>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">从模板导入</button>
              </div>
              <ul className="divide-y divide-slate-700/50">
                {MOCK_SITES.map(site => (
                  <li key={site} className="px-6 py-4 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                    <span className="text-sm text-slate-300">{site}</span>
                    <button className="text-slate-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'unlock' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">解锁设置</h2>
            <p className="text-sm text-slate-400 mb-6">设置合理的摩擦力，防止自己轻易破例。</p>

            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-200">每次解锁时长</div>
                  <div className="text-xs text-slate-500 mt-1">解锁后允许访问的时间</div>
                </div>
                <select className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option>5 分钟</option>
                  <option selected>10 分钟</option>
                  <option>15 分钟</option>
                </select>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-200">每晚最多解锁次数</div>
                  <div className="text-xs text-slate-500 mt-1">超过次数后将强制阻断</div>
                </div>
                <select className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option>1 次 (严格)</option>
                  <option selected>3 次 (标准)</option>
                  <option>不限制 (温和)</option>
                </select>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-200">解锁前冷静期</div>
                  <div className="text-xs text-slate-500 mt-1">点击解锁后需要等待的时间</div>
                </div>
                <select className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option>无</option>
                  <option selected>30 秒</option>
                  <option>60 秒</option>
                </select>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-200">要求输入确认语</div>
                  <div className="text-xs text-slate-500 mt-1">增加解锁的心理成本</div>
                </div>
                <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'stats' || activeTab === 'advanced') && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <BarChart className="w-12 h-12 mb-4 opacity-50" />
            <p>此页面在原型中暂未实现</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 主容器 (用于原型演示切换) ---
export default function App() {
  const [view, setView] = useState('block'); // 'popup', 'block', 'settings'

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* 原型导航栏 (仅供演示使用) */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-center gap-4 z-50 relative">
        <button 
          onClick={() => setView('popup')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'popup' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          查看 Popup 弹窗
        </button>
        <button 
          onClick={() => setView('block')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'block' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          查看阻断页 (Block Page)
        </button>
        <button 
          onClick={() => setView('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          查看设置页 (Options)
        </button>
      </div>

      {/* 内容展示区 */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {view === 'popup' && (
          <div className="relative animate-in zoom-in-95 duration-300">
            {/* 模拟浏览器工具栏背景 */}
            <div className="absolute -top-12 right-4 w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="absolute -top-3 right-6 w-4 h-4 bg-slate-900 border-t border-l border-slate-700 transform rotate-45"></div>
            <PopupView navigate={setView} />
          </div>
        )}
        
        {view === 'block' && (
          <div className="absolute inset-0 animate-in fade-in duration-500">
            <BlockPageView navigate={setView} />
          </div>
        )}
        
        {view === 'settings' && (
          <div className="w-full flex justify-center animate-in slide-in-from-bottom-8 duration-500">
            <SettingsView />
          </div>
        )}
      </div>
    </div>
  );
}