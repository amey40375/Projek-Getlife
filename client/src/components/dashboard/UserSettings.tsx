
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  Settings as SettingsIcon,
  Shield,
  Bell
} from 'lucide-react';

const UserSettings: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('id');
  const [notifications, setNotifications] = useState(true);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast({
      title: "Bahasa Diubah",
      description: `Bahasa telah diubah ke ${newLanguage === 'id' ? 'Indonesia' : 'English'}`
    });
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    toast({
      title: enabled ? "Mode Gelap Aktif" : "Mode Terang Aktif",
      description: "Tampilan telah diubah"
    });
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotifications(enabled);
    toast({
      title: enabled ? "Notifikasi Aktif" : "Notifikasi Nonaktif",
      description: enabled ? "Anda akan menerima notifikasi" : "Notifikasi telah dimatikan"
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Berhasil Keluar",
        description: "Anda telah keluar dari akun"
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
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        Pengaturan
      </h2>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informasi Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nama Lengkap</p>
            <p className="font-medium">{profile?.full_name || 'Belum diisi'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nomor Telepon</p>
            <p className="font-medium">{profile?.phone || 'Belum diisi'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium capitalize">{profile?.role}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Edit Profil
          </Button>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Pengaturan Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Bahasa</p>
                <p className="text-sm text-gray-500">Pilih bahasa aplikasi</p>
              </div>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dark Mode Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium">Mode Gelap</p>
                <p className="text-sm text-gray-500">Ubah tampilan aplikasi</p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          {/* Notification Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Notifikasi</p>
                <p className="text-sm text-gray-500">Terima pemberitahuan</p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privasi & Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" size="sm" className="w-full justify-start">
            Ubah Password
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            Kebijakan Privasi
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            Syarat & Ketentuan
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar dari Akun
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p>GetLife v1.0.0</p>
        <p>© 2024 GetLife. All rights reserved.</p>
      </div>
    </div>
  );
};

export default UserSettings;
