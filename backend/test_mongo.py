import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path
import ssl
import certifi

async def test_connection():
    load_dotenv(Path(__file__).parent / '.env')
    
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    print(f"Connecting to MongoDB...")
    print(f"URL: {mongo_url[:50]}...")
    print(f"Database: {db_name}")
    
    try:
        client = AsyncIOMotorClient(
            mongo_url,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        
        # Test connection
        await client.admin.command('ping')
        print("✓ Successfully connected to MongoDB!")
        
        # Test database access
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"✓ Database '{db_name}' accessible")
        print(f"✓ Collections: {collections if collections else 'None (empty database)'}")
        
        # Test insert
        test_doc = {"test": "document", "timestamp": "test"}
        result = await db.test_collection.insert_one(test_doc)
        print(f"✓ Insert test successful, ID: {result.inserted_id}")
        
        # Clean up
        await db.test_collection.delete_one({"_id": result.inserted_id})
        print("✓ Cleanup successful")
        
        client.close()
        print("\n✅ MongoDB connection is working properly!")
        
    except Exception as e:
        print(f"\n❌ MongoDB connection failed: {type(e).__name__}")
        print(f"Error: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(test_connection())
