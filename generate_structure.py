import os

EXCLUDE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.mp4', '.mov', '.csv', '.xlsx']
INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.html', '.md', '.txt']
MAX_SIZE_MB = 5  # Máximo tamaño permitido

def get_size_mb(file_path):
    return os.path.getsize(file_path) / (1024 * 1024)

def generate_structure(root_dir='.', output_file='project_structure.txt'):
    with open(output_file, 'w', encoding='utf-8') as f:
        for foldername, subfolders, filenames in os.walk(root_dir):
            f.write(f"{foldername}/\n")
            for filename in sorted(filenames):
                file_path = os.path.join(foldername, filename)
                ext = os.path.splitext(filename)[1].lower()
                try:
                    size_mb = get_size_mb(file_path)
                except OSError:
                    continue  # Ignorar archivos inaccesibles

                if ext in INCLUDE_EXTENSIONS and ext not in EXCLUDE_EXTENSIONS and size_mb <= MAX_SIZE_MB:
                    f.write(f"    {filename} ({size_mb:.2f} MB) [{ext}]\n")
            f.write("\n")
    print(f"✅ Estructura generada en: {output_file}")

# Ejecutar
if __name__ == "__main__":
    generate_structure()
