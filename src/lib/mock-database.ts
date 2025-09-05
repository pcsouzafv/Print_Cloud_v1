// Mock Database com dados massivos para demonstração da IA
// Este arquivo simula um banco povoado com dados realistas para análise

export const MOCK_DATABASE = {
  users: [
    // ADMINISTRADORES
    { id: '1', email: 'admin@empresa.com', name: 'Administrador Sistema', department: 'TI', role: 'ADMIN' },
    { id: '2', email: 'ricardo.tech@empresa.com', name: 'Ricardo Tecnologia', department: 'TI', role: 'ADMIN' },
    
    // GERENTES
    { id: '3', email: 'maria.santos@empresa.com', name: 'Maria Santos', department: 'Marketing', role: 'MANAGER' },
    { id: '4', email: 'ana.costa@empresa.com', name: 'Ana Costa', department: 'Financeiro', role: 'MANAGER' },
    { id: '5', email: 'pedro.vendas@empresa.com', name: 'Pedro Sales Manager', department: 'Vendas', role: 'MANAGER' },
    
    // USUÁRIOS TI
    { id: '6', email: 'lucas.dev@empresa.com', name: 'Lucas Desenvolvedor', department: 'TI', role: 'USER' },
    { id: '7', email: 'fernanda.sys@empresa.com', name: 'Fernanda Sistemas', department: 'TI', role: 'USER' },
    
    // USUÁRIOS MARKETING - ALTO VOLUME
    { id: '8', email: 'julia.design@empresa.com', name: 'Julia Designer', department: 'Marketing', role: 'USER' },
    { id: '9', email: 'bruno.social@empresa.com', name: 'Bruno Social Media', department: 'Marketing', role: 'USER' },
    { id: '10', email: 'carla.content@empresa.com', name: 'Carla Conteúdo', department: 'Marketing', role: 'USER' },
    { id: '11', email: 'rodrigo.marketing@empresa.com', name: 'Rodrigo Marketing', department: 'Marketing', role: 'USER' },
    
    // USUÁRIOS VENDAS - CRÍTICOS
    { id: '12', email: 'carlos.oliveira@empresa.com', name: 'Carlos Oliveira', department: 'Vendas', role: 'USER' },
    { id: '13', email: 'sandra.comercial@empresa.com', name: 'Sandra Comercial', department: 'Vendas', role: 'USER' },
    { id: '14', email: 'diego.vendedor@empresa.com', name: 'Diego Vendedor', department: 'Vendas', role: 'USER' },
    { id: '15', email: 'patricia.key@empresa.com', name: 'Patricia Key Account', department: 'Vendas', role: 'USER' },
    
    // USUÁRIOS FINANCEIRO - EFICIENTES
    { id: '16', email: 'joana.contabil@empresa.com', name: 'Joana Contábil', department: 'Financeiro', role: 'USER' },
    { id: '17', email: 'marcos.fiscal@empresa.com', name: 'Marcos Fiscal', department: 'Financeiro', role: 'USER' },
    { id: '18', email: 'camila.contas@empresa.com', name: 'Camila Contas a Pagar', department: 'Financeiro', role: 'USER' },
    
    // USUÁRIOS ADMINISTRAÇÃO
    { id: '19', email: 'joao.silva@empresa.com', name: 'João Silva', department: 'Administração', role: 'USER' },
    { id: '20', email: 'beatriz.rh@empresa.com', name: 'Beatriz RH', department: 'Administração', role: 'USER' },
    { id: '21', email: 'gustavo.recepcao@empresa.com', name: 'Gustavo Recepção', department: 'Administração', role: 'USER' },
    { id: '22', email: 'isabella.admin@empresa.com', name: 'Isabella Administrativa', department: 'Administração', role: 'USER' },
    
    // USUÁRIOS JURÍDICO
    { id: '23', email: 'rafael.juridico@empresa.com', name: 'Rafael Jurídico', department: 'Jurídico', role: 'USER' },
    { id: '24', email: 'amanda.contratos@empresa.com', name: 'Amanda Contratos', department: 'Jurídico', role: 'USER' },
    
    // USUÁRIOS OPERAÇÕES
    { id: '25', email: 'thiago.operacoes@empresa.com', name: 'Thiago Operações', department: 'Operações', role: 'USER' },
  ],

  departments: [
    { name: 'TI', budget: 8000.00, monthlyQuota: 15000, colorQuota: 3000, employees: 4 },
    { name: 'Marketing', budget: 12000.00, monthlyQuota: 25000, colorQuota: 8000, employees: 5 },
    { name: 'Vendas', budget: 10000.00, monthlyQuota: 20000, colorQuota: 5000, employees: 5 },
    { name: 'Financeiro', budget: 6000.00, monthlyQuota: 12000, colorQuota: 2000, employees: 4 },
    { name: 'Administração', budget: 5000.00, monthlyQuota: 10000, colorQuota: 1500, employees: 4 },
    { name: 'Jurídico', budget: 4000.00, monthlyQuota: 8000, colorQuota: 1000, employees: 2 },
    { name: 'Operações', budget: 7000.00, monthlyQuota: 18000, colorQuota: 3500, employees: 1 },
  ],

  printers: [
    // ADMINISTRAÇÃO
    { id: 'p1', name: 'HP LaserJet Pro M404dn', department: 'Administração', status: 'ACTIVE', isColor: false, utilization: 72 },
    { id: 'p2', name: 'HP LaserJet M507dn', department: 'Administração', status: 'ACTIVE', isColor: false, utilization: 45 },
    
    // MARKETING - ALTO VOLUME COLORIDO
    { id: 'p3', name: 'Canon ImageRunner C3226i', department: 'Marketing', status: 'ACTIVE', isColor: true, utilization: 89 },
    { id: 'p4', name: 'Xerox WorkCentre 6515', department: 'Marketing', status: 'ACTIVE', isColor: true, utilization: 94 },
    { id: 'p5', name: 'HP Color LaserJet Pro M454dn', department: 'Marketing', status: 'INACTIVE', isColor: true, utilization: 0 },
    
    // VENDAS
    { id: 'p6', name: 'Xerox VersaLink C405', department: 'Vendas', status: 'MAINTENANCE', isColor: true, utilization: 0 },
    { id: 'p7', name: 'Brother MFC-L8900CDW', department: 'Vendas', status: 'ACTIVE', isColor: true, utilization: 76 },
    { id: 'p8', name: 'Canon PIXMA G7020', department: 'Vendas', status: 'ACTIVE', isColor: true, utilization: 82 },
    
    // FINANCEIRO
    { id: 'p9', name: 'Brother HL-L6400DW', department: 'Financeiro', status: 'ACTIVE', isColor: false, utilization: 56 },
    { id: 'p10', name: 'HP LaserJet Pro M428fdw', department: 'Financeiro', status: 'ACTIVE', isColor: false, utilization: 38 },
    
    // TI
    { id: 'p11', name: 'Epson EcoTank L15150', department: 'TI', status: 'ERROR', isColor: true, utilization: 0 },
    { id: 'p12', name: 'Brother DCP-L5652DN', department: 'TI', status: 'ACTIVE', isColor: false, utilization: 29 },
    
    // JURÍDICO
    { id: 'p13', name: 'HP LaserJet Pro MFP M428dw', department: 'Jurídico', status: 'ACTIVE', isColor: false, utilization: 43 },
    
    // OPERAÇÕES
    { id: 'p14', name: 'Canon imageCLASS MF644Cdw', department: 'Operações', status: 'ACTIVE', isColor: true, utilization: 87 },
    { id: 'p15', name: 'Brother HL-L5100DN', department: 'Operações', status: 'MAINTENANCE', isColor: false, utilization: 0 },
  ],

  // COTAS CRÍTICAS E VARIADAS PARA ANÁLISE
  quotas: [
    // CRÍTICOS (>90%)
    { userId: '12', department: 'Vendas', monthlyLimit: 1000, currentUsage: 967, utilizationRate: 96.7, colorLimit: 250, colorUsage: 248 },
    { userId: '8', department: 'Marketing', monthlyLimit: 1500, currentUsage: 1423, utilizationRate: 94.8, colorLimit: 600, colorUsage: 587 },
    { userId: '15', department: 'Vendas', monthlyLimit: 1500, currentUsage: 1389, utilizationRate: 92.6, colorLimit: 400, colorUsage: 378 },
    
    // ALTOS (70-89%)
    { userId: '9', department: 'Marketing', monthlyLimit: 1200, currentUsage: 1034, utilizationRate: 86.2, colorLimit: 500, colorUsage: 456 },
    { userId: '25', department: 'Operações', monthlyLimit: 2000, currentUsage: 1689, utilizationRate: 84.5, colorLimit: 500, colorUsage: 278 },
    { userId: '3', department: 'Marketing', monthlyLimit: 2000, currentUsage: 1634, utilizationRate: 81.7, colorLimit: 800, colorUsage: 689 },
    { userId: '5', department: 'Vendas', monthlyLimit: 2200, currentUsage: 1756, utilizationRate: 79.8, colorLimit: 700, colorUsage: 612 },
    
    // MÉDIOS (40-69%)
    { userId: '11', department: 'Marketing', monthlyLimit: 800, currentUsage: 478, utilizationRate: 59.8, colorLimit: 300, colorUsage: 267 },
    { userId: '20', department: 'Administração', monthlyLimit: 800, currentUsage: 456, utilizationRate: 57.0, colorLimit: 200, colorUsage: 123 },
    { userId: '13', department: 'Vendas', monthlyLimit: 1200, currentUsage: 634, utilizationRate: 52.8, colorLimit: 300, colorUsage: 189 },
    
    // EFICIENTES (<40%)
    { userId: '16', department: 'Financeiro', monthlyLimit: 800, currentUsage: 234, utilizationRate: 29.3, colorLimit: 150, colorUsage: 34 },
    { userId: '17', department: 'Financeiro', monthlyLimit: 1000, currentUsage: 267, utilizationRate: 26.7, colorLimit: 200, colorUsage: 45 },
    { userId: '6', department: 'TI', monthlyLimit: 800, currentUsage: 189, utilizationRate: 23.6, colorLimit: 200, colorUsage: 23 },
  ],

  // ANÁLISE DE CUSTOS POR DEPARTAMENTO (ÚLTIMOS 30 DIAS)
  costAnalysis: {
    'Marketing': {
      totalCost: 2847.50,
      bwPages: 8920,
      colorPages: 12340,
      bwCost: 401.40, // 8920 * 0.045
      colorCost: 2446.10, // 12340 * 0.18 + extras
      employees: 5,
      avgCostPerEmployee: 569.50,
      colorRatio: 58.0,
      trend: 'increasing'
    },
    'Vendas': {
      totalCost: 1923.80,
      bwPages: 15670,
      colorPages: 7890,
      bwCost: 626.80, // 15670 * 0.04
      colorCost: 1297.00, // 7890 * 0.15 + extras
      employees: 5,
      avgCostPerEmployee: 384.76,
      colorRatio: 33.5,
      trend: 'stable'
    },
    'Financeiro': {
      totalCost: 743.20,
      bwPages: 18560,
      colorPages: 2340,
      bwCost: 556.80, // 18560 * 0.03
      colorCost: 186.40, // 2340 * 0.08 (mais eficiente)
      employees: 4,
      avgCostPerEmployee: 185.80,
      colorRatio: 11.2,
      trend: 'decreasing'
    },
    'TI': {
      totalCost: 534.75,
      bwPages: 12340,
      colorPages: 2560,
      bwCost: 308.50, // 12340 * 0.025
      colorCost: 226.25, // 2560 * 0.08 + manutenção
      employees: 4,
      avgCostPerEmployee: 133.69,
      colorRatio: 17.2,
      trend: 'stable'
    },
    'Administração': {
      totalCost: 823.45,
      bwPages: 16780,
      colorPages: 3450,
      bwCost: 587.30, // 16780 * 0.035
      colorCost: 236.15, // 3450 * 0.07 (eficiente)
      employees: 4,
      avgCostPerEmployee: 205.86,
      colorRatio: 17.1,
      trend: 'stable'
    },
    'Operações': {
      totalCost: 1456.30,
      bwPages: 23450,
      colorPages: 4680,
      bwCost: 891.10, // 23450 * 0.038
      colorCost: 565.20, // 4680 * 0.12
      employees: 1,
      avgCostPerEmployee: 1456.30,
      colorRatio: 16.6,
      trend: 'increasing'
    }
  },

  // EVENTOS CRÍTICOS PARA ANÁLISE
  criticalEvents: [
    {
      type: 'QUOTA_CRITICAL',
      user: 'Carlos Oliveira',
      department: 'Vendas',
      details: 'Usuário atingiu 96.7% da cota mensal com 4 dias restantes',
      severity: 'HIGH',
      impact: 'Potencial bloqueio de impressão em período crítico de vendas',
      recommendation: 'Aumentar cota emergencial ou redistributir para impressora compartilhada'
    },
    {
      type: 'PRINTER_DOWN',
      printer: 'Xerox VersaLink C405',
      department: 'Vendas',
      details: 'Impressora colorida principal em manutenção há 6 horas',
      severity: 'MEDIUM',
      impact: 'Fila de 23 jobs pendentes, R$ 89 em produtividade perdida',
      recommendation: 'Redirecionar jobs para Brother MFC-L8900CDW (3min setup)'
    },
    {
      type: 'COST_SPIKE',
      department: 'Marketing',
      details: 'Aumento de 45% nos custos coloridos nos últimos 7 dias',
      severity: 'MEDIUM',
      impact: 'Orçamento mensal pode ser excedido em R$ 1.200',
      recommendation: 'Implementar aprovação para jobs coloridos >50 páginas'
    },
    {
      type: 'MAINTENANCE_DUE',
      printer: 'Canon ImageRunner C3226i',
      department: 'Marketing',
      details: 'Previsão ML: 89% chance de falha nas próximas 72h',
      severity: 'LOW',
      impact: 'Possível interrupção do departamento de maior volume',
      recommendation: 'Agendar manutenção preventiva para fim de semana'
    }
  ],

  // PADRÕES IDENTIFICADOS PELA IA
  patterns: {
    peakHours: ['09:00-10:00', '14:00-15:00', '16:00-17:00'],
    peakDays: ['Terça-feira', 'Quarta-feira', 'Quinta-feira'],
    seasonality: 'Aumento de 23% no fim do mês (relatórios)',
    inefficiencies: [
      'Marketing imprime 47% mais em colorido que benchmark setorial',
      'TI tem 2 impressoras subutilizadas (29% e 0% utilização)',
      '3 usuários consomem 43% do orçamento total'
    ],
    opportunities: [
      'Duplex automático pode economizar R$ 890/mês (38% redução papel)',
      'Consolidação de impressoras TI: economia de R$ 340/mês',
      'Cotas dinâmicas podem otimizar utilização em 27%'
    ]
  },

  // BENCHMARK SETORIAL
  benchmark: {
    industry: 'Tecnologia/Consultoria',
    employees: '20-50',
    metrics: {
      costPerEmployee: 285.40, // Empresa: 329.20 (+15.4%)
      colorRatio: 22.5, // Empresa: 31.2 (+38.7%)
      utilizationRate: 67.0, // Empresa: 58.3 (-13.0%)
      maintenanceFreq: 4.2, // Empresa: 2.1 (melhor)
      paperWaste: 12.5 // Empresa: 18.3 (+46.4%)
    }
  }
};

// Função para simular contexto rico do usuário
export function getMockUserContext(userId?: string) {
  const user = MOCK_DATABASE.users.find(u => u.id === userId) || MOCK_DATABASE.users[0];
  const userQuota = MOCK_DATABASE.quotas.find(q => q.userId === userId);
  const deptCost = MOCK_DATABASE.costAnalysis[user.department];
  
  return {
    user: {
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
    },
    userStats: {
      totalJobs: Math.floor(Math.random() * 150) + 50,
      totalPages: Math.floor(Math.random() * 3000) + 500,
      totalCost: userQuota ? (userQuota.currentUsage * 0.08) : Math.floor(Math.random() * 200) + 50,
      colorJobs: Math.floor(Math.random() * 30) + 10,
      averagePagesPerJob: 8.3,
      averageCostPerJob: 1.47,
    },
    quotaUsage: userQuota ? {
      monthlyUsage: userQuota.currentUsage,
      monthlyLimit: userQuota.monthlyLimit,
      colorUsage: userQuota.colorUsage,
      colorLimit: userQuota.colorLimit,
      usagePercentage: userQuota.utilizationRate,
      colorUsagePercentage: (userQuota.colorUsage / userQuota.colorLimit) * 100,
    } : null,
    departmentData: {
      name: user.department,
      totalCost: deptCost?.totalCost || 500,
      employees: deptCost?.employees || 3,
      avgCostPerEmployee: deptCost?.avgCostPerEmployee || 150,
      colorRatio: deptCost?.colorRatio || 25,
      trend: deptCost?.trend || 'stable'
    },
    printerIssues: MOCK_DATABASE.printers.filter(p => 
      p.department === user.department && p.status !== 'ACTIVE'
    ),
    criticalEvents: MOCK_DATABASE.criticalEvents.filter(e => 
      e.department === user.department || e.type === 'QUOTA_CRITICAL'
    ),
    benchmark: MOCK_DATABASE.benchmark,
    patterns: MOCK_DATABASE.patterns
  };
}

// Função para obter insights contextuais
export function getContextualInsights(department?: string) {
  const deptData = department ? MOCK_DATABASE.costAnalysis[department] : null;
  const deptPrinters = MOCK_DATABASE.printers.filter(p => p.department === department);
  const deptEvents = MOCK_DATABASE.criticalEvents.filter(e => e.department === department);
  
  return {
    departmentOverview: deptData ? {
      cost: deptData.totalCost,
      efficiency: deptData.avgCostPerEmployee < 300 ? 'high' : 'medium',
      colorOptimization: deptData.colorRatio > 30 ? 'opportunity' : 'good',
      trend: deptData.trend
    } : null,
    printerHealth: {
      total: deptPrinters.length,
      active: deptPrinters.filter(p => p.status === 'ACTIVE').length,
      issues: deptPrinters.filter(p => p.status !== 'ACTIVE').length,
      utilization: deptPrinters.reduce((sum, p) => sum + p.utilization, 0) / deptPrinters.length
    },
    alerts: deptEvents.filter(e => e.severity === 'HIGH').length,
    recommendations: MOCK_DATABASE.patterns.opportunities
  };
}