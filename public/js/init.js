const numSounds = 8;
const sounds = Array.from({ length: numSounds}, (e, i) => new Howl({ src: `sounds/${i}.mp3`, html5: false, volume: 0.9, loop: false }));
const colors = ['lime', 'maroon', 'darkviolet', 'yellow', 'orange', 'black', 'navy', 'magenta'];
let usedColors = [];
let availableColors = colors.filter(el => usedColors.indexOf(el) < 0);
let myCircle = null;
let currentPlayers = [];
let otherCircles = new Map;
let myMessages = [];
let sorryText = 'sorry this game is full but you can still chat';
let env, osc;
let joined = false;
const socket = io.connect();
let foods = [];

socket.on('connect', (data) => {
    console.log('client connected');
    socket.on('init', (players) => {
        // console.log(players);
        if(players.length < availableColors.length){
            joined = true;
            myCircle = new SoundCircle(random(50, width-50), random(50, height-50), random(20,40), availableColors[Math.floor(Math.random() * availableColors.length)], players.length);
            // myCircle = new SoundCircle(random(50, width-50), random(50, height-50), random(20,40), 'red');
            const initCircleData = {
                pos: { x: myCircle.pos.x, y: myCircle.pos.y},
                size: myCircle.size,
                col: myCircle.col,
                velocity: {x: 0, y: 0},
                
            }
            
            socket.emit('start', initCircleData);
        } else {
            joined = false;
            const offScreenCircle = {
                pos: {x: -200, y: -200},
                size: 0,
                col: 'white',
                velocity: {x: 0, y: 0},  
            } 
            socket.emit('start', offScreenCircle);
        }
    })
})

socket.on('state-update', (data) => {
    players = data;
    updateColors();
    data.forEach((item, i) => {
        if(item.id){
            otherCircles.set(item.id, item.circle);
            myMessages = item.messages;
        }
    })  
})

socket.on('playFreq', (num) => {
    // console.log('received play sound message');
    // osc.freq(freq);
    // env.play(osc);
    playSound(num);
})

socket.on('updateChat', (message) => {
        addMessageToChat(message);
})



const colorForm = document.querySelector('#guess-form');
colorForm.addEventListener("submit", processForm);

const it = colors[Math.floor(Math.random() * colors.length)];
console.log(it);

const colorsHeading = document.querySelector('#colors').innerHTML = `the colors are: ${colors.join(' ')}`;
// colorsHeading.innerHtml = `the colors are: ${colors.join()}`;


function processForm(e) {
    e.preventDefault();
    const guess = e.target[0].value;
    checkGuess(guess)
    return false;
}

function checkGuess(guess){
    console.log(it);
    console.log(guess);
    if(guess === it){
        console.log('you win');
    }
}

function updateColors(){
    players.forEach(player => {
        // console.log(player.circle.col);
        usedColors.push(player.circle.col);
        availableColors = colors.filter(el => usedColors.indexOf(el) < 0);
        // console.log(availableColors);
    })
}


const messageForm = document.querySelector('#message-form');
messageForm.addEventListener("submit", addMessage);

const chat = document.querySelector('#chat');


function addMessage(e){
    e.preventDefault();
    console.log(e);
    const messageText = e.target[0].value;
    createMessage(messageText);
    
}


function createMessage(messageText){
    const message = {
        userId: socket.id,
        timeCreated: Date.now(),
        messageText: messageText,
    }
    socket.emit('newMessage', message);
    addMessageToChat(message);
}




function addMessageToChat(message){
    const messageDiv = document.createElement('div');
    messageDiv.style.border = `solid 3px ${colors[Math.floor(Math.random() * colors.length)]}`
    messageDiv.style.padding = '10px';
    const messageP = document.createElement('p');
    messageP.innerHTML = message.messageText;
    messageDiv.appendChild(messageP);
    chat.appendChild(messageDiv);

}



{/* <div class="message">
<p class="message-text">hi this is a test message</p>
</div> */}