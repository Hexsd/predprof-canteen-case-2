# Автоматизировання информационная система школьного питания
Ссылка на видеоролик в живом исполнении: https://vkvideo.ru/video-235863339_456239018?list=ln-EAM1ziQ5fxf6h4wN6O

Rutube: https://rutube.ru/video/private/afc7e8fee5959ee641c5c88227fdb45d/?p=odGj8XJTx6uDYErwEjfYmQ

Ссылка на видеоролик выполненный через запись экрана: https://vkvideo.ru/video-235863339_456239017?list=ln-ZLZKv0cdOPdlh8udvy

Rutube: https://rutube.ru/video/private/6eec436da315f345562ada8dfdc091a5/?p=4IWNSOmugb_deYuwXmX5XA
<h3>Веб-приложение развернуто на сервере и доступно по ссылке: https://hex-uslugi.ru</h3>

<h3>Администратор</h3>

Почта: admin@example.com
Пароль: admin

<h3>Повар</h3>

Почта: cook@example.com
Пароль: cook

<h3>Ученик</h3>

Почта: user@example.com
Пароль: user

<h1>Установка:</h1>
<h3>Для начала необходимо установить Docker</h3>

<h3>Linux</h3>

Выполните следующие команды в терминале:

Ubuntu
```
sudo apt install docker-compose
```
Arch
```
sudo pacman -S docker-compose
```
<h3>Windows</h3>

Скачайте Docker-desktop для вашей машины на сайте:

https://www.docker.com/products/docker-desktop

<h3>После необходимо выполнить следующие команды в терминале (Замените workdir на вашу рабочую директорию):</h3>

```
cd <workdir>
git clone https://github.com/Hexsd/predprof-canteen-case-2.git
docker-compose up -d
```
Сайт станет доступен по адресу http://localhost:8000

---

<h3>Чтобы создать секретный ключ для JWT, создайте файл .env в корневой директории проекта:</h3>
<img width="199" height="48" alt="image" src="https://github.com/user-attachments/assets/dfcf7b75-1479-4b27-a3d0-87bfcd215011" />
 
Запишите в него следующее содержимое: (Ваш секретный ключ для шифрования jwt-токенов)
<img width="350" height="61" alt="image" src="https://github.com/user-attachments/assets/d8cb09a1-2b70-475e-b01d-195263ac0b59" /> 
