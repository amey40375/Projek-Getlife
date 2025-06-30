
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Play, 
  CheckCircle,
  MessageCircle,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  User
} from 'lucide-react';

const MitraDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [mitraProfile, setMitraProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchOrders();
      fetchMitraProfile();
    }
  }, [profile]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('mitra_id', profile?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMitraProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('mitra_profiles')
        .select('*')
        .eq('mitra_id', profile?.id)
        .single();
      
      if (error) throw error;
      setMitraProfile(data);
    } catch (error) {
      console.error('Error fetching mitra profile:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleAcceptOrder = async (orderId: string, orderPrice: number) => {
    try {
      const commission = orderPrice * 0.2;
      const currentBalance = mitraProfile?.balance || 0;

      if (currentBalance < commission) {
        toast({
          title: "Saldo Tidak Cukup",
          description: `Saldo Anda tidak mencukupi untuk biaya komisi ${formatCurrency(commission)}`,
          variant: "destructive"
        });
        return;
      }

      // Update order status and mitra
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'accepted',
          mitra_id: profile?.id 
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Deduct commission from mitra balance
      const { error: balanceError } = await supabase
        .from('mitra_profiles')
        .update({ balance: currentBalance - commission })
        .eq('mitra_id', profile?.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('balance_transactions')
        .insert({
          user_id: profile?.id,
          type: 'commission',
          amount: -commission,
          description: 'Biaya komisi layanan',
          order_id: orderId
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Pesanan Diterima",
        description: `Biaya komisi ${formatCurrency(commission)} telah dipotong dari saldo Anda`
      });

      fetchOrders();
      fetchMitraProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleActiveStatus = async () => {
    try {
      const newStatus = !mitraProfile?.is_active;
      const { error } = await supabase
        .from('mitra_profiles')
        .update({ is_active: newStatus })
        .eq('mitra_id', profile?.id);

      if (error) throw error;

      setMitraProfile({ ...mitraProfile, is_active: newStatus });
      toast({
        title: newStatus ? "Status Aktif" : "Status Non-Aktif",
        description: newStatus ? "Anda sekarang dapat menerima pesanan" : "Anda tidak akan menerima pesanan baru"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    { id: 'orders', label: 'Pesanan', icon: MapPin },
    { id: 'history', label: 'Riwayat', icon: Clock },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'balance', label: 'Mutasi', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {profile?.full_name?.charAt(0) || 'M'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">GetLife Mitra</p>
                <p className="text-xs text-gray-500">Dashboard Mitra</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleActiveStatus}
                className="flex items-center gap-1"
              >
                {mitraProfile?.is_active ? (
                  <ToggleRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
                <span className={`text-xs ${mitraProfile?.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                  {mitraProfile?.is_active ? 'Aktif' : 'Non-Aktif'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto pb-20">
        <div className="p-4">
          {/* Balance Card */}
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Saldo Anda</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(mitraProfile?.balance || 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada pesanan masuk</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-blue-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{order.service_name}</h3>
                        <p className="text-sm text-gray-600">{order.address}</p>
                      </div>
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'in_progress' ? 'secondary' :
                        order.status === 'accepted' ? 'outline' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{order.scheduled_date} • {order.scheduled_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>{formatCurrency(order.total_price)}</span>
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <Button
                        onClick={() => handleAcceptOrder(order.id, order.total_price)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        Terima Pesanan
                      </Button>
                    )}

                    {order.status === 'accepted' && (
                      <Button
                        onClick={() => {/* Handle start work */}}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Mulai Kerja
                      </Button>
                    )}

                    {order.status === 'in_progress' && (
                      <Button
                        onClick={() => {/* Handle complete work */}}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Selesai
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
                  onClick={() => setActiveTab(item.id)}
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
    </div>
  );
};

export default MitraDashboard;
