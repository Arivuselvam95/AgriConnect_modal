from src.models.train import train_crop_model

for crop in ['wheat', 'paddy', 'barley', 'maize', 'bajra', 'copra', 'cotton', 'masoor', 'gram', 'groundnut', 'arhar', 'sesamum', 'jowar', 'moong', 'niger', 'rape', 'jute', 'safflower', 'soyabean', 'urad', 'ragi', 'sunflower', 'sugarcane']:
    train_crop_model(crop)
