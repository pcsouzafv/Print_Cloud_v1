'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Wifi, 
  Printer, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Network,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Printer {
  id: string;
  ip: string;
  name: string;
  model: string;
  manufacturer: string;
  status: 'online' | 'offline' | 'unknown';
  protocol: 'HTTP' | 'SNMP' | 'IPP';
  location?: string;
  department?: string;
}

interface PrinterDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPrinter: (printer: Omit<Printer, 'id'>) => void;
}

export default function PrinterDiscoveryModal({ 
  isOpen, 
  onClose, 
  onAddPrinter 
}: PrinterDiscoveryModalProps) {
  const [scanning, setScanning] = useState(false);
  const [networkRange, setNetworkRange] = useState('192.168.1.1-254');
  const [discoveredPrinters, setDiscoveredPrinters] = useState<Printer[]>([]);
  const [selectedPrinters, setSelectedPrinters] = useState<Set<string>>(new Set());
  const [manualIP, setManualIP] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');

  const handleNetworkScan = async () => {
    setScanning(true);
    setDiscoveredPrinters([]);
    
    try {
      // Simulated network scan - In real app, this would call backend API
      // that scans the network for printers using SNMP, HTTP, IPP protocols
      await simulateNetworkScan();
    } catch (error) {
      console.error('Erro na descoberta:', error);
    } finally {
      setScanning(false);
    }
  };

  const simulateNetworkScan = async () => {
    // Simulate scanning delay
    const baseIP = networkRange.split('-')[0].split('.').slice(0, 3).join('.');
    const mockPrinters: Printer[] = [];
    
    // Simulate finding some printers
    const printerIPs = ['10', '15', '25', '100', '150'];
    
    for (let i = 0; i < printerIPs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const printer: Printer = {
        id: `discovered-${i}`,
        ip: `${baseIP}.${printerIPs[i]}`,
        name: `Impressora ${i + 1}`,
        model: ['LaserJet Pro', 'EcoTank', 'OfficeJet', 'ColorLaserJet'][Math.floor(Math.random() * 4)],
        manufacturer: ['HP', 'Epson', 'Canon', 'Brother'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.3 ? 'online' : 'offline',
        protocol: ['HTTP', 'SNMP', 'IPP'][Math.floor(Math.random() * 3)] as 'HTTP' | 'SNMP' | 'IPP'
      };
      
      mockPrinters.push(printer);
      setDiscoveredPrinters([...mockPrinters]);
    }
  };

  const handleManualAdd = () => {
    if (!manualIP) return;
    
    const printer: Printer = {
      id: `manual-${Date.now()}`,
      ip: manualIP,
      name: `Impressora ${manualIP}`,
      model: 'Modelo Desconhecido',
      manufacturer: 'Fabricante Desconhecido',
      status: 'unknown',
      protocol: 'HTTP'
    };
    
    setDiscoveredPrinters([...discoveredPrinters, printer]);
    setManualIP('');
  };

  const handleSelectPrinter = (printerId: string) => {
    const newSelected = new Set(selectedPrinters);
    if (newSelected.has(printerId)) {
      newSelected.delete(printerId);
    } else {
      newSelected.add(printerId);
    }
    setSelectedPrinters(newSelected);
  };

  const handleAddSelected = () => {
    const printersToAdd = discoveredPrinters.filter(p => selectedPrinters.has(p.id));
    printersToAdd.forEach(printer => {
      const { id, ...printerData } = printer;
      onAddPrinter(printerData);
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Descobrir Impressoras na Rede</h2>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'scan' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('scan')}
          >
            <Network className="inline mr-2" size={16} />
            Busca na Rede
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'manual' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            <Plus className="inline mr-2" size={16} />
            Adicionar Manual
          </button>
        </div>

        {activeTab === 'scan' && (
          <div>
            {/* Network Range Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Faixa de Rede (IP inicial-final)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={networkRange}
                  onChange={(e) => setNetworkRange(e.target.value)}
                  placeholder="192.168.1.1-254"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button 
                  onClick={handleNetworkScan}
                  disabled={scanning}
                  className="flex items-center gap-2"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Scanning Progress */}
            {scanning && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="animate-spin text-blue-500" size={20} />
                    <div>
                      <p className="font-medium">Escaneando a rede...</p>
                      <p className="text-sm text-gray-600">
                        Buscando impressoras na faixa {networkRange}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Endereço IP da Impressora
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualIP}
                onChange={(e) => setManualIP(e.target.value)}
                placeholder="192.168.1.100"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button onClick={handleManualAdd}>
                <Plus size={16} className="mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {/* Discovered Printers */}
        {discoveredPrinters.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Impressoras Encontradas ({discoveredPrinters.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {discoveredPrinters.map((printer) => (
                <Card 
                  key={printer.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedPrinters.has(printer.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectPrinter(printer.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Printer size={24} className="text-gray-600" />
                        <div>
                          <h4 className="font-medium">{printer.name}</h4>
                          <p className="text-sm text-gray-600">{printer.ip}</p>
                          <p className="text-xs text-gray-500">
                            {printer.manufacturer} {printer.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {printer.status === 'online' && (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                        {printer.status === 'offline' && (
                          <AlertCircle size={16} className="text-red-500" />
                        )}
                        {printer.status === 'unknown' && (
                          <Monitor size={16} className="text-gray-500" />
                        )}
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {printer.protocol}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {discoveredPrinters.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              {selectedPrinters.size} de {discoveredPrinters.length} impressoras selecionadas
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddSelected}
                disabled={selectedPrinters.size === 0}
              >
                Adicionar Selecionadas ({selectedPrinters.size})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}