// Integration test utilities to validate frontend-backend connectivity
import { publicApi, authApi, projectApi, freelancerApi } from '@/api/services';
import { handleApiError } from './integration-validator';

export interface IntegrationTestResult {
  service: string;
  endpoint: string;
  success: boolean;
  error?: string;
  responseTime?: number;
  data?: any;
}

export class IntegrationTester {
  private results: IntegrationTestResult[] = [];

  async testPublicEndpoints(): Promise<IntegrationTestResult[]> {
    console.log('🧪 Testing public endpoints...');
    
    // Test platform stats
    await this.testEndpoint('Public API', 'Platform Stats', () => 
      publicApi.getPlatformStats()
    );

    // Test categories
    await this.testEndpoint('Public API', 'Categories', () => 
      publicApi.getPopularCategories()
    );

    // Test testimonials
    await this.testEndpoint('Public API', 'Testimonials', () => 
      publicApi.getFeaturedTestimonials()
    );

    // Test skills
    await this.testEndpoint('Public API', 'Skills', () => 
      publicApi.getSkills()
    );

    return this.results;
  }

  async testAuthEndpoints(): Promise<IntegrationTestResult[]> {
    console.log('🔐 Testing auth endpoints...');
    
    // Test registration endpoint (without actually registering)
    await this.testEndpoint('Auth API', 'Registration Endpoint', async () => {
      try {
        // Just test if the endpoint exists by making a request with invalid data
        await authApi.register({
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          primaryRole: 'freelancer',
          phone: '+1234567890',
          location: { country: 'Test', city: 'Test' },
          dateOfBirth: '1990-01-01',
          password: 'TestPassword123!'
        });
        return { success: false, error: 'Should have failed with invalid data' };
      } catch (error: any) {
        // Expected to fail, but endpoint should be reachable
        if (error.response?.status === 400 || error.response?.status === 409) {
          return { success: true, data: 'Endpoint reachable' };
        }
        throw error;
      }
    });

    // Test email OTP endpoint
    await this.testEndpoint('Auth API', 'Email OTP', async () => {
      try {
        await authApi.sendEmailOtp('test@example.com', 'verification');
        return { success: true, data: 'OTP endpoint reachable' };
      } catch (error: any) {
        // Expected to fail, but endpoint should be reachable
        if (error.response?.status === 400 || error.response?.status === 429) {
          return { success: true, data: 'OTP endpoint reachable' };
        }
        throw error;
      }
    });

    return this.results;
  }

  async testProjectEndpoints(): Promise<IntegrationTestResult[]> {
    console.log('📋 Testing project endpoints...');
    
    // Test public projects endpoint
    await this.testEndpoint('Project API', 'Public Projects', () => 
      projectApi.getProjects({ page: 1, limit: 5 })
    );

    // Test project templates
    await this.testEndpoint('Project API', 'Project Templates', () => 
      projectApi.getProjectTemplates()
    );

    return this.results;
  }

  async testFreelancerEndpoints(): Promise<IntegrationTestResult[]> {
    console.log('👨‍💻 Testing freelancer endpoints...');
    
    // Test freelancer profile endpoint (will fail without auth, but tests endpoint existence)
    await this.testEndpoint('Freelancer API', 'Profile Endpoint', async () => {
      try {
        await freelancerApi.getProfile();
        return { success: true, data: 'Profile endpoint reachable' };
      } catch (error: any) {
        if (error.response?.status === 401) {
          return { success: true, data: 'Profile endpoint reachable (auth required)' };
        }
        throw error;
      }
    });

    return this.results;
  }

  private async testEndpoint(
    service: string, 
    endpoint: string, 
    testFn: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        service,
        endpoint,
        success: true,
        responseTime,
        data: result
      });
      
      console.log(`✅ ${service} - ${endpoint}: ${responseTime}ms`);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = handleApiError(error);
      
      this.results.push({
        service,
        endpoint,
        success: false,
        error: errorMessage,
        responseTime
      });
      
      console.log(`❌ ${service} - ${endpoint}: ${errorMessage} (${responseTime}ms)`);
    }
  }

  async runAllTests(): Promise<{
    summary: {
      total: number;
      passed: number;
      failed: number;
      successRate: number;
    };
    results: IntegrationTestResult[];
  }> {
    console.log('🚀 Starting comprehensive integration tests...\n');
    
    this.results = [];
    
    await this.testPublicEndpoints();
    await this.testAuthEndpoints();
    await this.testProjectEndpoints();
    await this.testFreelancerEndpoints();
    
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const successRate = (passed / total) * 100;
    
    const summary = {
      total,
      passed,
      failed,
      successRate: Math.round(successRate * 100) / 100
    };
    
    console.log('\n📊 Integration Test Summary:');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.service} - ${r.endpoint}: ${r.error}`);
        });
    }
    
    return { summary, results: this.results };
  }

  getResults(): IntegrationTestResult[] {
    return this.results;
  }

  clearResults(): void {
    this.results = [];
  }
}

// Utility function to run integration tests
export async function runIntegrationTests(): Promise<{
  summary: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  };
  results: IntegrationTestResult[];
}> {
  const tester = new IntegrationTester();
  return await tester.runAllTests();
}

// Development utility to test specific endpoints
export async function testSpecificEndpoint(
  service: string,
  endpoint: string,
  testFn: () => Promise<any>
): Promise<IntegrationTestResult> {
  const tester = new IntegrationTester();
  await tester.testEndpoint(service, endpoint, testFn);
  return tester.getResults()[0];
}
