#!/usr/bin/env python3
"""
Test API predictions for all diseases
"""
import requests
import base64
import json
from pathlib import Path

BASE_URL = "http://localhost:5000"

# Use a real test image from the dataset
test_image = Path("test/NORMAL/IM-0001-0001.jpeg")

if not test_image.exists():
    print(f"[ERR] Test image not found: {test_image}")
    exit(1)

print("=" * 60)
print("API PREDICTION TEST")
print("=" * 60)

diseases = ["pneumonia", "brain", "bone", "eye", "kidney", "lung", "dental", "breast", "tb_covid"]

# Test with pneumonia X-ray image (most likely to work)
with open(test_image, "rb") as f:
    image_data = f.read()

for disease in diseases:
    print(f"\n[{disease.upper()}]", end=" ")
    try:
        files = {"file": (test_image.name, image_data, "image/jpeg")}
        response = requests.post(f"{BASE_URL}/api/predict/{disease}", files=files, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"OK - {result.get('status', 'N/A')}")
            if "error" in result:
                print(f"       Error: {result['error']}")
            if "prediction" in result:
                print(f"       Prediction: {result['prediction']}")
        else:
            print(f"FAIL ({response.status_code})")
            try:
                print(f"       {response.json()}")
            except:
                print(f"       {response.text[:100]}")
    except Exception as e:
        print(f"ERROR - {str(e)}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
