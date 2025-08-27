'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, Eye, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BrandingConfig {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  reportHeader: string;
}

export default function BrandingAdminPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchBranding = async () => {
    if (!tenant?.publicId) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/${tenant.publicId}/branding`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar configurações');
      }

      const data = await response.json();
      
      if (data.success) {
        setBranding(data.data);
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Erro ao carregar branding:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao carregar configurações'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, [tenant?.publicId]);

  const handleInputChange = (field: keyof BrandingConfig, value: string) => {
    if (!branding) return;
    
    setBranding(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!tenant?.publicId || !branding) return;

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/${tenant.publicId}/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          dashboardTitle: branding.dashboardTitle,
          dashboardSubtitle: branding.dashboardSubtitle
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Configurações salvas com sucesso!'
        });
        fetchBranding(); // Refresh data
      } else {
        throw new Error(data.message || 'Erro ao salvar');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao salvar configurações'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tenant?.publicId) return;

    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/${tenant.publicId}/logo`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setBranding(prev => prev ? { ...prev, logoUrl: data.data.logoUrl } : null);
        setMessage({
          type: 'success',
          text: 'Logo enviado com sucesso!'
        });
      } else {
        throw new Error(data.message || 'Erro no upload');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro no upload do logo'
      });
    } finally {
      setUploading(false);
    }
  };

  if (tenantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Tenant não encontrado</p>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎨 Configurações de Marca
        </h1>
        <p className="text-gray-600">
          Personalize o logo, cores e títulos do dashboard para {tenant.name}
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Logo da Organização
            </CardTitle>
            <CardDescription>
              Faça upload do logo oficial da instituição (PNG, JPG, máx 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Logo Preview */}
            {branding.logoUrl && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Logo atual:</p>
                <img 
                  src={branding.logoUrl} 
                  alt="Logo atual" 
                  className="max-h-24 mx-auto border rounded-lg p-2"
                />
              </div>
            )}

            {/* Upload Input */}
            <div>
              <Label htmlFor="logo-upload">Selecionar novo logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="mt-1"
              />
              {uploading && (
                <p className="text-sm text-blue-600 mt-2">Enviando logo...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle>Cores do Dashboard</CardTitle>
            <CardDescription>
              Defina as cores principais e secundárias da interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary-color">Cor Primária</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  id="primary-color"
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  placeholder="#1E40AF"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary-color">Cor Secundária</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  id="secondary-color"
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Text Content Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conteúdo Textual</CardTitle>
            <CardDescription>
              Personalize os títulos e textos do dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dashboard-title">Título do Dashboard</Label>
              <Input
                id="dashboard-title"
                type="text"
                value={branding.dashboardTitle}
                onChange={(e) => handleInputChange('dashboardTitle', e.target.value)}
                placeholder="Indicadores Clínicos"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dashboard-subtitle">Subtítulo do Dashboard</Label>
              <Input
                id="dashboard-subtitle"
                type="text"
                value={branding.dashboardSubtitle}
                onChange={(e) => handleInputChange('dashboardSubtitle', e.target.value)}
                placeholder="Monitoramento em Tempo Real"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
            <CardDescription>
              Visualização de como ficará o header do dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-lg p-6"
              style={{ 
                '--primary-color': branding.primaryColor,
                '--secondary-color': branding.secondaryColor
              } as any}
            >
              <div className="flex items-center gap-6">
                {branding.logoUrl && (
                  <img 
                    src={branding.logoUrl} 
                    alt="Logo preview" 
                    className="h-12 w-auto"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                    {branding.dashboardTitle}
                  </h2>
                  {branding.dashboardSubtitle && (
                    <p className="text-gray-600 mt-1">
                      {branding.dashboardSubtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}