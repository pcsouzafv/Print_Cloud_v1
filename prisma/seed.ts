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

  // Criar usuários de teste
  const users = await Promise.all([
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
        email: 'joao.silva@empresa.com',
        name: 'João Silva',
        department: 'Administração',
        role: 'USER',
        azureId: 'azure-joao-id',
      },
    }),
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
        email: 'carlos.oliveira@empresa.com',
        name: 'Carlos Oliveira',
        department: 'Vendas',
        role: 'USER',
        azureId: 'azure-carlos-id',
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
  ])

  console.log('✅ Usuários criados:', users.length)

  // Criar departamentos
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'TI',
        budget: 5000.00,
        monthlyQuota: 10000,
        colorQuota: 2000,
        managerId: users[0].id, // Admin
      },
    }),
    prisma.department.create({
      data: {
        name: 'Marketing',
        budget: 8000.00,
        monthlyQuota: 15000,
        colorQuota: 5000,
        managerId: users[2].id, // Maria
      },
    }),
    prisma.department.create({
      data: {
        name: 'Vendas',
        budget: 6000.00,
        monthlyQuota: 12000,
        colorQuota: 3000,
        managerId: users[4].id, // Ana (será manager de Vendas por agora)
      },
    }),
    prisma.department.create({
      data: {
        name: 'Financeiro',
        budget: 4000.00,
        monthlyQuota: 8000,
        colorQuota: 1500,
        managerId: users[4].id, // Ana
      },
    }),
    prisma.department.create({
      data: {
        name: 'Administração',
        budget: 3000.00,
        monthlyQuota: 6000,
        colorQuota: 1000,
        managerId: users[0].id, // Admin por agora
      },
    }),
  ])

  console.log('✅ Departamentos criados:', departments.length)

  // Criar impressoras de teste
  const printers = await Promise.all([
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
        name: 'Canon ImageRunner C3226i',
        model: 'C3226i',
        location: 'Marketing - 2º Andar - Copa',
        ipAddress: '192.168.1.102',
        serialNumber: 'CANON3226001',
        department: 'Marketing',
        status: 'ACTIVE',
        isColorPrinter: true,
        monthlyQuota: 3000,
      },
    }),
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
        monthlyQuota: 4000,
      },
    }),
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
        name: 'Epson EcoTank L15150',
        model: 'L15150',
        location: 'TI - 3º Andar - Datacenter',
        ipAddress: '192.168.1.105',
        serialNumber: 'EPSON15150001',
        department: 'TI',
        status: 'ERROR',
        isColorPrinter: true,
        monthlyQuota: 2000,
      },
    }),
  ])

  console.log('✅ Impressoras criadas:', printers.length)

  // Criar custos de impressão por departamento
  const printCosts = await Promise.all([
    prisma.printCost.create({
      data: {
        department: 'TI',
        blackAndWhitePage: 0.03,
        colorPage: 0.12,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Marketing',
        blackAndWhitePage: 0.04,
        colorPage: 0.15,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Vendas',
        blackAndWhitePage: 0.04,
        colorPage: 0.13,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Financeiro',
        blackAndWhitePage: 0.03,
        colorPage: 0.10,
      },
    }),
    prisma.printCost.create({
      data: {
        department: 'Administração',
        blackAndWhitePage: 0.03,
        colorPage: 0.11,
      },
    }),
  ])

  console.log('✅ Custos de impressão criados:', printCosts.length)

  // Criar cotas para os usuários
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)

  const quotas = await Promise.all([
    prisma.printQuota.create({
      data: {
        userId: users[0].id, // Admin
        department: 'TI',
        monthlyLimit: 2000,
        currentUsage: 450,
        colorLimit: 500,
        colorUsage: 120,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[1].id, // João
        department: 'Administração',
        monthlyLimit: 500,
        currentUsage: 234,
        colorLimit: 100,
        colorUsage: 45,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[2].id, // Maria
        department: 'Marketing',
        monthlyLimit: 1000,
        currentUsage: 678,
        colorLimit: 300,
        colorUsage: 189,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[3].id, // Carlos
        department: 'Vendas',
        monthlyLimit: 800,
        currentUsage: 756,
        colorLimit: 200,
        colorUsage: 198,
        resetDate: nextMonth,
      },
    }),
    prisma.printQuota.create({
      data: {
        userId: users[4].id, // Ana
        department: 'Financeiro',
        monthlyLimit: 1500,
        currentUsage: 423,
        colorLimit: 500,
        colorUsage: 67,
        resetDate: nextMonth,
      },
    }),
  ])

  console.log('✅ Cotas de usuários criadas:', quotas.length)

  // Criar alguns trabalhos de impressão de exemplo
  const printJobs = await Promise.all([
    prisma.printJob.create({
      data: {
        userId: users[1].id,
        printerId: printers[0].id,
        fileName: 'Relatório Mensal.pdf',
        pages: 15,
        copies: 2,
        isColor: false,
        cost: 0.90,
        status: 'COMPLETED',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000), // 5 min depois
      },
    }),
    prisma.printJob.create({
      data: {
        userId: users[2].id,
        printerId: printers[1].id,
        fileName: 'Apresentação Marketing.pptx',
        pages: 25,
        copies: 10,
        isColor: true,
        cost: 37.50,
        status: 'COMPLETED',
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 8 * 60 * 1000), // 8 min depois
      },
    }),
    prisma.printJob.create({
      data: {
        userId: users[3].id,
        printerId: printers[3].id,
        fileName: 'Proposta Comercial.docx',
        pages: 8,
        copies: 5,
        isColor: false,
        cost: 1.20,
        status: 'PRINTING',
        submittedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min atrás
      },
    }),
    prisma.printJob.create({
      data: {
        userId: users[4].id,
        printerId: printers[3].id,
        fileName: 'Demonstrativo Financeiro.xlsx',
        pages: 3,
        copies: 1,
        isColor: false,
        cost: 0.09,
        status: 'PENDING',
        submittedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
      },
    }),
    prisma.printJob.create({
      data: {
        userId: users[1].id,
        printerId: printers[0].id,
        fileName: 'Manual do Funcionário.pdf',
        pages: 45,
        copies: 1,
        isColor: true,
        cost: 6.75,
        status: 'FAILED',
        submittedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
      },
    }),
  ])

  console.log('✅ Trabalhos de impressão criados:', printJobs.length)

  // Criar alguns logs de auditoria
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: users[0].id,
        action: 'CREATE_PRINTER',
        entity: 'Printer',
        entityId: printers[0].id,
        details: { printerName: printers[0].name, location: printers[0].location },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[2].id,
        action: 'UPDATE_QUOTA',
        entity: 'PrintQuota',
        entityId: quotas[2].id,
        details: { oldLimit: 800, newLimit: 1000 },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: users[0].id,
        action: 'PRINTER_MAINTENANCE',
        entity: 'Printer',
        entityId: printers[2].id,
        details: { status: 'MAINTENANCE', reason: 'Manutenção preventiva' },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      },
    }),
  ])

  console.log('✅ Logs de auditoria criados:', auditLogs.length)

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📊 Dados criados:')
  console.log(`- ${users.length} usuários`)
  console.log(`- ${departments.length} departamentos`)
  console.log(`- ${printers.length} impressoras`)
  console.log(`- ${printCosts.length} configurações de custo`)
  console.log(`- ${quotas.length} cotas de usuário`)
  console.log(`- ${printJobs.length} trabalhos de impressão`)
  console.log(`- ${auditLogs.length} logs de auditoria`)
  
  console.log('\n🔑 Usuários de teste:')
  console.log('- admin@empresa.com (ADMIN)')
  console.log('- joao.silva@empresa.com (USER)')
  console.log('- maria.santos@empresa.com (MANAGER)')
  console.log('- carlos.oliveira@empresa.com (USER)')
  console.log('- ana.costa@empresa.com (MANAGER)')
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