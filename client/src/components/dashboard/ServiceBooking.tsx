
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Clock, CreditCard, Wallet } from 'lucide-react';

interface ServiceBookingProps {
  services: any[];
  onBookingComplete: () => void;
}

const ServiceBooking: React.FC<ServiceBookingProps> = ({ services, onBookingComplete }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    address: '',
    notes: '',
    payment_method: 'balance'
  });
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);
    try {
      // Get user's current location
      let latitude = null;
      let longitude = null;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.log('Could not get location:', error);
        }
      }

      // Create order
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: profile?.id,
          service_id: selectedService.id,
          service_name: selectedService.name,
          total_price: selectedService.base_price,
          duration_minutes: selectedService.duration_minutes,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          address: formData.address,
          latitude,
          longitude,
          payment_method: formData.payment_method,
          notes: formData.notes
        });

      if (error) throw error;

      toast({
        title: "Pesanan Berhasil",
        description: "Pesanan Anda telah dibuat dan menunggu konfirmasi mitra"
      });

      // Reset form
      setSelectedService(null);
      setFormData({
        scheduled_date: '',
        scheduled_time: '',
        address: '',
        notes: '',
        payment_method: 'balance'
      });

      onBookingComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  if (!selectedService) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Pilih Layanan</h2>
        <div className="grid gap-4">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration_minutes} menit
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(service.base_price)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedService(null)}
        >
          ← Kembali
        </Button>
        <h2 className="text-xl font-bold">Pesan {selectedService.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">
              {selectedService.name.includes('Massage') ? '💆' : '🧽'}
            </span>
            {selectedService.name}
          </CardTitle>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(selectedService.base_price)}
          </p>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Waktu</Label>
            <Input
              id="time"
              type="time"
              value={formData.scheduled_time}
              onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Alamat Lengkap</Label>
          <Textarea
            id="address"
            placeholder="Masukkan alamat lengkap untuk layanan"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="payment">Metode Pembayaran</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => setFormData({...formData, payment_method: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balance">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Saldo
                </div>
              </SelectItem>
              <SelectItem value="cash">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Cash (Bayar di Tempat)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Catatan (Opsional)</Label>
          <Textarea
            id="notes"
            placeholder="Tambahkan catatan khusus untuk mitra..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700" 
          disabled={loading}
        >
          {loading ? "Memproses..." : `Pesan Sekarang - ${formatCurrency(selectedService.base_price)}`}
        </Button>
      </form>
    </div>
  );
};

export default ServiceBooking;
