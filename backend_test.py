import requests
import sys
import json
from datetime import datetime

class ChauffeurAPITester:
    def __init__(self, base_url="https://chauffeur-calc.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_ride_id = None

    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                return True, response.json() if response.content else {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "ERROR")
                if response.content:
                    try:
                        error_data = response.json()
                        self.log(f"   Error: {error_data}", "ERROR")
                    except:
                        self.log(f"   Response: {response.text[:200]}", "ERROR")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Exception: {str(e)}", "ERROR")
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_auth_flow(self):
        """Test authentication flow"""
        # Login with test credentials
        success, response = self.run_test(
            "Login",
            "POST",
            "auth/login",
            200,
            data={"email": "test@test.com", "password": "test123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.log(f"✅ Token obtained: {self.token[:20]}...")
            
            # Test /auth/me endpoint
            me_success, me_response = self.run_test("Get Current User", "GET", "auth/me", 200)
            if me_success:
                self.log(f"✅ User info: {me_response.get('email', 'Unknown')}")
            return True
        return False

    def test_settings_endpoints(self):
        """Test settings endpoints"""
        # Get settings
        get_success, settings = self.run_test("Get Settings", "GET", "settings", 200)
        if not get_success:
            return False

        self.log(f"✅ Current settings: base_rate={settings.get('base_rate')}, social_contribution_pct={settings.get('social_contribution_pct')}")
        
        # Update settings
        updated_settings = {
            "base_rate": 13.00,
            "social_contribution_pct": 2.80
        }
        put_success, _ = self.run_test("Update Settings", "PUT", "settings", 200, data=updated_settings)
        
        # Verify update
        if put_success:
            verify_success, verify_settings = self.run_test("Verify Settings Update", "GET", "settings", 200)
            if verify_success and verify_settings.get('base_rate') == 13.00:
                self.log("✅ Settings update verified")
                return True
        return False

    def test_ride_crud(self):
        """Test ride CRUD operations"""
        # Create a test ride
        test_ride = {
            "date": "2024-12-15",
            "client_name": "Test Client",
            "car_brand": "Mercedes",
            "car_model": "E-Class",
            "start_time": "09:00",
            "end_time": "17:00",
            "extra_costs": 25.50,
            "wwv_km": 45.0,
            "notes": "Test ride for API testing"
        }
        
        create_success, ride_response = self.run_test("Create Ride", "POST", "rides", 201, data=test_ride)
        if not create_success:
            return False
            
        self.test_ride_id = ride_response.get('id')
        self.log(f"✅ Created ride with ID: {self.test_ride_id}")
        
        # Verify salary calculation
        expected_fields = ['gross_pay', 'net_pay', 'total_hours', 'social_contribution', 'wwv_amount']
        for field in expected_fields:
            if field in ride_response:
                self.log(f"✅ Ride calculation - {field}: {ride_response[field]}")
            else:
                self.log(f"❌ Missing field in ride response: {field}", "ERROR")
                return False
                
        # Verify new formula: Bruto should include social contribution
        gross_total = ride_response.get('gross_total', 0)
        gross_pay = ride_response.get('gross_pay', 0)
        social_contrib = ride_response.get('social_contribution', 0)
        wwv_amount = ride_response.get('wwv_amount', 0)
        extra_costs = ride_response.get('extra_costs', 0)
        net_pay = ride_response.get('net_pay', 0)
        
        expected_bruto = gross_pay + wwv_amount + extra_costs + social_contrib
        expected_netto = gross_total - social_contrib
        
        if abs(gross_total - expected_bruto) < 0.01:
            self.log(f"✅ Bruto formula correct: {gross_total} ≈ {expected_bruto}")
        else:
            self.log(f"❌ Bruto formula incorrect: {gross_total} != {expected_bruto}", "ERROR")
            return False
            
        if abs(net_pay - expected_netto) < 0.01:
            self.log(f"✅ Netto formula correct: {net_pay} ≈ {expected_netto}")
        else:
            self.log(f"❌ Netto formula incorrect: {net_pay} != {expected_netto}", "ERROR")
            return False

        # Get rides
        get_success, rides = self.run_test("Get Rides", "GET", "rides", 200)
        if get_success and len(rides) > 0:
            self.log(f"✅ Retrieved {len(rides)} rides")
        else:
            return False

        # Update ride
        updated_ride = {**test_ride, "extra_costs": 30.00}
        update_success, _ = self.run_test(f"Update Ride", "PUT", f"rides/{self.test_ride_id}", 200, data=updated_ride)
        
        return update_success

    def test_stats_endpoint(self):
        """Test enhanced stats endpoint with filters"""
        # Test basic stats
        basic_success, basic_stats = self.run_test("Get Basic Stats", "GET", "stats", 200)
        if not basic_success:
            return False
            
        # Check for new required fields
        required_stats_fields = [
            'total_rides', 'total_hours', 'total_gross', 'total_net',
            'total_overtime_hours', 'total_night_hours', 'avg_per_ride', 'avg_per_hour',
            'monthly_earnings', 'weekly_earnings', 'brand_stats', 'hourly_distribution',
            'day_of_week_stats', 'available_months', 'available_clients', 'available_brands'
        ]
        
        for field in required_stats_fields:
            if field in basic_stats:
                self.log(f"✅ Stats field present: {field}")
            else:
                self.log(f"❌ Missing stats field: {field}", "ERROR")
                return False

        # Test month filter
        month_success, month_stats = self.run_test("Stats with Month Filter", "GET", "stats?month=2024-12", 200)
        if month_success:
            self.log(f"✅ Month filtered stats: {month_stats.get('total_rides', 0)} rides")

        # Test client filter  
        if basic_stats.get('available_clients'):
            client = basic_stats['available_clients'][0] if basic_stats['available_clients'] else 'Test Client'
            client_success, client_stats = self.run_test("Stats with Client Filter", "GET", f"stats?client_name={client}", 200)
            if client_success:
                self.log(f"✅ Client filtered stats: {client_stats.get('total_rides', 0)} rides")

        # Test brand filter
        if basic_stats.get('available_brands'):
            brand = basic_stats['available_brands'][0] if basic_stats['available_brands'] else 'Mercedes'
            brand_success, brand_stats = self.run_test("Stats with Brand Filter", "GET", f"stats?car_brand={brand}", 200)
            if brand_success:
                self.log(f"✅ Brand filtered stats: {brand_stats.get('total_rides', 0)} rides")

        return True

    def cleanup(self):
        """Clean up test data"""
        if self.test_ride_id:
            delete_success, _ = self.run_test("Delete Test Ride", "DELETE", f"rides/{self.test_ride_id}", 200)
            if delete_success:
                self.log("✅ Test data cleaned up")

    def run_all_tests(self):
        """Run all tests"""
        self.log("🚀 Starting Chauffeur API Tests")
        self.log(f"📡 Base URL: {self.base_url}")
        
        try:
            # Health check
            if not self.test_health():
                self.log("❌ Health check failed - stopping tests", "ERROR")
                return False

            # Authentication
            if not self.test_auth_flow():
                self.log("❌ Authentication failed - stopping tests", "ERROR") 
                return False

            # Settings
            if not self.test_settings_endpoints():
                self.log("❌ Settings tests failed", "ERROR")

            # Ride CRUD
            if not self.test_ride_crud():
                self.log("❌ Ride CRUD tests failed", "ERROR")

            # Stats endpoint
            if not self.test_stats_endpoint():
                self.log("❌ Stats tests failed", "ERROR")

            # Cleanup
            self.cleanup()

            # Results
            self.log(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
            success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
            self.log(f"📈 Success rate: {success_rate:.1f}%")
            
            return self.tests_passed == self.tests_run

        except Exception as e:
            self.log(f"💥 Unexpected error: {str(e)}", "ERROR")
            return False

def main():
    tester = ChauffeurAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())