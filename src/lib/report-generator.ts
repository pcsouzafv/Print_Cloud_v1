import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportData {
  totalPrintJobs: number;
  totalPages: number;
  totalCost: number;
  activeUsers: number;
  activePrinters: number;
  topPrinters: Array<{
    name: string;
    jobs: number;
    pages: number;
  }>;
  topUsers: Array<{
    name: string;
    department: string;
    jobs: number;
    pages: number;
  }>;
  monthlyData: Array<{
    month: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  departmentUsage: Array<{
    department: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
}

interface ReportOptions {
  title: string;
  dateRange: string;
  reportType: string;
  data: ReportData;
  generatedAt: Date;
}

export class ReportGenerator {
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private static formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static async generatePDF(options: ReportOptions): Promise<void> {
    const doc = new jsPDF();
    const { title, dateRange, data, generatedAt } = options;

    // Header
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${dateRange}`, 20, 30);
    doc.text(`Gerado em: ${this.formatDate(generatedAt)}`, 20, 35);

    // Summary Stats
    doc.setFontSize(14);
    doc.text('Resumo Executivo', 20, 50);
    
    doc.setFontSize(10);
    doc.text(`Total de Jobs: ${this.formatNumber(data.totalPrintJobs)}`, 20, 60);
    doc.text(`Total de Páginas: ${this.formatNumber(data.totalPages)}`, 20, 65);
    doc.text(`Custo Total: ${this.formatCurrency(data.totalCost)}`, 20, 70);
    doc.text(`Usuários Ativos: ${data.activeUsers}`, 20, 75);
    doc.text(`Impressoras Ativas: ${data.activePrinters}`, 20, 80);

    // Top Printers Table
    if (data.topPrinters.length > 0) {
      doc.setFontSize(14);
      doc.text('Impressoras Mais Utilizadas', 20, 100);

      const printerTableData = data.topPrinters.map((printer, index) => [
        (index + 1).toString(),
        printer.name,
        this.formatNumber(printer.jobs),
        this.formatNumber(printer.pages)
      ]);

      (doc as any).autoTable({
        startY: 110,
        head: [['#', 'Impressora', 'Jobs', 'Páginas']],
        body: printerTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    // Top Users Table  
    if (data.topUsers.length > 0) {
      const currentY = (doc as any).lastAutoTable?.finalY || 150;
      
      doc.setFontSize(14);
      doc.text('Usuários Mais Ativos', 20, currentY + 20);

      const userTableData = data.topUsers.map((user, index) => [
        (index + 1).toString(),
        user.name,
        user.department,
        this.formatNumber(user.jobs),
        this.formatNumber(user.pages)
      ]);

      (doc as any).autoTable({
        startY: currentY + 30,
        head: [['#', 'Usuário', 'Departamento', 'Jobs', 'Páginas']],
        body: userTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    // Department Usage Table
    if (data.departmentUsage.length > 0) {
      const currentY = (doc as any).lastAutoTable?.finalY || 200;
      
      doc.setFontSize(14);
      doc.text('Uso por Departamento', 20, currentY + 20);

      const deptTableData = data.departmentUsage.map(dept => [
        dept.department,
        this.formatNumber(dept.jobs),
        this.formatNumber(dept.pages),
        this.formatCurrency(dept.cost)
      ]);

      (doc as any).autoTable({
        startY: currentY + 30,
        head: [['Departamento', 'Jobs', 'Páginas', 'Custo']],
        body: deptTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} - Print Cloud Report`, 20, 285);
    }

    // Download
    const fileName = `relatorio-impressao-${dateRange.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    doc.save(fileName);
  }

  static async generateExcel(options: ReportOptions): Promise<void> {
    const { title, dateRange, data, generatedAt } = options;
    
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Relatório de Impressão'],
      [''],
      ['Período:', dateRange],
      ['Gerado em:', this.formatDate(generatedAt)],
      [''],
      ['RESUMO EXECUTIVO'],
      ['Total de Jobs:', data.totalPrintJobs],
      ['Total de Páginas:', data.totalPages],
      ['Custo Total:', data.totalCost],
      ['Usuários Ativos:', data.activeUsers],
      ['Impressoras Ativas:', data.activePrinters]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Top Printers Sheet
    if (data.topPrinters.length > 0) {
      const printersData = [
        ['Ranking', 'Impressora', 'Jobs', 'Páginas'],
        ...data.topPrinters.map((printer, index) => [
          index + 1,
          printer.name,
          printer.jobs,
          printer.pages
        ])
      ];
      
      const printersSheet = XLSX.utils.aoa_to_sheet(printersData);
      XLSX.utils.book_append_sheet(workbook, printersSheet, 'Top Impressoras');
    }

    // Top Users Sheet
    if (data.topUsers.length > 0) {
      const usersData = [
        ['Ranking', 'Usuário', 'Departamento', 'Jobs', 'Páginas'],
        ...data.topUsers.map((user, index) => [
          index + 1,
          user.name,
          user.department,
          user.jobs,
          user.pages
        ])
      ];
      
      const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Top Usuários');
    }

    // Department Usage Sheet
    if (data.departmentUsage.length > 0) {
      const deptData = [
        ['Departamento', 'Jobs', 'Páginas', 'Custo'],
        ...data.departmentUsage.map(dept => [
          dept.department,
          dept.jobs,
          dept.pages,
          dept.cost
        ])
      ];
      
      const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
      XLSX.utils.book_append_sheet(workbook, deptSheet, 'Por Departamento');
    }

    // Monthly Data Sheet
    if (data.monthlyData.length > 0) {
      const monthlyData = [
        ['Mês', 'Jobs', 'Páginas', 'Custo'],
        ...data.monthlyData.map(month => [
          month.month,
          month.jobs,
          month.pages,
          month.cost
        ])
      ];
      
      const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Dados Mensais');
    }

    // Download
    const fileName = `relatorio-impressao-${dateRange.replace(/\s+/g, '-').toLowerCase()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  static async generateCSV(options: ReportOptions): Promise<void> {
    const { title, dateRange, data, generatedAt } = options;
    
    let csvContent = '';
    
    // Header
    csvContent += `"${title}"\n`;
    csvContent += `"Período: ${dateRange}"\n`;
    csvContent += `"Gerado em: ${this.formatDate(generatedAt)}"\n`;
    csvContent += '\n';
    
    // Summary
    csvContent += '"RESUMO EXECUTIVO"\n';
    csvContent += `"Total de Jobs","${data.totalPrintJobs}"\n`;
    csvContent += `"Total de Páginas","${data.totalPages}"\n`;
    csvContent += `"Custo Total","${data.totalCost}"\n`;
    csvContent += `"Usuários Ativos","${data.activeUsers}"\n`;
    csvContent += `"Impressoras Ativas","${data.activePrinters}"\n`;
    csvContent += '\n';

    // Top Printers
    if (data.topPrinters.length > 0) {
      csvContent += '"TOP IMPRESSORAS"\n';
      csvContent += '"Ranking","Impressora","Jobs","Páginas"\n';
      data.topPrinters.forEach((printer, index) => {
        csvContent += `"${index + 1}","${printer.name}","${printer.jobs}","${printer.pages}"\n`;
      });
      csvContent += '\n';
    }

    // Top Users
    if (data.topUsers.length > 0) {
      csvContent += '"TOP USUÁRIOS"\n';
      csvContent += '"Ranking","Usuário","Departamento","Jobs","Páginas"\n';
      data.topUsers.forEach((user, index) => {
        csvContent += `"${index + 1}","${user.name}","${user.department}","${user.jobs}","${user.pages}"\n`;
      });
      csvContent += '\n';
    }

    // Department Usage
    if (data.departmentUsage.length > 0) {
      csvContent += '"USO POR DEPARTAMENTO"\n';
      csvContent += '"Departamento","Jobs","Páginas","Custo"\n';
      data.departmentUsage.forEach(dept => {
        csvContent += `"${dept.department}","${dept.jobs}","${dept.pages}","${dept.cost}"\n`;
      });
      csvContent += '\n';
    }

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `relatorio-impressao-${dateRange.replace(/\s+/g, '-').toLowerCase()}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Factory function for easy usage
export async function generateReport(
  format: 'pdf' | 'excel' | 'csv',
  options: ReportOptions
): Promise<void> {
  try {
    switch (format) {
      case 'pdf':
        await ReportGenerator.generatePDF(options);
        break;
      case 'excel':
        await ReportGenerator.generateExcel(options);
        break;
      case 'csv':
        await ReportGenerator.generateCSV(options);
        break;
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  } catch (error) {
    console.error(`Erro ao gerar relatório ${format}:`, error);
    throw new Error(`Falha ao gerar relatório ${format}. Tente novamente.`);
  }
}