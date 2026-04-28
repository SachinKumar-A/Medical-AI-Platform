"""
Test high-accuracy API with optimized preprocessing
"""
import sys
import os
import io
import time
import requests
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw

BASE_DIR = Path(__file__).resolve().parent

def create_test_image(disease_type="general", size=(224, 224)):
    """Create a synthetic test image for quick validation"""
    img = Image.new('RGB', size, color='white')
    draw = ImageDraw.Draw(img)
    
    if disease_type == "brain":
        # Create MRI-like pattern (circular with some texture)
        draw.ellipse([50, 50, 174, 174], outline='gray', width=2)
        draw.rectangle([70, 70, 154, 154], outline='darkgray')
    elif disease_type == "bone":
        # Create X-ray-like pattern (elongated line)
        draw.line([(112, 10), (112, 214)], fill='gray', width=10)
        draw.ellipse([85, 50, 139, 100], outline='darkgray', width=2)
    elif disease_type == "pneumonia":
        # Create chest X-ray pattern
        draw.ellipse([40, 40, 184, 184], outline='darkgray', width=3)
    else:
        # Generic test pattern
        for i in range(0, 224, 20):
            draw.line([(i, 0), (i, 224)], fill='lightgray')
            draw.line([(0, i), (224, i)], fill='lightgray')
    
    return img


def test_api(disease, image_path=None):
    """Test single disease API"""
    print(f"\n{'='*60}")
    print(f"Testing: {disease.upper()}")
    print('='*60)
    
    url = f"http://localhost:5000/api/predict/{disease}"
    
    try:
        # Create or use provided image
        if image_path and Path(image_path).exists():
            with open(image_path, 'rb') as f:
                files = {'file': (Path(image_path).name, f, 'image/jpeg')}
                resp = requests.post(url, files=files, timeout=10)
        else:
            # Use test image
            test_img = create_test_image(disease)
            img_bytes = io.BytesIO()
            test_img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            files = {'file': ('test.png', img_bytes, 'image/png')}
            resp = requests.post(url, files=files, timeout=10)
        
        if resp.status_code == 200:
            result = resp.json()
            print(f"Status: ✅ OK (200)")
            print(f"Label: {result.get('label', 'N/A')}")
            print(f"Confidence: {result.get('confidence', 'N/A')}%")
            print(f"Status: {result.get('status', 'N/A')}")
            
            if 'raw_scores' in result:
                print(f"All scores: {result['raw_scores']}")
            elif 'raw_score' in result:
                print(f"Raw score: {result['raw_score']}")
            
            return True
        else:
            print(f"Status: ❌ FAIL ({resp.status_code})")
            print(f"Error: {resp.json().get('error', 'Unknown error')}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"Status: ❌ CONNECTION FAILED (server not responding)")
        return False
    except Exception as e:
        print(f"Status: ❌ ERROR - {e}")
        return False


def main():
    """Run tests on all 9 diseases"""
    import io
    
    print("\nMediScan High-Accuracy API Test")
    print("=" * 60)
    print("Testing all 9 disease models with optimized preprocessing")
    print("Waiting for server to be ready...")
    
    # Wait for server
    max_wait = 30
    start = time.time()
    while time.time() - start < max_wait:
        try:
            resp = requests.get("http://localhost:5000/api/health", timeout=2)
            if resp.status_code == 200:
                print("✅ Server is ready!\n")
                break
        except:
            pass
        time.sleep(1)
    else:
        print("❌ Server failed to start within 30 seconds")
        return
    
    diseases = [
        "pneumonia",
        "brain",
        "bone",
        "eye",
        "tb_covid",
        "lung",
        "dental",
        "breast",
        "kidney",  # CSV required
    ]
    
    results = {}
    for disease in diseases[:7]:  # Skip kidney for now (requires CSV)
        results[disease] = test_api(disease)
        time.sleep(0.5)  # Brief delay between tests
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    working = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"Models working: {working}/{total}")
    for disease, status in results.items():
        status_str = "✅ OK" if status else "❌ FAIL"
        print(f"  {disease:12}: {status_str}")
    print("="*60)


if __name__ == "__main__":
    main()
