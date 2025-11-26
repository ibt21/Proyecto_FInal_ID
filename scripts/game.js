import { TetrominosBag } from "./tetromino.js";
import { BoardHold, BoardNext, BoardTetris } from "./boardTetris.js";

export class Game {
    constructor(canvas, rows, cols, cellSize, space, canvasNext, canvasHold) {
        this.boardTetris = new BoardTetris(canvas, rows, cols, cellSize, space);
        this.tetrominosBag = new TetrominosBag(canvas, cellSize);
        this.currentTetromino = this.tetrominosBag.nextTetromino();
        this.keyboard();
        this.keys = { up: false, down: false };

        this.lastTime = 0;
        this.lastTime2 = 0;

        this.next = new BoardNext(canvasNext, 8, 4, cellSize, space, this.tetrominosBag.getNextTetromino());
        this.hold = new BoardHold(canvasHold, 2, 4, cellSize, space);
        this.canHold = true;

        this.score = 0;
        this.gameOver = false;

        this.baseSpeed = 1000;
        this.currentSpeed = this.baseSpeed;
        this.speedIncreaseThreshold = 70;
    }
    update() {
        let currentTime = Date.now();
        let deltaTime = currentTime - this.lastTime;
        let deltaTime2 = currentTime - this.lastTime2;

        if (deltaTime >= this.currentSpeed) {
            this.autoMoveTetrominoDown();
            this.lastTime = currentTime;
        }
        if (deltaTime2 >= 50) {
            this.boardTetris.draw();
            this.drawTetrominoghost();
            this.currentTetromino.draw(this.boardTetris);

            this.next.draw2();
            this.hold.draw2();

            if (this.keys.down) {
                this.moveTetrominoDown();
            }
            this.lastTime2 = currentTime;
        }


    }
    autoMoveTetrominoDown() {
        this.currentTetromino.move(1, 0);
        if (this.blockedTetromino()) {
            this.currentTetromino.move(-1, 0);
            this.placeTetromino();
        }
    }
    blockedTetromino() {
        const tetrominoPositions = this.currentTetromino.currentPositions();
        for (let i = 0; i < tetrominoPositions.length; i++) {
            if (!this.boardTetris.isEmpty(tetrominoPositions[i].row, tetrominoPositions[i].column)) {
                return true;
            }
        }
        return false;
    }
    moveTetrominoLeft() {
        this.currentTetromino.move(0, -1);
        if (this.blockedTetromino()) {
            this.currentTetromino.move(0, 1);
        }
    }
    moveTetrominoRight() {
        this.currentTetromino.move(0, 1);
        if (this.blockedTetromino()) {
            this.currentTetromino.move(0, -1);
        }
    }
    moveTetrominoDown() {
        this.currentTetromino.move(1, 0);
        if (this.blockedTetromino()) {
            this.currentTetromino.move(-1, 0);
            this.placeTetromino();
        }
    }
    rotationTetrominoCW() {
        this.currentTetromino.rotation++;
        if (this.currentTetromino.rotation > this.currentTetromino.shapes.length - 1) {
            this.currentTetromino.rotation = 0;
        }
        if (this.blockedTetromino()) {
            this.rotationTetrominoCCW();
        }
    }
    rotationTetrominoCCW() {
        this.currentTetromino.rotation--;
        if (this.currentTetromino.rotation < 0) {
            this.currentTetromino.rotation = this.currentTetromino.shapes.length - 1;
        }
        if (this.blockedTetromino()) {
            this.rotationTetrominoCW();
        }
    }
    placeTetromino() {
    const tetrominoPositions = this.currentTetromino.currentPositions();
    for (let i = 0; i < tetrominoPositions.length; i++) {
        this.boardTetris.matriz
        [tetrominoPositions[i].row]
        [tetrominoPositions[i].column] = this.currentTetromino.id;
    }

    const rowsCleared = this.boardTetris.clearFullRows();
    this.score += rowsCleared * 7;

    this.updateSpeed();

    if (this.boardTetris.gameOver()) {
        setTimeout(() => {
            this.gameOver = true;
        }, 500)
        return true;
    }
    else {
        this.currentTetromino = this.tetrominosBag.nextTetromino();
        this.next.listTetrominos = this.tetrominosBag.getThreeNextTetrominos();
        this.next.updateMatriz();
        this.canHold = true;
    }
}
    updateSpeed() {
        const level = Math.floor(this.score / this.speedIncreaseThreshold);
        this.currentSpeed = Math.max(100, this.baseSpeed - (level * 170)); 
    }
    dropDistance(position) {
        let distance = 0;
        while (this.boardTetris.isEmpty(position.row + distance + 1, position.column)) {
            distance++;
        }
        return distance;
    }
    tetrominoDropDistance() {
        let drop = this.boardTetris.rows;
        const tetrominoPositions = this.currentTetromino.currentPositions();
        for (let i = 0; i < tetrominoPositions.length; i++) {
            drop = Math.min(drop, this.dropDistance(tetrominoPositions[i]))
        }
        return drop;
    }
    drawTetrominoghost() {
        const dropDistance = this.tetrominoDropDistance();
        const tetrominoPositions = this.currentTetromino.currentPositions();
        for (let i = 0; i < tetrominoPositions.length; i++) {
            let position = this.boardTetris.getCoordinates(
                tetrominoPositions[i].column,
                tetrominoPositions[i].row + dropDistance
            );
            this.boardTetris.drawSquere(position.x, position.y, this.boardTetris.cellSize, "#000", "white", 20)
        }
    }
    dropBlock() {
        this.currentTetromino.move(this.tetrominoDropDistance(), 0);
        this.placeTetromino();
    }
    holdTetromino() {
        if (!this.canHold) return;
        if (this.hold.tetromino === null) {
            this.hold.tetromino = this.currentTetromino;
            this.currentTetromino = this.tetrominosBag.nextTetromino();
             this.hold.updateMatriz();
        }
        else {
            [this.currentTetromino, this.hold.tetromino] = [this.hold.tetromino, this.currentTetromino]
            this.hold.updateMatriz();
            this.canHold = false;
        }
    }
    reset() {
        this.gameOver = false;
        this.boardTetris.restarmatriz();
        this.score = 0;
        this.hold.tetromino = null;
        this.tetrominosBag.reset();
        this.currentTetromino = this.tetrominosBag.nextTetromino();
        this.hold.drawBackground();

        this.canHold = true;
        this.hold.restarmatriz();
        this.next.restarmatriz();
        this.next.listTetrominos = this.tetrominosBag.getThreeNextTetrominos();
        this.next.updateMatriz();
        this.next.draw2();
    }
    keyboard() {
        window.addEventListener("keydown", evt => {
            if (evt.key === "ArrowLeft") {
                this.moveTetrominoLeft();
            }
            if (evt.key === "ArrowRight") {
                this.moveTetrominoRight();
            }
            if (evt.key === "ArrowUp" && !this.keys.up) {
                this.rotationTetrominoCW();
                this.keys.up = true;
            }
            if (evt.key === "ArrowDown") {
                this.keys.down = true;
            }
            if (evt.key === "c" || evt.key === "C") {
                this.holdTetromino();
            }
            if (evt.key === " " || evt.key === "Spacebar") {
                if (!this.gameOver) {
                    this.dropBlock();
                }
            }

        });
        window.addEventListener("keyup", (evt) => {
            if (evt.key === "ArrowUp") {
                this.keys.up = false;
            }
            if (evt.key === "ArrowDown") {
                this.keys.down = false;
            }
        });
        window.addEventListener("click", () => {
            if (!this.gameOver) {
                this.dropBlock();
            }
        })
    }
}