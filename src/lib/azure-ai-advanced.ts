// Advanced AI Analysis Functions for Print Cloud
// Type definitions for Azure AI advanced functions
import { TextAnalyticsClient } from '@azure/ai-text-analytics';

// Advanced pattern analysis functions
export function getWeekdayPatterns(printJobs: any[]): { [weekday: string]: number } {
  const weekdayJobs: { [weekday: string]: number } = {
    'Segunda': 0, 'Terça': 0, 'Quarta': 0, 'Quinta': 0, 'Sexta': 0, 'Sábado': 0, 'Domingo': 0
  };
  
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  printJobs.forEach(job => {
    if (job.submittedAt) {
      const dayOfWeek = new Date(job.submittedAt).getDay();
      const weekdayName = weekdays[dayOfWeek];
      weekdayJobs[weekdayName] = (weekdayJobs[weekdayName] || 0) + 1;
    }
  });

  return weekdayJobs;
}

export function calculateCostEfficiency(printJobs: any[]): any {
  if (printJobs.length === 0) {
    return { efficiency: 0, metrics: {} };
  }
  
  const totalCost = printJobs.reduce((sum, job) => sum + (job.cost || 0), 0);
  const totalPages = printJobs.reduce((sum, job) => sum + (job.pages || 0), 0);
  const colorJobs = printJobs.filter(job => job.isColor).length;
  
  const costPerPage = totalPages > 0 ? totalCost / totalPages : 0;
  const colorRatio = printJobs.length > 0 ? colorJobs / printJobs.length : 0;
  const avgJobSize = totalPages / printJobs.length;
  
  // Efficiency scoring (0-10)
  let efficiency = 10;
  if (costPerPage > 0.10) efficiency -= 2; // High cost per page
  if (colorRatio > 0.4) efficiency -= 2;   // Too much color printing
  if (avgJobSize < 2) efficiency -= 1;     // Many small jobs
  if (avgJobSize > 15) efficiency -= 1;    // Very large jobs
  
  return {
    efficiency: Math.max(0, efficiency),
    metrics: {
      costPerPage: costPerPage.toFixed(3),
      colorRatio: (colorRatio * 100).toFixed(1) + '%',
      avgJobSize: avgJobSize.toFixed(1),
      totalCost: totalCost.toFixed(2),
      benchmark: costPerPage < 0.08 ? 'Excelente' : costPerPage < 0.12 ? 'Bom' : 'Precisa melhorar'
    }
  };
}

export function calculateSustainabilityMetrics(printJobs: any[]): any {
  if (printJobs.length === 0) {
    return { score: 0, metrics: {} };
  }
  
  const totalPages = printJobs.reduce((sum, job) => sum + (job.pages || 0), 0);
  const colorPages = printJobs.filter(job => job.isColor)
                              .reduce((sum, job) => sum + (job.pages || 0), 0);
  const duplexJobs = printJobs.filter(job => job.isDuplex).length;
  
  // Environmental calculations
  const treesUsed = totalPages / 8333; // Approx 8,333 sheets per tree
  const co2Emissions = totalPages * 0.0056; // ~5.6g CO2 per page
  const waterUsed = totalPages * 0.013; // ~13ml water per page
  const energyUsed = printJobs.length * 0.025; // ~0.025 kWh per job
  
  // Sustainability score (0-10)
  let score = 10;
  const colorRatio = colorPages / totalPages;
  const duplexRatio = duplexJobs / printJobs.length;
  
  if (colorRatio > 0.3) score -= 3;
  if (duplexRatio < 0.5) score -= 2;
  if (totalPages > 1500) score -= 1; // High volume penalty
  
  return {
    score: Math.max(0, score),
    metrics: {
      totalPages,
      colorPages,
      treesUsed: treesUsed.toFixed(3),
      co2Emissions: co2Emissions.toFixed(2) + 'kg',
      waterUsed: waterUsed.toFixed(1) + 'L',
      energyUsed: energyUsed.toFixed(2) + 'kWh',
      duplexRatio: (duplexRatio * 100).toFixed(1) + '%',
      sustainabilityGrade: score >= 8 ? 'A' : score >= 6 ? 'B' : score >= 4 ? 'C' : 'D'
    }
  };
}

export function detectAnomalies(printJobs: any[]): any[] {
  if (printJobs.length < 10) return [];
  
  const anomalies = [];
  
  // Sort jobs by date
  const sortedJobs = printJobs.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  
  // Calculate daily volumes
  const dailyVolumes: { [date: string]: number } = {};
  sortedJobs.forEach(job => {
    const date = new Date(job.submittedAt).toISOString().split('T')[0];
    dailyVolumes[date] = (dailyVolumes[date] || 0) + (job.pages || 0);
  });
  
  const volumes = Object.values(dailyVolumes);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const stdDev = Math.sqrt(volumes.reduce((sum, vol) => sum + Math.pow(vol - avgVolume, 2), 0) / volumes.length);
  
  // Detect volume anomalies (> 2 standard deviations from mean)
  Object.entries(dailyVolumes).forEach(([date, volume]) => {
    if (Math.abs(volume - avgVolume) > 2 * stdDev) {
      anomalies.push({
        type: 'volume_spike',
        date,
        value: volume,
        expected: Math.round(avgVolume),
        severity: volume > avgVolume + 2 * stdDev ? 'high' : 'medium',
        description: `Volume anômalo de ${volume} páginas em ${date} (esperado: ~${Math.round(avgVolume)})`
      });
    }
  });
  
  // Detect unusual cost patterns
  const highCostJobs = printJobs.filter(job => (job.cost || 0) > 5);
  if (highCostJobs.length > printJobs.length * 0.1) {
    anomalies.push({
      type: 'high_cost_pattern',
      count: highCostJobs.length,
      severity: 'medium',
      description: `${highCostJobs.length} trabalhos com custo elevado (>R$ 5) detectados`
    });
  }
  
  // Detect off-hours printing
  const offHoursJobs = printJobs.filter(job => {
    const hour = new Date(job.submittedAt).getHours();
    return hour < 7 || hour > 19; // Before 7 AM or after 7 PM
  });
  
  if (offHoursJobs.length > printJobs.length * 0.15) {
    anomalies.push({
      type: 'off_hours_usage',
      count: offHoursJobs.length,
      severity: 'low',
      description: `${offHoursJobs.length} impressões fora do horário comercial (>15% do total)`
    });
  }
  
  return anomalies.slice(0, 5); // Return up to 5 most significant anomalies
}

export function calculateMaintenancePrediction(patterns: any): any {
  const totalJobs = patterns.totalJobs || 0;
  const avgPagesPerJob = patterns.averagePagesPerJob || 0;
  const totalPages = totalJobs * avgPagesPerJob;
  
  // Simple maintenance prediction based on volume
  const pagesUntilMaintenance = 10000 - (totalPages % 10000); // Maintenance every 10k pages
  const jobsUntilMaintenance = Math.ceil(pagesUntilMaintenance / avgPagesPerJob);
  
  return {
    pagesUntilNext: pagesUntilMaintenance,
    jobsUntilNext: jobsUntilMaintenance,
    predictedDate: new Date(Date.now() + (jobsUntilMaintenance * 24 * 60 * 60 * 1000 / 20)).toISOString().split('T')[0],
    priority: pagesUntilMaintenance < 1000 ? 'high' : pagesUntilMaintenance < 3000 ? 'medium' : 'low',
    type: totalPages % 50000 < 10000 ? 'preventive' : 'routine'
  };
}

export function calculateCapacityUtilization(patterns: any): any {
  const totalJobs = patterns.totalJobs || 0;
  const peakHourJobs = Math.max(...Object.values(patterns.peakHours || {}).map(v => Number(v) || 0)) || 0;
  
  // Assume max capacity of 200 jobs per hour per printer
  const maxCapacity = 200;
  const utilizationRate = (peakHourJobs / maxCapacity) * 100;
  
  return {
    currentPeak: peakHourJobs,
    maxCapacity,
    utilizationRate: Math.min(100, utilizationRate).toFixed(1) + '%',
    status: utilizationRate > 90 ? 'critical' : utilizationRate > 70 ? 'high' : utilizationRate > 50 ? 'moderate' : 'low',
    recommendation: utilizationRate > 90 ? 'Adicionar capacidade' : 
                   utilizationRate > 70 ? 'Monitorar de perto' : 'Capacidade adequada'
  };
}

export function getSeasonalPredictions(): any {
  const currentMonth = new Date().getMonth();
  const seasonalFactors: { [key: number]: number } = {
    0: 0.85,  // Janeiro - pós feriados
    1: 0.95,  // Fevereiro - normalização
    2: 1.1,   // Março - volta completa
    3: 1.05,  // Abril
    4: 1.0,   // Maio - normal
    5: 0.9,   // Junho - meio do ano
    6: 0.85,  // Julho - férias escolares
    7: 1.0,   // Agosto - volta das férias
    8: 1.15,  // Setembro - alta atividade
    9: 1.1,   // Outubro
    10: 1.05, // Novembro
    11: 0.8   // Dezembro - feriados
  };
  
  return {
    currentFactor: seasonalFactors[currentMonth],
    nextMonthFactor: seasonalFactors[(currentMonth + 1) % 12],
    trend: seasonalFactors[(currentMonth + 1) % 12] > seasonalFactors[currentMonth] ? 'increasing' : 'decreasing',
    impact: Math.abs(seasonalFactors[(currentMonth + 1) % 12] - seasonalFactors[currentMonth]) > 0.1 ? 'significant' : 'minor'
  };
}

export function generateMockInsights(patterns: any): string[] {
  const insights = [];
  const colorRatio = (patterns.colorJobs / patterns.totalJobs) * 100;
  const totalJobs = patterns.totalJobs || 0;
  
  insights.push(`📈 **Performance**: ${totalJobs} jobs processados com eficiência de ${(85 + Math.random() * 10).toFixed(1)}% vs benchmark setorial`);
  
  if (colorRatio > 40) {
    insights.push(`🟡 **Alerta de Custo**: ${colorRatio.toFixed(1)}% de impressões coloridas está acima do ideal (30%), impactando orçamento em R$ ${Math.round(patterns.colorJobs * 0.17)}/mês`);
  }
  
  const peakHours = Object.keys(patterns.peakHours || {});
  if (peakHours.length > 0) {
    insights.push(`⏰ **Otimização de Carga**: Picos às ${peakHours.slice(0, 2).join(' e ')}h representam oportunidade de R$ ${Math.round(totalJobs * 0.03)}/mês em eficiência`);
  }
  
  insights.push(`🌱 **Sustentabilidade**: Com padrão atual, economia de ${Math.round(totalJobs * 0.4)} páginas/mês possível via otimizações inteligentes`);
  
  return insights.slice(0, 4);
}

export function getBasicPatterns(printJobs: any[]): any {
  return {
    totalJobs: printJobs.length,
    colorJobs: printJobs.filter(job => job.isColor).length,
    averagePagesPerJob: printJobs.reduce((sum, job) => sum + job.pages, 0) / printJobs.length || 0,
    peakHours: getPeakPrintingHours(printJobs),
    topUsers: getTopPrintingUsers(printJobs),
    costByDepartment: getCostByDepartment(printJobs),
  };
}

// Helper functions from original file
function getPeakPrintingHours(printJobs: any[]): { [hour: string]: number } {
  const hourCounts: { [hour: string]: number } = {};
  
  printJobs.forEach(job => {
    if (job.submittedAt) {
      const hour = new Date(job.submittedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  return Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .reduce((obj, [hour, count]) => {
      obj[`${hour}:00`] = count;
      return obj;
    }, {} as { [hour: string]: number });
}

function getTopPrintingUsers(printJobs: any[]): { [userId: string]: number } {
  const userCounts: { [userId: string]: number } = {};
  
  printJobs.forEach(job => {
    userCounts[job.userId] = (userCounts[job.userId] || 0) + 1;
  });

  return Object.entries(userCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .reduce((obj, [userId, count]) => {
      obj[userId] = count;
      return obj;
    }, {} as { [userId: string]: number });
}

function getCostByDepartment(printJobs: any[]): { [department: string]: number } {
  const departmentCosts: { [department: string]: number } = {};
  
  printJobs.forEach(job => {
    if (job.user?.department) {
      departmentCosts[job.user.department] = (departmentCosts[job.user.department] || 0) + job.cost;
    }
  });

  return departmentCosts;
}