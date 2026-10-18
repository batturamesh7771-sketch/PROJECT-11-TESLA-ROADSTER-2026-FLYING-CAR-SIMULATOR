import os
from PIL import Image

src_img = r"C:\Users\user\.gemini\antigravity\brain\f3390f9f-1872-4bdb-9fc1-81a593d85d5b\.user_uploaded\media_1792251975259.jpg"
out_dir = r"C:\Users\user\.gemini\antigravity\scratch\tesla-roadster-2026-sim\apps\web-simulator\public\assets"
os.makedirs(out_dir, exist_ok=True)

im = Image.open(src_img)
w, h = im.size
print(f"Loaded reference image: {w}x{h}")

# The image is 1920x1080 (or similar aspect ratio).
# Let's crop:
# 1. White Roadster Status image (left panel, top):
# X: ~1.5% to ~17.5%, Y: ~11% to ~17.5%
car_crop = im.crop((int(w * 0.015), int(h * 0.11), int(w * 0.178), int(h * 0.18)))
car_crop.save(os.path.join(out_dir, "roadster-flight-card.png"))
print("Saved roadster-flight-card.png")

# 2. Simulation Environment landscape thumbnail (right panel, bottom):
# X: ~77% to ~93%, Y: ~77% to ~92%
env_crop = im.crop((int(w * 0.77), int(h * 0.77), int(w * 0.93), int(h * 0.925)))
env_crop.save(os.path.join(out_dir, "simulation-environment.png"))
print("Saved simulation-environment.png")

# 3. Flight Sequence thumbnails (bottom center panel):
# The 5 sequence cards are between X: 34% and 60%, Y: ~76% and ~87%
# Card 1: Approach Ramp
c1 = im.crop((int(w * 0.342), int(h * 0.765), int(w * 0.392), int(h * 0.865)))
c1.save(os.path.join(out_dir, "seq-01-approach.png"))

# Card 2: Take Off
c2 = im.crop((int(w * 0.395), int(h * 0.765), int(w * 0.445), int(h * 0.865)))
c2.save(os.path.join(out_dir, "seq-02-takeoff.png"))

# Card 3: Mid Air Flip
c3 = im.crop((int(w * 0.448), int(h * 0.765), int(w * 0.498), int(h * 0.865)))
c3.save(os.path.join(out_dir, "seq-03-midair.png"))

# Card 4: Inverted Drive
c4 = im.crop((int(w * 0.501), int(h * 0.765), int(w * 0.551), int(h * 0.865)))
c4.save(os.path.join(out_dir, "seq-04-inverted.png"))

# Card 5: Landing
c5 = im.crop((int(w * 0.554), int(h * 0.765), int(w * 0.604), int(h * 0.865)))
c5.save(os.path.join(out_dir, "seq-05-landing.png"))
print("Saved 5 sequence cards")

# 4. Viewport reference background panorama:
# Crop the center 3D viewport scenic mountains and sky (behind car/ramp) to use as background sphere or sky panorama
vp_crop = im.crop((int(w * 0.19), int(h * 0.08), int(w * 0.76), int(h * 0.71)))
vp_crop.save(os.path.join(out_dir, "viewport-scene-bg.jpg"), quality=95)
print("Saved viewport-scene-bg.jpg")

print("All assets successfully extracted!")
