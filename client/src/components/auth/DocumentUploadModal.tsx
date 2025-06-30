
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mitraEmail: string | null;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  mitraEmail
}) => {
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, type: 'ktp' | 'kk') => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;
    const filePath = `${supabase.auth.getUser().then(({data}) => data.user?.id)}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async () => {
    if (!ktpFile || !kkFile) {
      toast({
        title: "Error",
        description: "Harap upload kedua dokumen",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const ktpPath = await handleFileUpload(ktpFile, 'ktp');
      const kkPath = await handleFileUpload(kkFile, 'kk');

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not found');

      const { error } = await supabase
        .from('mitra_verifications')
        .insert({
          mitra_id: userData.user.id,
          ktp_image: ktpPath,
          kk_image: kkPath
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Dokumen berhasil diupload. Tunggu verifikasi dari admin."
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Verifikasi Dokumen Mitra
          </DialogTitle>
          <DialogDescription className="text-left">
            Upload KTP dan Kartu Keluarga untuk verifikasi. Akun akan aktif setelah disetujui oleh admin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Perhatian:</p>
              <p>Pastikan dokumen jelas dan dapat dibaca. Format yang diterima: JPG, PNG, PDF (max 5MB)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ktp">KTP *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <Input
                id="ktp"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setKtpFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="ktp" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {ktpFile ? ktpFile.name : "Klik untuk upload KTP"}
                </p>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kk">Kartu Keluarga *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <Input
                id="kk"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setKkFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="kk" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {kkFile ? kkFile.name : "Klik untuk upload Kartu Keluarga"}
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="flex-1"
            >
              Nanti Saja
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || !ktpFile || !kkFile}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? "Mengupload..." : "Upload Dokumen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
