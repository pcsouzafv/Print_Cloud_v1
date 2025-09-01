import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🌱 Iniciando seed manual via API...')

    // Verificar conectividade
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Conexão com banco verificada')

    // Executar seed (importar a função main)
    const { exec } = require('child_process')
    
    return new Promise<NextResponse>((resolve) => {
      exec('npm run db:seed', { cwd: process.cwd() }, (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.error('❌ Erro no seed:', error)
          resolve(NextResponse.json({ 
            success: false, 
            error: error.message,
            stderr 
          }, { status: 500 }))
        } else {
          console.log('✅ Seed executado com sucesso')
          resolve(NextResponse.json({ 
            success: true, 
            message: 'Seed executado com sucesso',
            output: stdout 
          }))
        }
      })
    })

  } catch (error) {
    console.error('❌ Erro na API de seed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Verificar status dos dados
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.department.count(), 
      prisma.printer.count(),
      prisma.printJob.count(),
      prisma.printQuota.count(),
      prisma.auditLog.count(),
    ])

    const [users, departments, printers, printJobs, quotas, auditLogs] = stats
    const total = users + departments + printers + printJobs + quotas + auditLogs

    // Verificar se tem dados suficientes (indica se seed foi executado)
    const hasData = users >= 20 && printers >= 10 && printJobs >= 20

    return NextResponse.json({
      success: true,
      hasData,
      stats: {
        users,
        departments,
        printers, 
        printJobs,
        quotas,
        auditLogs,
        total
      },
      message: hasData ? 
        `✅ Dados completos: ${total} registros` : 
        `⚠️ Dados insuficientes: ${total} registros (seed não executado?)`
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao verificar dados',
      stats: null
    }, { status: 500 })
  }
}