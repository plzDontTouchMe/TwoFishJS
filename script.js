const fs = require('fs');
class TwoFish{
    #arrayKeys = [];
    #key;
    #k;
    #r = 16;
    constructor(key, k) {
        this.#k = k;
        this.#key = key
        this.generationSubKeys(key);
    }
    generationSubKeys(key){
        let M_e = '';
        let M_0 = '';
        for (let i = 0; i < key.length; i += 8) {
            M_e += this.getByteByText(key.charCodeAt(i), 8) + this.getByteByText(key.charCodeAt(i + 1), 8) + this.getByteByText(key.charCodeAt(i + 2), 8) + this.getByteByText(key.charCodeAt(i + 3), 8);
            M_0 += this.getByteByText(key.charCodeAt(i + 4), 8) + this.getByteByText(key.charCodeAt(i + 5), 8) + this.getByteByText(key.charCodeAt(i + 6), 8) + this.getByteByText(key.charCodeAt(i + 7), 8);
        }
        for (let i = 0, p = Math.pow(2, 24) + Math.pow(2, 16) + Math.pow(2, 8) + 1; i < this.#r; i++){ //2^25
            let A = this.h(2 * i * p, M_e); //2^30
            //let B = this.ROL(this.h((2 * i + 1) * p, M_0), 8);
        }
    }
    h(value, subKeyByte){
        let count = parseFloat(subKeyByte.length) / 64 * 2;
        let tempArray = new Array(count + 1);
        for(let i = 0; i < tempArray.length; i++){
            //tempArray[i] =
        }
        for (let i = 0; i < count; i++){
        }
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
const key = fs.readFileSync("key.txt", "ascii").toString().split('\n')[0].slice(0, -1);
const k = fs.readFileSync("key.txt", "ascii").toString().split('\n')[1];
const twoFish = new TwoFish(key, k);
twoFish.encode(text);