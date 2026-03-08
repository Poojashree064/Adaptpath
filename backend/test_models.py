"""
Final Diagnostic - Test Available Models
This will find which model works for you
"""

import os
from pathlib import Path
from dotenv import load_dotenv

print("\n" + "="*60)
print("🔍 AdaptPath - Final Model Test")
print("="*60 + "\n")

load_dotenv()

# Check API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY not found")
    exit(1)

print("✅ API key found")
print(f"   Key preview: {api_key[:10]}...{api_key[-5:]}")
print()

try:
    from google import genai
    from google.genai import types
    
    client = genai.Client(api_key=api_key)
    print("✅ GenAI client created")
    print()
    
    # Models to try (in order of preference)
    models_to_try = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest', 
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
    ]
    
    print("🧪 Testing available models...")
    print("-"*60)
    
    working_models = []
    
    for model_name in models_to_try:
        try:
            print(f"\nTesting: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents='Say hello',
                config=types.GenerateContentConfig(
                    temperature=0.5,
                    max_output_tokens=10,
                )
            )
            print(f"   ✅ SUCCESS! Response: {response.text}")
            working_models.append(model_name)
            break  # Found a working model, stop testing
            
        except Exception as e:
            error_str = str(e)
            if "404" in error_str or "NOT_FOUND" in error_str:
                print(f"   ❌ Model not available")
            elif "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                print(f"   ⚠️  Model available but quota exhausted")
                working_models.append(f"{model_name} (quota exhausted)")
            else:
                print(f"   ❌ Error: {str(e)[:80]}")
    
    print("\n" + "="*60)
    
    if working_models:
        best_model = working_models[0]
        if "quota" in best_model:
            print("⚠️  Models found but quota exhausted")
            print("\n   Solutions:")
            print("   1. Wait 1-2 minutes")
            print("   2. Get new API key from different Google account")
            print("   3. Upgrade to paid tier")
        else:
            print("🎉 SUCCESS! Working model found!")
            print(f"\n   Use this model: {best_model}")
            print("\n✅ Your backend will work with this model")
            print(f"   Update main.py to use: model='{best_model}'")
    else:
        print("⚠️  No working models found")
        print("\n   Possible solutions:")
        print("   1. Wait for quota reset (1-2 minutes)")
        print("   2. Try creating a new API key")
        print("   3. Check API key has Gemini API access")
    
    print("="*60 + "\n")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")

print()