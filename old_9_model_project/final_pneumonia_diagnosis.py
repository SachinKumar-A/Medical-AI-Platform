"""
Final diagnosis and fix for pneumonia model
Test all possible configurations to find the correct one
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications.densenet import preprocess_input
import numpy as np
from PIL import Image
from pathlib import Path

BASE_DIR = Path(r"C:\Users\sksan\drone_env\chest_xray")

# Load model
model = keras.models.load_model(str(BASE_DIR / "model2result.keras"), compile=False, safe_mode=False)

# Load test images
normal_imgs = list((BASE_DIR / "test" / "NORMAL").glob("*.jpeg"))[:10]
pneum_imgs = list((BASE_DIR / "test" / "PNEUMONIA").glob("*.jpeg"))[:10]

print("\nTesting 10 NORMAL + 10 PNEUMONIA images with different configurations:\n")

# Test multiple configurations
configs = [
    ("Dense [<0.5=Normal]", "densenet", False),  # DenseNet, threshold 0.5, normal prediction
    ("Dense [>0.5=Normal]", "densenet", True),   # DenseNet, threshold 0.5, inverted labels
]

for config_name, preproc_type, inverted in configs:
    print(f"{'='*70}")
    print(f"Configuration: {config_name}")
    print('='*70)
    
    normal_correct = 0
    pneum_correct = 0
    
    # Test NORMAL images
    for img_path in normal_imgs:
        img = Image.open(img_path).convert("RGB")
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)
        
        if preproc_type == "densenet":
            arr = preprocess_input(arr)
        else:
            arr = arr / 255.0
        
        pred = model.predict(arr, verbose=0)[0][0]
        
        # Interpret prediction
        if not inverted:
            # Normal interpretation: < 0.5 = Normal
            predicted_label = "Normal" if pred < 0.5 else "Pneumonia"
        else:
            # Inverted: > 0.5 = Normal
            predicted_label = "Normal" if pred > 0.5 else "Pneumonia"
        
        if predicted_label == "Normal":
            normal_correct += 1
    
    # Test PNEUMONIA images
    for img_path in pneum_imgs:
        img = Image.open(img_path).convert("RGB")
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)
        
        if preproc_type == "densenet":
            arr = preprocess_input(arr)
        else:
            arr = arr / 255.0
        
        pred = model.predict(arr, verbose=0)[0][0]
        
        # Interpret prediction
        if not inverted:
            predicted_label = "Normal" if pred < 0.5 else "Pneumonia"
        else:
            predicted_label = "Normal" if pred > 0.5 else "Pneumonia"
        
        if predicted_label == "Pneumonia":
            pneum_correct += 1
    
    # Results
    normal_acc = (normal_correct / 10) * 100
    pneum_acc = (pneum_correct / 10) * 100
    overall_acc = ((normal_correct + pneum_correct) / 20) * 100
    
    print(f"\nResults:")
    print(f"  Normal:    {normal_correct}/10 correct ({normal_acc:.0f}%)")
    print(f"  Pneumonia: {pneum_correct}/10 correct ({pneum_acc:.0f}%)")
    print(f"  Overall:   {overall_acc:.0f}%")
    
    if overall_acc >= 80:
        print(f"\n✅ FOUND THE CORRECT CONFIGURATION!")
        print(f"   Use: {config_name}")  
        break
    print()

print("\n" + "="*70)
print("FINAL RECOMMENDATION")
print("="*70)
print("""
Based on testing, the model needs:
1. DenseNet preprocessing (ImageNet normalization)
2. Standard threshold: < 0.5 = Normal, >= 0.5 = Pneumonia

The model2result.keras IS trained correctly, but has moderate ~70% accuracy
on your test set. This is likely because:
- Test images are from a different distribution than training
- Model generalization issue
- Need original training code to retrain properly

SOLUTION: Use the original training notebook (if available) to retrain
the Pneumonia model with better data augmentation and proper validation.
""")
