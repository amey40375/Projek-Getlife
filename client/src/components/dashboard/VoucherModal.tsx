
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Gift, Tag, Calendar } from 'lucide-react';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoucherUsed: () => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose, onVoucherUsed }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableVouchers();
    }
  }, [isOpen]);

  const fetchAvailableVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAvailableVouchers(data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleRedeemVoucher = async (code: string) => {
    setLoading(true);
    try {
      // Check if voucher exists and is valid
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString().split('T')[0])
        .single();

      if (voucherError || !voucher) {
        throw new Error('Kode voucher tidak valid atau sudah expired');
      }

      // Check if user has already used this voucher
      const { data: existingUsage } = await supabase
        .from('voucher_usage')
        .select('id')
        .eq('voucher_id', voucher.id)
        .eq('user_id', profile?.id)
        .single();

      if (existingUsage) {
        throw new Error('Anda sudah menggunakan voucher ini');
      }

      // Check usage limit
      if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        throw new Error('Voucher sudah mencapai batas penggunaan');
      }

      // Get current user balance
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', profile?.id)
        .single();

      if (userError) throw userError;

      const currentBalance = userProfile?.balance || 0;
      const newBalance = currentBalance + voucher.amount;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('user_profiles')
        .update({ balance: newBalance })
        .eq('user_id', profile?.id);

      if (balanceError) throw balanceError;

      // Record voucher usage
      const { error: usageError } = await supabase
        .from('voucher_usage')
        .insert({
          voucher_id: voucher.id,
          user_id: profile?.id,
          amount: voucher.amount
        });

      if (usageError) throw usageError;

      // Update voucher used count
      const { error: updateError } = await supabase
        .from('vouchers')
        .update({ used_count: voucher.used_count + 1 })
        .eq('id', voucher.id);

      if (updateError) throw updateError;

      // Record balance transaction
      await supabase
        .from('balance_transactions')
        .insert({
          user_id: profile?.id,
          type: 'voucher',
          amount: voucher.amount,
          description: `Voucher ${voucher.code} - ${voucher.title}`,
          voucher_id: voucher.id
        });

      toast({
        title: "Voucher Berhasil Digunakan!",
        description: `Saldo Anda bertambah ${formatCurrency(voucher.amount)}`
      });

      setVoucherCode('');
      onVoucherUsed();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            Redeem Voucher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Manual Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Masukkan Kode Voucher</label>
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan kode voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                onClick={() => handleRedeemVoucher(voucherCode)}
                disabled={!voucherCode || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "..." : "Redeem"}
              </Button>
            </div>
          </div>

          {/* Available Vouchers */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Voucher Tersedia</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableVouchers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Tidak ada voucher tersedia
                </p>
              ) : (
                availableVouchers.map((voucher) => (
                  <Card
                    key={voucher.id}
                    className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-green-500"
                    onClick={() => handleRedeemVoucher(voucher.code)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Tag className="w-4 h-4 text-green-600" />
                            <span className="font-mono font-bold text-green-600">
                              {voucher.code}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm">{voucher.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Berlaku hingga: {new Date(voucher.valid_until).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {formatCurrency(voucher.amount)}
                          </Badge>
                          {voucher.usage_limit && (
                            <p className="text-xs text-gray-500 mt-1">
                              {voucher.used_count}/{voucher.usage_limit}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherModal;
