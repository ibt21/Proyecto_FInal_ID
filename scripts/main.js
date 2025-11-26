import { Game } from "./game.js";
import { userManager } from "./UserManager.js";

const canvasTetris = document.getElementById("canvas-tetris");
const canvasNext = document.getElementById("canvas-next");
const canvasHold = document.getElementById("canvas-hold");
const score = document.getElementById("score");
const menu = document.getElementById("menu");
const btnMenu = document.getElementById("btn-start");

const rows = 20;
const cols = 10;
const cellSize = 26;
const space = 3;

let game;

function initGame() {
    game = new Game(canvasTetris, rows, cols, cellSize, space, canvasNext, canvasHold);
}

function update(){
    if (!userManager.currentUser) return;

    if(game && game.gameOver){
        menu.style.display = "flex";
        userManager.updateStats(game.score);
    } else if(game) {
        game.update();
        score.innerHTML = game.score;
    }

    requestAnimationFrame(update);
}

btnMenu.addEventListener("click",()=>{
    setTimeout(() => {
        menu.style.display = "none";
        game.reset(); 
    }, 200);
});

if (userManager.currentUser) {
    initGame();
    update();
}

export { game };