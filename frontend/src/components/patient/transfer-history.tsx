'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  ArrowRightLeft,
  Clock,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

interface Transfer {
  id: string;
  patientId: string;
  fromBed: string | null;
  toBed: string;
  transferDate: string;
  reason: string | null;
  notes: string | null;
  createdAt: string;
}

interface TransferHistoryProps {
  patientId: string;
  patientName: string;
}

export function TransferHistory({ patientId, patientName }: TransferHistoryProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchTransferHistory();
    }
  }, [patientId]);

  const fetchTransferHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/patients/${patientId}/transfers`);
      
      if (response.data.success) {
        setTransfers(response.data.data.transfers || []);
      } else {
        setError('Erro ao carregar histórico');
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de transferências:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Transferências
          </CardTitle>
          <CardDescription>
            Carregando histórico de mudanças de leito...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Transferências
          </CardTitle>
          <CardDescription>
            Erro ao carregar histórico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchTransferHistory}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tentar Novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Histórico de Transferências
        </CardTitle>
        <CardDescription>
          {transfers.length > 0 
            ? `${transfers.length} transferência(s) registrada(s)` 
            : 'Nenhuma transferência registrada'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <div className="text-center py-8">
            <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma transferência registrada</p>
            <p className="text-xs text-muted-foreground">
              As movimentações de leito do paciente aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer, index) => (
              <div key={transfer.id} className="relative">
                {/* Timeline line */}
                {index < transfers.length - 1 && (
                  <div className="absolute left-4 top-12 w-px h-16 bg-gray-200" />
                )}
                
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  {/* Transfer content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">
                              {transfer.fromBed ? (
                                <>De: {transfer.fromBed} → Para: {transfer.toBed}</>
                              ) : (
                                <>Internação em: {transfer.toBed}</>
                              )}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {transfer.fromBed ? 'Transferência' : 'Primeira Internação'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(transfer.transferDate)}
                          </div>
                        </div>
                      </div>
                      
                      {transfer.reason && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Motivo:</p>
                          <p className="text-sm">{transfer.reason}</p>
                        </div>
                      )}
                      
                      {transfer.notes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Observações:</p>
                          <p className="text-sm text-muted-foreground">{transfer.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Final timeline dot */}
            <div className="flex gap-4 mt-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-green-800 mb-1">
                    Paciente: {patientName}
                  </h4>
                  <p className="text-xs text-green-700">
                    Histórico completo de transferências
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}