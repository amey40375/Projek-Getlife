import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Gift, 
  Image, 
  MessageCircle,
  BarChart3,
  Shield,
  DollarSign
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('verifications');
  const [verifications, setVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMitra: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchVerifications();
      fetchStats();
    }
  }, [profile]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('mitra_verifications')
        .select(`
          *,
          profiles!mitra_verifications_mitra_id_fkey(full_name, phone)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersResult, mitraResult, ordersResult, revenueResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'mitra').eq('is_verified', true),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('balance_transactions').select('amount').eq('type', 'commission')
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalMitra: mitraResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerification = async (verificationId: string, mitraId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      // Update verification status
      const { error: verificationError } = await supabase
        .from('mitra_verifications')
        .update({
          status,
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id
        })
        .eq('id', verificationId);

      if (verificationError) throw verificationError;

      // Update mitra profile if approved
      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', mitraId);

        if (profileError) throw profileError;
      }

      toast({
        title: status === 'approved' ? "Mitra Disetujui" : "Mitra Ditolak",
        description: status === 'approved' ? "Mitra dapat mulai menerima pesanan" : "Mitra telah diberi tahu alasan penolakan"
      });

      fetchVerifications();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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
    { id: 'verifications', label: 'Verifikasi', icon: Users },
    { id: 'orders', label: 'Pesanan', icon: CheckCircle },
    { id: 'vouchers', label: 'Voucher', icon: Gift },
    { id: 'banners', label: 'Banner', icon: Image },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'stats', label: 'Statistik', icon: BarChart3 },
    { id: 'users', label: 'Blokir', icon: Shield }
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
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {profile?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">GetLife Admin</p>
                <p className="text-xs text-gray-500">Dashboard Admin</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto pb-20">
        <div className="p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">Total User</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalMitra}</p>
                <p className="text-xs text-gray-500">Mitra Aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">Total Pesanan</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Pendapatan</p>
              </CardContent>
            </Card>
          </div>

          {/* Verifications List */}
          {activeTab === 'verifications' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Verifikasi Mitra</h2>
              {verifications.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Tidak ada verifikasi pending</p>
                  </CardContent>
                </Card>
              ) : (
                verifications.map((verification) => (
                  <Card key={verification.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{verification.profiles?.full_name}</h3>
                          <p className="text-sm text-gray-600">{verification.profiles?.phone}</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3">
                        Diajukan: {new Date(verification.submitted_at).toLocaleDateString('id-ID')}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVerification(verification.id, verification.mitra_id, 'approved')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Terima
                        </Button>
                        <Button
                          onClick={() => handleVerification(verification.id, verification.mitra_id, 'rejected', 'Dokumen tidak valid')}
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Other tabs content would go here */}
          {activeTab !== 'verifications' && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Fitur {activeTab} sedang dalam pengembangan</p>
              </CardContent>
            </Card>
          )}
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

export default AdminDashboard;
