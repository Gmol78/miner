/**
 * Конструктор объекта - ячейки
 *
 * @param {number} posX horizontal position
 * @param {number} posY vertical position
 */

function Cell(posX, posY) {

    /*properties*/

    var opened = false;
    var mined = false;
    var exploded = false;
    var minesNear = '';
    var marked = false;


    /*methods*/

    this.openCell = function () {
        opened = true;
        if (mined) {
            exploded = true;
        }
    };

    this.setMine = function () {
        mined = true;
    };

    this.addMineNear = function () {
        minesNear++;
    };

    this.markCell = function () {
        marked = true;
    };

    /*getters, setters*/

    this.getX = function () {
        return posX;
    };

    this.getY = function () {
        return posY;
    };

    this.getMined = function () {
        return mined;
    };

    this.getOpened = function () {
        return opened;
    };

    this.getMinesNear = function () {
        return minesNear;
    };

    this.getExploded = function () {
        return exploded;
    }
}


/**
 * Конструктор объекта - минное поле
 *
 * @param {number} size  size of minefield
 * @param {number} mines number of mines
 */

function Minefield(size, mines) {

    var self = this; //context in closure

    /****private properties****/

    var cellsArray = [];


    /****private methods****/

    // create field
    function createCellsArray() {

        var arr = [];

        for (var x = 0; x < size; x++) {

            arr[x] = [];

            for (var y = 0; y < size; y++) {
                arr[x][y] = new Cell(x, y);
            }
        }
        cellsArray = arr;
    }

    // setting mines
    function mining() {

        var minesCount = 0;
        while (minesCount < mines) {

            var x = Math.floor(Math.random() * size);
            var y = Math.floor(Math.random() * size);

            var cell = cellsArray[x][y];

            if (!cell.getMined() && !cell.getOpened()) {

                cell.setMine();
                minesCount++;
            }
        }
    }


    function visitLocation(x, y, func) {

        var xBegin = ((x - 1) > 0) ? (x - 1) : 0;
        var xEnd = ((x + 1) < size) ? (x + 1) : (size - 1);

        var yBegin = ((y - 1) > 0) ? (y - 1) : 0;
        var yEnd = ((y + 1) < size) ? (y + 1) : (size - 1);

        for (var x1 = xBegin; x1 <= xEnd; x1++) {
            for (var y1 = yBegin; y1 <= yEnd; y1++) {

                if (x1 === x && y1 === y) continue;

                func(x, y, x1, y1);
            }
        }
    }


    function minesNear(x, y, x1, y1) {

        var cell = cellsArray[x][y];
        if (cell.getMined()) return;

        var cellTested = cellsArray[x1][y1];

        if (cellTested.getMined()) {
            cell.addMineNear();
        }
    }


    // seting numbers of mines near cell
    function setNumbers() {

        for (var x = 0; x < size; x++) {
            for (var y = 0; y < size; y++) {
                visitLocation(x, y, minesNear);
            }
        }
    }


    /****public methods****/

    // return cell from x,y position
    this.getCellFromPosition = function (x, y) {
        return cellsArray[x][y];
    };

    this.getNumbersMineNearInCellPosition = function (x, y) {
        console.log(y);
        var cell = cellsArray[x][y];
        return cell.getMinesNear();
    };

    this.testMined = function (x, y) {
        var cell = self.getCellFromPosition(x, y);
        return cell.getMined();
    };


    //open cell on x,y position
    this.openCellOnPosition = function (x, y) {

        var cell = this.getCellFromPosition(x, y);
        cell.openCell();

    };


    // open region near free cell
    this.fillRegion = function openLoc(x, y) {

        x = +x;
        y = +y;

        var xBegin = ((x - 1) > 0) ? (x - 1) : 0;
        var xEnd = ((x + 1) < size) ? (x + 1) : (size - 1);

        var yBegin = ((y - 1) > 0) ? (y - 1) : 0;
        var yEnd = ((y + 1) < size) ? (y + 1) : (size - 1);

        for (var x1 = xBegin; x1 <= xEnd; x1++) {
            for (var y1 = yBegin; y1 <= yEnd; y1++) {

                if (x1 === x && y1 === y) continue;

                var cellNearest = cellsArray[x1][y1];
                if (!cellNearest.getOpened()) {
                    cellNearest.openCell();

                    if (!cellNearest.getMinesNear()) {
                        openLoc(x1, y1);
                    }
                }
            }
        }
    };

    /*****getters****/

    this.getSize = function () {
        return size;
    };

    this.getMines = function () {
        return mines;
    };

    /*****init****/

    createCellsArray();

    this.init = function () {
        mining();
        setNumbers();
    };

}


/**
 * конструктор представления
 *
 * @param {object} minefield object new Minefield ();
 */

function View(minefield) {

    /*properties*/


    /*methods*/

    this.renderField = function () {

        var table = document.getElementById('minefield');
        table.innerHTML = '';

        for (var x = 0; x < minefield.getSize(); x++) {

            var tr = document.createElement('tr');

            for (var y = 0; y < minefield.getSize(); y++) {

                var cell = minefield.getCellFromPosition(x, y);

                var td = document.createElement('td');
                td.setAttribute('data-x', x);
                td.setAttribute('data-y', y);

                td.setAttribute('id', '' + x + '_' + y);

                if (cell.getMined()) {
                    td.classList.add('mined');
                }

                if (cell.getOpened()) {
                    td.classList.add('opened');
                }

                if (cell.getExploded()) {
                    td.classList.add('exploded');
                }

                if (cell.getMinesNear()) {
                    td.innerHTML = cell.getMinesNear();
                }

                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
    };

    this.setCellToOpened = function (x, y) {

        var cell = document.getElementById('' + x + '_' + y);
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

    var self = this; //  контекст через замыкание

    /*properties*/
    this.gameOver = false;
    this.moveNum = 0;
    this.scope = 0;
    this.time = 0;

    this.playField = new Minefield(size, mines);
    this.view = new View(this.playField);


    /*methods*/
    function LeftClickHandler() {

        var playField = document.getElementById('minefield');
        playField.onclick = function (e) {

            if (self.gameOver) return;

            xClicked = e.target.getAttribute('data-x');
            yClicked = e.target.getAttribute('data-y');

            moving(xClicked, yClicked);

        }
    }

    function moving(xClick, yClick) {

        self.playField.openCellOnPosition(xClick, yClick);
        self.moveNum++;

        if (self.moveNum === 1) {
            self.playField.init();
        }

        if (self.playField.testMined(xClick, yClick)) {
            gameOver();
            return;
        }

        if(!self.playField.getNumbersMineNearInCellPosition(xClick, yClick)){
            self.playField.fillRegion(xClick, yClick);
        }

        self.view.renderField();


    }

    function gameOver () {
        self.gameOver = true;
        // todo добавить функционал конца игры
    }


    /*init*/

    LeftClickHandler();

}


var miner = new Miner(9, 8);

