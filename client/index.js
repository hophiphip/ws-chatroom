var socket = io();

var form = document.getElementById('form');  
var input = document.getElementById('input');
var messages = document.getElementById('messages');

form.addEventListener('submit', function(evt) {    
    evt.preventDefault();

    if (input.value) {      
        socket.emit('message', input.value);      
        input.value = '';    
    }  
});

socket.on('message', (msg) => {
    const message = JSON.parse(msg);
    const newMessage = document.createElement('li');
    newMessage.innerHTML = `User: ${message.id} Send: ${message.text}`;
    messages.appendChild(newMessage);
})