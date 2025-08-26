'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MoreVertical, 
  Transfer, 
  LogOut, 
  Eye,
  Edit,
  AlertTriangle 
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Patient } from '@/types';

interface PatientActionsProps {
  patient: Patient;
  onUpdate: () => void; // Callback para atualizar lista
}

export function PatientActions({ patient, onUpdate }: PatientActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Transfer form state
  const [transferData, setTransferData] = useState({
    toBed: '',
    reason: '',
    notes: ''
  });

  // Discharge form state  
  const [dischargeData, setDischargeData] = useState({
    reason: '',
    notes: ''
  });

  const handleBedTransfer = async () => {
    if (!transferData.toBed.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/api/patients/${patient.id}/transfer`, {
        fromBed: (patient as any).bedNumber,
        toBed: transferData.toBed,
        reason: transferData.reason,
        notes: transferData.notes,
        transferDate: new Date().toISOString()
      });

      if (response.data.success) {
        setTransferDialogOpen(false);
        setTransferData({ toBed: '', reason: '', notes: '' });
        onUpdate(); // Refresh patient list
        alert('Transferência registrada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao transferir paciente:', error);
      alert('Erro ao transferir paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientDischarge = async () => {
    if (!dischargeData.reason.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/api/patients/${patient.id}/discharge`, {
        dischargeDate: new Date().toISOString(),
        dischargeReason: dischargeData.reason,
        notes: dischargeData.notes
      });

      if (response.data.success) {
        setDischargeDialogOpen(false);
        setDischargeData({ reason: '', notes: '' });
        onUpdate(); // Refresh patient list
        alert('Alta registrada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao dar alta ao paciente:', error);
      alert('Erro ao dar alta ao paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {/* Simple dropdown menu */}
      {showMenu && (
        <div className="absolute right-0 top-10 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowMenu(false);
                // TODO: Ver detalhes
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </button>
            
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowMenu(false);
                // TODO: Editar
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>

            <hr className="my-1" />

            {patient.isActive && (
              <>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    setTransferDialogOpen(true);
                  }}
                >
                  <Transfer className="h-4 w-4 mr-2" />
                  Transferir Leito
                </button>
                
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    setDischargeDialogOpen(true);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Alta do Paciente
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Paciente</DialogTitle>
            <DialogDescription>
              Registrar transferência de leito para {patient.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Leito Atual
              </label>
              <Input 
                value={(patient as any).bedNumber || 'Não informado'} 
                disabled 
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Novo Leito *
              </label>
              <Input
                placeholder="Ex: UTI-01, 203-B"
                value={transferData.toBed}
                onChange={(e) => setTransferData(prev => ({ ...prev, toBed: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo da Transferência
              </label>
              <Input
                placeholder="Ex: Transferência para UTI"
                value={transferData.reason}
                onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Observações
              </label>
              <Textarea
                placeholder="Observações sobre a transferência..."
                value={transferData.notes}
                onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTransferDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleBedTransfer}
              disabled={loading || !transferData.toBed.trim()}
            >
              {loading ? 'Transferindo...' : 'Confirmar Transferência'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={dischargeDialogOpen} onOpenChange={setDischargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Alta do Paciente
            </DialogTitle>
            <DialogDescription>
              Registrar alta hospitalar de {patient.name}. Esta ação irá inativar o paciente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo da Alta *
              </label>
              <Input
                placeholder="Ex: Melhora do quadro clínico, Alta a pedido"
                value={dischargeData.reason}
                onChange={(e) => setDischargeData(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Observações
              </label>
              <Textarea
                placeholder="Observações sobre a alta, recomendações, etc..."
                value={dischargeData.notes}
                onChange={(e) => setDischargeData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDischargeDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handlePatientDischarge}
              disabled={loading || !dischargeData.reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Processando...' : 'Confirmar Alta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}