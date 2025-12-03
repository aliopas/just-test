/**
 * Test script to validate all request types against the schema
 * This script tests that all request types can be created successfully
 */

import { createRequestSchema } from '../src/schemas/request.schema';

// Test data for each request type
const testRequests = {
  // Financial requests (require amount and currency)
  buy: {
    type: 'buy' as const,
    amount: 10000,
    currency: 'SAR' as const,
    notes: 'Test buy request',
  },
  sell: {
    type: 'sell' as const,
    amount: 5000,
    currency: 'USD' as const,
    targetPrice: 150,
    notes: 'Test sell request',
  },
  // Partnership (has amount but it's optional in schema)
  partnership: {
    type: 'partnership' as const,
    amount: 50000,
    currency: 'SAR' as const,
    metadata: {
      companyName: 'Test Company',
      partnershipType: 'strategic',
      partnershipDetails: 'Test partnership details',
      contactPerson: 'John Doe',
      contactEmail: 'john@example.com',
      contactPhone: '+966501234567',
    },
    notes: 'Test partnership request',
  },
  // Board nomination (amount and currency optional)
  board_nomination: {
    type: 'board_nomination' as const,
    amount: 1, // Fixed amount for non-financial
    currency: 'SAR' as const,
    metadata: {
      nomineeName: 'Jane Smith',
      nomineePosition: 'Board Member',
      nomineeQualifications: 'Extensive experience in finance',
      nominationReason: 'Strong leadership skills',
      nomineeEmail: 'jane@example.com',
      nomineePhone: '+966502345678',
    },
    notes: 'Test board nomination request',
  },
  // Board nomination without amount/currency (should work)
  board_nomination_no_amount: {
    type: 'board_nomination' as const,
    metadata: {
      nomineeName: 'Jane Smith',
      nomineePosition: 'Board Member',
      nomineeQualifications: 'Extensive experience in finance',
      nominationReason: 'Strong leadership skills',
    },
    notes: 'Test board nomination without amount',
  },
  // Feedback (amount and currency optional)
  feedback: {
    type: 'feedback' as const,
    metadata: {
      feedbackType: 'suggestion',
      subject: 'Test feedback',
      priority: 'high',
    },
    notes: 'This is a test feedback message',
  },
  // Feedback with amount (should work but optional)
  feedback_with_amount: {
    type: 'feedback' as const,
    amount: 1,
    currency: 'SAR' as const,
    metadata: {
      feedbackType: 'complaint',
      subject: 'Test complaint',
      priority: 'medium',
    },
    notes: 'This is a test complaint',
  },
};

function testRequest(name: string, data: unknown) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log('📦 Data:', JSON.stringify(data, null, 2));

  try {
    const result = createRequestSchema.safeParse(data);

    if (result.success) {
      console.log('✅ Validation PASSED');
      console.log('📋 Parsed data:', JSON.stringify(result.data, null, 2));
      return true;
    } else {
      console.log('❌ Validation FAILED');
      console.log('🚫 Errors:');
      result.error.issues.forEach((issue, index) => {
        console.log(
          `   ${index + 1}. ${issue.path.join('.')}: ${issue.message}`
        );
      });
      return false;
    }
  } catch (error) {
    console.log('❌ Exception occurred:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Request Schema Tests\n');
  console.log('='.repeat(60));

  const results: Array<{ name: string; passed: boolean }> = [];

  // Test financial requests
  results.push({
    name: 'Buy Request',
    passed: testRequest('Buy Request', testRequests.buy),
  });
  results.push({
    name: 'Sell Request',
    passed: testRequest('Sell Request', testRequests.sell),
  });

  // Test partnership
  results.push({
    name: 'Partnership Request',
    passed: testRequest('Partnership Request', testRequests.partnership),
  });

  // Test board nomination
  results.push({
    name: 'Board Nomination (with amount)',
    passed: testRequest(
      'Board Nomination (with amount)',
      testRequests.board_nomination
    ),
  });
  results.push({
    name: 'Board Nomination (without amount)',
    passed: testRequest(
      'Board Nomination (without amount)',
      testRequests.board_nomination_no_amount
    ),
  });

  // Test feedback
  results.push({
    name: 'Feedback (without amount)',
    passed: testRequest('Feedback (without amount)', testRequests.feedback),
  });
  results.push({
    name: 'Feedback (with amount)',
    passed: testRequest(
      'Feedback (with amount)',
      testRequests.feedback_with_amount
    ),
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });

  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
