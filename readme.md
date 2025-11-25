# Wildberries Tariffs Service

Сервис для получения тарифов на коробки от Wildberries и выгрузки их в Google Таблицы.

---

## Описание

Приложение:

- Получает данные с WB API (`https://common-api.wildberries.ru/api/v1/tariffs/box`)  
- Хранит актуальные тарифы в PostgreSQL  
- Обновляет тарифы за текущий день, если данные изменились  
- Выгружает данные в произвольное количество Google Таблиц (листы `stocks_coefs`)  
- Работает в Docker контейнерах  

---

## Настройка и запуск сервиса

#### 1. Склонировать репозиторий

```bash
git clone https://github.com/DinarMin/wb-service-script.git
```

#### 2. Заполнить данные в .env.example и переименовать в .env

```
API_KEY_WB=ваш_api_key_WB

GOOGLE_APPLICATION_CREDENTIALS='ваши_данные_для_гугл_таблицы(обязательно без переносов и в этих кавычках)'
GOOGLE_SHEETS_ID=ваш_sheets_id
```

#### 3. Убедиться об наличии docker и docker-compose на вашем OC

```bash
docker -v
docker-compose -v
```

##### Если версии не отображаются, установите:

##### Docker:
___
##### (Windows)
```
https://docs.docker.com/desktop/setup/install/windows-install/
```

##### (Linux)
```
https://docs.docker.com/desktop/setup/install/linux/
```

##### (Mac)
```
https://docs.docker.com/desktop/setup/install/mac-install/
```
##### Docker-compose: 
____
##### (General)
```
https://docs.docker.com/compose/install/
```

#### 4. Установка и запуск контейнера

##### Запустить терминал в директории клонированного проекта и прописать команду:
```bash
docker compose up
```



