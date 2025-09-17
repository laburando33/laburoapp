import os
import shutil

# Rutas base
BASE_DIR = './apps/web'
SRC_DIR = os.path.join(BASE_DIR, 'src')
CONFIG_DIR = os.path.join(BASE_DIR, 'config')

# Carpetas a mover
FOLDERS_TO_MOVE = {
    'app': 'src/app',
    'components': 'src/components',
    'lib': 'src/lib',
    'screens': 'src/screens',
    'styles': 'src/styles',
    'assets': 'src/assets',
    'public': 'public'
}

# Archivos de configuración (no se mueve .env.local para evitar problemas)
CONFIG_FILES = ['.eslintrc', '.gitignore']

# Crear directorios si no existen
os.makedirs(SRC_DIR, exist_ok=True)
os.makedirs(CONFIG_DIR, exist_ok=True)

# Mover carpetas al destino correspondiente
for folder, new_location in FOLDERS_TO_MOVE.items():
    src_path = os.path.join(BASE_DIR, folder)
    dest_path = os.path.join(BASE_DIR, new_location)
    if os.path.exists(src_path):
        print(f"Moviendo {folder} a {new_location}...")
        shutil.move(src_path, dest_path)

# Mover archivos de configuración (excepto .env.local)
for config_file in CONFIG_FILES:
    src_path = os.path.join(BASE_DIR, config_file)
    dest_path = os.path.join(CONFIG_DIR, config_file)
    if os.path.exists(src_path):
        print(f"Moviendo {config_file} a config/")
        shutil.move(src_path, dest_path)

print("Reorganización completada exitosamente.")

