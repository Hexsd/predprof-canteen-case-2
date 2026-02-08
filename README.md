# Автоматизировання информационная система школьного питания
Веб-приложение доступно по ссылке: https://hex-uslugi.ru
# Установка:
<h2>Установка Docker</h2>
'''curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh'''
<h3>Замените <workdir> на вашу рабочую директорию</h3>
'''cd <workdir>
git clone https://github.com/Hexsd/predprof-canteen-case-2.git
mkdir -p /home/docker'''
<h3>Чтобы запустить веб-приложение, создайте файл .env в корневой директории проекта:</h3>
<img width="199" height="48" alt="image" src="https://github.com/user-attachments/assets/dfcf7b75-1479-4b27-a3d0-87bfcd215011" />
<h3>Запишите в него следующее содержимое: (Ваш секретный ключ для шифрования jwt-токенов)</h3>
<img width="350" height="61" alt="image" src="https://github.com/user-attachments/assets/d8cb09a1-2b70-475e-b01d-195263ac0b59" /> 
<h3>После используйте эту команду в корневой директории проекта:</h3>
'''docker-compose up -d'''
<h3>Сайт станет доступен по адресу http://localhost:8000</h3>
