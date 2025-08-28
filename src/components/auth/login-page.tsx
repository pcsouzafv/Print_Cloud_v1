'use client';

import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/lib/msal-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Shield, Users, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error('Login failed:', e);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Print Cloud
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sistema completo de gestão de impressoras e bilhetagem empresarial
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Printer className="text-blue-600" size={24} />
              <div>
                <h3 className="font-semibold">Gestão de Impressoras</h3>
                <p className="text-sm text-gray-600">Controle total dos equipamentos</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Shield className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold">Segurança Azure AD</h3>
                <p className="text-sm text-gray-600">Autenticação empresarial</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Users className="text-purple-600" size={24} />
              <div>
                <h3 className="font-semibold">Controle de Usuários</h3>
                <p className="text-sm text-gray-600">Cotas e permissões</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <BarChart3 className="text-orange-600" size={24} />
              <div>
                <h3 className="font-semibold">Relatórios</h3>
                <p className="text-sm text-gray-600">Analytics e custos</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Bem-vindo ao Print Cloud</CardTitle>
            <CardDescription>
              Faça login com sua conta corporativa para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLogin} 
              className="w-full h-12 text-base"
              size="lg"
            >
              <Shield className="mr-2" size={20} />
              Entrar com Microsoft
            </Button>
            
            <div className="text-xs text-center text-gray-500">
              Sistema integrado com Azure Active Directory
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}