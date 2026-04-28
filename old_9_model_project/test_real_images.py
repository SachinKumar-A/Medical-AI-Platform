"""
Test with REAL CHEST X-RAY IMAGES
Using actual test data from your test folders
"""
import requests
import json
import time
from PIL import Image
from pathlib import Path
import random

BASE_URL = "http://localhost:5000"
TEST_DIR = Path(r"C:\Users\sksan\drone_env\chest_xray\test")

def test_with_real_images():
    """Test pneumonia detection with REAL normal and pneumonia X-rays"""
    
    print("\n" + "="*70)
    print("🩺 REAL X-RAY VALIDATION TEST")
    print("   Using actual chest X-ray images from test folder")
    print("="*70)
    
    # Get test images
    normal_dir = TEST_DIR / "NORMAL"
    pneum_dir = TEST_DIR / "PNEUMONIA"
    
    normal_images = list(normal_dir.glob("*.jpeg")) + list(normal_dir.glob("*.jpg"))
    pneum_images = list(pneum_dir.glob("*.jpeg")) + list(pneum_dir.glob("*.jpg")) if pneum_dir.exists() else []
    
    print(f"\nTest Images Found:")
    print(f"  NORMAL images: {len(normal_images)}")
    print(f"  PNEUMONIA images: {len(pneum_images)}")
    
    # Test 5 normal images
    print("\n" + "-"*70)
    print("Testing NORMAL X-rays (should predict 'Normal')")
    print("-"*70)
    
    normal_correct = 0
    normal_tested = 0
    
    for img_path in random.sample(normal_images, min(5, len(normal_images))):
        try:
            with open(img_path, 'rb') as f:
                files = {'file': (img_path.name, f, 'image/jpeg')}
                resp = requests.post(f"{BASE_URL}/api/predict/pneumonia", files=files, timeout=30)
            
            if resp.status_code == 200:
                result = resp.json()
                label = result.get('label', 'Unknown')
                confidence = result.get('confidence', 0)
                
                is_correct = "Normal" in label
                normal_tested += 1
                if is_correct:
                    normal_correct += 1
                
                status = "✅" if is_correct else "❌"
                print(f"{status} {img_path.name:30} → {label:15} ({confidence}%)")
            else:
                print(f"❌ {img_path.name:30} → ERROR {resp.status_code}")
                normal_tested += 1
        
        except Exception as e:
            print(f"❌ {img_path.name:30} → {str(e)[:40]}")
            normal_tested += 1
    
    # Test 5 pneumonia images (if available)
    print("\n" + "-"*70)
    if pneum_images:
        print("Testing PNEUMONIA X-rays (should predict 'Pneumonia')")
        print("-"*70)
        
        pneum_correct = 0
        pneum_tested = 0
        
        for img_path in random.sample(pneum_images, min(5, len(pneum_images))):
            try:
                with open(img_path, 'rb') as f:
                    files = {'file': (img_path.name, f, 'image/jpeg')}
                    resp = requests.post(f"{BASE_URL}/api/predict/pneumonia", files=files, timeout=30)
                
                if resp.status_code == 200:
                    result = resp.json()
                    label = result.get('label', 'Unknown')
                    confidence = result.get('confidence', 0)
                    
                    is_correct = "Pneumonia" in label
                    pneum_tested += 1
                    if is_correct:
                        pneum_correct += 1
                    
                    status = "✅" if is_correct else "❌"
                    print(f"{status} {img_path.name:30} → {label:15} ({confidence}%)")
                else:
                    print(f"❌ {img_path.name:30} → ERROR {resp.status_code}")
                    pneum_tested += 1
            
            except Exception as e:
                print(f"❌ {img_path.name:30} → {str(e)[:40]}")
                pneum_tested += 1
    else:
        pneum_correct = 0
        pneum_tested = 0
        print("(NO PNEUMONIA IMAGES FOUND - SKIP)")
    
    # Summary
    print("\n" + "="*70)
    print("📊 VALIDATION RESULTS")
    print("="*70)
    
    if normal_tested > 0:
        normal_accuracy = (normal_correct / normal_tested) * 100
        print(f"\nNormal X-rays:    {normal_correct}/{normal_tested} correct ({normal_accuracy:.0f}%)")
    
    if pneum_tested > 0:
        pneum_accuracy = (pneum_correct / pneum_tested) * 100
        print(f"Pneumonia X-rays: {pneum_correct}/{pneum_tested} correct ({pneum_accuracy:.0f}%)")
    
    total_correct = normal_correct + pneum_correct
    total_tested = normal_tested + pneum_tested
    
    if total_tested > 0:
        overall_accuracy = (total_correct / total_tested) * 100
        print(f"\n🎯 Overall Accuracy: {overall_accuracy:.0f}% ({total_correct}/{total_tested} correct)")
    
    print("\n" + "="*70)
    
    if overall_accuracy >= 90:
        print("✅ EXCELLENT - Model is working correctly!")
    elif overall_accuracy >= 70:
        print("⚠️  ACCEPTABLE - Model mostly working, needs fine-tuning")
    else:
        print("❌ POOR - Model needs improvement")
    
    print("="*70 + "\n")


if __name__ == "__main__":
    test_with_real_images()
