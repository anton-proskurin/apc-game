#!/bin/bash
# deploy.sh — Деплой APC на Yandex Cloud Object Storage
# Использование: ./deploy.sh [имя-бакета]

set -e

# ─── Конфигурация ────────────────────────────────────────────
BUCKET_NAME="${1:-apc-game}"
ENDPOINT_URL="https://storage.yandexcloud.net"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  APC Game — Деплой на Yandex Cloud    ${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# ─── Проверка зависимостей ───────────────────────────────────
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Ошибка: AWS CLI не найден.${NC}"
    echo "Установка: brew install awscli"
    echo "Или: pip install awscli"
    echo ""
    echo "Затем настройте ключи:"
    echo "  aws configure --profile yandex"
    echo "  AWS Access Key ID: <ваш ключ>"
    echo "  AWS Secret Access Key: <ваш секрет>"
    echo "  Default region name: ru-central1"
    exit 1
fi

# ─── Проверка файлов ─────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$SCRIPT_DIR/index.html" ]; then
    echo -e "${RED}Ошибка: index.html не найден. Запустите скрипт из корня проекта.${NC}"
    exit 1
fi

echo -e "${YELLOW}Бакет:${NC} $BUCKET_NAME"
echo -e "${YELLOW}Файлы:${NC} $SCRIPT_DIR"
echo ""

# ─── Загрузка файлов ─────────────────────────────────────────
echo "Загрузка HTML..."
aws s3 cp "$SCRIPT_DIR/index.html" "s3://$BUCKET_NAME/index.html" \
    --endpoint-url "$ENDPOINT_URL" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "no-cache"

echo "Загрузка CSS..."
aws s3 cp "$SCRIPT_DIR/style.css" "s3://$BUCKET_NAME/style.css" \
    --endpoint-url "$ENDPOINT_URL" \
    --content-type "text/css; charset=utf-8" \
    --cache-control "max-age=3600"

echo "Загрузка JavaScript..."
aws s3 sync "$SCRIPT_DIR/js/" "s3://$BUCKET_NAME/js/" \
    --endpoint-url "$ENDPOINT_URL" \
    --content-type "application/javascript; charset=utf-8" \
    --cache-control "max-age=3600" \
    --delete

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Деплой завершён!                     ${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "Сайт доступен по адресу:"
echo -e "${YELLOW}  https://$BUCKET_NAME.website.yandexcloud.net${NC}"
echo ""
echo -e "Или через endpoint:"
echo -e "${YELLOW}  $ENDPOINT_URL/$BUCKET_NAME/index.html${NC}"
