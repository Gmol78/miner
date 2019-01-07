/**
 * Конструктор объекта - ячейки
 *
 * @param {number} posX horizontal position
 * @param {number} posY vertical position
 */

function Cell(posX, posY) {

    /*properties*/

    this.posX = posX;
    this.posY = posY;

    this.isCellOpened = false;
    this.isCellMined = false;
    this.numberMinesNear = '';

    /*methods*/

    this.openCell = function () {
        this.isCellOpened = true;
    };

    this.setMine = function () {
        this.isCellMined = true;
    };

    this.addNumberMinesNear = function () {
        this.numberMinesNear++;
    }
}


/**
 * Конструктор объекта - минное поле
 *
 * @param {number} size  size of minefield
 * @param {number} mines number of mines
 */

function Minefield(size, mines) {

    /****properties****/

    this.fieldSize = size;
    this.MinesNum = mines;
    this.cellsArray = [];

    var self = this;

    /****methods****/

    // create field
    this.createCellsArray = function () {

        var size = this.fieldSize;
        var arr = [];

        for (var x = 0; x < size; x++) {

            arr[x] = [];

            for (var y = 0; y < size; y++) {
                arr[x][y] = new Cell(x, y);
            }
        }
        this.cellsArray = arr;
    };

    // seting mines
    this.setMines = function () {

        var minesCount = 0;
        while (minesCount < this.MinesNum) {

            var x = Math.floor(Math.random() * this.fieldSize);
            var y = Math.floor(Math.random() * this.fieldSize);

            var cell = this.cellsArray[x][y];

            if (!cell.isCellMined && !cell.isCellOpened) {

                cell.setMine();
                minesCount++;
            }
        }
    };

    // seting numbers of mines near cell
    this.setNumbers = function () {
        for (var x = 0; x < this.fieldSize; x++) {

            for (var y = 0; y < this.fieldSize; y++) {

                var cell = this.cellsArray[x][y];
                if (cell.isCellMined) continue;

                var xBegin = ((x - 1) > 0) ? (x - 1) : 0;
                var xEnd = ((x + 1) < this.fieldSize) ? (x + 1) : (this.fieldSize - 1);

                var yBegin = ((y - 1) > 0) ? (y - 1) : 0;
                var yEnd = ((y + 1) < this.fieldSize) ? (y + 1) : (this.fieldSize - 1);

                for (var x1 = xBegin; x1 <= xEnd; x1++) {
                    for (var y1 = yBegin; y1 <= yEnd; y1++) {

                        if (x1 === x && y1 === y) continue;

                        var cellTested = this.cellsArray[x1][y1];
                        if (cellTested.isCellMined) {

                            cell.addNumberMinesNear();
                        }
                    }
                }

            }
        }
    };

    // return cell from x,y position
    this.getCellFromPosition = function (x, y) {

        return this.cellsArray[x][y];
    };

    //open cell on x,y position
    this.openCellOnPosition = function (x, y) {

        var cell = this.getCellFromPosition(x, y);
        cell.openCell();

    };

    // open region near free cell
    this.fillRegion = function openLoc(x, y) {


        console.log(x);
        console.log(y);

        console.log(self.fieldSize);

        x = +x;
        y = +y;

        var xBegin = ((x - 1) > 0) ? (x - 1) : 0;
        var xEnd = ((x + 1) < self.fieldSize) ? (x + 1) : (self.fieldSize - 1);

        var yBegin = ((y - 1) > 0) ? (y - 1) : 0;
        var yEnd = ((y + 1) < self.fieldSize) ? (y + 1) : (self.fieldSize - 1);

        console.log('xBegin: ' + xBegin);
        console.log('xEnd: ' + xEnd);

        console.log('yBegin: ' + yBegin);
        console.log('yEnd: ' + yEnd);

        for (var x1 = xBegin; x1 <= xEnd; x1++) {
            for (var y1 = yBegin; y1 <= yEnd; y1++) {

                if (x1 === x && y1 === y) continue;

                var cellNearest = self.cellsArray[x1][y1];
                if (!cellNearest.isCellOpened) {
                    cellNearest.openCell();

                    if (!cellNearest.numberMinesNear) {
                        openLoc(x1, y1);
                    }

                }
            }
        }
    };

    /*****init****/

    this.createCellsArray();
    //this.setMines();
    //this.setNumbers();
}


/**
 * конструктор представления
 *
 * @param {object} minefield object new Minefield ();
 */

function View(minefield) {

    /*properties*/
    this.Field = minefield;

    /*methods*/

    this.renderField = function () {

        var table = document.getElementById('minefield');
        table.innerHTML = '';

        for (var x = 0; x < this.Field.fieldSize; x++) {

            var tr = document.createElement('tr');

            for (var y = 0; y < this.Field.fieldSize; y++) {

                var cell = this.Field.cellsArray[x][y];

                var td = document.createElement('td');
                td.setAttribute('data-x', x);
                td.setAttribute('data-y', y);

                td.setAttribute('id', '' + x + '_' + y);

                if (cell.isCellMined) {
                    td.classList.add('mined');
                }

                if (cell.isCellOpened) {
                    td.classList.add('opened');
                }

                if (cell.numberMinesNear) {
                    td.innerHTML = cell.numberMinesNear;
                }

                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
    };

    this.setCellToOpened = function (x, y) {

        var cell = document.getElementById('' + x + '_' + y);
        console.log(cell);
        cell.classList.add('opened');

    };

    /*init*/

    this.renderField();
}

/**
 * конструктор контроллера
 *
 * @param {number} size
 * @param {number} mines
 */

function Miner(size, mines) {

    var self = this; // todo проброс контекста через замыкание потом переделать call, apply итд

    /*properties*/
    this.gameOver = false;
    this.moveNum = 0;
    this.scope = 0;
    this.time = 0;

    this.playField = new Minefield(size, mines);
    this.view = new View(this.playField);


    /*methods*/
    this.moving = function () {

        var clickedCell = null;

        var playField = document.getElementById('minefield');
        playField.onclick = function (e) {

            if (self.gameOver) return;

            xClicked = e.target.getAttribute('data-x');
            yClicked = e.target.getAttribute('data-y');

            //console.log(self.cellTesting(xClicked, yClicked));

            if (self.cellTesting(xClicked, yClicked)) {

                self.gameOver = true;
            }

            self.playField.openCellOnPosition(xClicked, yClicked);


            if (!self.moveNum) {
                self.playField.setMines();
                self.playField.setNumbers();
            }

            if (!self.playField.cellsArray[xClicked][yClicked].numberMinesNear && !self.playField.cellsArray[xClicked][yClicked].isCellMined) {
                self.playField.fillRegion(xClicked, yClicked);
            }

            self.view.renderField();

            self.moveNum++;

        }
    };

    this.cellTesting = function (x, y) {

        var cell = this.playField.cellsArray[x][y];
        return cell.isCellMined;

    };

    /*init*/

    this.moving();

}


var miner = new Miner(9, 8);
