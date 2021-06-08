class IRC {
    constructor() {
        this.nickname = ""
        this.connected = false
        this.infoShown = false
        this.getEnterPressed()
        this.checkSession()
    }

    checkSession() {
        fetch("/checkSession", {
            method: "GET"
        }).then(res => res.json()).then(res => {
            if (res.state == "reconnected") {
                this.nickname = res.nickname
                this.renderChat(res.chat)
                this.connected = true
                this.hangGetRequest()
            } else {
                this.connectToIRC()
                this.connectToIRC()
                this.hangGetRequest()
            }
        })
    }

    connectToIRC() {
        while (this.nickname == "") {
            this.nickname = prompt("Insert your name")
        }
        fetch("/connectNewUser", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname: this.nickname })
        }).then(console.log("connected")).then(this.connected = true)
    }

    getEnterPressed() {
        window.addEventListener("keydown", (e) => {
            if (e.keyCode == 13) {
                if (this.nickname != "") {
                    this.sendMessage()
                }
            }
        })
        document.getElementById("info").addEventListener("click", () => {
            if (!this.infoShown) {
                document.getElementById("sidepanel").style.transform = "translateX(300px)"
            } else {
                document.getElementById("sidepanel").style.transform = "translateX(0)"
            }
            this.infoShown = !this.infoShown
        })
    }

    sendMessage() {
        if (this.nickname != "") {
            let msg = document.getElementById('message').value
            document.getElementById('message').value = ""
            if (msg[0] == "/") {
                fetch("/sendCommand", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ command: msg })
                }).then(res => res.json()).then(res => {
                    if (res.state) {
                        location.reload()
                    } else {
                        this.nickname = res.newnick
                    }
                })
            } else {
                let time = new Date()
                let hr = time.getHours()
                let min = time.getMinutes()
                fetch("/sendMsg", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: msg, time: hr + ":" + min })
                })
            }
        }
    }

    renderChat(content) {
        let chat = document.getElementById('chat')
        chat.innerHTML = ""
        content.forEach(message => {
            chat.innerHTML += "[" + message[3] + "]" + " <" + "<span style='color:" + message[1] + "'>@" + message[0] + "</span>" + ">: <span class='mesg'>" + message[2] + "</span></br>"
        })
        chat.scrollTop = chat.scrollHeight
        $('.mesg').emoticonize()
    }

    hangGetRequest() {
        if (this.nickname != "") {
            fetch("/cyclicalRequest", {
                method: "GET"
            }).then(res => res.json()).then(res => {
                this.renderChat(res.chat)
                this.hangGetRequest()
            })
        }
    }
}

new IRC()