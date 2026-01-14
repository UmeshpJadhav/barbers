'use client';

import { useState, useEffect, useRef } from 'react';
import { queueAPI, PositionResponse } from '../lib/api';
import { getSocket } from '../lib/socket';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Mail,
  ExternalLink,
  ChevronDown,
  Phone,
  Check
} from 'lucide-react';


// Icons - Simple SVG components
const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Scissors = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
  </svg>
);

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);



const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const Award = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// Simple Card Component
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

// Simple Input Component
const Input = ({ id, type = 'text', placeholder, value, onChange, required, className = '' }: any) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white placeholder:text-gray-400 ${className}`}
  />
);

// Simple Label Component
const Label = ({ htmlFor, children, className = '' }: { htmlFor: string; children: React.ReactNode; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>
    {children}
  </label>
);

// Simple Badge Component
const Badge = ({ children, variant = 'outline', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => {
  const variants: Record<string, string> = {
    outline: 'bg-white text-gray-700 border-gray-300',
    default: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function CustomerPage() {
  const [view, setView] = useState<'join' | 'position'>('join');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [service, setService] = useState<string[]>(['Haircut']);
  const [positionData, setPositionData] = useState<PositionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [stats, setStats] = useState<{
    waiting: number;
    avgWait: number;
    servedToday: number;
    currentQueue: Array<{ name: string; queueNumber: number; status: string; service?: string }>;
    isShopOpen: boolean;
  }>({
    waiting: 0,
    avgWait: 0,
    servedToday: 0,
    currentQueue: [],
    isShopOpen: true
  });
  const [isShopOpen, setIsShopOpen] = useState(true);

  const checkPositionRef = useRef<(() => Promise<void>) | null>(null);

  const checkPosition = async (phoneToCheck?: string) => {
    const phone = phoneToCheck || phoneNumber;
    if (!phone) return;

    setLoading(true);
    setError('');

    try {
      const data = await queueAPI.getPosition(phone);
      setPositionData(data);
      setView('position');
      // Update local state if successful and different
      if (data.customerName && !customerName) setCustomerName(data.customerName);
      if (phone !== phoneNumber) setPhoneNumber(phone);
    } catch (err: any) {
      // Don't show error on initial load unless it's critical
      if (!phoneToCheck) setError(err.message);

      if (err.message.includes('not in the queue')) {
        setView('join');
        setPositionData(null);
        // Clean up local storage if we thought we were in queue but aren't
        localStorage.removeItem('queue_phone');
        localStorage.removeItem('queue_name');
      }
    } finally {
      setLoading(false);
    }
  };

  // Keep ref up to date with latest function closing over current state
  useEffect(() => {
    checkPositionRef.current = checkPosition;
  }, [phoneNumber, checkPosition]); // Update ref when deps change

  useEffect(() => {
    const socket = getSocket();

    // Check for existing session
    const storedPhone = localStorage.getItem('queue_phone');
    const storedName = localStorage.getItem('queue_name');

    if (storedPhone) {
      setPhoneNumber(storedPhone);
      if (storedName) setCustomerName(storedName);
      // Verify position immediately
      checkPosition(storedPhone);
    }

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
      // Remove existing listeners to prevent duplicates
      socket.off('queueUpdated');

      socket.on('queueUpdated', (data) => {
        console.log('Queue updated:', data);
        // Use ref to access latest checkPosition without re-binding socket
        if (checkPositionRef.current) {
          checkPositionRef.current();
        }
        updateStats();
        updateStats(); // Double update to ensure sync
      });

      socket.on('shopStatusUpdated', (data: { isOpen: boolean }) => {
        setIsShopOpen(data.isOpen);
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      socket.on('connect', () => {
        setSocketConnected(true);
      });
    };

    setupSocket();
    updateStats();

    return () => {
      socket.off('queueUpdated');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []); // Run once on mount

  const updateStats = async () => {
    try {
      const data = await queueAPI.getStats();
      setStats({
        ...data,
        isShopOpen: data.isOpen
      });
      setIsShopOpen(data.isOpen);
    } catch (err) {
      console.error('Failed to update stats:', err);
    }
  };

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await queueAPI.joinQueue(customerName, phoneNumber, service);

      // Save session
      localStorage.setItem('queue_phone', phoneNumber);
      localStorage.setItem('queue_name', customerName);

      setSuccess(`Welcome ${customerName}!`);
      setPositionData({
        queueNumber: result.queueNumber,
        position: result.position,
        status: 'waiting',
        estimatedWaitTime: result.estimatedWaitTime,
        customerName: customerName,
      });
      setView('position');
      await updateStats();
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('already in the queue')) {
        // Even if error, if they are already in queue, save session and show position
        localStorage.setItem('queue_phone', phoneNumber);
        if (customerName) localStorage.setItem('queue_name', customerName);

        setView('position');
        checkPosition();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    try {
      await queueAPI.cancelQueue(phoneNumber);
      setSuccess('Queue entry cancelled');

      // Clear session
      localStorage.removeItem('queue_phone');
      localStorage.removeItem('queue_name');

      setPositionData(null);
      setView('join');
      setPhoneNumber('');
      setCustomerName('');
      await updateStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <Navbar />

      {/* Hero Section */}
      <div id="home" className="relative overflow-hidden bg-gradient-to-r from-stone-50 via-amber-50/50 to-white text-gray-900 pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 border border-amber-200 shadow-sm transition-transform hover:scale-105">
              <Scissors className="w-4 h-4" />
              <span>Premium Grooming Experience</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight text-gray-900 tracking-tight">
              Master the Art of <span className="text-amber-600 relative inline-block">
                Style
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" fill="currentColor" />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience world-class grooming at Prashant Hair Saloon. Where traditional techniques meet modern aesthetics to craft your signature look.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button
                size="lg"
                variant="default"
                className="w-full sm:w-auto h-14 px-8 text-base shadow-xl shadow-amber-200/50 hover:shadow-amber-200/80 hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => {
                  const el = document.getElementById('join-queue');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="pt-12 border-t border-gray-200/60 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-gray-900">15+</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Years Exp.</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">5k+</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Happy Clients</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">4.9</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Queue Section */}
      <div id="join-queue" className="container mx-auto px-4 pb-20 -mt-20 relative z-20">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {view === 'position' && positionData ? (
            <Card className="mb-8 border-none shadow-2xl shadow-indigo-100 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-50 via-indigo-50/50 to-transparent p-8">
                {positionData.status === 'waiting' && (
                  <>
                    <div className="text-center space-y-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-lg">
                        <Clock className="size-4 text-purple-600" />
                        <span>Waiting in Queue</span>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-3">Your Position</div>
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-purple-600 blur-2xl opacity-20" />
                          <div className="relative text-8xl font-bold text-purple-600">#{positionData.position}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-8 pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{positionData.estimatedWaitTime}</div>
                          <div className="text-xs text-gray-600">minutes wait</div>
                        </div>
                        <div className="h-12 w-px bg-gray-200" />
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stats.waiting}</div>
                          <div className="text-xs text-gray-600">in queue</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                        Relax and wait comfortably. We'll notify you when it's your turn.
                      </p>
                    </div>
                  </>
                )}

                {positionData.status === 'serving' && (
                  <>
                    <div className="text-center space-y-6">
                      <div className="relative inline-flex">
                        <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-40 animate-pulse" />
                        <div className="relative rounded-full bg-amber-500 p-6">
                          <Scissors className="size-16 text-white" />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">Your Turn Now!</h2>
                        <p className="text-lg text-gray-600">Please proceed to the barber chair</p>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Sparkles className="size-4 text-amber-600" />
                        <span className="font-medium text-gray-700">Service in progress</span>
                      </div>
                    </div>
                  </>
                )}

                {positionData.status === 'completed' && (
                  <>
                    <div className="text-center space-y-6">
                      <div className="relative inline-flex">
                        <div className="absolute inset-0 bg-green-500 blur-3xl opacity-40 animate-pulse" />
                        <div className="relative rounded-full bg-green-500 p-6">
                          <CheckCircle2 className="size-16 text-white" />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">All Done!</h2>
                        <p className="text-lg text-gray-600">Thank you for visiting Prashant Hair Saloon</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t bg-white px-8 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Booking for</span>
                  <span className="font-medium text-gray-900">{positionData.customerName}</span>
                </div>
                {positionData.status === 'waiting' && (
                  <button
                    onClick={handleCancel}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancel Queue
                  </button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="mb-8 border-none shadow-2xl shadow-indigo-100 hover:shadow-3xl transition-shadow duration-300">
              <CardContent className="p-10 text-center">
                <div className="rounded-full bg-indigo-100 p-6 inline-flex items-center justify-center mb-6">
                  <Scissors className="size-12 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900">Welcome to Prashant Hair Saloon</h2>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Join the queue below and we'll keep you updated on your position in real-time. No more waiting in line!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Join Queue Form */}
          <div id="join-queue" className="container mx-auto px-4 pb-12 transition-all duration-300">
            <Card className="max-w-md mx-auto overflow-hidden shadow-2xl border-0 ring-1 ring-gray-100 bg-white/95 backdrop-blur-xl">
              {view === 'join' ? (
                <div className="p-8">
                  {/* Shop Status Banner */}
                  {!isShopOpen && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                      <p className="text-red-700 font-bold mb-1">We are currently closed</p>
                      <p className="text-red-600/80 text-sm">Please come back during opening hours</p>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">Get in Line</h3>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Join us at Prashant Hair Saloon</p>
                  </div>

                  {isShopOpen ? (
                    <form onSubmit={handleJoinQueue} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-semibold ml-1">Your Name</Label>
                        <Input
                          id="name"
                          required
                          value={customerName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                          placeholder="John Doe"
                          className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-semibold ml-1">Phone Number</Label>
                        <Input
                          id="phone"
                          required
                          type="tel"
                          value={phoneNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                          placeholder="98765 43210"
                          className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 rounded-xl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="services" className="text-gray-700 font-semibold ml-1">Select Services</Label>
                        <div className="space-y-2 sm:space-y-3">
                          {[
                            { name: 'Haircut', price: '₹120', time: '30m' },
                            { name: 'Beard setting', price: '₹80', time: '20m' },
                            { name: 'Clean shave', price: '₹60', time: '20m' },
                            { name: 'Face cleanup', price: '₹250', time: '25m' },
                            { name: 'Facial', price: '₹400', time: '45m' },
                            { name: 'Treatment facial', price: '₹600', time: '60m' },
                            { name: 'Ladies haircut', price: '₹250', time: '40m' },
                            { name: 'Hair smoothing (Shoulder)', price: '₹3000', time: '120m' },
                            { name: 'Hair pumping men (Half)', price: '₹800', time: '45m' },
                            { name: 'Hair pumping men (Full)', price: '₹1500', time: '75m' },
                          ].map((s) => {
                            const isSelected = service.includes(s.name);
                            return (
                              <div
                                key={s.name}
                                onClick={() => {
                                  const newServices = isSelected
                                    ? service.filter((i: string) => i !== s.name)
                                    : [...service, s.name];
                                  setService(newServices.length ? newServices : []);
                                }}
                                className={`group relative flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md active:scale-[0.99] ${isSelected
                                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-sm'
                                  : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className={`flex items-center justify-center size-8 sm:size-10 rounded-full transition-colors shrink-0 ${isSelected ? 'bg-indigo-100/80 text-indigo-600' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                    {isSelected ? <Check className="size-4 sm:size-5" /> : <Scissors className="size-4 sm:size-5" />}
                                  </div>
                                  <div className="text-left">
                                    <div className={`font-bold text-sm sm:text-base ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>{s.name}</div>
                                    <div className="text-xs text-gray-500 font-medium">Duration: {s.time}</div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className={`font-bold text-sm sm:text-base ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>{s.price}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {service.length === 0 && (
                          <p className="text-sm text-center text-red-500 font-medium bg-red-50 py-2 rounded-lg animate-pulse">
                            Please select at least one service to continue
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-14 text-base font-bold bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-200/50 rounded-xl transition-all hover:scale-[1.02]"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : 'Join the Queue'}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-gray-500 text-sm">
                        Check your position if you are already in the queue.
                      </p>
                      <div className="space-y-2">
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                          placeholder="Enter phone number to check status"
                          className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 rounded-xl"
                        />
                        <Button
                          type="button"
                          onClick={() => checkPosition()}
                          className="w-full h-12 text-base font-bold bg-white text-gray-900 border-2 border-gray-100 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                        >
                          Check Status
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">Your Position</h3>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Real-time updates on your queue status</p>
                  </div>
                  {/* Position data will be rendered here */}
                </div>
              )}
            </Card>
          </div>

          <Card className="shadow-xl border-none shadow-indigo-100">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-4 text-center mb-8">
                <div>
                  <div className="text-2xl font-bold text-amber-600">{stats.avgWait}m</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Avg Wait</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{stats.servedToday}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Served Today</div>
                </div>
              </div>

              {/* Live Queue List */}
              {stats.currentQueue.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Current Live Queue</h4>
                  <div className="space-y-3">
                    {stats.currentQueue.map((c) => (
                      <div
                        key={c.queueNumber}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all ${c.status === 'serving'
                          ? 'bg-amber-50 border-amber-200 shadow-sm'
                          : 'bg-white border-gray-100'
                          }`}
                      >
                        <div className={`size-8 sm:size-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-sm ${c.status === 'serving'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                          }`}>
                          #{c.queueNumber}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 truncate text-sm sm:text-base">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-500 font-medium truncate">
                            {c.status === 'serving' ? 'Started now' : `Waiting for ${c.service || 'Haircut'}`}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {c.status === 'serving' ? (
                            <>
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                              </span>
                              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide hidden sm:block">Serving</span>
                            </>
                          ) : (
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Waiting</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="container mx-auto px-4 pb-8 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Signature Services</h2>
            <p className="text-gray-600 mt-2">Handpicked treatments to keep you looking sharp.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Haircut', price: '₹100', time: '30 min', desc: 'Precision cuts tailored to your style.' },
              { title: 'Beard', price: '₹60', time: '15 min', desc: 'Expert beard shaping and trimming.' },
              { title: 'Clean-up', price: '₹200', time: '20 min', desc: 'Quick facial refresh and cleansing.' },
              { title: 'Ladies Haircut', price: '₹250', time: '40 min', desc: 'Professional styling for women.' },
              { title: 'Facial Normal', price: '₹300', time: '30 min', desc: 'Standard facial for glowing skin.' },
              { title: 'Treatment Facial', price: '₹500', time: '45 min', desc: 'Advanced skin treatment and care.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <span className="text-indigo-600 font-semibold">{item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="size-4" />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/60">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Clients Love Prashant</h2>
            <p className="text-gray-600 mt-2">Real feedback from our regulars.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Aman S.', text: 'Best fades in town. No waiting, super clean shop.' },
              { name: 'Riya K.', text: 'Professional, friendly, and they remember my style every time.' },
              { name: 'Pratik P.', text: 'Loved the hot towel shave. Relaxing experience and great vibe.' },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="size-5 text-amber-500" />
                  <Star className="size-5 text-amber-500" />
                  <Star className="size-5 text-amber-500" />
                  <Star className="size-5 text-amber-500" />
                  <Star className="size-5 text-amber-500" />
                </div>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">“{t.text}”</p>
                <div className="text-sm font-semibold text-gray-900">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team & Trust */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the Stylists</h2>
            <p className="text-gray-600 mb-6">Skilled barbers dedicated to sharp, consistent results.</p>
            <div className="space-y-4">
              {[
                { name: 'Prashant', role: 'Master Barber • 10+ yrs', note: 'Precision cuts, fades, beard styling' },
              ].map((m) => (
                <div key={m.name} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{m.name}</div>
                      <div className="text-sm text-gray-600">{m.role}</div>
                    </div>
                    <Badge variant="default" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                      Pro
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{m.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="location" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Visit Prashant Hair Saloon</h3>
            <p className="text-gray-600 mb-4">Rukhmai Nagar, Ashelegaon, Ulhasnagar 4</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm text-gray-500">Today</div>
                <div className="font-semibold text-gray-900">10 AM - 9 PM (Tue Closed)</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm text-gray-500">Contact</div>
                <div className="font-semibold text-gray-900">+91 86983 22199</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href="https://www.google.com/maps"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Get Directions
              </a>
              <a
                href="tel:+918698322199"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
              >
                Call Now
              </a>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { title: '10k+ Clients', desc: 'Trusted by the community' },
                { title: 'Since 2012', desc: 'Experience you can rely on' },
                { title: 'Hygiene First', desc: 'Sanitized tools & stations' },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-gray-200 p-3">
                  <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Award className="size-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Expert Stylists</h3>
            <p className="text-gray-600">Professional barbers with years of experience</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Clock className="size-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">No Wait Time</h3>
            <p className="text-gray-600">Join queue digitally and relax comfortably</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <Star className="size-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Premium Service</h3>
            <p className="text-gray-600">Quality cuts and grooming at affordable prices</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Prashant Hair Saloon</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Elevating your style with precision cuts and premium grooming services since 2012.
              </p>
              <div className="flex items-center gap-4 pt-2">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="p-2 rounded-full bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-600 transition-all border border-gray-100">
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-gray-900 font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-600">
                <li><a href="#home" className="hover:text-amber-600 transition-colors">Home</a></li>
                <li><a href="#join-queue" className="hover:text-amber-600 transition-colors">Join Queue</a></li>
                <li><a href="#services" className="hover:text-amber-600 transition-colors">Services</a></li>
                <li><a href="#location" className="hover:text-amber-600 transition-colors">Visit Us</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-gray-900 font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <MapPin className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Rukhmai Nagar, Ashelegaon,<br />Ulhasnagar 4</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-5 text-amber-500 shrink-0" />
                  <span>+91 86983 22199</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="size-5 text-amber-500 shrink-0" />
                  <span>info@prashantsaloon.com</span>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-gray-900 font-bold mb-6">Opening Hours</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span>Mon, Wed - Sun</span>
                  <span className="font-semibold text-gray-900">10:00 AM - 9:00 PM</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span>Tuesday</span>
                  <span className="font-semibold text-amber-600">Closed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span>System Status: {socketConnected ? 'Online' : 'Reconnecting...'}</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-1">
              <p>© 2025 Prashant Hair Saloon. All rights reserved.</p>
              <span className="hidden md:inline text-gray-300">|</span>
              <p className="font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Developed by <a href="https://umeshj-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">Umesh Jadhav</a>
              </p>
            </div>


          </div>
        </div>
      </footer>
    </div>
  );
}
