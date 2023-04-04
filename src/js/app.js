import Board from "./board.js";

class Trello{
    constructor(){
        this.card = undefined;
        this.cardParent = undefined;
        this.columns = document.querySelector('.column');
        this.cards = document.querySelectorAll('.card')
        this.table = {
        todo: new Board(document.querySelector('.todo')),
        inprogress: new Board(document.querySelector('.inprogress')),
        done: new Board(document.querySelector('.done')),
        };
    };

    drag(){
        const main = document.querySelector(".table");
        let elemBelow = "";
        let lastCard ="";
        let dragCardSize ="";
        let dragCard ="";

        main.addEventListener("dragenter", (e) => {
            if (e.target.classList.contains("column")) {
            e.target.classList.add("drop");
            };
        });
          
        main.addEventListener("dragleave", (e) => {
            if (e.target.classList.contains("drop")) {
              e.target.classList.remove("drop");
            };
        });

        main.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("card")) {
            e.dataTransfer.setData("text/plain", e.target.id);
            dragCardSize = e.target.offsetHeight;
            dragCard = e.target;
            setTimeout(()=>{
                dragCard.classList.add('fog');
        },0);

            
            }
          });

        main.addEventListener("dragover", (e) => {
            e.preventDefault();
            elemBelow = e.target;
            if (elemBelow.classList.contains("card")){
                if(elemBelow.id != lastCard.id && lastCard !=''){
                    lastCard.style.marginTop = '20px';
                };
                lastCard = e.target;
                elemBelow.style.marginTop = `${dragCardSize+10}px`;

                
            };
        });

        main.addEventListener("drop", (e) => {
            dragCard.classList.remove('fog')
            const card = main.querySelector(`[id="${e.dataTransfer.getData("text/plain")}"]`);
            if (elemBelow === card) {
                return;
            };
            if (elemBelow.classList.contains("card")) {
                const center = elemBelow.getBoundingClientRect().y + elemBelow.getBoundingClientRect().height / 2;
                if (e.clientY > center) {
                    if (elemBelow.nextElementSibling !== null) {
                        elemBelow = elemBelow.nextElementSibling;
                    } else{
                        return;
                    }
                }
                elemBelow.parentElement.insertBefore(card, elemBelow);
            }
            if (e.target.classList.contains("column")) {
                if (lastCard && elemBelow.classList[1]==lastCard.parentElement.classList[1]){
                    lastCard.parentElement.insertBefore(card, lastCard);
                    card.style.marginTop = '20px';
                    lastCard.style.marginTop = '20px';
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

    listener(){
        this.drag();
        document.addEventListener('click',(e)=>{
            if(e.target.className == 'footer'){
                this.table[e.target.parentElement.classList[1]].showAddBlock()
            };
            if(e.target.className == 'cross'){
                const parent = e.target.parentElement.parentElement.classList[1];
                this.table[parent].delCard(e.target.parentElement)
            };
        });
        document.addEventListener("mouseover", (e)=>{  
            if(e.target.classList[0] =='card'){ 
                let cross = e.target.querySelector('.cross')
                cross.classList.remove('fog');
                cross ='';
            };
        });
        document.addEventListener("mouseout", (e)=>{
            if(e.target.classList[0] =='card'){
                let cross = e.target.querySelector('.cross')
                setTimeout(()=>{
                    cross.classList.add('fog');
                    cross ='';
                }, 1200);
           };
        });

    };

    localStateRead(){
        if(localStorage.length == 0){
           return
        } else {
            for (let key in localStorage){
                if(localStorage.getItem(key) != null){
                    this.restoreState(key,localStorage.getItem(key))
                }
            }
        }
    };

    restoreState(key,value){
        const values = JSON.parse(value)
        for (let jkey in values){
            this.table[key].createCard(jkey, values[jkey])
        }
    };

    cleanState(){
        const allCards = document.querySelectorAll('.card');
        for (let card of allCards){
            card.remove()
        };
        this.localStateRead()
    };

    saveState(){
        for (let column of Object.keys(this.table)){
            this.table[column].saveState();
        };
    };

};

const listener = new Trello();


listener.localStateRead();
listener.listener();

//console.log('lastcrd',lastCard)
//if (elemBelow.classList.contains("card")){
//    console.log('nvjslv')

