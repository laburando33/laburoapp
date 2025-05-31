#!/bin/bash

echo "🔧 Corrigiendo imports según nuevos aliases..."

# Asegurate de estar en apps/web/
cd "$(dirname "$0")"

# Reemplazos seguros
find ./src -type f -name "*.ts*" -exec sed -i 's|@/lib/|@lib/|g' {} +
find ./src -type f -name "*.ts*" -exec sed -i 's|@/hooks/|@hooks/|g' {} +
find ./src -type f -name "*.ts*" -exec sed -i 's|@/components/|@components/|g' {} +
find ./src -type f -name "*.ts*" -exec sed -i 's|@/utils/|@utils/|g' {} +
find ./src -type f -name "*.ts*" -exec sed -i 's|@/shared/|@shared/|g' {} +
find ./src -type f -name "*.ts*" -exec sed -i 's|@/admin/|@admin/|g' {} +

echo "✅ Reemplazos completados. Ejecutá 'npm run check-types' para verificar errores."
