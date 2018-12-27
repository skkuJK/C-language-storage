# jk-face-recognition
Real-time Face Recognition using Smartphone

* [Introduction](#introduction)
* [Install](#install)
* [How to use](#how-to-use)
* [Contact](#contact)
* [Reference](#reference)

## Introduction
Hi! Everyone!
**jk-face-recognition** is aimed at face recognition in real time using smart phone. The language used for this platform was Java, JavaScript, html, css, etc. and used the Node js platform. The **jk-face-recognition** integrates smartphones, servers and the Web. Face recognition software used on **jk-face-recognition** was made from [here](https://github.com/justadudewhohacks/face-recognition.js).

* The smartphone displays the face of the people in the camera through a rectangle to the user and provides the information of the person processed by the server.
* The server performs tasks requiring high processing such as face detection, face recognition, face learning, and image storage.
* The Web provides a simple interface for administrators to do various tasks such as database, user data management, and so on.
* **jk-face-recognition** can also automatically recognize celebrities using the Clova Face Recognition API and the Naver News API.

## Install

#### face-recognition
[here](https://github.com/justadudewhohacks/face-recognition.js)

#### mysql
[here](https://github.com/mysqljs/mysql)

#### request
[here](https://github.com/request/request)

#### websocket
[here](https://github.com/theturtle32/WebSocket-Node)

## How to use

### User Perspective
##### 1. The user takes people through a smartphone camera.
##### 2. The image taken by the smartphone camera is transmitted to the server.
##### 3. The server detects and recognizes the face in the image, and transmits the information of the corresponding person to the smartphone.
##### 4. The smartphone displays the information of the person provided to the server to the user.

### Administrator Perspective
##### 1. The administrator can insert information about a new person on a web page and update the information of the existing person.
##### 2. The web server sends newly added or updated information to the server.
##### 3. The server processes the information provided by the web server and sends the processing result to the web server.

### Precautions
To use **jk-face-recognition**, you have to run it in the order of server, web server, smart phone.

## Contact
## Used open source


