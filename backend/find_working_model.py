"""
Find Working Models for google-generativeai package
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("\n" + "="*60)
print("🔍 Finding Working Gemini Models")
print("="*60 + "\n")

try:
    import google.generativeai as genai
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found")
        exit(1)
    
    genai.configure(api_key=api_key)
    
    print("✅ API configured")
    print(f"   Key: {api_key[:10]}...{api_key[-5:]}")
    print()
    
    # List of model names to try
    model_names = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro',
        'models/gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash',
    ]
    
    print("🧪 Testing different model names...")
    print("-"*60)
    
    working_models = []
    
    for model_name in model_names:
        try:
            print(f"\nTrying: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content('Say hello')
            
            print(f"   ✅ SUCCESS!")
            print(f"   Response: {response.text}")
            working_models.append(model_name)
            
            # Found a working model, use it!
            break
            
        except Exception as e:
            error_str = str(e)
            if "404" in error_str or "not found" in error_str.lower():
                print(f"   ❌ Model not found")
            elif "429" in error_str or "quota" in error_str.lower():
                print(f"   ⚠️  Model exists but quota exhausted")
                working_models.append(f"{model_name} (needs quota)")
            else:
                print(f"   ❌ Error: {str(e)[:80]}")
    
    print("\n" + "="*60)
    
    if working_models:
        best = working_models[0]
        if "quota" in best:
            print("⚠️  Models found but quota exhausted")
            print("\nWait 1-2 minutes, then update main.py to use:")
            print(f"   model_name = '{best.split()[0]}'")
        else:
            print("🎉 SUCCESS! Working model found!")
            print(f"\nUpdate main.py to use:")
            print(f"   self.model = genai.GenerativeModel('{best}')")
            print("\nThen restart: python main.py")
    else:
        print("❌ No working models found")
        print("\nTrying to list all available models...")
        
        try:
            print("\nAvailable models:")
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(f"   • {m.name}")
                    
        except Exception as e:
            print(f"   Could not list models: {str(e)[:100]}")
    
    print("="*60 + "\n")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()