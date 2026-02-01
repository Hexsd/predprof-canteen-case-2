# Автоматизировання информационная система школьного питания
# Установка:
# install docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Замените <workdir> на вашу рабочую директорию
cd <workdir>
git clone https://github.com/Hexsd/predprof-canteen-case-2.git
mkdir -p /home/docker
<h3>Чтобы запустить веб-приложение, создайте файл .env в корневой директории проекта:</h3>
картинка
<h3>Запишите в него следующее содержимое: картинка (Придуманный вами секретный ключ для шифрования jwt-токенов)</h3>
<h3>После используйте эту команду в корневой директории проекта:</h3>
docker-compose up -d