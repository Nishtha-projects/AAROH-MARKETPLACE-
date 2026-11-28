import os
import json
import shutil
import requests
from io import BytesIO
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
from ddgs import DDGS
from sklearn.metrics import classification_report

DATA_DIR = "public/uploads/crafts"
MODEL_DIR = "public/models"

# Exact search terms for genuine Indian handicrafts (avoiding tourist landmarks)
CLASSES = {
    "Madhubani": "Madhubani Mithila traditional painting artwork",
    "Warli": "Warli tribal folk painting Maharashtra",
    "Gond": "Gond tribal painting Madhya Pradesh art",
    "Kalamkari": "Srikalahasti Kalamkari hand painted textile",
    "Pattachitra": "Odisha Pattachitra traditional scroll painting",
    "Kutch_Rogan": "Kutch Rogan art painting Gujarat",
    "Jaipur_Blue_Pottery": "Jaipur blue pottery ceramic vase plate craft",
    "Bastar_Dokra": "Dokra bell metal brass tribal handicraft"
}

HEADERS = {"User-Agent": "AarohMarketplaceBot/1.0 (Educational SML Project)"}

def fetch_wikimedia_images(query, folder, limit=40):
    saved = len(os.listdir(folder))
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrnamespace": 6,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url"
    }
    try:
        res = requests.get(url, params=params, headers=HEADERS, timeout=15).json()
        pages = res.get("query", {}).get("pages", {})
        for p in pages.values():
            img_url = p.get("imageinfo", [{}])[0].get("url")
            if not img_url:
                continue
            try:
                r = requests.get(img_url, headers=HEADERS, timeout=10)
                img = Image.open(BytesIO(r.content)).convert("RGB")
                img = img.resize((224, 224))
                img.save(os.path.join(folder, f"wiki_{saved}.jpg"), "JPEG", quality=85)
                saved += 1
            except Exception:
                continue
    except Exception as e:
        print(f"Wikimedia note for {query}: {e}")
    return saved

def fetch_ddg_images(query, folder, target=65):
    saved = len(os.listdir(folder))
    if saved >= target:
        return saved
    try:
        with DDGS() as ddgs:
            results = ddgs.images(query, max_results=90)
            for r in results:
                if saved >= target:
                    break
                img_url = r.get("image")
                if not img_url:
                    continue
                try:
                    resp = requests.get(img_url, headers=HEADERS, timeout=8)
                    img = Image.open(BytesIO(resp.content)).convert("RGB")
                    img = img.resize((224, 224))
                    img.save(os.path.join(folder, f"ddg_{saved}.jpg"), "JPEG", quality=85)
                    saved += 1
                except Exception:
                    continue
    except Exception as e:
        print(f"DDG note for {query}: {e}")
    return saved

def download_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    for cls_name, query in CLASSES.items():
        folder = os.path.join(DATA_DIR, cls_name)
        os.makedirs(folder, exist_ok=True)
        print(f"Fetching real craft images for {cls_name}...")
        count = fetch_wikimedia_images(query, folder, limit=40)
        count = fetch_ddg_images(query, folder, target=65)
        print(f"  -> Saved {count} clean images for {cls_name}")

        # Remove folder if somehow 0 images downloaded so ImageFolder never crashes
        if len(os.listdir(folder)) == 0:
            os.rmdir(folder)

def train_and_export():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    dataset = datasets.ImageFolder(DATA_DIR, transform=tf)
    class_names = dataset.classes
    train_len = int(0.8 * len(dataset))
    train_ds, val_ds = random_split(dataset, [train_len, len(dataset) - train_len])

    train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=16)

    model = models.mobilenet_v3_small(weights="DEFAULT")
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(class_names))
    model = model.to(device)

    opt = optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.CrossEntropyLoss()

    print(f"\nTraining MobileNetV3 on {len(dataset)} real craft images across {len(class_names)} classes...")
    for epoch in range(6):
        model.train()
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            loss_fn(model(x), y).backward()
            opt.step()
        print(f"Epoch {epoch+1}/6 complete")

    model.eval()
    preds, trues = [], []
    with torch.no_grad():
        for x, y in val_loader:
            out = model(x.to(device))
            preds.extend(torch.argmax(out, 1).cpu().numpy())
            trues.extend(y.numpy())

    rep = classification_report(trues, preds, target_names=class_names, output_dict=True, zero_division=0)
    os.makedirs(MODEL_DIR, exist_ok=True)

    dummy = torch.randn(1, 3, 224, 224, device=device)
    torch.onnx.export(model, dummy, f"{MODEL_DIR}/aaroh_classifier.onnx", input_names=["input"], output_names=["output"])

    with open(f"{MODEL_DIR}/metrics.json", "w") as f:
        json.dump({
            "architecture": "MobileNetV3-Small (Transfer Learning)",
            "total_samples": len(dataset),
            "accuracy": round(rep["accuracy"] * 100, 2),
            "classes": class_names,
            "f1_scores": {c: round(rep[c]["f1-score"], 3) for c in class_names}
        }, f, indent=2)

    print("\nSUCCESS! Real craft photos downloaded, model trained, and metrics.json saved!")

if __name__ == "__main__":
    download_data()
    train_and_export()