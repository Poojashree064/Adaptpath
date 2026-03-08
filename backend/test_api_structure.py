"""
Test Script - Using Correct API Structure for google-genai 0.3.0
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("\n" + "="*60)
print("🔍 Testing google-genai 0.3.0 API Structure")
print("="*60 + "\n")

try:
    from google import genai
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found")
        exit(1)
    
    print("✅ API key found")
    print(f"   Key: {api_key[:10]}...{api_key[-5:]}")
    print()
    
    # Try the correct API structure for version 0.3.0
    client = genai.Client(api_key=api_key)
    print("✅ Client created")
    print()
    
    print("🧪 Testing different API methods...")
    print("-"*60)
    
    # Method 1: Try generate_content directly
    try:
        print("\nMethod 1: Using generate_content with full model path")
        response = client.models.generate_content(
            model='models/gemini-1.5-flash',
            contents='Say hello in one word'
        )
        print(f"   ✅ SUCCESS! Response: {response.text}")
        print("\n   Use: model='models/gemini-1.5-flash'")
        
    except Exception as e:
        print(f"   ❌ Failed: {str(e)[:100]}")
    
    # Method 2: Try without models/ prefix
    try:
        print("\nMethod 2: Using generate_content without prefix")
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents='Say hello in one word'
        )
        print(f"   ✅ SUCCESS! Response: {response.text}")
        print("\n   Use: model='gemini-1.5-flash'")
        
    except Exception as e:
        print(f"   ❌ Failed: {str(e)[:100]}")
    
    # Method 3: Try gemini-pro
    try:
        print("\nMethod 3: Using gemini-pro")
        response = client.models.generate_content(
            model='gemini-pro',
            contents='Say hello in one word'
        )
        print(f"   ✅ SUCCESS! Response: {response.text}")
        print("\n   Use: model='gemini-pro'")
        
    except Exception as e:
        print(f"   ❌ Failed: {str(e)[:100]}")
    
    # Method 4: Try with models/ prefix for gemini-pro
    try:
        print("\nMethod 4: Using models/gemini-pro")
        response = client.models.generate_content(
            model='models/gemini-pro',
            contents='Say hello in one word'
        )
        print(f"   ✅ SUCCESS! Response: {response.text}")
        print("\n   Use: model='models/gemini-pro'")
        
    except Exception as e:
        print(f"   ❌ Failed: {str(e)[:100]}")
    
    # Method 5: Try gemini-1.5-flash-001
    try:
        print("\nMethod 5: Using gemini-1.5-flash-001")
        response = client.models.generate_content(
            model='gemini-1.5-flash-001',
            contents='Say hello in one word'
        )
        print(f"   ✅ SUCCESS! Response: {response.text}")
        print("\n   Use: model='gemini-1.5-flash-001'")
        
    except Exception as e:
        print(f"   ❌ Failed: {str(e)[:100]}")
    
    # Method 6: Check package version
    try:
        print("\n" + "-"*60)
        print("Package Info:")
        import google.genai
        if hasattr(google.genai, '__version__'):
            print(f"   google-genai version: {google.genai.__version__}")
        else:
            print("   Version: Unable to determine")
            
        # Try to list models
        try:
            print("\nAttempting to list available models...")
            models_list = list(client.models.list())
            if models_list:
                print("   Available models:")
                for model in models_list[:5]:  # Show first 5
                    print(f"      • {model.name}")
            else:
                print("   No models returned from list()")
        except Exception as e:
            print(f"   Could not list models: {str(e)[:100]}")
            
    except Exception as e:
        print(f"   Error: {str(e)[:100]}")
    
    print("\n" + "="*60 + "\n")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print()