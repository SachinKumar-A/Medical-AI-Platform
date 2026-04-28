"""
Export Kidney Disease LGBM Model
Trains LGBMClassifier and saves as joblib file
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from lightgbm import LGBMClassifier
from sklearn.metrics import accuracy_score

# Set paths
KIDNEY_DIR = 'kidney'
DATA_FILE = 'kidney/kidney_disease.csv'

print("="*60)
print("Kidney Disease LGBM Model Export")
print("="*60)

# Load data
print("\n[1/5] Loading kidney disease dataset...")
df = pd.read_csv(DATA_FILE)

# Drop ID column
df.drop('id', axis=1, inplace=True)

# Rename columns for clarity
df.columns = ['age', 'blood_pressure', 'specific_gravity', 'albumin', 'sugar', 'red_blood_cells', 'pus_cell',
              'pus_cell_clumps', 'bacteria', 'blood_glucose_random', 'blood_urea', 'serum_creatinine', 'sodium',
              'potassium', 'haemoglobin', 'packed_cell_volume', 'white_blood_cell_count', 'red_blood_cell_count',
              'hypertension', 'diabetes_mellitus', 'coronary_artery_disease', 'appetite', 'peda_edema',
              'aanemia', 'class']

print(f"   Dataset shape: {df.shape}")

# Data cleaning
print("[2/5] Preprocessing data...")

# Identify and encode ALL categorical columns
label_encoders = {}
for col in df.columns:
    if df[col].dtype == 'object' and col != 'class':
        le = LabelEncoder()
        df[col] = df[col].fillna('missing')
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

# Convert numeric columns, handling errors
for col in df.columns:
    if col != 'class' and df[col].dtype != 'object':
        df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill remaining NaN values
df = df.fillna(df.mean(numeric_only=True))

# Store feature names
feature_names = [col for col in df.columns if col != 'class']
with open(f'{KIDNEY_DIR}/kidney_features.txt', 'w') as f:
    for feat in feature_names:
        f.write(f"{feat}\n")

# Prepare X and y
X = df.drop('class', axis=1)
y = df['class']

# Encode target variable
le_target = LabelEncoder()
y = le_target.fit_transform(y)

print(f"   Features: {len(feature_names)}")
print(f"   Target classes: {le_target.classes_}")

# Train-test split
print("[3/5] Splitting data (80-20)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train LGBM model
print("[4/5] Training LGBM Classifier...")
lgbm = LGBMClassifier(learning_rate=1.0, random_state=42, verbose=-1, n_jobs=-1)
lgbm.fit(X_train, y_train)

# Evaluate
train_acc = accuracy_score(y_train, lgbm.predict(X_train))
test_acc = accuracy_score(y_test, lgbm.predict(X_test))

print(f"   Train Accuracy: {train_acc:.4f}")
print(f"   Test Accuracy:  {test_acc:.4f}")

# Save model
print("[5/5] Saving model...")
model_path = f'{KIDNEY_DIR}/kidney_disease_lgbm.joblib'
target_classes_path = f'{KIDNEY_DIR}/kidney_target_classes.joblib'

joblib.dump(lgbm, model_path)
joblib.dump(le_target.classes_, target_classes_path)

print(f"\n✅ Model saved to: {model_path}")
print(f"✅ Target classes saved to: {target_classes_path}")
print(f"✅ Feature names saved to: kidney/kidney_features.txt")
print("\n" + "="*60)
print(f"Kidney Disease Model Export COMPLETE!")
print(f"Test Accuracy: {test_acc:.2%}")
print("="*60 + "\n")
