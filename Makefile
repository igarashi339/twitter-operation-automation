# すべてのサービスを起動
.PHONY: up
up:
	docker-compose up -d

# すべてのサービスを停止
.PHONY: down
down:
	docker-compose down

# キャッシュを削除してビルドする
.PHONY: build
build:
	docker-compose build --no-cache

# すべてのコンテナとイメージを削除する
.PHONY: delete-all
delete-all:
	docker-compose down --rmi all --volumes

# フロントエンドのコンテナに入る
.PHONY: shell
shell:
	docker-compose exec clasp ash

# nodemodulesを手元にコピーする(エディターの補完を効かせるため)
.PHONY: copy
copy:
	sudo docker cp twitter-operation-automation_clasp_1:/code/node_modules ./gas/

# ビルドしてプッシュ
.PHONY: push
push:
	docker-compose run --rm clasp ash -c "npm run build && clasp push"