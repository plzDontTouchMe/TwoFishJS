const fs = require('fs');
class TwoFish{
    arrayKeys = [];
    k = 7;
    constructor(key) {
        this.generationSubKeys(key);
    }
    generationSubKeys(key){

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
    encode(text){
        let arrayDataBlock = [];
        for(let i = 0; i < text.length; i+=16){
            arrayDataBlock.push(text.slice(i, i + 16));
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
    splitDataBlock(text){

    }
}
const text = fs.readFileSync("text.txt", "ascii");
const key = fs.readFileSync("key.txt", "ascii");
const twoFish = new TwoFish(key);
twoFish.encode(text);