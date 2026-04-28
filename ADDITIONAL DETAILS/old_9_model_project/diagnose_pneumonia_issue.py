"""
Diagnose the pneumonia model issue
- Check raw model outputs
- Test different preprocessing approaches
- Find the correct label mapping
"""
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
from pathlib import Path

BASE_DIR = Path(r"C:\Users\sksan\drone_env\chest_xray")

# Load model
print("\nLoading pneumonia model...")
model = keras.models.load_model(
    str(BASE_DIR / "model2result.keras"),
    compile=False,
    safe_mode=False
)

print(f"Model input shape: {model.input_shape}")
print(f"Model output shape: {model.output_shape}")

# Get a normal image
normal_img_path = list((BASE_DIR / "test" / "NORMAL").glob("*.jpeg"))[0]
pneum_img_path = list((BASE_DIR / "test" / "PNEUMONIA").glob("*.jpeg"))[0]

print(f"\nTest images:")
print(f"  Normal: {normal_img_path.name}")
print(f"  Pneumonia: {pneum_img_path.name}")

# Test different preprocessing approaches
def test_preprocessing(img_path, label_name):
    """Test different preprocessing methods"""
    img_pil = Image.open(img_path).convert("RGB")
    
    print(f"\n{'='*70}")
    print(f"Testing: {label_name}")
    print('='*70)
    
    # Method 1: Standard normalization [0, 1]
    print("\n[Method 1] Standard normalization [0, 1]")
    img1 = img_pil.resize((224, 224))
    arr1 = np.array(img1, dtype=np.float32) / 255.0
    arr1 = np.expand_dims(arr1, axis=0)
    
    pred1 = model.predict(arr1, verbose=0)[0]
    print(f"  Raw output: {pred1}")
    print(f"  Prediction: {pred1[0]:.4f} (Class 0=Normal, Class 1=Pneumonia)")
    
    # Method 2: DenseNet preprocessing
    print("\n[Method 2] DenseNet preprocessing (ImageNet normalization)")
    from tensorflow.keras.applications.densenet import preprocess_input
    img2 = img_pil.resize((224, 224))
    arr2 = np.array(img2, dtype=np.float32)
    arr2 = np.expand_dims(arr2, axis=0)
    arr2 = preprocess_input(arr2)
    
    pred2 = model.predict(arr2, verbose=0)[0]
    print(f"  Raw output: {pred2}")
    print(f"  Prediction: {pred2[0]:.4f}")
    
    # Method 3:  Grayscale to single channel
    print("\n[Method 3] Grayscale preprocessing (single channel x 3)")
    img3 = img_pil.resize((224, 224))
    img3_gray = img3.convert("L")  # Convert to grayscale
    arr3 = np.array(img3_gray, dtype=np.float32)
    arr3 = np.expand_dims(arr3, axis=-1)  # Add channel dimension
    arr3 = np.concatenate([arr3, arr3, arr3], axis=-1)  # Triple to RGB
    arr3 = np.expand_dims(arr3, axis=0) / 255.0
    
    pred3 = model.predict(arr3, verbose=0)[0]
    print(f"  Raw output: {pred3}")
    print(f"  Prediction: {pred3[0]:.4f}")
    
    return {
        "label": label_name,
        "method1": pred1[0],
        "method2": pred2[0],
        "method3": pred3[0]
    }

# Test both normal and pneumonia
normal_results = test_preprocessing(normal_img_path, "NORMAL")
pneum_results = test_preprocessing(pneum_img_path, "PNEUMONIA")

# Analysis
print("\n" + "="*70)
print("ANALYSIS")
print("="*70)

print("\nNormal image predictions across all methods:")
for method, score in [("Standard", normal_results["method1"]),
                       ("DenseNet", normal_results["method2"]),
                       ("Grayscale", normal_results["method3"])]:
    print(f"  {method:12}: {score:.4f} {'(Low=Normal ✓)' if score < 0.5 else '(High=Pneumonia ✗)'}")

print("\nPneumonia image predictions across all methods:")
for method, score in [("Standard", pneum_results["method1"]),
                       ("DenseNet", pneum_results["method2"]),
                       ("Grayscale", pneum_results["method3"])]:
    print(f"  {method:12}: {score:.4f} {'(High=Pneumonia ✓)' if score > 0.5 else '(Low=Normal ✗)'}")

print("\n" + "="*70)
print("DIAGNOSIS")
print("="*70)

# Check if outputs are reasonable
normal_avg = np.mean([normal_results["method1"], normal_results["method2"], normal_results["method3"]])
pneum_avg = np.mean([pneum_results["method1"], pneum_results["method2"], pneum_results["method3"]])

if normal_avg > 0.95 and pneum_avg > 0.95:
    print("\n❌ ISSUE DETECTED:")
    print("   Both Normal and Pneumonia have high scores (>0.95)")
    print("   The model is BROKEN or trained incorrectly")
    print("   It's biased to always predict Pneumonia")
    print("\n✅ SOLUTION:")
    print("   The model needs to be retrained with the original code")
    print("   Current model: model2result.keras (BROKEN)")
    print("   Need: Use original training notebook to rebuild")

elif normal_avg < 0.5 and pneum_avg > 0.5:
    print("\n✅ MODEL IS WORKING CORRECTLY")
    print(f"   Normal: {normal_avg:.4f} (Low - correct!)")
    print(f"   Pneumonia: {pneum_avg:.4f} (High - correct!)")

elif normal_results["method1"] != normal_results["method1"]:
    print("\n⚠️  PREPROCESSING ISSUE DETECTED")
    print("   Model sensitivity to different preprocessing methods")
    print("   Need to match exact preprocessing from training")

print("\n" + "="*70 + "\n")
