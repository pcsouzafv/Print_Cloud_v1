import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.auditLog.deleteMany()
  await prisma.printJob.deleteMany()
  await prisma.printQuota.deleteMany()
  await prisma.printCost.deleteMany()
  await prisma.department.deleteMany()
  await prisma.printer.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuários de teste (25 usuários para análise robusta)
  const users = await Promise.all([
    // ADMINISTRADORES
    prisma.user.create({
      data: {
        email: 'admin@empresa.com',
        name: 'Administrador Sistema',
        department: 'TI',
        role: 'ADMIN',
        azureId: 'azure-admin-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ricardo.tech@empresa.com',
        name: 'Ricardo Tecnologia',
        department: 'TI',
        role: 'ADMIN',
        azureId: 'azure-ricardo-id',
      },
    }),

    // GERENTES
    prisma.user.create({
      data: {
        email: 'maria.santos@empresa.com',
        name: 'Maria Santos',
        department: 'Marketing',
        role: 'MANAGER',
        azureId: 'azure-maria-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ana.costa@empresa.com',
        name: 'Ana Costa',
        department: 'Financeiro',
        role: 'MANAGER',
        azureId: 'azure-ana-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'pedro.vendas@empresa.com',
        name: 'Pedro Sales Manager',
        department: 'Vendas',
        role: 'MANAGER',
        azureId: 'azure-pedro-id',
      },
    }),

    // USUÁRIOS TI
    prisma.user.create({
      data: {
        email: 'lucas.dev@empresa.com',
        name: 'Lucas Desenvolvedor',
        department: 'TI',
        role: 'USER',
        azureId: 'azure-lucas-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'fernanda.sys@empresa.com',
        name: 'Fernanda Sistemas',
        department: 'TI',
        role: 'USER',
        azureId: 'azure-fernanda-id',
      },
    }),

    // USUÁRIOS MARKETING
    prisma.user.create({
      data: {
        email: 'julia.design@empresa.com',
        name: 'Julia Designer',
        department: 'Marketing',
        role: 'USER',
        azureId: 'azure-julia-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bruno.social@empresa.com',
        name: 'Bruno Social Media',
        department: 'Marketing',
        role: 'USER',
        azureId: 'azure-bruno-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carla.content@empresa.com',
        name: 'Carla Conteúdo',
        department: 'Marketing',
        role: 'USER',
        azureId: 'azure-carla-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'rodrigo.marketing@empresa.com',
        name: 'Rodrigo Marketing',
        department: 'Marketing',
        role: 'USER',
        azureId: 'azure-rodrigo-id',
      },
    }),

    // USUÁRIOS VENDAS
    prisma.user.create({
      data: {
        email: 'carlos.oliveira@empresa.com',
        name: 'Carlos Oliveira',
        department: 'Vendas',
        role: 'USER',
        azureId: 'azure-carlos-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sandra.comercial@empresa.com',
        name: 'Sandra Comercial',
        department: 'Vendas',
        role: 'USER',
        azureId: 'azure-sandra-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'diego.vendedor@empresa.com',
        name: 'Diego Vendedor',
        department: 'Vendas',
        role: 'USER',
        azureId: 'azure-diego-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'patricia.key@empresa.com',
        name: 'Patricia Key Account',
        department: 'Vendas',
        role: 'USER',
        azureId: 'azure-patricia-id',
      },
    }),

    // USUÁRIOS FINANCEIRO  
    prisma.user.create({
      data: {
        email: 'joana.contabil@empresa.com',
        name: 'Joana Contábil',
        department: 'Financeiro',
        role: 'USER',
        azureId: 'azure-joana-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'marcos.fiscal@empresa.com',
        name: 'Marcos Fiscal',
        department: 'Financeiro',
        role: 'USER',
        azureId: 'azure-marcos-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'camila.contas@empresa.com',
        name: 'Camila Contas a Pagar',
        department: 'Financeiro',
        role: 'USER',
        azureId: 'azure-camila-id',
      },
    }),

    // USUÁRIOS ADMINISTRAÇÃO
    prisma.user.create({
      data: {
        email: 'joao.silva@empresa.com',
        name: 'João Silva',
        department: 'Administração',
        role: 'USER',
        azureId: 'azure-joao-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'beatriz.rh@empresa.com',
        name: 'Beatriz RH',
        department: 'Administração',
        role: 'USER',
        azureId: 'azure-beatriz-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'gustavo.recepcao@empresa.com',
        name: 'Gustavo Recepção',
        department: 'Administração',
        role: 'USER',
        azureId: 'azure-gustavo-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'isabella.admin@empresa.com',
        name: 'Isabella Administrativa',
        department: 'Administração',
        role: 'USER',
        azureId: 'azure-isabella-id',
      },
    }),

    // USUÁRIOS JURÍDICO
    prisma.user.create({
      data: {
        email: 'rafael.juridico@empresa.com',
        name: 'Rafael Jurídico',
        department: 'Jurídico',
        role: 'USER',
        azureId: 'azure-rafael-id',
      },
    }),
    prisma.user.create({
      data: {
        email: 'amanda.contratos@empresa.com',
        name: 'Amanda Contratos',
        department: 'Jurídico',
        role: 'USER',
        azureId: 'azure-amanda-id',
      },
    }),

    // USUÁRIOS OPERAÇÕES  
    prisma.user.create({
      data: {
        email: 'thiago.operacoes@empresa.com',
        name: 'Thiago Operações',
        department: 'Operações',
        role: 'USER',
        azureId: 'azure-thiago-id',
      },
    }),
  ])

  console.log('✅ Usuários criados:', users.length)

  // Criar departamentos (7 departamentos para análise robusta)
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'TI',
        budget: 8000.00,
        monthlyQuota: 15000,
        colorQuota: 3000,
        managerId: users[0].id, // Admin
      },
    }),
    prisma.department.create({
      data: {
        name: 'Marketing',
        budget: 12000.00,
        monthlyQuota: 25000,
        colorQuota: 8000,
        managerId: users[2].id, // Maria
      },
    }),
    prisma.department.create({
      data: {
        name: 'Vendas',
        budget: 10000.00,
        monthlyQuota: 20000,
        colorQuota: 5000,
        managerId: users[4].id, // Pedro (corrigido)
      },
    }),
    prisma.department.create({
      data: {
        name: 'Financeiro',
        budget: 6000.00,
        monthlyQuota: 12000,
        colorQuota: 2000,
        managerId: users[3].id, // Ana
      },
    }),
    prisma.department.create({
      data: {
        name: 'Administração',
        budget: 5000.00,
        monthlyQuota: 10000,
        colorQuota: 1500,
        managerId: users[1].id, // Ricardo (TI Admin)
      },
    }),
    prisma.department.create({
      data: {
        name: 'Jurídico',
        budget: 4000.00,
        monthlyQuota: 8000,
        colorQuota: 1000,
        managerId: users[0].id, // Admin temporário
      },
    }),
    prisma.department.create({
      data: {
        name: 'Operações',
        budget: 7000.00,
        monthlyQuota: 18000,
        colorQuota: 3500,
        managerId: users[0].id, // Admin temporário
      },
    }),
  ])

  console.log('✅ Departamentos criados:', departments.length)

  // Criar impressoras de teste (15 impressoras para análise robusta)
  const printers = await Promise.all([
    // ADMINISTRAÇÃO
    prisma.printer.create({
      data: {
        name: 'HP LaserJet Pro M404dn',
        model: 'M404dn',
        location: 'Administração - 1º Andar - Sala 101',
        ipAddress: '192.168.1.101',
        serialNumber: 'HP404DN001',
        department: 'Administração',
        status: 'ACTIVE',
        isColorPrinter: false,
        monthlyQuota: 5000,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'HP LaserJet M507dn',
        model: 'M507dn',
        location: 'Administração - 1º Andar - RH',
        ipAddress: '192.168.1.111',
        serialNumber: 'HP507DN001',
        department: 'Administração',
        status: 'ACTIVE',
        isColorPrinter: false,
        monthlyQuota: 4000,
      },
    }),

    // MARKETING
    prisma.printer.create({
      data: {
        name: 'Canon ImageRunner C3226i',
        model: 'C3226i',
        location: 'Marketing - 2º Andar - Copa',
        ipAddress: '192.168.1.102',
        serialNumber: 'CANON3226001',
        department: 'Marketing',
        status: 'ACTIVE',
        isColorPrinter: true,
        monthlyQuota: 8000,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'Xerox WorkCentre 6515',
        model: '6515',
        location: 'Marketing - 2º Andar - Design',
        ipAddress: '192.168.1.112',
        serialNumber: 'XEROX6515001',
        department: 'Marketing',
        status: 'ACTIVE',
        isColorPrinter: true,
        monthlyQuota: 6000,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'HP Color LaserJet Pro M454dn',
        model: 'M454dn',
        location: 'Marketing - 2º Andar - Social Media',
        ipAddress: '192.168.1.113',
        serialNumber: 'HP454DN001',
        department: 'Marketing',
        status: 'INACTIVE',
        isColorPrinter: true,
        monthlyQuota: 7000,
      },
    }),

    // VENDAS
    prisma.printer.create({
      data: {
        name: 'Xerox VersaLink C405',
        model: 'C405',
        location: 'Vendas - 1º Andar - Recepção',
        ipAddress: '192.168.1.103',
        serialNumber: 'XEROX405001',
        department: 'Vendas',
        status: 'MAINTENANCE',
        isColorPrinter: true,
        monthlyQuota: 5500,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'Brother MFC-L8900CDW',
        model: 'MFC-L8900CDW',
        location: 'Vendas - 1º Andar - Sala Reunião',
        ipAddress: '192.168.1.114',
        serialNumber: 'BROTHER8900001',
        department: 'Vendas',
        status: 'ACTIVE',
        isColorPrinter: true,
        monthlyQuota: 4500,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'Canon PIXMA G7020',
        model: 'G7020',
        location: 'Vendas - 1º Andar - Key Accounts',
        ipAddress: '192.168.1.115',
        serialNumber: 'CANON7020001',
        department: 'Vendas',
        status: 'ACTIVE',
        isColorPrinter: true,
        monthlyQuota: 3000,
      },
    }),

    // FINANCEIRO
    prisma.printer.create({
      data: {
        name: 'Brother HL-L6400DW',
        model: 'HL-L6400DW',
        location: 'Financeiro - 1º Andar - Contabilidade',
        ipAddress: '192.168.1.104',
        serialNumber: 'BROTHER6400001',
        department: 'Financeiro',
        status: 'ACTIVE',
        isColorPrinter: false,
        monthlyQuota: 6000,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'HP LaserJet Pro M428fdw',
        model: 'M428fdw',
        location: 'Financeiro - 1º Andar - Contas a Pagar',
        ipAddress: '192.168.1.116',
        serialNumber: 'HP428FDW001',
        department: 'Financeiro',
        status: 'ACTIVE',
        isColorPrinter: false,
        monthlyQuota: 5000,
      },
    }),

    // TI
    prisma.printer.create({
      data: {
        name: 'Epson EcoTank L15150',
        model: 'L15150',
        location: 'TI - 3º Andar - Datacenter',
        ipAddress: '192.168.1.105',
        serialNumber: 'EPSON15150001',
        department: 'TI',
        status: 'ERROR',
        isColorPrinter: true,
        monthlyQuota: 4000,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'Brother DCP-L5652DN',
        model: 'DCP-L5652DN',
        location: 'TI - 3º Andar - Desenvolvimento',
        ipAddress: '192.168.1.117',
        serialNumber: 'BROTHER5652001',
        department: 'TI',
        status: 'ACTIVE',
        isColorPrinter: false,
        monthlyQuota: 3500,
      },
    }),

    // JURÍDICO
    prisma.printer.create({
      data: {
        name: 'HP LaserJet Pro MFP M428dw',
        model: 'M428dw',
        location: 'Jurídico - 2º Andar - Contratos',
        ipAddress: '192.168.1.118',
        serialNumber: 'HP428DW001',
        department: 'Jurídico',
        status: 'ACTIVE',
        isColorPrinter: false,
        monthlyQuota: 3000,
      },
    }),

    // OPERAÇÕES
    prisma.printer.create({
      data: {
        name: 'Canon imageCLASS MF644Cdw',
        model: 'MF644Cdw',
        location: 'Operações - Térreo - Expedição',
        ipAddress: '192.168.1.119',
        serialNumber: 'CANON644CDW001',
        department: 'Operações',
        status: 'ACTIVE',
        isColorPrinter: true,
        monthlyQuota: 7000,
      },
    }),
    prisma.printer.create({
      data: {
        name: 'Brother HL-L5100DN',
        model: 'HL-L5100DN',
        location: 'Operações - Térreo - Logística',
        ipAddress: '192.168.1.120',
        serialNumber: 'BROTHER5100001',
        department: 'Operações',
        status: 'MAINTENANCE',
        isColorPrinter: false,
        monthlyQuota: 6500,
      },
    }),
  ])

  console.log('✅ Impressoras criadas:', printers.length)

  // Criar custos de impressão por departamento (7 departamentos)
  const printCosts = await Promise.all([
    prisma.printCost.create({
      data: {
        department: 'TI',
        blackAndWhitePage: 0.025,
        colorPage: 0.10,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Marketing',
        blackAndWhitePage: 0.045,
        colorPage: 0.18,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Vendas',
        blackAndWhitePage: 0.04,
        colorPage: 0.15,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Financeiro',
        blackAndWhitePage: 0.03,
        colorPage: 0.12,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Administração',
        blackAndWhitePage: 0.035,
        colorPage: 0.13,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Jurídico',
        blackAndWhitePage: 0.032,
        colorPage: 0.11,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Operações',
        blackAndWhitePage: 0.038,
        colorPage: 0.14,
      },
    }),
  ])

  console.log('✅ Custos de impressão criados:', printCosts.length)

  // Criar cotas para os usuários
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)

  const quotas = await Promise.all([
    // ADMINISTRADORES
    prisma.printQuota.create({
      data: {
        userId: users[0].id, // Admin
        department: 'TI',
        monthlyLimit: 3000,
        currentUsage: 845,
        colorLimit: 800,
        colorUsage: 234,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[1].id, // Ricardo
        department: 'TI',
        monthlyLimit: 2500,
        currentUsage: 567,
        colorLimit: 600,
        colorUsage: 123,
        resetDate: nextMonth,
      },
    }),

    // GERENTES
    prisma.printQuota.create({
      data: {
        userId: users[2].id, // Maria - Marketing
        department: 'Marketing',
        monthlyLimit: 2000,
        currentUsage: 1567,
        colorLimit: 800,
        colorUsage: 689,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[3].id, // Ana - Financeiro
        department: 'Financeiro',
        monthlyLimit: 1800,
        currentUsage: 534,
        colorLimit: 400,
        colorUsage: 89,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[4].id, // Pedro - Vendas
        department: 'Vendas',
        monthlyLimit: 2200,
        currentUsage: 1789,
        colorLimit: 700,
        colorUsage: 645,
        resetDate: nextMonth,
      },
    }),

    // USUÁRIOS TI
    prisma.printQuota.create({
      data: {
        userId: users[5].id, // Lucas Dev
        department: 'TI',
        monthlyLimit: 800,
        currentUsage: 234,
        colorLimit: 200,
        colorUsage: 45,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[6].id, // Fernanda Sys
        department: 'TI',
        monthlyLimit: 900,
        currentUsage: 678,
        colorLimit: 250,
        colorUsage: 134,
        resetDate: nextMonth,
      },
    }),

    // USUÁRIOS MARKETING - ALTO VOLUME COLORIDO
    prisma.printQuota.create({
      data: {
        userId: users[7].id, // Julia Design
        department: 'Marketing',
        monthlyLimit: 1500,
        currentUsage: 1234,
        colorLimit: 600,
        colorUsage: 567,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[8].id, // Bruno Social
        department: 'Marketing',
        monthlyLimit: 1200,
        currentUsage: 1089,
        colorLimit: 500,
        colorUsage: 445,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[9].id, // Carla Content
        department: 'Marketing',
        monthlyLimit: 1000,
        currentUsage: 823,
        colorLimit: 400,
        colorUsage: 378,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[10].id, // Rodrigo Marketing
        department: 'Marketing',
        monthlyLimit: 800,
        currentUsage: 756,
        colorLimit: 300,
        colorUsage: 289,
        resetDate: nextMonth,
      },
    }),

    // USUÁRIOS VENDAS - CENÁRIOS CRÍTICOS
    prisma.printQuota.create({
      data: {
        userId: users[11].id, // Carlos - CRÍTICO
        department: 'Vendas',
        monthlyLimit: 1000,
        currentUsage: 967,
        colorLimit: 250,
        colorUsage: 248,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[12].id, // Sandra
        department: 'Vendas',
        monthlyLimit: 1200,
        currentUsage: 845,
        colorLimit: 300,
        colorUsage: 234,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[13].id, // Diego
        department: 'Vendas',
        monthlyLimit: 900,
        currentUsage: 678,
        colorLimit: 200,
        colorUsage: 156,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[14].id, // Patricia Key Account
        department: 'Vendas',
        monthlyLimit: 1500,
        currentUsage: 1134,
        colorLimit: 400,
        colorUsage: 345,
        resetDate: nextMonth,
      },
    }),

    // USUÁRIOS FINANCEIRO - EFICIENTES
    prisma.printQuota.create({
      data: {
        userId: users[15].id, // Joana Contábil
        department: 'Financeiro',
        monthlyLimit: 800,
        currentUsage: 234,
        colorLimit: 150,
        colorUsage: 34,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[16].id, // Marcos Fiscal
        department: 'Financeiro',
        monthlyLimit: 1000,
        currentUsage: 456,
        colorLimit: 200,
        colorUsage: 67,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[17].id, // Camila Contas
        department: 'Financeiro',
        monthlyLimit: 700,
        currentUsage: 334,
        colorLimit: 100,
        colorUsage: 23,
        resetDate: nextMonth,
      },
    }),

    // USUÁRIOS ADMINISTRAÇÃO
    prisma.printQuota.create({
      data: {
        userId: users[18].id, // João Silva
        department: 'Administração',
        monthlyLimit: 600,
        currentUsage: 345,
        colorLimit: 150,
        colorUsage: 67,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[19].id, // Beatriz RH
        department: 'Administração',
        monthlyLimit: 800,
        currentUsage: 567,
        colorLimit: 200,
        colorUsage: 145,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[20].id, // Gustavo Recepção
        department: 'Administração',
        monthlyLimit: 400,
        currentUsage: 123,
        colorLimit: 100,
        colorUsage: 34,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[21].id, // Isabella Admin
        department: 'Administração',
        monthlyLimit: 700,
        currentUsage: 445,
        colorLimit: 180,
        colorUsage: 89,
        resetDate: nextMonth,
      },
    }),

    // USUÁRIOS JURÍDICO - BAIXO VOLUME
    prisma.printQuota.create({
      data: {
        userId: users[22].id, // Rafael Jurídico
        department: 'Jurídico',
        monthlyLimit: 500,
        currentUsage: 234,
        colorLimit: 100,
        colorUsage: 23,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[23].id, // Amanda Contratos
        department: 'Jurídico',
        monthlyLimit: 600,
        currentUsage: 345,
        colorLimit: 120,
        colorUsage: 45,
        resetDate: nextMonth,
      },
    }),

    // USUÁRIOS OPERAÇÕES - ALTO VOLUME
    prisma.printQuota.create({
      data: {
        userId: users[24].id, // Thiago Operações
        department: 'Operações',
        monthlyLimit: 2000,
        currentUsage: 1456,
        colorLimit: 500,
        colorUsage: 234,
        resetDate: nextMonth,
      },
    }),
  ])

  console.log('✅ Cotas de usuários criadas:', quotas.length)

  // Criar trabalhos de impressão robustos para análise (50+ jobs)
  const now = new Date()
  const printJobs = []

  // Helper para gerar custos baseados em departamento
  const getCost = (pages: number, copies: number, isColor: boolean, department: string) => {
    const costs = printCosts.find(c => c.department === department)
    if (!costs) return 0
    const unitCost = isColor ? costs.colorPage : costs.blackAndWhitePage
    return Number((pages * copies * unitCost).toFixed(2))
  }

  // JOBS MARKETING - ALTO VOLUME COLORIDO
  const marketingJobs = [
    { user: 7, printer: 2, file: 'Catálogo Produtos 2024.pdf', pages: 24, copies: 50, color: true, status: 'COMPLETED', hoursAgo: 3 },
    { user: 8, printer: 3, file: 'Post Instagram - Campanha.jpg', pages: 1, copies: 100, color: true, status: 'COMPLETED', hoursAgo: 2 },
    { user: 9, printer: 4, file: 'Apresentação Clientes.pptx', pages: 18, copies: 15, color: true, status: 'COMPLETED', hoursAgo: 4 },
    { user: 10, printer: 2, file: 'Flyers Promocionais.pdf', pages: 2, copies: 200, color: true, status: 'COMPLETED', hoursAgo: 1 },
    { user: 2, printer: 3, file: 'Relatório Marketing Q3.docx', pages: 45, copies: 5, color: true, status: 'COMPLETED', hoursAgo: 6 },
    { user: 7, printer: 4, file: 'Banner Evento.pdf', pages: 1, copies: 20, color: true, status: 'FAILED', hoursAgo: 0.5 },
  ]

  // JOBS VENDAS - PROPOSTAS E CONTRATOS
  const salesJobs = [
    { user: 11, printer: 5, file: 'Proposta Comercial - Cliente ABC.pdf', pages: 12, copies: 3, color: false, status: 'COMPLETED', hoursAgo: 2 },
    { user: 12, printer: 6, file: 'Contrato Prestação Serviços.docx', pages: 8, copies: 5, color: false, status: 'COMPLETED', hoursAgo: 1 },
    { user: 13, printer: 7, file: 'Tabela Preços 2024.xlsx', pages: 3, copies: 10, color: true, status: 'COMPLETED', hoursAgo: 3 },
    { user: 14, printer: 5, file: 'Apresentação Key Accounts.pptx', pages: 22, copies: 8, color: true, status: 'PRINTING', hoursAgo: 0.2 },
    { user: 4, printer: 6, file: 'Relatório Vendas Mensal.pdf', pages: 28, copies: 4, color: false, status: 'COMPLETED', hoursAgo: 4 },
    { user: 11, printer: 7, file: 'Orçamento Detalhado.xlsx', pages: 6, copies: 2, color: false, status: 'PENDING', hoursAgo: 0.1 },
  ]

  // JOBS FINANCEIRO - RELATÓRIOS E DOCUMENTOS
  const financeJobs = [
    { user: 15, printer: 8, file: 'Balanço Patrimonial Q3.pdf', pages: 35, copies: 3, color: false, status: 'COMPLETED', hoursAgo: 5 },
    { user: 16, printer: 9, file: 'Declaração IR - Pessoa Jurídica.pdf', pages: 18, copies: 2, color: false, status: 'COMPLETED', hoursAgo: 8 },
    { user: 17, printer: 8, file: 'Contas a Pagar - Outubro.xlsx', pages: 5, copies: 1, color: false, status: 'COMPLETED', hoursAgo: 2 },
    { user: 3, printer: 9, file: 'Demonstrativo Fluxo Caixa.xlsx', pages: 8, copies: 4, color: false, status: 'COMPLETED', hoursAgo: 6 },
    { user: 15, printer: 8, file: 'Comprovantes Bancários.pdf', pages: 12, copies: 1, color: false, status: 'COMPLETED', hoursAgo: 1 },
  ]

  // JOBS TI - DOCUMENTAÇÃO TÉCNICA
  const itJobs = [
    { user: 5, printer: 10, file: 'Manual Sistema PrintCloud.pdf', pages: 65, copies: 2, color: false, status: 'COMPLETED', hoursAgo: 12 },
    { user: 6, printer: 11, file: 'Diagrama Arquitetura.pdf', pages: 8, copies: 3, color: true, status: 'COMPLETED', hoursAgo: 4 },
    { user: 0, printer: 10, file: 'Procedimento Backup.docx', pages: 12, copies: 5, color: false, status: 'COMPLETED', hoursAgo: 7 },
    { user: 1, printer: 11, file: 'Log Erros Sistema.txt', pages: 25, copies: 1, color: false, status: 'FAILED', hoursAgo: 2 },
  ]

  // JOBS ADMINISTRAÇÃO - DOCUMENTOS ADMINISTRATIVOS
  const adminJobs = [
    { user: 18, printer: 0, file: 'Comunicado Interno.docx', pages: 2, copies: 50, color: false, status: 'COMPLETED', hoursAgo: 3 },
    { user: 19, printer: 1, file: 'Formulário Admissão.pdf', pages: 6, copies: 10, color: false, status: 'COMPLETED', hoursAgo: 5 },
    { user: 20, printer: 0, file: 'Lista Presença Reunião.xlsx', pages: 1, copies: 20, color: false, status: 'COMPLETED', hoursAgo: 1 },
    { user: 21, printer: 1, file: 'Política Empresa 2024.pdf', pages: 28, copies: 8, color: false, status: 'PRINTING', hoursAgo: 0.3 },
  ]

  // JOBS JURÍDICO - CONTRATOS E DOCUMENTOS LEGAIS
  const legalJobs = [
    { user: 22, printer: 12, file: 'Contrato Trabalho.docx', pages: 4, copies: 3, color: false, status: 'COMPLETED', hoursAgo: 4 },
    { user: 23, printer: 12, file: 'Termo Confidencialidade.pdf', pages: 3, copies: 8, color: false, status: 'COMPLETED', hoursAgo: 6 },
  ]

  // JOBS OPERAÇÕES - LOGÍSTICA E EXPEDIÇÃO
  const opsJobs = [
    { user: 24, printer: 13, file: 'Etiquetas Expedição.pdf', pages: 10, copies: 50, color: false, status: 'COMPLETED', hoursAgo: 2 },
    { user: 24, printer: 14, file: 'Relatório Logística.xlsx', pages: 15, copies: 3, color: false, status: 'MAINTENANCE', hoursAgo: 1 },
  ]

  const allJobs = [...marketingJobs, ...salesJobs, ...financeJobs, ...itJobs, ...adminJobs, ...legalJobs, ...opsJobs]

  for (const job of allJobs) {
    const cost = getCost(job.pages, job.copies, job.color, users[job.user].department)
    const submittedAt = new Date(now.getTime() - job.hoursAgo * 60 * 60 * 1000)
    const completedAt = job.status === 'COMPLETED' ? 
      new Date(submittedAt.getTime() + Math.random() * 10 * 60 * 1000) : null

    printJobs.push(
      prisma.printJob.create({
        data: {
          userId: users[job.user].id,
          printerId: printers[job.printer].id,
          fileName: job.file,
          pages: job.pages,
          copies: job.copies,
          isColor: job.color,
          cost,
          status: job.status as any,
          submittedAt,
          completedAt,
        },
      })
    )
  }

  const createdJobs = await Promise.all(printJobs)

  console.log('✅ Trabalhos de impressão criados:', createdJobs.length)

  // Criar logs de auditoria robustos para análise
  const auditLogs = await Promise.all([
    // CRIAÇÃO DE IMPRESSORAS
    prisma.auditLog.create({
      data: {
        userId: users[0].id,
        action: 'CREATE_PRINTER',
        entity: 'Printer',
        entityId: printers[0].id,
        details: { printerName: printers[0].name, location: printers[0].location, department: 'Administração' },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[1].id,
        action: 'CREATE_PRINTER',
        entity: 'Printer',
        entityId: printers[10].id,
        details: { printerName: printers[10].name, location: printers[10].location, department: 'TI' },
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 horas atrás
      },
    }),

    // ATUALIZAÇÕES DE COTAS
    prisma.auditLog.create({
      data: {
        userId: users[2].id,
        action: 'UPDATE_QUOTA',
        entity: 'PrintQuota',
        entityId: quotas[2].id,
        details: { userName: 'Maria Santos', oldLimit: 1500, newLimit: 2000, reason: 'Aumento demanda Marketing' },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[4].id,
        action: 'UPDATE_QUOTA',
        entity: 'PrintQuota',
        entityId: quotas[4].id,
        details: { userName: 'Pedro Vendas', oldLimit: 1800, newLimit: 2200, reason: 'Aumento atividade comercial' },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
      },
    }),

    // MANUTENÇÕES DE IMPRESSORAS
    prisma.auditLog.create({
      data: {
        userId: users[0].id,
        action: 'PRINTER_MAINTENANCE',
        entity: 'Printer',
        entityId: printers[5].id,
        details: { printerName: 'Xerox VersaLink C405', status: 'MAINTENANCE', reason: 'Manutenção preventiva toner' },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[1].id,
        action: 'PRINTER_ERROR',
        entity: 'Printer',
        entityId: printers[10].id,
        details: { printerName: 'Epson EcoTank L15150', status: 'ERROR', error: 'Papel atolado - cabeçote bloqueado' },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      },
    }),

    // ALERTAS DE COTAS CRÍTICAS
    prisma.auditLog.create({
      data: {
        userId: users[11].id,
        action: 'QUOTA_ALERT',
        entity: 'PrintQuota',
        entityId: quotas[11].id,
        details: { userName: 'Carlos Oliveira', usage: 967, limit: 1000, utilizationRate: 96.7, severity: 'CRITICAL' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[14].id,
        action: 'QUOTA_WARNING',
        entity: 'PrintQuota',
        entityId: quotas[14].id,
        details: { userName: 'Patricia Key Account', colorUsage: 345, colorLimit: 400, utilizationRate: 86.25, severity: 'WARNING' },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
      },
    }),

    // JOBS DE ALTO CUSTO
    prisma.auditLog.create({
      data: {
        userId: users[2].id,
        action: 'HIGH_COST_JOB',
        entity: 'PrintJob',
        entityId: createdJobs[0].id,
        details: { fileName: 'Catálogo Produtos 2024.pdf', cost: 216, pages: 1200, reason: 'Job colorido alto volume' },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
      },
    }),

    // CONFIGURAÇÕES DE SISTEMA
    prisma.auditLog.create({
      data: {
        userId: users[0].id,
        action: 'UPDATE_DEPARTMENT_BUDGET',
        entity: 'Department',
        entityId: departments[1].id,
        details: { departmentName: 'Marketing', oldBudget: 10000, newBudget: 12000, reason: 'Ajuste orçamento Q4' },
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 dias atrás
      },
    }),
    
    // FALHAS DE IMPRESSÃO
    prisma.auditLog.create({
      data: {
        userId: users[7].id,
        action: 'PRINT_JOB_FAILED',
        entity: 'PrintJob',
        entityId: createdJobs[5].id,
        details: { fileName: 'Banner Evento.pdf', printerName: 'HP Color LaserJet Pro M454dn', error: 'Impressora inativa' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
      },
    }),

    // RELATÓRIO DE ANÁLISE GERADO
    prisma.auditLog.create({
      data: {
        userId: users[0].id,
        action: 'GENERATE_AI_REPORT',
        entity: 'System',
        entityId: 'ai-analysis-001',
        details: { reportType: 'Cost Analysis', period: 'Monthly', savings: 1250, recommendations: 8 },
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
      },
    }),
  ])

  console.log('✅ Logs de auditoria criados:', auditLogs.length)

  // Calcular estatísticas finais
  const totalJobs = createdJobs.length
  const totalCost = createdJobs.reduce((sum, job) => sum + job.cost, 0)
  const colorJobs = createdJobs.filter(job => job.isColor).length
  const criticalUsers = quotas.filter(q => (q.currentUsage / q.monthlyLimit) > 0.9).length
  const activeUsers = quotas.filter(q => q.currentUsage > 0).length
  const activePrinters = printers.filter(p => p.status === 'ACTIVE').length
  const totalPages = createdJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0)

  console.log('🎉 Seed ROBUSTO concluído com sucesso!')
  console.log('\n📊 DATASET COMPLETO CRIADO:')
  console.log(`- ${users.length} usuários (25 funcionários realistas)`)
  console.log(`- ${departments.length} departamentos (com orçamentos diversos)`)
  console.log(`- ${printers.length} impressoras (mix de marcas e status)`)
  console.log(`- ${printCosts.length} configurações de custo por departamento`)
  console.log(`- ${quotas.length} cotas de usuário (cenários diversos)`)
  console.log(`- ${totalJobs} trabalhos de impressão (histórico realista)`)
  console.log(`- ${auditLogs.length} logs de auditoria (rastreabilidade completa)`)
  
  console.log('\n💡 ANÁLISES DISPONÍVEIS PARA A IA:')
  console.log(`- Total de páginas impressas: ${totalPages.toLocaleString()}`)
  console.log(`- Custo total gerado: R$ ${totalCost.toFixed(2)}`)
  console.log(`- Jobs coloridos: ${colorJobs}/${totalJobs} (${Math.round(colorJobs/totalJobs*100)}%)`)
  console.log(`- Usuários ativos: ${activeUsers}/${users.length} (${Math.round(activeUsers/users.length*100)}%)`)
  console.log(`- Usuários críticos (>90% cota): ${criticalUsers} ⚠️`)
  console.log(`- Impressoras ativas: ${activePrinters}/${printers.length} (${Math.round(activePrinters/printers.length*100)}%)`)
  
  console.log('\n🔑 PRINCIPAIS USUÁRIOS DE TESTE:')
  console.log('- admin@empresa.com (ADMIN TI)')
  console.log('- maria.santos@empresa.com (MANAGER Marketing - Alto volume colorido)')
  console.log('- carlos.oliveira@empresa.com (USER Vendas - COTA CRÍTICA 96.7%)')
  console.log('- julia.design@empresa.com (USER Marketing - Designer ativo)')
  console.log('- ana.costa@empresa.com (MANAGER Financeiro - Uso eficiente)')

  console.log('\n🤖 IA PRINTBOT PRONTA PARA ANALISAR:')
  console.log('✅ Padrões de uso por departamento')
  console.log('✅ Detecção de usuários críticos')
  console.log('✅ Oportunidades de economia')
  console.log('✅ Análise preditiva de manutenção')
  console.log('✅ Otimização de custos por departamento')
  console.log('✅ Benchmarking e recomendações inteligentes')
  
  console.log(`\n🔢 TOTAL DE REGISTROS: ${users.length + departments.length + printers.length + printCosts.length + quotas.length + totalJobs + auditLogs.length} registros`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })