'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion'; // Will be available after npm install
import { queueAPI, QueueEntry } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useAuth } from '../../contexts/AuthContext';
// Icons - Using simple SVG for now, will use lucide-react after npm install
const Clock = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Users = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const Scissors = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>;
const CheckCircle2 = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircle = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Phone = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const Zap = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const Bell = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

// Premium Card Component
const PremiumCard = ({ className, children, ...props }: any) => (
  <div className={`rounded-xl border border-gray-200 bg-white/80 backdrop-blur-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`} {...props}>
    {children}
  </div>
);

// Simple Badge Component
const Badge = ({ children, className, variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'outline' | 'success' | 'warning' }) => {
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    outline: 'bg-white text-gray-700 border-gray-300',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Simple Button Component
const Button = ({ children, onClick, className = '', disabled = false, size = 'md', variant = 'default' }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'destructive';
}) => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const variants: Record<string, string> = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Simple Dialog Component
const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }: any) => <div className="p-6">{children}</div>;
const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }: any) => <h2 className="text-xl font-bold text-gray-900">{children}</h2>;
const DialogFooter = ({ children }: any) => <div className="flex justify-end gap-2 mt-6">{children}</div>;

// Simple Tabs Component
const Tabs = ({ defaultValue, children, className = '' }: {
  defaultValue: string;
  children: (activeTab: string, setActiveTab: (tab: string) => void) => React.ReactNode;
  className?: string;
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className}>
      {children(activeTab, setActiveTab)}
    </div>
  );
};

const TabsList = ({ children, className = '' }: any) => (
  <div className={`flex gap-1 border-b border-gray-200 ${className}`}>{children}</div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: any) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === value
      ? 'border-b-2 border-indigo-600 text-indigo-600'
      : 'text-gray-600 hover:text-gray-900'
      }`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab }: any) => {
  if (activeTab !== value) return null;
  return <div>{children}</div>;
};

// ScrollArea Component
const ScrollArea = ({ children, className = '' }: any) => (
  <div className={`overflow-y-auto ${className}`}>{children}</div>
);

// Avatar Component
const Avatar = ({ children, className = '' }: any) => (
  <div className={`rounded-full overflow-hidden ${className}`}>{children}</div>
);

const AvatarFallback = ({ children, className = '' }: any) => (
  <div className={`flex items-center justify-center bg-gradient-to-tr from-purple-100 to-blue-100 text-purple-700 font-bold ${className}`}>
    {children}
  </div>
);

export default function BarberDashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState<QueueEntry | null>(null);
  const [actionDialog, setActionDialog] = useState<'call' | 'complete' | 'cancel' | null>(null);
  const [activeTab, setActiveTab] = useState('waiting');

  // New State for Earnings & History
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [servedCount, setServedCount] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadQueue();

    const socket = getSocket();

    const setupSocket = () => {
      if (socket.connected) {
        setSocketConnected(true);
        setupListeners();
      } else {
        socket.once('connect', () => {
          setSocketConnected(true);
          setupListeners();
        });
      }
    };

    const setupListeners = () => {
      socket.on('queueUpdated', (data) => {
        console.log('Queue updated:', data);
        // Only reload if looking at today
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate === today) {
          loadQueue();
        }
      });

      socket.emit('getQueueStatus');

      socket.on('queueStatus', (data) => {
        loadQueue();
      });

      socket.on('connect', () => {
        setSocketConnected(true);
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });
    };

    setupSocket();

    return () => {
      socket.off('queueUpdated');
      socket.off('queueStatus');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [isAuthenticated, selectedDate]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await queueAPI.getActiveQueue(selectedDate);
      const status = await queueAPI.getShopStatus();
      setIsShopOpen(status.isOpen);
      setQueue(data.queue);
      setTotalEarnings(data.totalEarnings || 0);
      setServedCount(data.servedCount || 0);
      setError('');
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Unauthorized')) {
        logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkServing = async (queueNumber: number) => {
    try {
      setSelectedCustomer(queue.find(c => c.queueNumber === queueNumber) || null);
      setActionDialog('call');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const confirmCallNext = async () => {
    if (!selectedCustomer) return;
    try {
      await queueAPI.markServing(selectedCustomer.queueNumber);
      await loadQueue();
      setActionDialog(null);
      setSelectedCustomer(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCompleteService = async (queueNumber: number) => {
    try {
      setSelectedCustomer(queue.find(c => c.queueNumber === queueNumber) || null);
      setActionDialog('complete');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const confirmComplete = async () => {
    if (!selectedCustomer) return;
    try {
      await queueAPI.markComplete(selectedCustomer.queueNumber);
      await loadQueue();
      setActionDialog(null);
      setSelectedCustomer(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelBooking = (customer: QueueEntry) => {
    setSelectedCustomer(customer);
    setActionDialog('cancel');
  };

  const confirmCancel = async () => {
    if (!selectedCustomer) return;
    try {
      await queueAPI.cancelQueue(selectedCustomer.phoneNumber);
      await loadQueue();
      setActionDialog(null);
      setSelectedCustomer(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const waitingCustomers = queue.filter(c => c.status === 'waiting').sort((a, b) => a.position - b.position);
  const inServiceCustomers = queue.filter(c => c.status === 'serving');
  const completedCustomers = queue.filter(c => c.status === 'completed').slice(0, 20);

  // Calculate stats
  const stats = {
    totalWaiting: waitingCustomers.length,
    customersServedToday: completedCustomers.length,
    averageWaitTime: waitingCustomers.length > 0
      ? Math.round(waitingCustomers.reduce((sum, c) => sum + c.estimatedWaitTime, 0) / waitingCustomers.length)
      : 0,
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans w-full overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/50 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b bg-white/70 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 w-full max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-2.5 transition-colors ${isShopOpen ? 'bg-indigo-100' : 'bg-red-100'}`}>
                  <Scissors className={`size-6 ${isShopOpen ? 'text-indigo-600' : 'text-red-500'}`} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-900">
                    {user?.shopName || 'Barbershop Dashboard'}
                  </h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600 font-medium">Admin Console</p>
                    <span className="text-gray-300">•</span>
                    <button
                      onClick={async () => {
                        try {
                          const newStatus = await queueAPI.toggleShopStatus(!isShopOpen);
                          setIsShopOpen(newStatus.isOpen);
                        } catch (err) {
                          console.error('Failed to toggle status');
                        }
                      }}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${isShopOpen
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                        }`}
                    >
                      {isShopOpen ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={socketConnected ? 'success' : 'warning'} className="gap-2">
                  <div className={`size-1.5 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                  <span>{socketConnected ? 'Live' : 'Connecting...'}</span>
                </Badge>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <Badge variant="outline" className="gap-2">
                  <Clock className="size-3" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </Badge>
                <Button variant="ghost" onClick={() => { logout(); router.push('/login'); }} size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 md:space-y-8 max-w-7xl w-full">
          {/* KPI Cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Waiting', val: stats.totalWaiting, icon: Users, desc: 'In Line', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Active', val: inServiceCustomers.length, icon: Zap, desc: 'Serving', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { label: 'Completed', val: servedCount, icon: CheckCircle2, desc: 'Served', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
              { label: 'Avg Wait', val: `${stats.averageWaitTime}m`, icon: Clock, desc: 'Estimated', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
              { label: 'Revenue', val: `₹${totalEarnings}`, icon: Zap, desc: 'Total', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            ].map((item, i) => (
              <PremiumCard key={i} className="hover:border-indigo-200 bg-white/80">
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className={`rounded-xl p-2 md:p-3 border ${item.bg} ${item.border}`}>
                      <item.icon className={`size-5 md:size-6 ${item.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{item.label}</p>
                    <p className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{item.val}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 opacity-80">{item.desc}</p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>

          {/* Queue Tabs */}
          <PremiumCard className="bg-white/80">
            <Tabs defaultValue="waiting" className="w-full">
              {(activeTab, setActiveTab) => (
                <>
                  <div className="border-b border-gray-200 bg-gray-50/50 p-3">
                    <TabsList className="grid w-full grid-cols-3 h-auto bg-gray-100 border border-gray-200 p-1 shadow-inner gap-1">
                      <TabsTrigger value="waiting" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Waiting ({waitingCustomers.length})
                      </TabsTrigger>
                      <TabsTrigger value="in-service" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Active ({inServiceCustomers.length})
                      </TabsTrigger>
                      <TabsTrigger value="completed" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Done ({completedCustomers.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-0 min-h-[400px]">
                    <TabsContent value="waiting" activeTab={activeTab}>
                      {waitingCustomers.length > 0 ? (
                        <ScrollArea className="h-[500px]">
                          <div className="divide-y divide-gray-100">
                            {waitingCustomers.map((c, i) => (
                              <div key={c.queueNumber} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                  <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm border ${i === 0 ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white border-gray-200 text-gray-500'
                                    }`}>
                                    {c.position}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm text-gray-900">
                                      {c.customerName}
                                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{c.service || 'Haircut'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                      <Phone className="size-3" /> {c.phoneNumber}
                                      <span>•</span>
                                      <span className="text-amber-600 font-medium">Est. {c.estimatedWaitTime}m</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {i === 0 && (
                                    <Button
                                      onClick={() => handleMarkServing(c.queueNumber)}
                                      size="sm"
                                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                      Start Serving
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => handleCancelBooking(c)}
                                  >
                                    <XCircle className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                          <Users className="size-10 mb-4" />
                          <p className="text-lg font-semibold">Queue Empty</p>
                          <p className="text-sm">Relax, no one waiting.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="in-service" activeTab={activeTab}>
                      {inServiceCustomers.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center text-gray-400">
                          No active services
                        </div>
                      ) : (
                        <div className="p-6 w-full grid gap-4 md:grid-cols-2">
                          {inServiceCustomers.map(c => (
                            <div key={c.queueNumber} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                              <div>
                                <span className="font-medium text-gray-900">{c.customerName}</span>
                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{c.service || 'Haircut'}</span>
                                <p className="text-xs text-gray-500 mt-1">#{c.queueNumber}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="warning">In Chair</Badge>
                                <Button
                                  onClick={() => handleCompleteService(c.queueNumber)}
                                  size="sm"
                                  className="bg-gray-900 text-white hover:bg-gray-800"
                                >
                                  Done
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed" activeTab={activeTab}>
                      <ScrollArea className="h-[500px]">
                        <div className="divide-y divide-gray-100">
                          {completedCustomers.map(c => (
                            <div key={c.queueNumber} className="p-4 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="size-4 text-green-600" />
                                <span className="font-medium text-sm line-through text-gray-500">{c.customerName}</span>
                                <span className="text-xs text-gray-400">({c.service || 'Haircut'} - ₹{c.price || 0})</span>
                              </div>
                              <div className="text-xs text-gray-400">Done</div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </>
              )}
            </Tabs>
          </PremiumCard>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={actionDialog === 'call'} onOpenChange={(open: boolean) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Next Customer</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600 animate-pulse">
              <Bell className="size-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer?.customerName}</h3>
            <p className="text-gray-500 mt-1">Ticket #{selectedCustomer?.queueNumber}</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={confirmCallNext} className="bg-indigo-600 text-white hover:bg-indigo-700">Confirm Call</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'complete'} onOpenChange={(open: boolean) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Service?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-gray-600">Mark {selectedCustomer?.customerName} as done?</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={confirmComplete} className="bg-green-600 text-white hover:bg-green-700">Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'cancel'} onOpenChange={(open: boolean) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-red-600">This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialog(null)}>Back</Button>
            <Button variant="destructive" onClick={confirmCancel}>Cancel Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
