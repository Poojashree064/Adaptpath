"""
Verification Script - Check if everything is set up correctly
"""

import sys
import os

print("\n" + "="*60)
print("🔍 AdaptPath Setup Verification")
print("="*60 + "\n")

# Check 1: Which google package is installed
print("1. Checking Google AI package...")
try:
    import google.generativeai
    print("   ✅ google-generativeai is installed (CORRECT)")
    package_ok = True
except ImportError:
    print("   ❌ google-generativeai NOT installed")
    package_ok = False

try:
    import google.genai
    print("   ⚠️  google-genai is also installed (should be removed)")
except ImportError:
    pass

print()

# Check 2: .env file
print("2. Checking .env file...")
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    print(f"   ✅ GEMINI_API_KEY found ({api_key[:10]}...{api_key[-5:]})")
else:
    print("   ❌ GEMINI_API_KEY not found")

print()

# Check 3: Test Gemini API
print("3. Testing Gemini API connection...")
if package_ok and api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content('Say hello in one word')
        print(f"   ✅ API working! Response: {response.text}")
        print()
        print("="*60)
        print("🎉 EVERYTHING IS WORKING!")
        print("="*60)
        print("\nYour backend is ready to use!")
        print("Restart it with: python main.py")
        
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            print("   ⚠️  API key works but quota exhausted")
            print("      Wait 1-2 minutes and try again")
        else:
            print(f"   ❌ API test failed: {str(e)[:100]}")
else:
    print("   ⚠️  Cannot test - package or API key missing")

print()

# Check 4: main.py content
print("4. Checking main.py...")
try:
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import google.generativeai as genai' in content:
        print("   ✅ main.py using correct package (google-generativeai)")
    elif 'from google import genai' in content:
        print("   ❌ main.py using wrong package (google-genai)")
        print("      Run: copy main_working.py main.py")
    else:
        print("   ⚠️  Cannot determine which package main.py uses")
        
except FileNotFoundError:
    print("   ❌ main.py not found in current directory")

print("\n" + "="*60)
print("Verification Complete")
print("="*60 + "\n")