'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NavigationHeader } from '@/components/ui/navigation-header'
import { api } from '@/lib/api'
// import { Patient, formatPatientDisplay } from '@fisiohub/shared'
// import { CID_CODES } from '@fisiohub/shared/src/data/cid-codes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Patient, formatPatientDisplay } from '@/types'

interface PatientFormData {
  name: string
  email: string
  phone: string
  attendanceNumber: string
  bedNumber: string
  birthDate: string
  address: string
  cid: string
  diagnosis: string
  observations: string
}

const initialFormData: PatientFormData = {
  name: '',
  email: '',
  phone: '',
  attendanceNumber: '',
  bedNumber: '',
  birthDate: '',
  address: '',
  cid: '',
  diagnosis: '',
  observations: ''
}

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [formData, setFormData] = useState<PatientFormData>(initialFormData)
  const [editingPatient, setEditingPatient] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients', {
        params: { search: searchTerm }
      })
      if (response.data.success) {
        setPatients(response.data.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
      alert('Erro ao carregar pacientes')
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [searchTerm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = editingPatient ? `/api/patients/${editingPatient}` : '/api/patients'
      const method = editingPatient ? 'PUT' : 'POST'
      
      const response = await api({
        method,
        url: endpoint,
        data: {
          ...formData,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          attendanceNumber: formData.attendanceNumber || undefined,
          bedNumber: formData.bedNumber || undefined,
          birthDate: formData.birthDate || undefined,
          address: formData.address || undefined,
          cid: formData.cid || undefined,
          diagnosis: formData.diagnosis || undefined,
          observations: formData.observations || undefined,
        }
      })

      if (response.data.success) {
        const message = editingPatient ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!'
        alert(`✅ ${message}\n\n📊 O dashboard será atualizado automaticamente com os novos dados.`)
        setFormData(initialFormData)
        setEditingPatient(null)
        fetchPatients()
        
        // Redirecionar automaticamente para a aba de lista após 2 segundos
        setTimeout(() => {
          const listTab = document.querySelector('[data-value="lista"]') as HTMLElement
          if (listTab) {
            listTab.click()
          }
        }, 1500)
      }
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error)
      alert(error.response?.data?.message || 'Erro ao salvar paciente')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (patient: Patient) => {
    setFormData({
      name: patient.name,
      email: patient.email || '',
      phone: patient.phone || '',
      attendanceNumber: patient.attendanceNumber || '',
      bedNumber: patient.bedNumber || '',
      birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '',
      address: patient.address || '',
      cid: patient.cid || '',
      diagnosis: patient.diagnosis || '',
      observations: patient.observations || ''
    })
    setEditingPatient(patient.id)
  }

  const handleDelete = async (patientId: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return

    try {
      const response = await api.delete(`/api/patients/${patientId}`)
      if (response.data.success) {
        alert('Paciente excluído com sucesso!')
        fetchPatients()
      }
    } catch (error: any) {
      console.error('Erro ao excluir paciente:', error)
      alert(error.response?.data?.message || 'Erro ao excluir paciente')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const cancelEdit = () => {
    setFormData(initialFormData)
    setEditingPatient(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader title="Gerenciamento de Pacientes" />
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pacientes</h1>
        <p className="text-gray-600">Cadastre e gerencie seus pacientes</p>
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista">Lista de Pacientes</TabsTrigger>
          <TabsTrigger value="cadastro">
            {editingPatient ? 'Editar Paciente' : 'Cadastrar Paciente'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar pacientes por nome, email ou número de atendimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Pacientes Cadastrados</h2>
            </div>
            <div className="divide-y">
              {patients.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Nenhum paciente encontrado</p>
                </div>
              ) : (
                patients.map((patient) => (
                  <div key={patient.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-900">
                          {formatPatientDisplay(patient)}
                        </h3>
                        {patient.email && (
                          <p className="text-sm text-gray-600">📧 {patient.email}</p>
                        )}
                        {patient.phone && (
                          <p className="text-sm text-gray-600">📱 {patient.phone}</p>
                        )}
                        {patient.attendanceNumber && (
                          <p className="text-sm text-gray-600">🏷️ Atendimento: {patient.attendanceNumber}</p>
                        )}
                        {patient.bedNumber && (
                          <p className="text-sm text-gray-600">🏥 Leito: {patient.bedNumber}</p>
                        )}
                        {patient.cid && (
                          <p className="text-sm text-gray-600">📋 CID: {patient.cid}</p>
                        )}
                        {patient.diagnosis && (
                          <p className="text-sm text-gray-600">🩺 {patient.diagnosis}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(patient)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cadastro">
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                {editingPatient ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome completo do paciente"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="attendanceNumber">Número de Atendimento *</Label>
                  <Input
                    id="attendanceNumber"
                    name="attendanceNumber"
                    value={formData.attendanceNumber}
                    onChange={handleInputChange}
                    placeholder="Ex: 2024001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bedNumber">Leito</Label>
                  <Input
                    id="bedNumber"
                    name="bedNumber"
                    value={formData.bedNumber}
                    onChange={handleInputChange}
                    placeholder="Ex: 101A, UTI-05"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="cid">CID *</Label>
                  <Select value={formData.cid} onValueChange={(value) => setFormData(prev => ({ ...prev, cid: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o CID" />
                    </SelectTrigger>
                    <SelectContent>
                      {CID_CODES.map((cid) => (
                        <SelectItem key={cid.code} value={cid.code}>
                          {cid.code} - {cid.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Input
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Diagnóstico principal"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  placeholder="Observações adicionais sobre o paciente"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingPatient ? 'Atualizar Paciente' : 'Cadastrar Paciente')}
                </Button>
                {editingPatient && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar Edição
                  </Button>
                )}
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}