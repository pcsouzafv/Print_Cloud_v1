'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SeedStats {
  users: number
  departments: number
  printers: number
  printCosts: number
  quotas: number
  printJobs: number
  auditLogs: number
  totalRecords: number
  totalCost: number
  criticalUsers: number
}

interface StatusResponse {
  success: boolean
  hasData: boolean
  stats: SeedStats
  message: string
  timestamp: string
}

interface SeedResponse {
  success: boolean
  message: string
  stats: SeedStats
  timestamp: string
}

export default function AdminPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [seedResult, setSeedResult] = useState<SeedResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setStatus({
        success: false,
        hasData: false,
        stats: {} as SeedStats,
        message: 'Erro ao conectar com a API',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const executeSeed = async () => {
    setSeedLoading(true)
    setSeedResult(null)
    
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setSeedResult(data)
      
      // Atualizar status após seed
      if (data.success) {
        setTimeout(checkStatus, 1000)
      }
    } catch (error) {
      console.error('Erro ao executar seed:', error)
      setSeedResult({
        success: false,
        message: 'Erro ao executar seed',
        stats: {} as SeedStats,
        timestamp: new Date().toISOString()
      })
    } finally {
      setSeedLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Painel de Administração - Print Cloud
          </h1>
          <p className="text-gray-600">
            Gerenciamento de dados e diagnóstico do sistema
          </p>
        </div>

        {/* Status dos Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Status dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={checkStatus} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '⏳ Verificando...' : '🔍 Verificar Status'}
              </Button>
            </div>
            
            {status && (
              <div className="border rounded-lg p-4">
                <div className={`text-sm mb-3 ${status.success ? 'text-green-600' : 'text-red-600'}`}>
                  {status.success ? '✅ Conexão OK' : '❌ Erro de Conexão'}
                </div>
                
                {status.success && status.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="font-semibold text-blue-900">👥 Usuários</div>
                      <div className="text-blue-700">{status.stats.users || 0}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="font-semibold text-green-900">🖨️ Impressoras</div>
                      <div className="text-green-700">{status.stats.printers || 0}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="font-semibold text-purple-900">📄 Jobs</div>
                      <div className="text-purple-700">{status.stats.printJobs || 0}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <div className="font-semibold text-red-900">⚠️ Críticos</div>
                      <div className="text-red-700">{status.stats.criticalUsers || 0}</div>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  Última verificação: {new Date(status.timestamp).toLocaleString('pt-BR')}
                </div>
                
                <div className="mt-3">
                  <div className={`text-sm font-medium ${status.hasData ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.message}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Executar Seed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌱 Seed do Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="text-sm text-yellow-800">
                ⚠️ <strong>Atenção:</strong> Esta operação irá limpar todos os dados existentes e criar novos dados de demonstração.
              </div>
            </div>
            
            <Button 
              onClick={executeSeed}
              disabled={seedLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {seedLoading ? '⏳ Executando Seed...' : '🌱 Executar Seed Completo'}
            </Button>
            
            {seedResult && (
              <div className="border rounded-lg p-4">
                <div className={`text-sm mb-3 ${seedResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {seedResult.success ? '✅ Seed Executado' : '❌ Erro no Seed'}
                </div>
                
                <div className="text-sm">
                  {seedResult.message}
                </div>
                
                {seedResult.success && seedResult.stats && (
                  <div className="mt-3 text-xs bg-gray-50 p-3 rounded">
                    <strong>Dados Criados:</strong>
                    <br />• {seedResult.stats.users} usuários
                    <br />• {seedResult.stats.printers} impressoras  
                    <br />• {seedResult.stats.printJobs} trabalhos de impressão
                    <br />• {seedResult.stats.quotas} cotas de usuários
                    <br />• <strong>Total: {seedResult.stats.totalRecords} registros</strong>
                    <br />• <strong>Custo Total: R$ {seedResult.stats.totalCost?.toFixed(2)}</strong>
                    <br />• <strong>Usuários Críticos: {seedResult.stats.criticalUsers}</strong>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Executado em: {new Date(seedResult.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>1. Verificar Status:</strong> Clique em "Verificar Status" para ver quantos dados estão no banco.
            </div>
            <div>
              <strong>2. Executar Seed:</strong> Se não há dados suficientes, clique em "Executar Seed Completo".
            </div>
            <div>
              <strong>3. Testar IA:</strong> Após o seed, vá para a aplicação e teste o PrintBot com perguntas como:
              <ul className="ml-4 mt-1 text-xs text-gray-600">
                <li>• "Quais usuários estão próximos da cota?"</li>
                <li>• "Como posso economizar nos custos de impressão?"</li>
                <li>• "Há impressoras com problemas no momento?"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}