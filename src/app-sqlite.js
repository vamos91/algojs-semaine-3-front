import './style.css'
import initSqlJs from "sql.js";


window.addEventListener('DOMContentLoaded', async () => {
    const SQL = await initSqlJs({
        // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
        // You can omit locateFile completely when running in node
            locateFile: file => `./node_modules/sql.js/dist/sql-wasm.wasm`
        });
    const db = new SQL.Database();

        const createTable = () => {
        let sqlCreateMessageTable = `
                CREATE TABLE MESSAGE (
                    id integer primary key autoincrement,
                    mail_exp varchar(255),
                    mail_dest varchar(255),
                    subject varchar(255),
                    message text
                )
            `
        db.exec(sqlCreateMessageTable)
    }
    
    createTable()


    /**
     * Count Message from backend
     * @function updateCounter()
     * @param {string} messageList - List of message.
     */
    const updateCounter = (messageList) => {
        const counterMail = document.querySelector('.counter-mail')
        const counterMailSent = document.querySelector('.counter-mail-sent')
        const messageCount = messageList.filter((item) => item.is_message_received === true)
        const messageSentCount = messageList.filter((item) => item.is_message_received === false)
        counterMail.innerHTML = messageCount.length
        counterMailSent.innerHTML = messageSentCount.length
    }

    /**
     * Delete message one by one
     * @function deleteMessage()
     * Delete request to localhost:3000
     */
    const deleteMessage = () => {
        const trashs = document.querySelectorAll('.trash')
            trashs.forEach((trash) => {
                trash.addEventListener('click', (e) => {
                    const trashId = trash.id.split('-')
                    const destroy = async () => {
                        await fetch(`http://localhost:3000/message/${trashId[1]}`, {
                        method: 'DELETE'
                        })
                    }
                    destroy()
                    location.reload()
                })
            })
    }

    /**
     * Displaying one message
     * @function displayOneMessage()
     * 
     */
    const displayOneMessage = (source) => {
        const message_received = document.querySelector('#messages')
        const message_send = document.querySelector('#messages-sent')
        const section_read_message = document.querySelector('#section-one-message')
        const read_message = document.querySelector('#read-message')
        const back_button = document.querySelector('.back-button')

        back_button.addEventListener('click', () => {
            message_received.style.display = 'block'
            message_send.style.display = 'block'
            section_read_message.style.display = 'none'
        })

        const messages = document.querySelectorAll('.read-mail')
        messages.forEach((message) => {
            message.addEventListener('click', (e) => {
                const id = message.id
                const messageId = id.split('-')

                if (source === 'from server') {
                    fetch(`https://sandbox-p2s3-message.alt-tools.tech/message/${messageId[1]}`)
                    .then(response => response.json())
                    .then((data) => {
                        read_message.innerHTML = ''
                        read_message.insertAdjacentHTML('beforeend', `
                            <div class="card" id="card-${data.message.id}">
                                <div class="user">
                                    <img width='30px' id="avatar" src="../public/avatar.webp" alt=""/>
                                    <div>${data.message.mail_exp} - ${data.message.id}</div>
                                </div>
                                <div class="infos">
                                    <div>Subject: ${data.message.subject}</div>
                                    <p>${data.message.message}</p>
                                </div> 
                            </div>  
                            `)
                    })
                } else {
                    const sql = `select * from message where id = ${messageId[1]}`
                    const oneMessageFromSqlite = db.exec(sql)
                        read_message.innerHTML = ''
                        read_message.insertAdjacentHTML('beforeend', `
                            <div class="card" id="card-${oneMessageFromSqlite[0].values[0][0]}">
                                <div class="user">
                                    <img width='30px' id="avatar" src="../public/avatar.webp" alt=""/>
                                    <div>${oneMessageFromSqlite[0].values[0][2]} - ${oneMessageFromSqlite[0].values[0][0]}</div>
                                </div>
                                <div class="infos">
                                    <div>Subject: ${oneMessageFromSqlite[0].values[0][3]}</div>
                                    <p>${oneMessageFromSqlite[0].values[0][4]}</p>
                                </div> 
                            </div>  
                            `)
                }
                message_received.style.display = 'none'
                message_send.style.display = 'none'
                section_read_message.style.display = 'block'
            })  
        })
    }

    /**
     * Displaying all messages
     * @function displayMessages()
     * 
     */
    const displayMessages = (messages) => {
        for (let index = 0; index < messages.length; index++) {
            if (messages[index].is_message_received === true) {
                const messageListElement = document.querySelector('#messages')
                messageListElement.insertAdjacentHTML('beforeend', `
                <div class="card" id="card-${messages[index].id}">
                    <div class="user">
                        <img width='30px' id="avatar" src="../public/avatar.webp" alt=""/>
                        <div>${messages[index].mail_exp} - ${messages[index].id}</div>
                            <img class="trash" data-action="delete" id="card-${messages[index].id}" width="30px" src="./trash.svg" alt="" />
                    </div>
                    <div class="infos">
                        <div>Subject: ${messages[index].subject}</div>
                        <p>${messages[index].message}</p>
                    </div> 
                    <button class="read-mail" id="card-${messages[index].id}">Read mail</button>
                </div>
            `) 
            } 
            
        }  
        deleteMessage() 
        displayOneMessage('from server')
    }


    const displayMessageSend = () => {
        const messageListElement = document.querySelector('#messages-sent')
        messageListElement.innerHTML = ''
        const sqlSelect = `SELECT * FROM message`
        const messages_from_sqlite = db.exec(sqlSelect)
        messages_from_sqlite[0].values.forEach((message, index) => {
                messageListElement.insertAdjacentHTML('beforeend', `
                <div class="card" id="card-${message[0]}">
                    <div class="user">
                        <img width='30px' id="avatar" src="../public/avatar.webp" alt=""/>
                        <div>${message[1]} - ${message[0] + index}</div>
                        <img class="trash" data-action="delete" id="card-${message[0]}" width="30px" src="./trash.svg" alt="" />
                    </div>
                    <div class="infos">
                        <div>Subject: ${message[3]}</div>
                        <p>${message[4]}</p>
                    </div>
                    <button class="read-mail" id="card-${message[0]}">Read mail</button>
                </div>
                `)
        });
        displayOneMessage('from sqlite')
        deleteMessageSent()
    }

    const deleteMessageSent = () => {
        const trashs = document.querySelectorAll('.trash')
            trashs.forEach((trash) => {
                trash.addEventListener('click', (e) => {
                    const trashId = trash.id.split('-')
                    const deleteOne = `DELETE from message where id = ${trashId[1]}`
                    db.exec(deleteOne)
                    displayMessageSend()
                })
            })
    }


    /**
     * Get all messages from server
     * Update counter
     * @function getInboxMessageFromServer()
     * 
     */
    const getInboxMessageFromServer = async () => {
        const messages = await fetch('https://sandbox-p2s3-message.alt-tools.tech/message')
        const messageJson = await messages.json()
        updateCounter(messageJson.messages)
        displayMessages(messageJson.messages)
    }

    getInboxMessageFromServer()

    let email = ''
    /**
     * get email from user
     * @function signin()
     * 
     */
    const signin = () => {
        const signinButton = document.querySelector('.signin-button')
        const inputSignin = document.querySelector('.input-signin')
        signinButton.addEventListener('click', (e) => {
            email = inputSignin.value
        })
    }

    signin()

    /**
     * Send data to API
     * @function form()
     * 
     */
    const form = () => {
        const form = document.querySelector("#formulaire")
        const alert = document.querySelector('.alert')
        form.addEventListener('submit', (event) => {
            event.preventDefault()
            
            const sendMessageToSqlite = async () => {
                const sqlInsert = `INSERT INTO message
                (mail_exp, mail_dest, subject, message) 
                values 
                ('${email}', '${event.target.email.value}', '${event.target.subject.value}', '${message.value}')`
                db.exec(sqlInsert)
                displayMessageSend()
        }
            
        
            if (email !== '' && event.target.email.value !== '' && event.target.subject.value !== '' && event.target.message.value !== '') {
                alert.style.display = 'none'
                sendMessageToSqlite()
            } else {
                alert.style.display = 'block'
            }  
        })
    }

    form()
})



