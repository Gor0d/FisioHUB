import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from '../../app/landing/page'

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('LandingPage', () => {
  beforeEach(() => {
    window.location.href = '';
  });

  it('renders the main heading correctly', () => {
    render(<LandingPage />)
    
    const heading = screen.getByRole('heading', { name: /gestão de indicadores clínicos inteligente/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders all three pricing plans', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Básico')).toBeInTheDocument()
    expect(screen.getByText('Profissional')).toBeInTheDocument()
    expect(screen.getByText('Empresarial')).toBeInTheDocument()
  })

  it('displays the professional plan as most popular', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Mais Popular')).toBeInTheDocument()
  })

  it('shows all feature sections', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Indicadores Clínicos')).toBeInTheDocument()
    expect(screen.getByText('Gestão de Equipes')).toBeInTheDocument()
    expect(screen.getByText('Multi-hospitais')).toBeInTheDocument()
    expect(screen.getByText('Segurança LGPD')).toBeInTheDocument()
    expect(screen.getByText('Acesso Anywhere')).toBeInTheDocument()
    expect(screen.getByText('Tempo Real')).toBeInTheDocument()
  })

  it('renders testimonials section', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Dr. Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('Carlos Santos')).toBeInTheDocument()
    expect(screen.getByText('Dra. Ana Costa')).toBeInTheDocument()
  })

  it('allows email input in hero section', async () => {
    const user = userEvent.setup()
    render(<LandingPage />)
    
    const emailInput = screen.getByPlaceholderText('seu.email@hospital.com')
    await user.type(emailInput, 'test@hospital.com')
    
    expect(emailInput).toHaveValue('test@hospital.com')
  })

  it('redirects to register with email when get started is clicked', async () => {
    const user = userEvent.setup()
    render(<LandingPage />)
    
    const emailInput = screen.getByPlaceholderText('seu.email@hospital.com')
    const getStartedButton = screen.getByRole('button', { name: /começar grátis/i })
    
    await user.type(emailInput, 'test@hospital.com')
    await user.click(getStartedButton)
    
    expect(window.location.href).toBe('/register?email=test%40hospital.com')
  })

  it('redirects to register without email when no email provided', async () => {
    const user = userEvent.setup()
    render(<LandingPage />)
    
    const getStartedButton = screen.getByRole('button', { name: /começar grátis/i })
    await user.click(getStartedButton)
    
    expect(window.location.href).toBe('/register')
  })

  it('displays pricing information correctly', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('R$ 299')).toBeInTheDocument()
    expect(screen.getByText('R$ 799')).toBeInTheDocument()  
    expect(screen.getByText('R$ 1.999')).toBeInTheDocument()
  })

  it('shows plan features correctly', () => {
    render(<LandingPage />)
    
    // Basic plan features
    expect(screen.getByText('1 hospital/clínica')).toBeInTheDocument()
    expect(screen.getByText('Até 50 colaboradores')).toBeInTheDocument()
    
    // Professional plan features
    expect(screen.getByText('Até 5 hospitais')).toBeInTheDocument()
    expect(screen.getByText('B.I completo')).toBeInTheDocument()
    
    // Enterprise plan features
    expect(screen.getByText('Hospitais ilimitados')).toBeInTheDocument()
    expect(screen.getByText('White-label')).toBeInTheDocument()
  })

  it('contains correct CTA links for each plan', () => {
    render(<LandingPage />)
    
    const planLinks = screen.getAllByText('Começar Teste Grátis')
    expect(planLinks).toHaveLength(3)
    
    const basicLink = screen.getByRole('link', { name: /começar teste grátis/i })
    expect(basicLink.closest('a')).toHaveAttribute('href', '/register?plan=basic')
  })

  it('displays trust indicators', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('500+ Hospitais')).toBeInTheDocument()
    expect(screen.getByText('50k+ Profissionais')).toBeInTheDocument()
    expect(screen.getByText('2M+ Indicadores')).toBeInTheDocument()
  })

  it('shows footer with correct links', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Funcionalidades')).toBeInTheDocument()
    expect(screen.getByText('Preços')).toBeInTheDocument()
    expect(screen.getByText('Sobre')).toBeInTheDocument()
    expect(screen.getByText('Contato')).toBeInTheDocument()
    expect(screen.getByText('Central de Ajuda')).toBeInTheDocument()
  })

  it('renders LGPD compliance notice', () => {
    render(<LandingPage />)
    
    expect(screen.getByText(/LGPD compliant/)).toBeInTheDocument()
  })

  it('displays 14 days free trial information', () => {
    render(<LandingPage />)
    
    expect(screen.getByText(/14 dias grátis/)).toBeInTheDocument()
  })

  it('has navigation header with correct links', () => {
    render(<LandingPage />)
    
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /começar grátis/i })).toHaveAttribute('href', '/register')
  })
})