#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any

class GetDrivenAPITester:
    def __init__(self, base_url="https://chauffeur-calc.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            "test": name,
            "passed": success,
            "details": details
        })
        
        return success

    def make_request(self, method: str, endpoint: str, data: Dict[Any, Any] = None, expected_status: int = 200):
        """Make API request with error handling"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return success, response.status_code, response_data
            
        except requests.exceptions.RequestException as e:
            return False, 0, str(e)

    def test_health_check(self):
        """Test health endpoint"""
        success, status, data = self.make_request('GET', '/health')
        return self.log_test("Health Check", success, f"Status: {status}")

    def test_register_new_user(self):
        """Test user registration"""
        timestamp = int(datetime.now().timestamp())
        test_data = {
            "email": f"test_user_{timestamp}@test.com",
            "password": "TestPassword123!",
            "name": f"Test User {timestamp}"
        }
        
        success, status, data = self.make_request('POST', '/auth/register', test_data, 200)
        
        if success and isinstance(data, dict) and 'token' in data and 'user' in data:
            self.token = data['token']
            self.user_id = data['user']['id']
            return self.log_test("User Registration", True, f"User created: {data['user']['email']}")
        else:
            return self.log_test("User Registration", False, f"Status: {status}, Response: {data}")

    def test_login_existing_user(self):
        """Test login with existing user"""
        test_data = {
            "email": "test@test.com",
            "password": "test123"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', test_data, 200)
        
        if success and isinstance(data, dict) and 'token' in data:
            self.token = data['token']
            self.user_id = data['user']['id']
            return self.log_test("User Login", True, f"Login successful: {data['user']['email']}")
        else:
            return self.log_test("User Login", False, f"Status: {status}, Response: {data}")

    def test_get_user_profile(self):
        """Test get current user profile"""
        if not self.token:
            return self.log_test("Get User Profile", False, "No token available")
        
        success, status, data = self.make_request('GET', '/auth/me')
        
        if success and isinstance(data, dict) and 'email' in data:
            return self.log_test("Get User Profile", True, f"Profile retrieved: {data['email']}")
        else:
            return self.log_test("Get User Profile", False, f"Status: {status}, Response: {data}")

    def test_get_default_settings(self):
        """Test get user settings"""
        if not self.token:
            return self.log_test("Get Settings", False, "No token available")
        
        success, status, data = self.make_request('GET', '/settings')
        
        if success and isinstance(data, dict) and 'base_rate' in data:
            return self.log_test("Get Settings", True, f"Base rate: €{data['base_rate']}")
        else:
            return self.log_test("Get Settings", False, f"Status: {status}, Response: {data}")

    def test_update_settings(self):
        """Test update settings"""
        if not self.token:
            return self.log_test("Update Settings", False, "No token available")
        
        new_settings = {
            "base_rate": 13.50,
            "overtime_multiplier": 1.6,
            "night_surcharge": 1.75
        }
        
        success, status, data = self.make_request('PUT', '/settings', new_settings)
        
        if success and isinstance(data, dict) and data.get('base_rate') == 13.50:
            return self.log_test("Update Settings", True, f"Settings updated successfully")
        else:
            return self.log_test("Update Settings", False, f"Status: {status}, Response: {data}")

    def test_create_ride(self):
        """Test create a new ride"""
        if not self.token:
            return self.log_test("Create Ride", False, "No token available")
        
        ride_data = {
            "date": "2024-01-15",
            "client_name": "Test Client Ltd",
            "car_brand": "Mercedes",
            "car_model": "S-Class",
            "start_time": "08:00",
            "end_time": "17:00",
            "extra_costs": 25.50,
            "wwv_km": 45.0,
            "notes": "Test ride for API testing"
        }
        
        success, status, data = self.make_request('POST', '/rides', ride_data, 200)
        
        if success and isinstance(data, dict) and 'id' in data:
            self.test_ride_id = data['id']
            return self.log_test("Create Ride", True, 
                f"Ride created - Net pay: €{data.get('net_pay', 0):.2f}, Hours: {data.get('total_hours', 0)}")
        else:
            return self.log_test("Create Ride", False, f"Status: {status}, Response: {data}")

    def test_get_rides(self):
        """Test get all rides"""
        if not self.token:
            return self.log_test("Get Rides", False, "No token available")
        
        success, status, data = self.make_request('GET', '/rides')
        
        if success and isinstance(data, list):
            return self.log_test("Get Rides", True, f"Retrieved {len(data)} rides")
        else:
            return self.log_test("Get Rides", False, f"Status: {status}, Response: {data}")

    def test_update_ride(self):
        """Test update existing ride"""
        if not self.token or not hasattr(self, 'test_ride_id'):
            return self.log_test("Update Ride", False, "No token or ride ID available")
        
        updated_data = {
            "date": "2024-01-15",
            "client_name": "Updated Client Name",
            "car_brand": "BMW",
            "car_model": "7 Series",
            "start_time": "09:00",
            "end_time": "18:00",
            "extra_costs": 30.00,
            "wwv_km": 50.0,
            "notes": "Updated test ride"
        }
        
        success, status, data = self.make_request('PUT', f'/rides/{self.test_ride_id}', updated_data)
        
        if success and isinstance(data, dict) and data.get('client_name') == 'Updated Client Name':
            return self.log_test("Update Ride", True, f"Ride updated successfully")
        else:
            return self.log_test("Update Ride", False, f"Status: {status}, Response: {data}")

    def test_delete_ride(self):
        """Test delete ride"""
        if not self.token or not hasattr(self, 'test_ride_id'):
            return self.log_test("Delete Ride", False, "No token or ride ID available")
        
        success, status, data = self.make_request('DELETE', f'/rides/{self.test_ride_id}', expected_status=200)
        
        if success:
            return self.log_test("Delete Ride", True, "Ride deleted successfully")
        else:
            return self.log_test("Delete Ride", False, f"Status: {status}, Response: {data}")

    def test_get_stats(self):
        """Test get user statistics"""
        if not self.token:
            return self.log_test("Get Stats", False, "No token available")
        
        success, status, data = self.make_request('GET', '/stats')
        
        if success and isinstance(data, dict):
            stats_keys = ['total_rides', 'total_hours', 'total_gross', 'total_net', 'monthly_earnings']
            if all(key in data for key in stats_keys):
                return self.log_test("Get Stats", True, 
                    f"Total rides: {data['total_rides']}, Net: €{data['total_net']:.2f}")
            else:
                return self.log_test("Get Stats", False, f"Missing stats keys in response")
        else:
            return self.log_test("Get Stats", False, f"Status: {status}, Response: {data}")

    def test_salary_calculation(self):
        """Test salary calculation with edge cases"""
        if not self.token:
            return self.log_test("Salary Calculation", False, "No token available")
        
        # Test overnight shift (20:00 to 06:00 next day) - should have night surcharge
        night_ride = {
            "date": "2024-01-16",
            "client_name": "Night Shift Client",
            "car_brand": "Mercedes",
            "car_model": "E-Class",
            "start_time": "20:00",
            "end_time": "06:00",
            "extra_costs": 0,
            "wwv_km": 0,
            "notes": "Night shift test"
        }
        
        success, status, data = self.make_request('POST', '/rides', night_ride, 200)
        
        if success and isinstance(data, dict):
            # Should have 10 total hours, 9 normal + 1 overtime, all 10 hours get night surcharge
            expected_night_hours = 10.0
            expected_overtime_hours = 1.0
            
            actual_night_hours = data.get('night_hours', 0)
            actual_overtime_hours = data.get('overtime_hours', 0)
            
            # Clean up test ride
            if 'id' in data:
                self.make_request('DELETE', f"/rides/{data['id']}")
            
            if abs(actual_night_hours - expected_night_hours) < 0.1 and abs(actual_overtime_hours - expected_overtime_hours) < 0.1:
                return self.log_test("Salary Calculation", True, 
                    f"Night hours: {actual_night_hours}, Overtime: {actual_overtime_hours}")
            else:
                return self.log_test("Salary Calculation", False, 
                    f"Expected night: {expected_night_hours}, got: {actual_night_hours}, Expected OT: {expected_overtime_hours}, got: {actual_overtime_hours}")
        else:
            return self.log_test("Salary Calculation", False, f"Status: {status}, Response: {data}")

    def test_invalid_login(self):
        """Test invalid login credentials"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', invalid_data, 401)
        
        return self.log_test("Invalid Login Test", success, f"Status: {status}")

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, status, data = self.make_request('GET', '/rides', expected_status=401)
        
        # Restore token
        self.token = original_token
        
        return self.log_test("Unauthorized Access Test", success, f"Status: {status}")

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚗 GET DRIVEN API Test Suite")
        print("=" * 50)
        
        # Health check first
        if not self.test_health_check():
            print("❌ Health check failed - aborting tests")
            return self.generate_summary()
        
        # Authentication tests
        print("\n🔐 Authentication Tests:")
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Try existing user first, fallback to registration
        if not self.test_login_existing_user():
            print("   Existing user login failed, trying registration...")
            if not self.test_register_new_user():
                print("❌ Both login and registration failed - aborting")
                return self.generate_summary()
        
        self.test_get_user_profile()
        
        # Settings tests
        print("\n⚙️ Settings Tests:")
        self.test_get_default_settings()
        self.test_update_settings()
        
        # Ride management tests
        print("\n🚙 Ride Management Tests:")
        if self.test_create_ride():
            self.test_get_rides()
            self.test_update_ride()
            self.test_delete_ride()
        
        # Statistics tests
        print("\n📊 Statistics Tests:")
        self.test_get_stats()
        
        # Edge case tests
        print("\n🧪 Edge Case Tests:")
        self.test_salary_calculation()
        
        return self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            
            # Show failed tests
            failed_tests = [r for r in self.test_results if not r['passed']]
            if failed_tests:
                print("\nFailed tests:")
                for test in failed_tests:
                    print(f"  • {test['test']}: {test['details']}")
            
            return False

def main():
    """Main test runner"""
    tester = GetDrivenAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())