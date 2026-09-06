# 수동
docker compose -f ./docker-compose.yaml run --rm backup

# 자동
# 0 3 * * * docker compose run --rm backup