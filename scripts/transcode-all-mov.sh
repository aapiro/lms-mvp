#!/usr/bin/env bash
set -euo pipefail

# scripts/transcode-all-mov.sh
# Detecta lecciones con file_key que contienen '.mov' y ejecuta
# scripts/transcode-and-upload.sh por cada una.

DRY_RUN=true
AUTO_YES=false

if [[ "${1:-}" == "--yes" ]]; then
  AUTO_YES=true
  DRY_RUN=false
fi
if [[ "${1:-}" == "--run" ]]; then
  DRY_RUN=false
fi

echo "Detectando lecciones con file_key que contienen '.mov'..."

# Obtener ids desde Postgres dentro del contenedor
LESSION_IDS=$(docker exec -i lms-postgres psql -U lmsuser -d lmsdb -t -A -c "SELECT id FROM lessons WHERE file_key ILIKE '%.mov%';" || true)

if [[ -z "$LESSION_IDS" ]]; then
  echo "No se encontraron lecciones con file_key que contengan '.mov'."
  exit 0
fi

# Imprimir ids encontrados
echo "Lecciones encontradas (IDs):"
echo "$LESSION_IDS" | tr '\n' ' '

echo
if $DRY_RUN; then
  echo "Modo dry-run: no se ejecutarán transcodificaciones. Para ejecutar, vuelve a correr el script con --run o --yes."
fi

for id in $LESSION_IDS; do
  echo "---\nProcesando lección ID: $id"
  if $DRY_RUN; then
    # mostrar file_key y fileUrl
    docker exec -i lms-postgres psql -U lmsuser -d lmsdb -c "SELECT file_key FROM lessons WHERE id=$id;"
    echo "Endpoint API (fileUrl):"
    curl -sS "http://localhost:8080/api/lessons/$id" | sed -n '1,200p'
  else
    if $AUTO_YES; then
      ./scripts/transcode-and-upload.sh $id
    else
      read -p "Transcodificar y subir la lección $id ahora? [y/N] " yn
      case "$yn" in
        [Yy]* ) ./scripts/transcode-and-upload.sh $id ;;
        * ) echo "Saltando $id" ;;
      esac
    fi
  fi
done

echo "Proceso completado."
