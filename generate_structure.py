import os

EXCLUDE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.mp4', '.mov', '.csv', '.xlsx']
MAX_SIZE_MB = 5  # Tamaño máximo de archivos en MB para incluir en el listado

def get_size_mb(file_path):
    size = os.path.getsize(file_path) / (1024 * 1024)
    return size

def generate_structure(root_dir='.', output_file='project_structure.txt'):
    with open(output_file, 'w') as f:
        for foldername, subfolders, filenames in os.walk(root_dir):
            f.write(f"{foldername}/\n")
            for filename in filenames:
                file_path = os.path.join(foldername, filename)
                if not any(filename.endswith(ext) for ext in EXCLUDE_EXTENSIONS) and get_size_mb(file_path) <= MAX_SIZE_MB:
                    f.write(f"    {filename} ({get_size_mb(file_path):.2f} MB)\n")
            f.write("\n")
    print(f"Estructura generada en {output_file}")

# Ejecutar
generate_structure()
