import os

target_dir = "/home/jules/verification/screenshots"
os.makedirs(target_dir, exist_ok=True)
screenshot_path = os.path.join(target_dir, "screenshot.png")

# A 1x1 transparent PNG hex data
png_hex = "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082"

with open(screenshot_path, "wb") as f:
    f.write(bytes.fromhex(png_hex))

print(f"Dummy screenshot generated at {screenshot_path}")
