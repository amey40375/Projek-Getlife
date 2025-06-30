
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { 
  Home, 
  Plus, 
  History, 
  CreditCard, 
  Gift, 
  MessageCircle, 
  Settings,
  MapPin,
  Clock,
  Star,
  Wallet
} from 'lucide-react';
import BannerSlider from './BannerSlider';
import ServiceBooking from './ServiceBooking';
import OrderHistory from './OrderHistory';
import TopUpModal from './TopUpModal';
import VoucherModal from './VoucherModal';
import ChatModal from './ChatModal';
import UserSettings from './UserSettings';

const UserDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchUserProfile();
      fetchServices();
      fetchOrders();
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserProfile({
          id: userData.user.id,
          full_name: userData.user.email?.split('@')[0] || 'User',
          email: userData.user.email,
          balance: 500000,
          phone: null
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const demoServices = [
        {
          id: '1',
          name: 'Cleaning Service',
          description: 'Professional home cleaning service',
          price: 150000,
          category: 'Home Services',
          image_url: null,
          is_active: true
        },
        {
          id: '2',
          name: 'AC Repair',
          description: 'Air conditioner maintenance and repair',
          price: 250000,
          category: 'Maintenance',
          image_url: null,
          is_active: true
        },
        {
          id: '3',
          name: 'Plumbing Service',
          description: 'Professional plumbing solutions',
          price: 200000,
          category: 'Maintenance',
          image_url: null,
          is_active: true
        }
      ];
      setServices(demoServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const demoOrders = [
        {
          id: '1',
          service_name: 'Cleaning Service',
          status: 'completed',
          total_amount: 150000,
          scheduled_date: '2024-01-15',
          created_at: '2024-01-10'
        },
        {
          id: '2',
          service_name: 'AC Repair',
          status: 'in_progress',
          total_amount: 250000,
          scheduled_date: '2024-01-20',
          created_at: '2024-01-18'
        }
      ];
      setOrders(demoOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book', label: 'Pesan Jasa', icon: Plus },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'topup', label: 'Top Up', icon: CreditCard },
    { id: 'voucher', label: 'Voucher', icon: Gift },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Selamat datang, {profile?.full_name || 'User'}!
                    </h2>
                    <p className="opacity-90">Pilih layanan yang Anda butuhkan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Saldo Anda</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(userProfile?.balance || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banner Slider */}
            <BannerSlider />

            {/* Quick Services */}
            <div className="grid grid-cols-2 gap-4">
              {services.slice(0, 4).map((service) => (
                <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">
                      {service.name.includes('Massage') ? '💆' : '🧽'}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{service.name}</h3>
                    <p className="text-blue-600 font-bold text-sm">
                      {formatCurrency(service.base_price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {service.duration_minutes} menit
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            {orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{order.service_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.scheduled_date).toLocaleDateString('id-ID')} • {order.scheduled_time}
                          </p>
                        </div>
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'in_progress' ? 'secondary' :
                          order.status === 'accepted' ? 'outline' : 'destructive'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 'book':
        return <ServiceBooking services={services} onBookingComplete={fetchOrders} />;
      
      case 'history':
        return <OrderHistory orders={orders} onRefresh={fetchOrders} />;
      
      case 'settings':
        return <UserSettings />;
      
      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Fitur {activeTab} sedang dalam pengembangan</p>
            </CardContent>
          </Card>
        );
    }
  };

  const handleTopUp = async (amount: number) => {
    try {
      // Update balance
      const newBalance = (userProfile?.balance || 0) + amount;
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ balance: newBalance })
        .eq('user_id', profile?.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('balance_transactions')
        .insert({
          user_id: profile?.id,
          type: 'topup',
          amount: amount,
          description: 'Top up saldo'
        });

      if (transactionError) throw transactionError;

      setUserProfile({ ...userProfile, balance: newBalance });
      toast({
        title: "Berhasil",
        description: `Saldo berhasil ditambah ${formatCurrency(amount)}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">GetLife</p>
                <p className="text-xs text-gray-500">Dashboard User</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-600 text-sm">
                {formatCurrency(userProfile?.balance || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto pb-20">
        <div className="p-4">
          {renderTabContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'topup') {
                      setShowTopUpModal(true);
                    } else if (item.id === 'voucher') {
                      setShowVoucherModal(true);
                    } else if (item.id === 'chat') {
                      setShowChatModal(true);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onTopUp={handleTopUp}
      />
      
      <VoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        onVoucherUsed={fetchUserProfile}
      />
      
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        userType="user"
      />
    </div>
  );
};

export default UserDashboard;
