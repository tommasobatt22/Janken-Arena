import './style.css'

// Get a reference to the canvas and its context
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var dpi = window.devicePixelRatio;
canvas.width = getComputedStyle(canvas).getPropertyValue('width').slice(0, -2) * dpi;
canvas.height = getComputedStyle(canvas).getPropertyValue('height').slice(0, -2) * dpi;

// Regola la dimensione del canvas tramite CSS
canvas.style.width = getComputedStyle(canvas).getPropertyValue('width');
canvas.style.height = getComputedStyle(canvas).getPropertyValue('height');

var dotsR = [];
var dotsP = [];
var dotsS = [];
var allDots = []; // Definisci allDots globalmente

const speed = 20

var images = {
  r: new Image(),
  p: new Image(),
  s: new Image()
};

// Imposta i percorsi delle immagini (modifica con i tuoi percorsi)
images.r.src = '/src/img/rock.png';    // Immagine per roccia
images.p.src = '/src/img/paper.png';   // Immagine per carta
images.s.src = '/src/img/scissors.png'; // Immagine per forbici

var imagesLoaded = 0;
var totalImages = 3;

// Controlla quando tutte le immagini sono caricate
function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    console.log('Tutte le immagini sono state caricate');
  }
}

images.r.onload = onImageLoad;
images.p.onload = onImageLoad;
images.s.onload = onImageLoad;

// Funzione per generare una velocità casuale
function getRandomVelocity() {
  var angle = Math.random() * 2 * Math.PI; // Angolo casuale tra 0 e 2π
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
  };
}

function checkWinner() {
  var types = new Set();
  for (let i = 0; i < allDots.length; i++) {
    for (let j = 0; j < allDots[i].length; j++) {
      types.add(allDots[i][j].type);
    }
  }
  if (types.size === 1) {
    var winnerType = Array.from(types)[0];
    var winnerName = '';
    switch(winnerType) {
      case 'r':
        winnerName = 'Rocks';
        break;
      case 'p':
        winnerName = 'Paper';
        break;
      case 's':
        winnerName = 'Scissor';
        break;
    }
    document.getElementById('winner-area').style.display = 'block' 
    document.getElementById('winner-text').innerHTML = winnerName + ' Wins 👑 🚫 😤 🔥'
    console.log(winnerName + ' Wins 😤');
    return true;
  }
  return false;
}

var frameLength = 2;

const radius = 30;

var animationId = null; // Per tenere traccia dell'animazione

//draw all dots
function drawDots() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < allDots.length; i++) {
    for (let j = 0; j < allDots[i].length; j++) {
      drawDot(allDots[i][j]);
    }
  }
}

// Function to draw a point on the canvas
function drawDot(dot) {
  context.globalAlpha = 0.9;
  
  // Disegna l'immagine invece del cerchio colorato
  var img = images[dot.type];
  if (img.complete) {  // Controlla se l'immagine è caricata
    var size = radius * 2;  // Dimensione dell'immagine
    context.drawImage(img, dot.x - radius, dot.y - radius, size, size);
  } else {
    // Se l'immagine non è ancora caricata, disegna un cerchio colorato come fallback
    context.beginPath();
    context.arc(dot.x, dot.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = dot.color;
    context.fill();
  }
};


function moveDots() {
  for (let i = 0; i < allDots.length; i++) {
    for (let j = 0; j < allDots[i].length; j++) {
      var dot = allDots[i][j];

      //moving the dots
      dot.x += dot.xMove;
      dot.y += dot.yMove;

      //collision borders check
      if (dot.x < 0 || dot.x + radius > canvas.width) {
        dot.xMove *= -1
      }
      if (dot.y < 0 || dot.y + radius >= canvas.height) {
        dot.yMove *= -1
      }
      //collision dots check
      for (let k = 0; k < allDots.length; k++) {
        for (let l = 0; l < allDots[k].length; l++) {
          var otherDot = allDots[k][l];
          if (dot === otherDot) continue; // Salta il confronto con se stesso
          
          var distance = Math.sqrt(Math.pow(dot.x - otherDot.x, 2) + Math.pow(dot.y - otherDot.y, 2));//more information for the distance: https://it.wikipedia.org/wiki/Distanza_euclidea
          if (distance <= radius * 2) {
            //swapping the directions
            var tempX = dot.xMove;
            var tempY = dot.yMove;
            dot.xMove = otherDot.xMove;
            dot.yMove = otherDot.yMove;
            otherDot.xMove = tempX;
            otherDot.yMove = tempY;
             switch (dot.type) {
              case 'r':
                switch (otherDot.type) {
                  case 's':
                    //changing the type (ora cambia l'immagine automaticamente)
                    otherDot.type = dot.type;
                    break;
                  case 'p':
                    dot.type = otherDot.type;
                    break;
                }
                break;
              case 'p':
                switch (otherDot.type) {
                  case 'r':
                    //changing the type
                    otherDot.type = dot.type;
                    break;
                  case 's':
                    dot.type = otherDot.type;
                    break;
                }
                break;
              case 's':
                switch (otherDot.type) {
                  case 'p':
                    //changing the type
                    otherDot.type = dot.type;
                    break;
                  case 'r':
                    dot.type = otherDot.type;
                    break;
                }
                break;
            }
          }
        }
      }
    }
  }
}

function animate() {
  moveDots();
  drawDots();
  
  // Controlla se c'è un vincitore
  if (checkWinner()) {
    cancelAnimationFrame(animationId);
    animationId = null;
    return; // Ferma l'animazione
  }
  
  animationId = requestAnimationFrame(animate);
}

//animation loop 
document.getElementById('animation-start').addEventListener('click', function (e){

   if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  // Reset arrays
  dotsR = [];
  dotsP = [];
  dotsS = [];
  
  const rocksRange = document.getElementById('rocks-range').value;
  const scissorsRange = document.getElementById('scissors-range').value;
  const papersRange = document.getElementById('papers-range').value;

  //populating dotsR
  for (let i = 0; i < rocksRange; i++) {
    var x = Math.random() * (canvas.width - radius * 2) + radius;
    var y = Math.random() * (canvas.height - radius * 2) + radius;
    var velocity = getRandomVelocity();
    var dot = {//save the dot values
      type: 'r',
      x: x,
      y: y,
      color: "#00272B",
      xMove: velocity.x,
      yMove: velocity.y,
    }; 
    dotsR.push(dot);
  }

  //populating dotsP
  for (let i = 0; i < papersRange; i++) {
    var x = Math.random() * (canvas.width - radius * 2) + radius;
    var y = Math.random() * (canvas.height - radius * 2) + radius;
    var velocity = getRandomVelocity();
    var dot = {//save the dot values
      type: 'p',
      x: x,
      y: y,
      color: "#FF2ECC",
      xMove: velocity.x,
      yMove: velocity.y,
    };
    dotsP.push(dot);
  }
  
  //populating dotsS
  for (let i = 0; i < scissorsRange; i++) {
    var x = Math.random() * (canvas.width - radius * 2) + radius;
    var y = Math.random() * (canvas.height - radius * 2) + radius;
    var velocity = getRandomVelocity();
    var dot = {//save the dot values
      type: 's',
      x: x,
      y: y,
      color: "#E0FF4F",
      xMove: velocity.x,
      yMove: velocity.y,
    };
    dotsS.push(dot);
  }
  
  // Aggiorna allDots
  allDots = [dotsR, dotsP, dotsS];
  console.log(allDots);
  
  animate();
})

document.getElementById('close-button').addEventListener('click', function (e){
  document.getElementById('winner-area').style.display = 'none'
})