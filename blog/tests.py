from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import Post, Profile, VisitedCountry
import json

class TripTalesTestCase(TestCase):
    def setUp(self):
        # 1. Create a test client and user        
        self.client = Client()
        self.user_password = 'secure_password_123'
        self.user = User.objects.create_user(
            username='test_traveler', 
            email='test@example.com', 
            password=self.user_password
        )
        self.profile = Profile.objects.create(user=self.user, bio="I love testing!")

        #2. Get a JWT token (simulate login)
        response = self.client.post('/api/token/pair', 
            data=json.dumps({
                "username": "test_traveler",
                "password": self.user_password
            }),
            content_type='application/json'
        )
        self.token = response.json().get('access')
        self.auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_1_profile_flow(self):
        #Test: Getting a profile, updating your bio, and adding a country
        print("\n--- TEST 1: Profile Flow ---")
        
        # A. Checking /api/me
        response = self.client.get('/api/me', **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['username'], 'test_traveler')
        print("✅ Get Profile: OK")

        # B. Adding a country (visited country)
        country_data = {"country_code": "FRA"}
        response = self.client.post('/api/countries', 
            data=json.dumps(country_data), 
            content_type='application/json', 
            **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(VisitedCountry.objects.filter(user=self.user, country_code='FRA').exists())
        print("✅ Add Country (FRA): OK")

    def test_2_post_crud_flow(self):
        #Test: Creating, Reading, and Deleting a Post
        print("\n--- TEST 2: Post CRUD Flow ---")

        # A. Creating a post (via multipart/form-data, since there are files there)
        # Simulate form submission
        post_data = {
            'title': 'My Trip to Paris',
            'continent': 'Europe',
            'location_name': 'Paris, France',
            # Blocks are sent in a specific way, for the test we will simplify and check the creation of a record in the database
            'block_0_type': 'text',
            'block_0_content': 'It was amazing!',
        }
        
        response = self.client.post('/api/posts/create', data=post_data, **self.auth_headers)
        
        # Check if the post has been created
        self.assertEqual(response.status_code, 200)
        slug = response.json().get('slug')
        self.assertTrue(Post.objects.filter(title='My Trip to Paris').exists())
        print(f"✅ Create Post: OK (Slug: {slug})")

        # B. Getting a list of posts
        response = self.client.get('/api/posts')
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)
        print("✅ List Posts: OK")

        # C. Author's public profile
        response = self.client.get(f'/api/users/{self.user.username}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['stories_count'], 1)
        print("✅ Public Profile Stats: OK")

        # D. Deleting a post
        response = self.client.delete(f'/api/posts/{slug}', **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Post.objects.filter(slug=slug).exists())
        print("✅ Delete Post: OK")

    def test_3_public_access(self):
        """Test: Accessing Public Data Without Authorization"""
        print("\n--- TEST 3: Public Access ---")
        
        # The list of posts is available without a token
        response = self.client.get('/api/posts')
        self.assertEqual(response.status_code, 200)
        print("✅ Public Feed: OK")

        # Attempt to create a post WITHOUT a token (should be a 401 error)
        response = self.client.post('/api/posts/create', {'title': 'Hack attempt'})
        self.assertEqual(response.status_code, 401)
        print("✅ Unauthorized Write Protection: OK")