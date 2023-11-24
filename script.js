const fs = require('fs');
class TwoFish{
    #text;
    #key;
    arrayKeys = [];
    constructor(text, key) {
        this.#text = text;
        this.#key = key;
    }
    getByteByText(text, degree){
        let temp = '';
        for(let i = Math.pow(2, degree - 1); i >= 1; i /= 2){
            if(text - i >= 0){
                temp += '1';
                text -= i;
            }
            else {
                temp += '0';
            }
        }
        return temp;
    }
    getTextByByte(text, degree){
        let temp = 0;
        let index = 0;
        for(let i = Math.pow(2, degree - 1); i >= 1; i /= 2){
            temp += text[index] === '1' ? i : 0;
            index++;
        }
        return temp;
    }
    generateSubKeys(){
        console.log(this.#key)
    }
    splitDataBlock(text){
        console.log(text);
    }
    encode(){
        this.generateSubKeys();
        let arrayDataBlock = [];
        for(let i = 0; i < this.#text.length; i+=16){
            arrayDataBlock.push(this.#text.slice(i, i + 16));
        }
        for(let i = 0; i < arrayDataBlock.length; i++){
            let temp = '';
            for(let j = 0; j < arrayDataBlock[i].length; j++){
                temp += this.getByteByText(arrayDataBlock[i].charCodeAt(j), 8) + ' ';
                //console.log(String.fromCharCode(arrayDataBlock[i].charCodeAt(j)))
            }
            this.splitDataBlock(temp);
        }
    }
}
const text = fs.readFileSync("text.txt", "ascii");
const key = fs.readFileSync("key.txt", "ascii");
const twoFish = new TwoFish(text, key);
twoFish.encode();