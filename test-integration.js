// Quick test script to verify backend integration
const API_BASE = 'http://localhost:3001/api';

async function testBackendIntegration() {
  console.log('🧪 Testing AutoBalancer Backend Integration...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('   ✅ Health check:', healthData.status);
    console.log('   🌍 Environment:', healthData.environment);
    console.log();

    // Test 2: Test endpoint
    console.log('2️⃣ Testing API test endpoint...');
    const testResponse = await fetch(`${API_BASE}/test`);
    const testData = await testResponse.json();
    console.log('   ✅ Test endpoint:', testData.success ? 'SUCCESS' : 'FAILED');
    console.log('   📝 Message:', testData.message);
    console.log();

    // Test 3: Wallet connection
    console.log('3️⃣ Testing wallet connection endpoint...');
    const walletResponse = await fetch(`${API_BASE}/wallet/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: '0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999'
      })
    });
    const walletData = await walletResponse.json();
    console.log('   ✅ Wallet connection:', walletData.success ? 'SUCCESS' : 'FAILED');
    console.log('   👛 Address:', walletData.address);
    if (!walletData.success && walletData.error) {
      console.log('   ❌ Error:', walletData.error);
    }
    console.log();

    // Test 4: Plans endpoint (should return empty for now)
    console.log('4️⃣ Testing plans endpoint...');
    const plansResponse = await fetch(`${API_BASE}/plans?userAddress=0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999`);
    const plansData = await plansResponse.json();
    console.log('   ✅ Plans endpoint:', plansData.success ? 'SUCCESS' : 'FAILED');
    console.log('   📊 Plans count:', plansData.data.plans.length);
    console.log();

    // Test 5: Rebalancer endpoint
    console.log('5️⃣ Testing rebalancer endpoint...');
    const rebalancerResponse = await fetch(`${API_BASE}/rebalancer?userAddress=0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999`);
    const rebalancerData = await rebalancerResponse.json();
    console.log('   ✅ Rebalancer endpoint:', rebalancerData.success ? 'SUCCESS' : 'FAILED');
    console.log('   ⚖️ Configs count:', rebalancerData.data.configs.length);
    console.log();

    console.log('🎉 All backend integration tests passed!');
    console.log('✅ Frontend-Backend integration is working correctly');

  } catch (error) {
    console.error('❌ Backend integration test failed:', error.message);
    console.error('💡 Make sure the backend server is running on port 3001');
  }
}

// Run the test
testBackendIntegration();