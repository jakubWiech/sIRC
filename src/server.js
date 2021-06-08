const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const cors = require('cors')

var chat = []

app.use(cors())
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: "tajemnica", resave: false, saveUninitialized: true }))

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

app.get("*.js", function (req, res) {
    res.sendFile(path.join(__dirname + req.url))
})

app.get("*.css", function (req, res) {
    res.sendFile(path.join(__dirname + req.url))
})

app.get("*.png", function (req, res) {
    res.sendFile(path.join(__dirname + "/images/ircbg.png"))
})

app.get("/checkSession", function (req, res) {
    if (req.session.nickname) {
        let tmpchat = []
        for (let i = req.session.msgIndex; i < chat.length; i++) {
            tmpchat.push(chat[i])
        }
        res.end(JSON.stringify({ state: "reconnected", nickname: req.session.nickname, chat: tmpchat }))
    } else {
        res.end(JSON.stringify({ state: "noname" }))
    }
})

app.get("/cyclicalRequest", function (req, res) {
    let start = Date.now()
    let messages = chat.length
    let tmpchat = []
    let check = setInterval(function () {
        if (messages != chat.length | Date.now() - start >= 5000) {
            for (let i = req.session.msgIndex; i < chat.length; i++) {
                tmpchat.push(chat[i])
            }
            clearInterval(check)
            res.end(JSON.stringify({ chat: tmpchat }))
        }
    }, 10)
})

app.post("/sendMsg", function (req, res) {
    let singleMsg = [req.session.nickname, req.session.color, req.body.message, req.body.time]
    chat.push(singleMsg)
    res.end()
})

app.post("/sendCommand", function (req, res) {
    let commandArr = req.body.command.split(" ")
    let quit = false
    switch (commandArr[0]) {
        case "/nick":
            let newNick = ""
            for (let i = 1; i < commandArr.length; i++) {
                newNick += commandArr[i] + " "
            }
            req.session.nickname = newNick
            req.session.save()
            break;
        case "/color":
            req.session.color = commandArr[1]
            req.session.save()
            break;
        case "/quit":
            quit = true
            req.session.destroy()
            break;
    }
    res.end(JSON.stringify({ state: quit, newnick: req.session.nickname }))
})

app.post("/connectNewUser", function (req, res) {
    req.session.msgIndex = chat.length
    req.session.nickname = req.body.nickname
    req.session.color = "rgb(" + Math.floor(Math.random() * 200) + ", " + Math.floor(Math.random() * 200) + ", " + Math.floor(Math.random() * 200) + ")"
    req.session.save()
    res.end()
})

app.listen(3000, () => {
    console.log("Bangla na 3000")
})