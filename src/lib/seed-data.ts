import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function executeSeed() {
  console.log('🌱 Iniciando seed via código TypeScript...')

  try {
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...')
    await prisma.auditLog.deleteMany()
    await prisma.printJob.deleteMany()
    await prisma.printQuota.deleteMany()
    await prisma.printCost.deleteMany()
    await prisma.department.deleteMany()
    await prisma.printer.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Dados limpos')

    // Criar usuários
    console.log('👥 Criando usuários...')
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

      // USUÁRIOS MARKETING (ALTO VOLUME)
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

      // USUÁRIOS VENDAS (CRÍTICOS)
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
    ])

    console.log(`✅ ${users.length} usuários criados`)

    // Criar departamentos
    console.log('🏢 Criando departamentos...')
    const departments = await Promise.all([
      prisma.department.create({
        data: {
          name: 'TI',
          budget: 8000.00,
          monthlyQuota: 15000,
          colorQuota: 3000,
          managerId: users[0].id,
        },
      }),
      prisma.department.create({
        data: {
          name: 'Marketing',
          budget: 12000.00,
          monthlyQuota: 25000,
          colorQuota: 8000,
          managerId: users[2].id,
        },
      }),
      prisma.department.create({
        data: {
          name: 'Vendas',
          budget: 10000.00,
          monthlyQuota: 20000,
          colorQuota: 5000,
          managerId: users[4].id,
        },
      }),
      prisma.department.create({
        data: {
          name: 'Financeiro',
          budget: 6000.00,
          monthlyQuota: 12000,
          colorQuota: 2000,
          managerId: users[3].id,
        },
      }),
      prisma.department.create({
        data: {
          name: 'Administração',
          budget: 5000.00,
          monthlyQuota: 10000,
          colorQuota: 1500,
          managerId: users[1].id,
        },
      }),
    ])

    console.log(`✅ ${departments.length} departamentos criados`)

    // Criar impressoras
    console.log('🖨️ Criando impressoras...')
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
          monthlyQuota: 8000,
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
          monthlyQuota: 5500,
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
          monthlyQuota: 4000,
        },
      }),
    ])

    console.log(`✅ ${printers.length} impressoras criadas`)

    // Criar custos
    console.log('💰 Criando custos...')
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
    ])

    console.log(`✅ ${printCosts.length} custos criados`)

    // Criar cotas
    console.log('📊 Criando cotas...')
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)

    const quotas = await Promise.all([
      // Admin
      prisma.printQuota.create({
        data: {
          userId: users[0].id,
          department: 'TI',
          monthlyLimit: 3000,
          currentUsage: 845,
          colorLimit: 800,
          colorUsage: 234,
          resetDate: nextMonth,
        },
      }),
      // Julia Designer - Alto uso
      prisma.printQuota.create({
        data: {
          userId: users[6].id,
          department: 'Marketing',
          monthlyLimit: 1500,
          currentUsage: 1234,
          colorLimit: 600,
          colorUsage: 567,
          resetDate: nextMonth,
        },
      }),
      // Carlos - CRÍTICO 96.7%
      prisma.printQuota.create({
        data: {
          userId: users[8].id,
          department: 'Vendas',
          monthlyLimit: 1000,
          currentUsage: 967,
          colorLimit: 250,
          colorUsage: 248,
          resetDate: nextMonth,
        },
      }),
      // Sandra - Vendas normal
      prisma.printQuota.create({
        data: {
          userId: users[9].id,
          department: 'Vendas',
          monthlyLimit: 1200,
          currentUsage: 845,
          colorLimit: 300,
          colorUsage: 234,
          resetDate: nextMonth,
        },
      }),
      // Joana - Financeiro eficiente
      prisma.printQuota.create({
        data: {
          userId: users[10].id,
          department: 'Financeiro',
          monthlyLimit: 800,
          currentUsage: 234,
          colorLimit: 150,
          colorUsage: 34,
          resetDate: nextMonth,
        },
      }),
    ])

    console.log(`✅ ${quotas.length} cotas criadas`)

    // Criar jobs
    console.log('📄 Criando jobs de impressão...')
    const printJobs = await Promise.all([
      prisma.printJob.create({
        data: {
          userId: users[6].id, // Julia
          printerId: printers[1].id, // Canon colorida
          fileName: 'Catálogo Produtos 2024.pdf',
          pages: 24,
          copies: 50,
          isColor: true,
          cost: 216.00, // 24*50*0.18
          status: 'COMPLETED',
          submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        },
      }),
      prisma.printJob.create({
        data: {
          userId: users[8].id, // Carlos
          printerId: printers[2].id, // Xerox em manutenção
          fileName: 'Proposta Comercial - Cliente ABC.pdf',
          pages: 12,
          copies: 3,
          isColor: false,
          cost: 1.44, // 12*3*0.04
          status: 'FAILED',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      }),
      prisma.printJob.create({
        data: {
          userId: users[10].id, // Joana
          printerId: printers[3].id, // Brother P&B
          fileName: 'Relatório Financeiro.xlsx',
          pages: 8,
          copies: 2,
          isColor: false,
          cost: 0.48, // 8*2*0.03
          status: 'COMPLETED',
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
        },
      }),
    ])

    console.log(`✅ ${printJobs.length} jobs criados`)

    // Criar logs de auditoria
    console.log('📝 Criando logs de auditoria...')
    const auditLogs = await Promise.all([
      prisma.auditLog.create({
        data: {
          userId: users[0].id,
          action: 'QUOTA_ALERT',
          entity: 'PrintQuota',
          entityId: quotas[2].id,
          details: { 
            userName: 'Carlos Oliveira', 
            usage: 967, 
            limit: 1000, 
            utilizationRate: 96.7, 
            severity: 'CRITICAL' 
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: users[0].id,
          action: 'PRINTER_MAINTENANCE',
          entity: 'Printer',
          entityId: printers[2].id,
          details: { 
            printerName: 'Xerox VersaLink C405', 
            status: 'MAINTENANCE', 
            reason: 'Manutenção preventiva' 
          },
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: users[6].id,
          action: 'HIGH_COST_JOB',
          entity: 'PrintJob',
          entityId: printJobs[0].id,
          details: { 
            fileName: 'Catálogo Produtos 2024.pdf', 
            cost: 216, 
            pages: 1200, 
            reason: 'Job colorido alto volume' 
          },
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      }),
    ])

    console.log(`✅ ${auditLogs.length} logs criados`)

    // Estatísticas finais
    const totalRecords = users.length + departments.length + printers.length + printCosts.length + quotas.length + printJobs.length + auditLogs.length
    const totalCost = printJobs.reduce((sum, job) => sum + job.cost, 0)
    const criticalUsers = quotas.filter(q => (q.currentUsage / q.monthlyLimit) >= 0.9).length

    console.log('🎉 SEED CONCLUÍDO COM SUCESSO!')
    console.log(`📊 TOTAL DE REGISTROS: ${totalRecords}`)
    console.log(`💰 CUSTO TOTAL: R$ ${totalCost.toFixed(2)}`)
    console.log(`⚠️ USUÁRIOS CRÍTICOS: ${criticalUsers}`)
    console.log('🤖 DADOS PRONTOS PARA IA ANALISAR!')

    return {
      success: true,
      stats: {
        users: users.length,
        departments: departments.length,
        printers: printers.length,
        printCosts: printCosts.length,
        quotas: quotas.length,
        printJobs: printJobs.length,
        auditLogs: auditLogs.length,
        totalRecords,
        totalCost,
        criticalUsers
      }
    }

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    throw error
  }
}