import { LeadRepository } from './src/repositories/lead.repository.js';
import { supabase } from './src/config/supabaseClient.js';

// Mock supabase client
supabase.from = (table) => {
  return {
    insert: async (data) => {
      // Simulate network delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ error: null });
        }, 10);
      });
    }
  };
};

const generateLeads = (num) => {
  const leads = [];
  for (let i = 0; i < num; i++) {
    leads.push({
      company_name: `Company ${i}`,
      phone_number: `90555000000${i % 10}`,
      category: "Test",
      status: "pending"
    });
  }
  return leads;
};

async function runBenchmark() {
  const leads = generateLeads(100);
  
  // Disable console logs for benchmark
  const oldLog = console.log;
  console.log = () => {};
  
  console.time('insertLeads');
  const start = Date.now();
  
  await LeadRepository.insertLeads(leads);
  
  const end = Date.now();
  console.timeEnd('insertLeads');
  
  // Restore console logs
  console.log = oldLog;
  console.log(`Time taken: ${end - start}ms`);
}

runBenchmark().catch(console.error);
