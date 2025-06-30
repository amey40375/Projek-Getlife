
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Wallet } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onTopUp }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const topUpAmounts = [
    { amount: 50000, label: 'Rp 50.000' },
    { amount: 100000, label: 'Rp 100.000' },
    { amount: 200000, label: 'Rp 200.000' },
    { amount: 500000, label: 'Rp 500.000' },
    { amount: 1000000, label: 'Rp 1.000.000' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleTopUp = async () => {
    if (!selectedAmount) return;
    
    setLoading(true);
    try {
      await onTopUp(selectedAmount);
      onClose();
      setSelectedAmount(null);
    } catch (error) {
      console.error('Top up error:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Top Up Saldo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pilih nominal yang ingin ditambahkan ke saldo Anda:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {topUpAmounts.map((option) => (
              <Card
                key={option.amount}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAmount === option.amount
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedAmount(option.amount)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAmount === option.amount
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAmount === option.amount && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Catatan:</strong> Ini adalah simulasi top up. Dalam aplikasi nyata, 
              ini akan terhubung dengan payment gateway.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={!selectedAmount || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Memproses..." : `Top Up ${selectedAmount ? formatCurrency(selectedAmount) : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpModal;
