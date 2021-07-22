//DOM selections
const playerGrid = document.querySelector(".player");
const aiGrid = document.querySelector(".ai");
const hitByPlayer = document.querySelector("#computer-down > span");
const hitByComputer = document.querySelector("#player-down > span");
const gameEndMessage = document.querySelector("#overlay span");
const turn = document.querySelector("#turn > span");
const start = document.getElementById("btn1");
const resetLocation = document.getElementById("btn2");
const reset2 = document.getElementById("btn3");
const smallShip = document.querySelector(".s-ship-container");
const mediumShip = document.querySelector(".m-ship-container");
const largeShip = document.querySelector(".l-ship-container");
const xLargeShip = document.querySelector(".xl-ship-container");
const smallNum = document.getElementById("destroyer");
const mediumNum = document.getElementById("sub-cru");
const largeNum = document.getElementById("battleship");
const xLargeNum = document.getElementById("carrier");
const sound = document.getElementById("music");
const gameBoardSelection = document.querySelector("#size ul")

//AUDIO
const explosionAudio = document.getElementById("explosion");
const seaAudio = document.getElementById("sea-sound");
const shipAudio = document.getElementById("ship-sound");
const winningAudio = document.getElementById("winning-sound");
const losingAudio = document.getElementById("losing-sound");
const startAudio = document.getElementById("game-start");

//Variables
const playerObj = {
  ship: [],
  hit: [],
  shipLeft: 0
};

const computerObj = {
  ship: [],
  hit: [],
  shipLeft: 0
};
const shipLimit = 5;
let gameBoard = "MEDIUM";
let computerHit = [];
let playerHit;
let gridWidth;
let gridHeight;
let dragSpot;
let grabbedAt;
let length;
let droppedAt;
let toggled;
let playerArray = [];
let listOfPlayerArray = [];
let computerArray = [];
let listOfComputerArray = [];
let soundOn = 0;

//ON GAME START
createGrid(10);
initialize();


//CUSTOMIZE BOARD SIZE//
gameBoardSelection.addEventListener("click", selectBoardSize);

//CUSTOMIZE NUMBER OF SHIPS//
smallNum.addEventListener("input", function(){
  clearSpecificShipType("s-ship-container")
  makeShip(smallShip, smallNum.value, 2);
  initialize();
})
mediumNum.addEventListener("input", function(){
  clearSpecificShipType("m-ship-container")
  makeShip(mediumShip, mediumNum.value, 3);
  initialize();
})
largeNum.addEventListener("input", function(){
  clearSpecificShipType("l-ship-container")
  makeShip(largeShip, largeNum.value, 4);
  initialize();
})
xLargeNum.addEventListener("input", function(){
  clearSpecificShipType("xl-ship-container")
  makeShip(xLargeShip, xLargeNum.value, 5);
  initialize();
})

//GAME CLICK BUTTONS//
sound.addEventListener("click", soundToggle);
resetLocation.addEventListener("click", function(){
  createGrid(10);
  resetHistory();
});
reset2.addEventListener("click", function(){
  createGrid(10);
  resetHistory();
});
start.addEventListener("click", startGame); 

//GAME FUNCTIONS//
function selectBoardSize(evt) {
  let size = evt.target.getAttribute("data-size");
  if(evt.target.innerText === gameBoard){
    return;
  }
  else {
    createGrid(size);
    gameBoard = evt.target.innerText;
    for (let a of gameBoardSelection.children){
      a.classList.remove("select");
    }
    evt.target.classList.add("select");
  }
  resetHistory();
  if (!soundOn) {
    seaAudio.pause();
  }
}

function makeStandardShip() {
  clearAllShips();
  makeShip(smallShip, 1, 2);
  makeShip(mediumShip, 2, 3);
  makeShip(largeShip, 1, 4);
  makeShip(xLargeShip, 1, 5);
}

function createGrid(num) {
  emptyInitialGrid();
  makeGrid(playerGrid, num, "p");
  makeGrid(aiGrid, num, "c");
  makeStandardShip();
  max = parseInt(num);
  totalGridSize(max * max);
}

function initialize() {
  gameEndMessage.parentNode.parentNode.style.display = "none";
  mouseDownShip();
  clickShip();
  dragShip();
  dropShip();
  resetLocation.disabled = true;
  start.disabled = true;
  checkStart(listOfPlayerArray);
}

function makeGrid(type, numBox, id) {
  type.style.gridTemplateColumns = `repeat(${numBox}, 1fr)`;
  for (let i = 0; i < numBox * numBox; i++) {
    let grid = document.createElement("div");
    grid.classList.add("grid-item");
    grid.setAttribute("id", `${id}${i + 1}`);
    type.appendChild(grid);
    gridWidth = grid.clientWidth;
    gridHeight = grid.clientHeight;
  }
}

function totalGridSize(num) {
  totalSquares = [];
  totalPlayerSquares = [];
  for (let i = 1; i <= num; i++) {
    totalSquares.push(i);
    totalPlayerSquares.push(i)
  }
}

function makeShip(type, num, size) {
  type.style.cursor = "move";
  for (let i = 0; i < num; i++) {
    let ship = document.createElement("div");
    ship.classList.add("ships");
    ship.setAttribute("draggable", true);
    type.appendChild(ship);
  }
  generateShipID();
  type.childNodes.forEach(function (ship) {
    for (let j = 0; j < size; j++) {
      let shipSize = document.createElement("div");
      shipSize.classList.add("size");
      shipSize.setAttribute("id", `${ship.getAttribute("id")}size${j + 1}`);
      shipSize.setAttribute(
        "style",
        `width: ${gridWidth}px; height: ${gridHeight}px`
      );
      ship.appendChild(shipSize);
    }
    ship.firstChild.classList.add("size-edge-top");
    ship.lastChild.classList.add("size-edge-bottom");
  });
  
}

function makeShipContainerSize(){
  let ships = document.querySelectorAll(".ships");
  ships.forEach(function(ship) {
    let height = ship.childElementCount;
    if(!toggled) {
      ship.setAttribute("style", 
      `height: ${gridHeight * height}px`)
    } else {
      ship.setAttribute("style", 
      `height: ${gridHeight}px`)
    };
  })
}

function generateShipID() {
  let ships = document.querySelectorAll(".ships");
  for (let i = 0; i < ships.length; i++) {
    ships[i].setAttribute("id", `ship${i + 1}`);
  }
}

function setComputerShip() {
  random = Math.floor(Math.random() * totalSquares.length);
  computerArray.push(totalSquares[random]);
  directionArray = [0, 1];
  randomArray =
    directionArray[Math.floor(Math.random() * directionArray.length)];
  if (randomArray === 0) {
    computerRowAddition(totalSquares[random]);
  } else {
    computerColMultiplication(totalSquares[random]);
  }
}

function computerRowAddition(num) {
  for (let i = 1; i < length; i++) {
    computerArray.push((num += 1));
  }
  checkComputerValidChoice()
}

function computerColMultiplication(num) {
  for (let i = 1; i < length; i++) {
    computerArray.push((num += max));
  }
  checkComputerValidChoice();
}

function checkComputerValidChoice(){
  while(!checkValidHorizontal(computerArray, checkArray(computerArray, totalSquares)) 
  || !checkValidVertical(computerArray, checkArray(computerArray, totalSquares))) {
    computerArray = [];
    setComputerShip();
  }
  removeFromComputerSquare();
  pushToFinalArray(computerArray, listOfComputerArray);
  convertToID(listOfComputerArray, "c")
  computerArray = [];
}

function checkArray(side, total) {
  let allInSquare = side.every(num => total.includes(num));
  return allInSquare;
}

//CONDENSE//

function removeFromComputerSquare(){
  totalSquares = totalSquares.filter(function(num) {
    return !computerArray.includes(num);
  })
}

function removeFromPlayerSquare() {
  totalPlayerSquares = totalPlayerSquares.filter(function(num) {
    return !playerArray.includes(num);
  })
}

//DRAG SHIP PORTION CODE & LOGIC

function dragShip() {
  let ships = document.querySelectorAll(".ships");
  for (let ship of ships) {
    ship.addEventListener("dragstart", handleDragStart, false);
    ship.addEventListener("dragend", handleDragEnd, false);
  }
}

function handleDragStart(evt) {
  evt.target.style.opacity = "0.5";
  evt.dataTransfer.setData("text", evt.target.id);
}

function handleDragEnd(evt) {
  evt.target.style.opacity = "1.0";
}

function handleDragOver(evt) {
  if(listOfPlayerArray.length < shipLimit) {
    evt.preventDefault();
  }
}

function dropShip() {
  for (let box of playerGrid.querySelectorAll(".grid-item")) {
    box.addEventListener("dragover", handleDragOver);
    box.addEventListener("drop", function (evt) {
      if (!box.classList.contains("taken")) {
        let data = document.getElementById(evt.dataTransfer.getData("Text"));
        droppedAt = evt.target.id;
        calculateDrag();
        if ((checkValidHorizontal(playerArray, checkArray(playerArray, totalPlayerSquares))
           && toggled)
           || (checkValidVertical(playerArray, checkArray(playerArray, totalPlayerSquares)) 
           && !toggled)) {
          data.parentNode.removeChild(data);
          removeFromPlayerSquare()
          pushToFinalArray(playerArray, listOfPlayerArray);
          convertToID(listOfPlayerArray, "p");
          playerArray = [];
          setComputerShip();
          checkStart(listOfPlayerArray);
        }
        else {
          playerArray = [];
        }
      }
    });

  }
}
function convertToID(totalArray, id) {
  for (let i = 0; i < totalArray.length; i++) {
    let listOfID = totalArray[i].map((squares) => `${id}${squares}`);
    if (id === "p"){
      addEffects(listOfID);
    }
    else{
      addEffectsComputer(listOfID)
    }
  }
}

function addEffectsComputer(array){
  array.forEach(function(id){
    document.getElementById(id).classList.add("taken-c");
  })
}

function addEffects(array) {
  if(!soundOn){
    shipAudio.volume = 0.2;
    shipAudio.play();
    shipAudio.currentTime = 0;
  }
  for(let i = 0; i< array.length; i++){
  document.getElementById(array[i]).classList.add("taken");
  }
}

function clickShip(){
  let counter = 0
  let ships = document.querySelectorAll(".ships");
  for (let ship of ships) {
    ship.addEventListener("click", function (evt) {
      if(counter === 0){
        ship.firstChild.classList.replace("size-edge-top", "size-edge-left");
        ship.lastChild.classList.replace("size-edge-bottom", "size-edge-right");
        ship.classList.add("horizontal")
        counter += 1;
      }
      else {
        ship.firstChild.classList.replace("size-edge-left", "size-edge-top");
        ship.lastChild.classList.replace("size-edge-right", "size-edge-bottom");
        ship.classList.remove("horizontal")
        counter -= 1;
      }
      return counter;
    })
  }
}

function mouseDownShip() {
  let ships = document.querySelectorAll(".ships");
  for (let ship of ships) {
    ship.addEventListener("mousedown", function (evt) {
      toggled = ship.classList.contains("horizontal");
      id = evt.target.id;
      length = evt.target.parentNode.childNodes.length;
      grabbedAt = parseInt(id[id.length - 1]);
      makeShipContainerSize();
    });
  }
}

function calculateDrag() {
  let gridNum = parseInt(droppedAt.substring(1));
  if (!toggled) {
    shipVerticalAlign(gridNum);
  } else {
    shipHorizontalAlign(gridNum);
  }
}

function shipVerticalAlign(gridNum) {
  let n = length + 1;
  let m = grabbedAt + length;
  let gridCount = m - n;
  for (
    let i = gridNum - gridCount * max;
    i < gridNum + (length - gridCount) * max;
    i += max
  ) {
    playerArray.push(i);
  }
}

function shipHorizontalAlign(gridNum) {
  let n = length + 1;
  let m = grabbedAt + length;
  let gridCount = m - n;
  for (let i = gridNum - gridCount; i < gridNum + length - gridCount; i++) {
    playerArray.push(i);
  }
}

//CHECK AGAINST INVALID SHIP DROPPING/GENERATION
function checkValidVertical(array, arraycheck) {
  let notValid = array.some((squares) => squares <= 0 || squares > max*max);
  if (!arraycheck|| notValid) {
    return false;
  }
  else {
    return true;
  }
}

function checkValidHorizontal(array, arraycheck) {
  let outside = 0;
  for (let i = 0; i < array.length-1; i++) {
    if (array[i] % max == 0 && array[i+1] % max == 1) {
      outside = 1;
    }
  }
  if (!arraycheck||outside){
    return false;
  }
  else {
    return true;
  }
}

function checkStart(finalArray){
  if(finalArray.length >= 1){
    start.disabled = false;
    resetLocation.disabled = false;
}
}

function pushToFinalArray(array, finalArray){
  if (array.length !== 0){
    finalArray.push(array);
  }
}

function getShipOnGrid(side, obj, taken){
  let ships = document.querySelectorAll(`.${side} > .${taken}`);
  ships.forEach(function(ship) {
    obj.ship.push(ship.getAttribute("id"));
  });
}

//GAME PORTION//

function startGame() {
  for (let box of aiGrid.childNodes) {
    box.classList.add("hover");
    box.addEventListener("click", fireMissle);
    box.addEventListener("click", createRipple)
  }
  if(!soundOn){
    startAudio.volume = 0.2;
    startAudio.play();
    startAudio.currentTime = 0;
  }
  start.disabled = true;
  resetLocation.disabled = true;
  smallNum.disabled = true;
  mediumNum.disabled = true;
  largeNum.disabled = true;
  xLargeNum.disabled = true;
  totalGridSize(max * max);
  renderGameStats();
  getShipOnGrid("ai", computerObj, "taken-c");
  getShipOnGrid("player", playerObj, "taken");
  listOfComputerArray = convertTotalArrayToID(listOfComputerArray, "c");
  listOfPlayerArray = convertTotalArrayToID(listOfPlayerArray, "p");
}
function computerMissle(array) {
  let initialLength = 0;
  let currentLength = computerHit.length;
  if(initialLength === currentLength){
    random = Math.floor(Math.random() * totalSquares.length);
    array.push(`p${totalSquares[random]}`);
    totalSquares.splice(random, 1);
  }
  else if (currentLength > initialLength){
    hitLogic(array);
  }
}
//SEMI-SMART COMPUTER AI ALGORITHM//
function hitLogic(array){
  let nextChoice = [0, 1, 2, 3];
  let nextTarget;
  let counter = true;
  let currentTarget = parseInt(computerHit[computerHit.length-1].substring(1));
  let targetAround = [getSquareAbove(currentTarget), getSquareBelow(currentTarget), getSquareLeft(currentTarget), getSquareRight(currentTarget)]
  targetAround = targetAround.filter(num => num > 0 && num < max*max);
  do{
    if (!(currentTarget%max === 0 || currentTarget%max === 1 )){
      let chooseTarget = Math.floor(Math.random() * nextChoice.length);
      if(nextChoice[chooseTarget] === 0){
        nextTarget = getSquareAbove(currentTarget);
      }
      else if(nextChoice[chooseTarget] === 1){
        nextTarget = getSquareBelow(currentTarget);
      }
      else if(nextChoice[chooseTarget] === 2){
        nextTarget = getSquareLeft(currentTarget);
      }
      else if(nextChoice[chooseTarget] === 3){
        nextTarget = getSquareRight(currentTarget);
      }
    }
    else {
      nextChoice = [0, 1, 2];
      chooseTarget = Math.floor(Math.random() * nextChoice.length);
      if(currentTarget%max === 0){
        targetAround = [getSquareAbove(currentTarget), getSquareBelow(currentTarget), getSquareLeft(currentTarget)]
        targetAround = targetAround.filter(num => num > 0 && num < max*max);
        if(nextChoice[chooseTarget] === 0){
          nextTarget = getSquareAbove(currentTarget);
        }
        else if(nextChoice[chooseTarget] === 1){
          nextTarget = getSquareBelow(currentTarget);
        }
        else if(nextChoice[chooseTarget] === 2){
          nextTarget = getSquareLeft(currentTarget)
        }
      }
      else if(currentTarget%max === 1){
        targetAround = [getSquareAbove(currentTarget), getSquareBelow(currentTarget), getSquareRight(currentTarget)]
        targetAround = targetAround.filter(num => num > 0 && num < max*max);
        if(nextChoice[chooseTarget] === 0){
          nextTarget = getSquareAbove(currentTarget);
        }
        else if(nextChoice[chooseTarget] === 1){
          nextTarget = getSquareBelow(currentTarget);
        }
        else if(nextChoice[chooseTarget] === 2){
          nextTarget = getSquareRight(currentTarget);
        }
      }
    }
  if(targetAround.every(num => (array.map(x => parseInt(x.substring(1))).includes(num)))){
    initialLength = computerHit.length;
    random = Math.floor(Math.random() * totalSquares.length);
    array.push(`p${totalSquares[random]}`);
    totalSquares.splice(random, 1);
    counter = false;
    break;
  }

} while(totalSquares.indexOf(nextTarget) === -1);
  if (counter === true){
  array.push(`p${nextTarget}`);
  totalSquares.splice(totalSquares.indexOf(nextTarget), 1);
  counter = true; }
}


function getSquareAbove(num){
  let newTarget = num - max;
  return newTarget;
}

function getSquareBelow(num){
  let newTarget = num + max;
  return newTarget;
}

function getSquareLeft(num){
  let newTarget = num - 1;
  return newTarget;
}

function getSquareRight(num){
  let newTarget = num + 1;
  return newTarget;
}

function shipSunkLogic(side, totalShips) {
  let shipArray = [];
  for (let i = 0; i< totalShips.length; i++) {
      let res = totalShips[i].filter(f => !side.includes(f));
      shipArray.push(res); 
  }
  return shipArray
}

function calculateShipSunk(){
  listOfComputerArray = (shipSunkLogic(playerHit, listOfComputerArray));
  for (let i = 0; i<listOfComputerArray.length; i++) {
    if (listOfComputerArray[i].length === 0) {
      listOfComputerArray.splice(i, 1)
      listOfComputerArray.length;
    }
  }
  listOfPlayerArray = (shipSunkLogic(computerHit, listOfPlayerArray));
  for (let i = 0; i<listOfPlayerArray.length; i++) {
    if (listOfPlayerArray[i].length === 0) {
      listOfPlayerArray.splice(i, 1)
      listOfPlayerArray.length;
    }
  }
}

function convertTotalArrayToID(totalArray, id) {
  totalArray = totalArray.map(array => array.map(a => `${id}${a}`));
  return totalArray;
}

function fireMissle(evt) {
  if (!playerObj.hit.includes(evt.target.id)) {
    evt.target.innerHTML = "X";
    playerObj.hit.push(evt.target.id);
    computerMissle(computerObj.hit, "p");
    document.getElementById(computerObj.hit[computerObj.hit.length-1]).innerHTML = "X";
  }
  if(!soundOn){
    explosionAudio.volume = 0.2;
    explosionAudio.play();
    explosionAudio.currentTime = 0;
  }
  checkHit();
  calculateShipSunk();
  renderGameStats();
  renderWinningMessage()
}

function checkHit() {
  for (let i = 0; i<computerObj.hit.length; i++){
    if (playerObj.ship.includes(computerObj.hit[i])){
      computerHit.push(computerObj.hit[i]);
    }}
  computerHit = [... new Set(computerHit)];
  addHitEffect(computerHit);
  playerHit = computerObj.ship.filter((x) => playerObj.hit.includes(x));
  addHitEffect(playerHit);
}

function addHitEffect(array){
  array.forEach(function (id) {
    document.getElementById(id).classList.add("hit");
  })
}

function renderGameStats() {
  turn.innerHTML = playerObj.hit.length;
  hitByPlayer.innerHTML = listOfComputerArray.length;
  hitByComputer.innerHTML = listOfPlayerArray.length;
}

function renderWinningMessage(){
  if(listOfComputerArray.length === 0){
    gameEndMessage.innerHTML = `Congratulations! You shot down all of the enemy's ship!`;
    winningAudio.volume = 0.2;
    winningAudio.play();
    winningAudio.currentTime = 0;
    disableMissleAfterWin();
    gameEndMessage.parentNode.parentNode.style.display = "block";
  }
  else if (listOfPlayerArray.length === 0) {
    for (let grid of aiGrid.querySelectorAll(".taken-c")) {
      grid.classList.replace("taken-c", "taken");
    }
    gameEndMessage.innerHTML = `The computer has shot down all of player's ship!`;
    losingAudio.volume = 0.2;
    losingAudio.play();
    losingAudio.currentTime = 0;
    disableMissleAfterWin();
    gameEndMessage.parentNode.parentNode.style.display = "block";
  }
}

function disableMissleAfterWin(){
  for (let box of aiGrid.querySelectorAll(".grid-item")) {
    box.classList.remove("hover");
    box.removeEventListener("click", fireMissle);
  }
}

function resetHistory() {
  for (let grid of document.querySelectorAll(".grid-item")) {
    grid.classList.remove("hit", "taken", "taken-c");
    grid.removeEventListener("click", createRipple);
    grid.innerHTML = "";
  }
  playerObj.ship = [];
  playerObj.hit = [];
  computerObj.ship = [];
  computerObj.hit = [];
  computerHit = [];
  playerHit = [];
  listOfComputerArray = [];
  listOfPlayerArray = [];
  turn.innerHTML = "";
  hitByPlayer.innerHTML = "";
  hitByComputer.innerHTML = "";
  smallNum.value = 1;
  mediumNum.value = 2;
  largeNum.value = 1;
  xLargeNum.value = 1;
  start.disabled = true;
  resetLocation.disabled = true;
  smallNum.disabled = false;
  mediumNum.disabled = false;
  largeNum.disabled = false;
  xLargeNum.disabled = false;
  if (!soundOn) {
      seaAudio.play();
  }
  clearAllShips();
  makeStandardShip();
  initialize();
}

function emptyInitialGrid(){
  while (playerGrid.firstChild) {
    playerGrid.removeChild(playerGrid.firstChild);
  }
  while (aiGrid.firstChild) {
    aiGrid.removeChild(aiGrid.firstChild);
  }
}

function clearAllShips() {
  let ships = document.querySelectorAll(".ships");
  for (let ship of ships) {
    ship.remove();
  }
}

function clearSpecificShipType(type) {
  let ships = document.querySelectorAll(`.${type} .ships`);
  for (let ship of ships) {
    ship.remove();
  }
}

function soundToggle(evt) {
  if (seaAudio.paused) {
    evt.target.innerHTML = "Sound: ON&nbsp&nbsp";
    seaAudio.volume = 0.5;
    seaAudio.play();
    soundOn = 0;
  } else {
    evt.target.innerHTML = "Sound: OFF";
    seaAudio.pause();
    soundOn = 1;
  }
}

function createRipple(evt){
  let ripple = document.querySelector(".ripple");
  let clonedRipple = ripple.cloneNode(true);
  clonedRipple.classList.add("animate");
  clonedRipple.style.left = `${evt.clientX}px`;
  clonedRipple.style.top = `${evt.clientY}px`;
  ripple.parentNode.replaceChild(clonedRipple, ripple);
}

