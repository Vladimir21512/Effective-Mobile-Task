## Начало
Скопируйте файлы репозитория:
```bash
git clone https://github.com/Vladimir21512/Effective-Mobile-Task.git
```
## Версии
При создании проекта использовались `NodeJS v22.20.0` и
`npm v10.9.3`

## Аутенфикация

Аутенфикация через access и refresh токены. **Refresh** живёт **3 дня**, **access** - **3 минуты**

## Конечные точки
- /api
- /users/resfresh-tokens
- /users/login
- /users/example-query-auth
- /users/get-user
- /users/users-list
- /users/block<br />
Полную документацию в формате json можно посмотреть по адресу /api после запуска приложения

## Настройка окружения
- .env: PORT - порт NodeJS приложения; POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, POSTGRES_HOST - данные базы данных
- PostgreSQL: создайте базу данных и создайте таблицу:
```bash
CREATE TABLE users(id SMALLSERIAL, firstname VARCHAR(20), lastname VARCHAR(20), patronymic VARCHAR(20), birthdate DATE, email VARCHAR(30) UNIQUE, password VARCHAR(100), isadmin BOOLEAN, isactive BOOLEAN);
```
## Запуск через npm
В корневой папке запустите:
```bash
  npm install
```
```bash
  npm run build
```
```bash
  npm run start
```
## Запуск через Docker
В файле `docker-compose.yml` измените переменные окружения если это необходимо. Важно: если запускаете **PostgreSQL** на **другом сервере**, то для сервиса app в environment для POSTGRES_HOST укажите ip-адрес сервера, на котором запущена БД.\ 
После чего в корневом каталоге для создания образов запустите: 
```bash
docker compose up 
```
## После запуска 

можете перейти на **/api** чтобы посмотреть **endpoint** и **тела для запросов**
