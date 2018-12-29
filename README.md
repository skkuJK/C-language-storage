![logo](https://user-images.githubusercontent.com/46180332/50475050-a2dd3b80-0a06-11e9-9d58-5b83db661284.png) 
# jk-face-recognition 

Real-time Face Recognition using Smartphone

* [Introduction](#introduction)
* [Install](#install)
* [How to use](#how-to-use)
* [Contact](#contact)
* [Used open source](#used-open-source)
* [License](#license)

## Introduction
Hi! Everyone!
**jk-face-recognition** is aimed at face recognition in real time using smart phone. The language used for this platform was Java, JavaScript, html, css, etc. and used the Node js platform. The **jk-face-recognition** integrates smartphones, servers and the Web. Face recognition software used on **jk-face-recognition** was made from [here](https://github.com/justadudewhohacks/face-recognition.js).

* The smartphone displays the face of the people in the camera through a rectangle to the user and provides the information of the person processed by the server.
* The server performs tasks requiring high processing such as face detection, face recognition, face learning, and image storage.
* The Web provides a simple interface for administrators to do various tasks such as database, user data management, and so on.
* **jk-face-recognition** can also automatically recognize celebrities using the Clova Face Recognition API and the Naver News API.
![-](https://user-images.githubusercontent.com/46180332/50533598-1f3f5e00-0b70-11e9-9a64-cd5dd3962c83.gif)
* By touching the smartphone screen, the user can not display the information on the smartphone screen. Once you touch the smartphone screen again, the information is displayed on the smartphone screen.

## Install

#### [face-recognition](https://github.com/justadudewhohacks/face-recognition.js)

#### [mysql](https://github.com/mysqljs/mysql)

#### [request](https://github.com/request/request)

#### [websocket](https://github.com/theturtle32/WebSocket-Node)

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
##### 1. To use **jk-face-recognition**, you have to run it in the order of server, web server, smart phone.
##### 2. Celebrity recognition is performed when the face recognition is not 5 times.
##### 3. Face learning is performed when face detection is not performed more than 30 times.

## Contact
#### rhantls2279@naver.com

## Used open source

#### [face-recognition](https://github.com/justadudewhohacks/face-recognition.js)

#### [mysql](https://github.com/mysqljs/mysql)

#### [request](https://github.com/request/request)

#### [websocket](https://github.com/theturtle32/WebSocket-Node)

## License
Copyright(c)2018 Jongkwon Jang. All rights reserved.

