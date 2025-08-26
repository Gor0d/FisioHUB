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
  ArrowRightLeft, 
  LogOut, 
  Eye,
  Edit,
  AlertTriangle 
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Patient } from '@/types';
import { useParams } from 'next/navigation';

interface PatientActionsProps {
  patient: Patient;
  onUpdate: () => void; // Callback para atualizar lista
}

export function PatientActions({ patient, onUpdate }: PatientActionsProps) {
  const params = useParams();
  const slug = params?.slug as string;
  const [showMenu, setShowMenu] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    name: patient.name || '',
    email: patient.email || '',
    phone: patient.phone || '',
    attendanceNumber: (patient as any).attendanceNumber || '',
    bedNumber: (patient as any).bedNumber || '',
    admissionDate: (patient as any).admissionDate ? new Date((patient as any).admissionDate).toISOString().slice(0, 16) : '',
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().slice(0, 10) : '',
    address: patient.address || '',
    diagnosis: (patient as any).diagnosis || '',
    observations: (patient as any).observations || ''
  });

  // Transfer form state
  const [transferData, setTransferData] = useState({
    toBed: '',
    reason: '',
    notes: ''
  });

  // Discharge form state  
  const [dischargeData, setDischargeData] = useState({
    dischargeDate: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    reason: '',
    notes: ''
  });

  const handleEditPatient = async () => {
    if (!editData.name.trim()) return;
    
    setLoading(true);
    try {
      const updatePayload = {
        ...editData,
        birthDate: editData.birthDate ? new Date(editData.birthDate).toISOString() : null,
        admissionDate: editData.admissionDate ? new Date(editData.admissionDate).toISOString() : null
      };

      const response = await api.patch(`/api/patients/${patient.id}`, updatePayload);

      if (response.data.success) {
        setEditDialogOpen(false);
        onUpdate(); // Refresh patient data
        alert('Paciente atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      alert('Erro ao atualizar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
        onUpdate(); // Refresh patient data and history
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
        dischargeDate: new Date(dischargeData.dischargeDate).toISOString(),
        dischargeReason: dischargeData.reason,
        notes: dischargeData.notes
      });

      if (response.data.success) {
        setDischargeDialogOpen(false);
        setDischargeData({ 
          dischargeDate: new Date().toISOString().slice(0, 16),
          reason: '', 
          notes: '' 
        });
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
                window.location.href = `/t/${slug}/patients/${patient.id}`;
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </button>
            
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowMenu(false);
                setEditDialogOpen(true);
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
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Atualizar informações de {patient.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Completo *
                </label>
                <Input
                  placeholder="Nome completo"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Telefone
                  </label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número do Atendimento
                  </label>
                  <Input
                    placeholder="ATD-2024-001"
                    value={editData.attendanceNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, attendanceNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Leito
                  </label>
                  <Input
                    placeholder="101-A"
                    value={editData.bedNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, bedNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Data de Internação
                  </label>
                  <Input
                    type="datetime-local"
                    value={editData.admissionDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, admissionDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Data de Nascimento
                  </label>
                  <Input
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Endereço
                </label>
                <Input
                  placeholder="Rua, número, bairro, cidade"
                  value={editData.address}
                  onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>

            {/* Dados Clínicos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Clínicos</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Diagnóstico
                </label>
                <Input
                  placeholder="Ex: Lombalgia crônica"
                  value={editData.diagnosis}
                  onChange={(e) => setEditData(prev => ({ ...prev, diagnosis: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Observações
                </label>
                <Textarea
                  placeholder="Observações sobre o paciente..."
                  value={editData.observations}
                  onChange={(e) => setEditData(prev => ({ ...prev, observations: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditPatient}
              disabled={loading || !editData.name.trim()}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                Data e Hora da Alta *
              </label>
              <Input
                type="datetime-local"
                value={dischargeData.dischargeDate}
                onChange={(e) => setDischargeData(prev => ({ ...prev, dischargeDate: e.target.value }))}
                className="w-full"
              />
            </div>

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