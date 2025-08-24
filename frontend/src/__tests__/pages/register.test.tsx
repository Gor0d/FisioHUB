import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '../../app/register/page'

// Mock fetch
global.fetch = jest.fn()

const mockPush = jest.fn()

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      const params: { [key: string]: string } = {
        email: 'test@example.com',
        plan: 'professional'
      }
      return params[key] || null
    }
  })
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetch.mockClear()
  })

  it('renders step 1 - company information', () => {
    render(<RegisterPage />)
    
    expect(screen.getByText('Informações da Empresa')).toBeInTheDocument()
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Hospital São José')).toBeInTheDocument()
  })

  it('pre-fills email from search params', () => {
    render(<RegisterPage />)
    
    const emailInput = screen.getByDisplayValue('test@example.com')
    expect(emailInput).toBeInTheDocument()
  })

  it('generates slug automatically from company name', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    const slugInput = screen.getByPlaceholderText('hospital-sao-jose')
    
    await user.clear(nameInput)
    await user.type(nameInput, 'Clínica São Paulo')
    
    await waitFor(() => {
      expect(slugInput).toHaveValue('clinica-sao-paulo')
    })
  })

  it('validates required fields in step 1', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    const continueButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(continueButton)
    
    expect(screen.getByText('Nome da empresa é obrigatório')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    const emailInput = screen.getByDisplayValue('test@example.com')
    const slugInput = screen.getByPlaceholderText('hospital-sao-jose')
    
    await user.type(nameInput, 'Test Hospital')
    await user.clear(emailInput)
    await user.type(emailInput, 'invalid-email')
    await user.type(slugInput, 'test-hospital')
    
    const continueButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(continueButton)
    
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })

  it('progresses to step 2 with valid data', async () => {
    const user = userEvent.setup()
    
    // Mock slug availability check
    fetch.mockResolvedValueOnce({
      status: 404, // 404 means slug is available
      json: () => Promise.resolve({ success: false })
    })
    
    render(<RegisterPage />)
    
    // Fill step 1
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    const slugInput = screen.getByPlaceholderText('hospital-sao-jose')
    
    await user.type(nameInput, 'Test Hospital')
    await user.clear(slugInput)
    await user.type(slugInput, 'test-hospital-123')
    
    const continueButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(continueButton)
    
    await waitFor(() => {
      expect(screen.getByText('Dados do Administrador')).toBeInTheDocument()
      expect(screen.getByText('Passo 2 de 3')).toBeInTheDocument()
    })
  })

  it('validates password requirements in step 2', async () => {
    const user = userEvent.setup()
    
    // Mock slug availability
    fetch.mockResolvedValueOnce({
      status: 404,
      json: () => Promise.resolve({ success: false })
    })
    
    render(<RegisterPage />)
    
    // Complete step 1
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    await user.type(nameInput, 'Test Hospital')
    
    const continueButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(continueButton)
    
    await waitFor(() => {
      expect(screen.getByText('Dados do Administrador')).toBeInTheDocument()
    })
    
    // Try invalid password
    const adminNameInput = screen.getByPlaceholderText('João Silva')
    const passwordInput = screen.getByPlaceholderText('Digite uma senha segura')
    
    await user.type(adminNameInput, 'Test Admin')
    await user.type(passwordInput, '123')
    
    const continueStep2Button = screen.getByRole('button', { name: /continuar/i })
    await user.click(continueStep2Button)
    
    expect(screen.getByText('Senha deve ter pelo menos 8 caracteres')).toBeInTheDocument()
  })

  it('shows password strength requirements', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({ status: 404, json: () => Promise.resolve({ success: false }) })
    
    render(<RegisterPage />)
    
    // Navigate to step 2
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    await user.type(nameInput, 'Test Hospital')
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Dados do Administrador')).toBeInTheDocument()
    })
    
    // Test password with missing requirements
    const adminNameInput = screen.getByPlaceholderText('João Silva')
    const passwordInput = screen.getByPlaceholderText('Digite uma senha segura')
    
    await user.type(adminNameInput, 'Test Admin')
    await user.type(passwordInput, 'simplepassword')
    
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    
    expect(screen.getByText(/senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número/i)).toBeInTheDocument()
  })

  it('validates password confirmation', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({ status: 404, json: () => Promise.resolve({ success: false }) })
    
    render(<RegisterPage />)
    
    // Navigate to step 2
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    await user.type(nameInput, 'Test Hospital')
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Dados do Administrador')).toBeInTheDocument()
    })
    
    const adminNameInput = screen.getByPlaceholderText('João Silva')
    const passwordInput = screen.getByPlaceholderText('Digite uma senha segura')
    const confirmPasswordInput = screen.getByPlaceholderText('Digite a senha novamente')
    
    await user.type(adminNameInput, 'Test Admin')
    await user.type(passwordInput, 'StrongPass123')
    await user.type(confirmPasswordInput, 'DifferentPass123')
    
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    
    expect(screen.getByText('Confirmação de senha não confere')).toBeInTheDocument()
  })

  it('shows selected plan in sidebar', () => {
    render(<RegisterPage />)
    
    expect(screen.getByText('Plano Selecionado')).toBeInTheDocument()
    expect(screen.getByText('Profissional')).toBeInTheDocument()
    expect(screen.getByText('R$ 799/mês')).toBeInTheDocument()
    expect(screen.getByText('14 dias grátis')).toBeInTheDocument()
  })

  it('displays progress steps correctly', () => {
    render(<RegisterPage />)
    
    const stepIndicators = screen.getAllByRole('generic').filter(
      el => el.textContent === '1' || el.textContent === '2' || el.textContent === '3'
    )
    expect(stepIndicators.length).toBeGreaterThan(0)
  })

  it('allows going back from step 2', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({ status: 404, json: () => Promise.resolve({ success: false }) })
    
    render(<RegisterPage />)
    
    // Go to step 2
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    await user.type(nameInput, 'Test Hospital')
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Dados do Administrador')).toBeInTheDocument()
    })
    
    // Go back
    const backButton = screen.getByRole('button', { name: /voltar/i })
    await user.click(backButton)
    
    expect(screen.getByText('Informações da Empresa')).toBeInTheDocument()
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({ status: 404, json: () => Promise.resolve({ success: false }) })
    
    render(<RegisterPage />)
    
    // Navigate to step 2
    const nameInput = screen.getByPlaceholderText('Hospital São José')
    await user.type(nameInput, 'Test Hospital')
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Dados do Administrador')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByPlaceholderText('Digite uma senha segura')
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click eye icon to show password
    const eyeButton = passwordInput.nextElementSibling
    await user.click(eyeButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})