import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('🔍 Verificando status dos dados...')

    // Testar conectividade
    await prisma.$queryRaw`SELECT 1 as test`

    // Contar registros
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.printer.count(),
      prisma.printJob.count(),
      prisma.printQuota.count(),
      prisma.auditLog.count(),
      prisma.printCost.count(),
    ])

    const [users, departments, printers, printJobs, quotas, auditLogs, printCosts] = counts
    const total = users + departments + printers + printJobs + quotas + auditLogs + printCosts

    // Verificar se seed foi executado (esperamos 25+ users, 15+ printers, etc)
    const seedExecuted = users >= 20 && printers >= 10 && printJobs >= 15

    // Buscar alguns exemplos de dados
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: { name: true, email: true, department: true, role: true }
    })

    const criticalQuotas = await prisma.printQuota.findMany({
      where: {
        currentUsage: {
          gte: prisma.printQuota.fields.monthlyLimit * 0.9  // >= 90% da cota
        }
      },
      take: 5,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        seedExecuted,
        totalRecords: total
      },
      tables: {
        users,
        departments, 
        printers,
        printJobs,
        quotas,
        auditLogs,
        printCosts
      },
      samples: {
        users: sampleUsers,
        criticalQuotas: criticalQuotas.map(q => ({
          user: q.user.name,
          usage: q.currentUsage,
          limit: q.monthlyLimit,
          percentage: Math.round((q.currentUsage / q.monthlyLimit) * 100)
        }))
      },
      recommendations: seedExecuted ? 
        ['✅ Dados completos - IA pronta para análise'] :
        ['⚠️ Executar seed: POST /api/admin/seed', '⚠️ Verificar logs do deploy', '⚠️ Verificar conexão com banco']
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      tables: null,
      samples: null,
      recommendations: [
        '❌ Banco inacessível',
        '🔧 Verificar string de conexão DATABASE_URL',
        '🔧 Verificar se banco PostgreSQL está rodando',
        '🔧 Executar: npx prisma db push'
      ]
    }, { status: 500 })
  }
}