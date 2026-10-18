import os
import zipfile

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ZIP_NAME = "PROJECT-11-TESLA-ROADSTER-2026-FLYING-CAR-SIMULATOR.zip"
ZIP_PATH = os.path.join(PROJECT_ROOT, ZIP_NAME)

EXCLUDED_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "__pycache__",
    ".cache",
    ".temp",
    ".turbo",
    ".vscode"
}

EXCLUDED_FILES = {
    ZIP_NAME,
    ".DS_Store",
    "thumbs.db"
}

def should_exclude(rel_path):
    parts = rel_path.replace("\\", "/").split("/")
    for p in parts:
        if p in EXCLUDED_DIRS:
            return True
    filename = os.path.basename(rel_path)
    if filename in EXCLUDED_FILES or filename.endswith(".pyc") or filename.endswith(".log"):
        return True
    return False

def make_zip():
    print(f"Creating zip archive at: {ZIP_PATH}")
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)

    total_files = 0
    with zipfile.ZipFile(ZIP_PATH, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(PROJECT_ROOT):
            # prune excluded dirs in place
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            for file in sorted(files):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, PROJECT_ROOT)
                if should_exclude(rel_path):
                    continue
                zipf.write(full_path, arcname=rel_path)
                total_files += 1

    size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print(f"Successfully packaged {total_files} files into {ZIP_NAME} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    make_zip()
