import { getPollingService } from './printer-polling';

export async function initializeServices() {
  console.log('🚀 Initializing Print Cloud services...');
  
  try {
    // Start the printer polling service
    const pollingService = getPollingService();
    await pollingService.startPolling();
    
    console.log('✅ Printer polling service initialized');
    console.log('🎯 Print Cloud integration services ready!');
    
    return {
      success: true,
      services: ['printer-polling'],
    };
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Optional: Auto-start services in production
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_SERVICES !== 'false') {
  initializeServices().catch(console.error);
}