"""
Updated Diagnostic Script - Uses Stable Gemini Model
Run this to verify your setup with gemini-1.5-flash (better quota)
"""

import os
from pathlib import Path

print("\n" + "="*60)
print("🔍 AdaptPath Backend - Environment Diagnostic v3")
print("="*60 + "\n")

# Check 1: .env file exists
env_file = Path(".env")
if env_file.exists():
    print("✅ .env file found")
    print(f"   Location: {env_file.absolute()}")
    
    with open(".env", "r", encoding="utf-8") as f:
        content = f.read()
        lines = content.split("\n")
        print(f"   Lines in file: {len([l for l in lines if l.strip()])}")
        print("\n   Contents (API key masked for security):")
        for line in lines:
            if line.strip() and not line.strip().startswith("#"):
                if "GEMINI_API_KEY" in line:
                    if "=" in line:
                        key_part = line.split("=")[0]
                        value_part = line.split("=")[1]
                        masked = value_part[:10] + "..." + value_part[-5:] if len(value_part) > 15 else "***"
                        print(f"   {key_part}={masked}")
                else:
                    print(f"   {line}")
else:
    print("❌ .env file NOT found")
    exit(1)

print("\n" + "-"*60)

# Check 2: python-dotenv installed
try:
    import dotenv
    print("✅ python-dotenv is installed")
except ImportError:
    print("❌ python-dotenv NOT installed")
    exit(1)

print("\n" + "-"*60)

# Check 3: Load .env and check environment variable
print("\nAttempting to load .env file...")
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ load_dotenv() executed successfully")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        print("✅ GEMINI_API_KEY found in environment")
        print(f"   Key length: {len(api_key)} characters")
        print(f"   Key preview: {api_key[:10]}...{api_key[-5:]}")
        
        if api_key.startswith("AIzaSy"):
            print("✅ API key format looks correct (starts with AIzaSy)")
        else:
            print("⚠️  API key format might be incorrect")
    else:
        print("❌ GEMINI_API_KEY NOT found in environment")
        exit(1)
        
except Exception as e:
    print(f"❌ Error loading .env: {str(e)}")
    exit(1)

print("\n" + "-"*60)

# Check 4: Test Google GenAI with stable model
print("\nTesting Google GenAI connection...")
try:
    from google import genai
    from google.genai import types
    print("✅ google-genai package is installed")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            client = genai.Client(api_key=api_key)
            print("✅ Google GenAI client created successfully")
            
            # Try a simple test with STABLE MODEL
            print("\n🧪 Testing API connection with gemini-1.5-flash...")
            print("   (Using stable model with better quota)")
            
            try:
                response = client.models.generate_content(
                    model='gemini-1.5-flash',  # ← Using stable model
                    contents='Say "Hello" in one word',
                    config=types.GenerateContentConfig(
                        temperature=0.5,
                        max_output_tokens=10,
                    )
                )
                print("✅ API connection successful!")
                print(f"   Test response: {response.text}")
                
                print("\n" + "="*60)
                print("🎉 SUCCESS! EVERYTHING IS WORKING!")
                print("="*60)
                print("\n✅ Your .env file is correct")
                print("✅ API key is valid")
                print("✅ Google GenAI is working with gemini-1.5-flash")
                print("✅ No quota issues with this model")
                
                print("\n📋 Your backend is ready to use!")
                print("\nMake sure your main.py uses: model='gemini-1.5-flash'")
                print("(NOT gemini-2.0-flash-exp)")
                
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    print(f"⚠️  Rate limit hit for gemini-1.5-flash too!")
                    print("\n   This means you've made many requests recently.")
                    print("   Solutions:")
                    print("   1. Wait 1-2 minutes and try again")
                    print("   2. Try gemini-1.5-pro instead")
                    print("   3. Get a new API key from a different Google account")
                    print("   4. Upgrade to paid tier for higher limits")
                    print("\n   Your setup is correct, just need to wait or upgrade!")
                else:
                    print(f"⚠️  API test failed: {str(e)[:200]}")
                    print("\n   Check: https://aistudio.google.com/app/apikey")
                
        except Exception as e:
            print(f"❌ Failed to create GenAI client: {str(e)}")
    else:
        print("⚠️  Cannot test - API key not found")
        
except ImportError:
    print("❌ google-genai package NOT installed")
    print("   Solution: pip install google-genai")
except Exception as e:
    print(f"❌ Error testing GenAI: {str(e)}")

print("\n" + "="*60)
print("Diagnostic Complete")
print("="*60 + "\n")