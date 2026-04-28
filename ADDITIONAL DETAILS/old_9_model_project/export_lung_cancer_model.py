"""
Export Lung Cancer EfficientNet-B0 Model
Trains EfficientNet-B0 on lung cancer CT scans and saves as PyTorch checkpoint
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models
import os
import time

print("="*60)
print("Lung Cancer EfficientNet-B0 Model Export")
print("="*60)

# Configuration
BATCH_SIZE = 16
EPOCHS = 5  # Quick training - just 5 epochs!
LEARNING_RATE = 0.001
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DATA_DIR = "lung_cancer/CLID-main/CT Scan"
SAVE_DIR = "lung_cancer"

print(f"\nUsing device: {DEVICE}")

# Data transforms
data_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Load dataset
print("\n[1/5] Loading CT scan dataset...")
try:
    full_dataset = datasets.ImageFolder(DATA_DIR, transform=data_transform)
    num_classes = len(full_dataset.classes)
    print(f"   Classes found: {full_dataset.classes}")
    print(f"   Total images: {len(full_dataset)}")
except Exception as e:
    print(f"ERROR: Could not load dataset from {DATA_DIR}")
    print(f"Please ensure the CLID dataset exists at: lung_cancer/CLID-main/CT Scan")
    print(f"Details: {e}")
    exit(1)

# Split dataset
print("[2/5] Splitting dataset (80-10-10)...")
dataset_size = len(full_dataset)
train_size = int(0.8 * dataset_size)
val_size = int(0.1 * dataset_size)
test_size = dataset_size - train_size - val_size

train_set, val_set, test_set = random_split(
    full_dataset,
    [train_size, val_size, test_size],
    generator=torch.Generator().manual_seed(42)
)

print(f"   Train: {len(train_set)} | Val: {len(val_set)} | Test: {len(test_set)}")

# Create dataloaders
train_loader = DataLoader(train_set, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
val_loader = DataLoader(val_set, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

# Load pre-trained EfficientNet-B0
print("\n[3/5] Loading pre-trained EfficientNet-B0...")
model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)

# Modify final layer for num_classes
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, num_classes)

model = model.to(DEVICE)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# Training function
def train_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for images, labels in loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
    
    return running_loss / len(loader), correct / total

# Validation function
def validate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    
    return running_loss / len(loader), correct / total

# Train model
print(f"\n[4/5] Training EfficientNet-B0 ({EPOCHS} epochs)...")
print(f"   Classes: {num_classes}")
print()

best_val_acc = 0.0
for epoch in range(EPOCHS):
    # Train
    train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer)
    
    # Validate
    val_loss, val_acc = validate(model, val_loader, criterion)
    
    print(f"   Epoch {epoch+1:2d}/{EPOCHS} | Train Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}")
    
    if val_acc > best_val_acc:
        best_val_acc = val_acc

print(f"\n   Best Validation Accuracy: {best_val_acc:.4f}")

# Save model
print("\n[5/5] Saving model checkpoint...")
checkpoint = {
    'model_state_dict': model.state_dict(),
    'num_classes': num_classes,
    'class_names': full_dataset.classes,
    'architecture': 'EfficientNet-B0'
}

model_path = f'{SAVE_DIR}/lung_cancer_efficientnet_b0.pt'
torch.save(checkpoint, model_path)

print(f"\n✅ Model saved to: {model_path}")
print(f"✅ Classes: {full_dataset.classes}")
print(f"✅ Number of classes: {num_classes}")
print("\n" + "="*60)
print(f"Lung Cancer Model Export COMPLETE!")
print(f"Best Validation Accuracy: {best_val_acc:.2%}")
print("="*60 + "\n")
