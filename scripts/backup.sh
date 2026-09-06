#!/bin/bash
set -e

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="postgres_${DATE}.dump"

echo "▶ Starting backup: $BACKUP_FILE"

# pg_dump
pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -F c \
  "$DB_NAME" \
  > "$BACKUP_FILE"

echo "✔ Dump created"

# MinIO 설정
mc alias set minio http://minio:$MINIO_PORT "$MINIO_USER" "$MINIO_PASSWORD"

# db-backups이라는 버킷은 콘솔에서 직접 생성
# 업로드
mc cp "$BACKUP_FILE" "minio/db-backups/$BACKUP_FILE"

echo "✔ Uploaded to MinIO"

# 로컬 파일 삭제
rm "$BACKUP_FILE"

echo "✔ Backup completed"