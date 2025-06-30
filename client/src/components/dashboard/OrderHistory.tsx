
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Star, MessageCircle } from 'lucide-react';

interface OrderHistoryProps {
  orders: any[];
  onRefresh: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onRefresh }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'accepted':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'accepted':
        return 'Diterima';
      case 'in_progress':
        return 'Sedang Dikerjakan';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Riwayat Pesanan</h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada riwayat pesanan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <Card key={order.id} className="border-l-4 border-l-blue-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{order.service_name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {order.address}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      {new Date(order.scheduled_date).toLocaleDateString('id-ID')} • {order.scheduled_time}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">
                      {formatCurrency(order.total_price)}
                    </span>
                  </div>
                </div>

                {order.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}

                {order.status === 'completed' && order.rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>Rating: {order.rating}/5</span>
                    {order.review && (
                      <span className="text-gray-500">• "{order.review}"</span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Dipesan: {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </span>
                  
                  {(order.status === 'accepted' || order.status === 'in_progress') && (
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat Mitra
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
