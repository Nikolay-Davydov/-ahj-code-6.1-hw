/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/board.js
class Board {
  constructor(board) {
    this.board = board;
    this.footer = board.querySelector(".footer");
    this.add = board.querySelector(".add_card");
    this.textArea = board.querySelector(".card_text");
    this.board.ondragover = this.drop;
  }
  showAddBlock() {
    this.footer.classList.add("fog");
    this.add.classList.remove("fog");
    this.add.addEventListener("click", e => {
      if (e.target.className == "add_cross") {
        this.closeBlock();
      } else {
        this.addCard();
      }
    });
  }
  addCard() {
    let cardValue = this.textArea.value;
    if (cardValue != "") {
      this.createCard(this.getId(), cardValue);
      this.saveCard(cardValue);
      this.closeBlock();
      this.textArea.value = "";
    }
  }
  createCard(id, cardValue) {
    const card = document.createElement("div");
    const cross = document.createElement("div");
    cross.innerHTML = "&#10006;";
    card.id = id;
    card.draggable = "true";
    card.classList.add("card");
    cross.classList.add("cross");
    cross.classList.add("fog");
    card.innerText = cardValue;
    card.append(cross);
    this.board.append(card);
  }
  getId() {
    let idNums = JSON.parse(localStorage.getItem(this.board.classList[1]));
    if (idNums == null) {
      return `1${this.board.classList[1]}`;
    } else {
      return String(Number(String(Object.keys(idNums).slice(-1)).replace(/[^0-9]/g, "")) + 1) + String(this.board.classList[1]);
    }
  }
  saveCard(cardValue) {
    const jsn = JSON.parse(localStorage.getItem(this.board.classList[1]));
    const id = this.getId();
    const newValue = {};
    newValue[id] = cardValue;
    if (jsn == null) {
      localStorage.setItem(this.board.classList[1], JSON.stringify(newValue));
    } else {
      let local = JSON.parse(localStorage.getItem(this.board.classList[1]));
      local[id] = cardValue;
      localStorage.setItem(this.board.classList[1], JSON.stringify(local));
    }
  }
  delCard(element) {
    const id = element.id;
    const local = JSON.parse(localStorage.getItem(this.board.classList[1]));
    delete local[id];
    localStorage.setItem(this.board.classList[1], JSON.stringify(local));
    element.remove();
  }
  closeBlock() {
    this.textArea.value = "";
    this.footer.classList.remove("fog");
    this.add.classList.add("fog");
  }
  saveState() {
    localStorage.removeItem(this.board.classList[1]);
    for (let card of this.board.children) {
      if (card.className == "card") {
        this.saveCard(card.innerText.replace(/[^a-zа-яё0-9\s]/gi, ""));
      }
    }
  }
}
;// CONCATENATED MODULE: ./src/js/app.js

class Trello {
  constructor() {
    this.card = undefined;
    this.cardParent = undefined;
    this.columns = document.querySelector(".column");
    this.cards = document.querySelectorAll(".card");
    this.table = {
      todo: new Board(document.querySelector(".todo")),
      inprogress: new Board(document.querySelector(".inprogress")),
      done: new Board(document.querySelector(".done"))
    };
  }
  drag() {
    const main = document.querySelector(".table");
    let elemBelow = "";
    let lastCard = "";
    let dragCardSize = "";
    let dragCard = "";
    main.addEventListener("dragenter", e => {
      if (e.target.classList.contains("column")) {
        e.target.classList.add("drop");
      }
    });
    main.addEventListener("dragleave", e => {
      if (e.target.classList.contains("drop")) {
        e.target.classList.remove("drop");
      }
    });
    main.addEventListener("dragstart", e => {
      if (e.target.classList.contains("card")) {
        e.dataTransfer.setData("text/plain", e.target.id);
        dragCardSize = e.target.offsetHeight;
        dragCard = e.target;
        setTimeout(() => {
          dragCard.classList.add("fog");
        }, 0);
      }
    });
    main.addEventListener("dragover", e => {
      e.preventDefault();
      elemBelow = e.target;
      if (elemBelow.classList.contains("card")) {
        if (elemBelow.id != lastCard.id && lastCard != "") {
          lastCard.style.marginTop = "20px";
        }
        lastCard = e.target;
        elemBelow.style.marginTop = `${dragCardSize + 10}px`;
      }
    });
    main.addEventListener("drop", e => {
      dragCard.classList.remove("fog");
      const card = main.querySelector(`[id="${e.dataTransfer.getData("text/plain")}"]`);
      if (elemBelow === card) {
        return;
      }
      if (elemBelow.classList.contains("card")) {
        const center = elemBelow.getBoundingClientRect().y + elemBelow.getBoundingClientRect().height / 2;
        if (e.clientY > center) {
          if (elemBelow.nextElementSibling !== null) {
            elemBelow = elemBelow.nextElementSibling;
          } else {
            return;
          }
        }
        elemBelow.parentElement.insertBefore(card, elemBelow);
      }
      if (e.target.classList.contains("column")) {
        if (lastCard && elemBelow.classList[1] == lastCard.parentElement.classList[1]) {
          lastCard.parentElement.insertBefore(card, lastCard);
          card.style.marginTop = "20px";
          lastCard.style.marginTop = "20px";
          this.saveState();
          this.cleanState();
          return;
        }
        e.target.append(card);
      }
      this.saveState();
      this.cleanState();
    });
  }
  listener() {
    this.drag();
    document.addEventListener("click", e => {
      if (e.target.className == "footer") {
        this.table[e.target.parentElement.classList[1]].showAddBlock();
      }
      if (e.target.className == "cross") {
        const parent = e.target.parentElement.parentElement.classList[1];
        this.table[parent].delCard(e.target.parentElement);
      }
    });
    document.addEventListener("mouseover", e => {
      if (e.target.classList[0] == "card") {
        let cross = e.target.querySelector(".cross");
        cross.classList.remove("fog");
        cross = "";
      }
    });
    document.addEventListener("mouseout", e => {
      if (e.target.classList[0] == "card") {
        let cross = e.target.querySelector(".cross");
        setTimeout(() => {
          cross.classList.add("fog");
          cross = "";
        }, 1200);
      }
    });
  }
  localStateRead() {
    if (localStorage.length == 0) {
      return;
    } else {
      for (let key in localStorage) {
        if (localStorage.getItem(key) != null) {
          this.restoreState(key, localStorage.getItem(key));
        }
      }
    }
  }
  restoreState(key, value) {
    const values = JSON.parse(value);
    for (let jkey in values) {
      this.table[key].createCard(jkey, values[jkey]);
    }
  }
  cleanState() {
    const allCards = document.querySelectorAll(".card");
    for (let card of allCards) {
      card.remove();
    }
    this.localStateRead();
  }
  saveState() {
    for (let column of Object.keys(this.table)) {
      this.table[column].saveState();
    }
  }
}
const listener = new Trello();
listener.localStateRead();
listener.listener();

//console.log('lastcrd',lastCard)
//if (elemBelow.classList.contains("card")){
//    console.log('nvjslv')
;// CONCATENATED MODULE: ./src/index.js



// TODO: write your code in app.js
/******/ })()
;