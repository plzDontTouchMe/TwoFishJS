const fs = require('fs');
class TwoFish{
    #key;
    #k;
    #r = 1;
    #arraySubKeys = new Array(40);
    #q0 = [
        [ 8, 1, 7, 13, 6, 15, 3, 2, 0, 11, 5, 9, 14, 12, 10, 4 ],
        [ 14, 12, 11, 8, 1, 2, 3, 5, 15, 4, 10, 6, 7, 0, 9, 13 ],
        [ 11, 10, 5, 14, 6, 13, 9, 0, 12, 8, 15, 3, 2, 4, 7, 1 ],
        [ 13, 7, 15, 4, 1, 2, 6, 14, 9, 11, 3, 0, 8, 5, 12, 10 ]
    ]
    #q1 = [
        [ 2, 8, 11, 13, 15, 7, 6, 14, 3, 1, 9, 4, 0, 10, 12, 5 ],
        [ 1, 14, 2, 11, 4, 12, 3, 7, 6, 13, 10, 5, 15, 9, 0, 8 ],
        [ 4, 12, 7, 5, 1, 6, 9, 10, 0, 14, 13, 8, 2, 11, 3, 15 ],
        [ 11, 9, 5, 1, 12, 3, 13, 14, 6, 4, 7, 15, 2, 0, 8, 10 ]
    ]
    #q = [
        [ 1, 0, 0, 1 ],
        [ 1, 1, 0, 0 ],
        [ 0, 1, 0, 1 ],
        [ 0, 0, 1, 1 ],
        [ 1, 0, 1, 0 ]
    ]
    #MDS = [
        [ 1, 239, 91, 91 ],
        [ 91, 239, 239, 1 ],
        [ 239, 91, 1, 239 ],
        [ 239, 1, 239, 91 ]
    ]
    #RS = [
        [ 1, 164, 85, 135, 90, 88, 219, 158 ],
        [ 164, 86, 130, 243, 30, 198, 104, 229 ],
        [ 2, 161, 252, 193, 71, 174, 61, 25 ],
        [ 164, 85, 135, 90, 88, 219, 158, 3 ]
    ]
    #S = [];
    #a = 2;
    #b = 7;
    #n = 251;
    constructor(key, k) {
        this.#k = k;
        if(key.length > 32){
            key = key.slice(0, 32);
        }
        this.#key = key;
        this.generationSubKeys(key);
        if(this.#key.length < 24){
            this.#q.shift();
            if(this.#key.length.length < 16) {
                this.#q.shift();
            }
        }
    }
    generationSubKeys(key){
        let M_e = [];
        let M_0 = [];
        let tempArray = []
        for (let i = 0; i < key.length;i++) {
            tempArray.push(key.charCodeAt(i));
        }
        for (let i = 0; i < tempArray.length;i+=8) {
            let temp = (this.multiplyVectorByMatrix(tempArray.slice(i, i + 8), this.#RS)).slice(0, 4);
            let sum = 0;
            for(let j = 0; j < temp.length; j++){
                sum += temp[j];
            }
            this.#S.push(this.getByteByValue(sum, 32));
        }
        for (let i = 0; i < key.length; i += 8) {
            M_e.push(this.getByteByValue(key.charCodeAt(i), 8) + this.getByteByValue(key.charCodeAt(i + 1), 8) + this.getByteByValue(key.charCodeAt(i + 2), 8) + this.getByteByValue(key.charCodeAt(i + 3), 8));
            M_0.push(this.getByteByValue(key.charCodeAt(i + 4), 8) + this.getByteByValue(key.charCodeAt(i + 5), 8) + this.getByteByValue(key.charCodeAt(i + 6), 8) + this.getByteByValue(key.charCodeAt(i + 7), 8));
        }
        for (let i = 0, p = 2**24 + 2**16 + 2**8 + 1; i < (this.#r + 4) * 2; i+=2){ //2^25
            let A = this.h(2 * i * p, M_e); //2^30
            let B = this.getValueByByte(this.ROL(this.getByteByValue(this.h((2 * i + 1) * p, M_0), 32), 8), 32);
            this.#arraySubKeys[i] = this.getByteByValue((A + B) % 2**32, 32);
            this.#arraySubKeys[i + 1] = this.ROL(this.getByteByValue((A + B) % 2**32, 32), 9);
        }
    }
    h(value, subKeyByte){
        for (let i = 0, indexM = subKeyByte.length - 1; i <= subKeyByte.length; i++){
            let valueByte = this.getByteByValue(value, 32);
            let tempQ = new Array(4);
            let qByte = '';
            for(let j = 0; j < 4; j++){
                tempQ[j] = valueByte.slice(j * 8, (j + 1) * 8);
                let y = this.#q[i][j] === 1 ? this.permutation(tempQ[j], this.#q1) : this.permutation(tempQ[j], this.#q0);
                qByte += this.getByteByValue(y, 8);
            }
            if(i === subKeyByte.length){
                let tempArray = new Array(4)
                for(let j = 0; j < 4; j++){
                    tempArray[j] = this.getValueByByte(qByte.slice(j * 8, (j + 1) * 8), 8);
                }
                tempArray = this.multiplyVectorByMatrix(tempArray, this.#MDS);
                let result = 0;
                for(let j = 0; j < 4; j++){
                    result += tempArray[j];
                }
                return result;
            }
            let tempByte = '';
            for(let j = 0; j < qByte.length; j++){
                tempByte += qByte[j] ^ subKeyByte[indexM][j];
            }
            value = this.getValueByByte(tempByte, 32);
        }
    }
    multiplyVectorByMatrix(vector, matrix) {
        var result = [];
        var rows = matrix.length;
        var cols = matrix[0].length;
        for (var i = 0; i < cols; i++) {
            var sum = 0;
            for (var j = 0; j < rows; j++) {
                sum += vector[j] * matrix[j][i];
            }
            result[i] = sum;
        }
        return result;
    }
    permutation(x, qTable){
        let value = this.getValueByByte(x, 8);
        let a0 = x / 16;
        let b0 = x % 16;
        let a1 = a0 ^ b0;
        let b1 = a0 ^ this.getValueByByte(this.ROR(this.getByteByValue(b0), 1)) ^ ((8 * a0) % 16);
        let a2 = qTable[0][a1 % 16];
        let b2 = qTable[1][b1 % 16];
        let a3 = a2 ^ b2;
        let b3 = a2 ^ this.getValueByByte(this.ROR(this.getByteByValue(b2), 1)) ^ ((8 * a2) % 16);
        let a4 = qTable[2][a3 % 16];
        let b4 = qTable[3][b3 % 16];
        return 16 * b4 + a4;
    }
    ROR(byte, shiftCount){
        byte = byte.slice(byte.length - shiftCount, byte.length) + byte.slice(0, byte.length - shiftCount)
        return byte;
    }
    ROL(byte, shiftCount){
        byte = byte.slice(shiftCount, byte.length) + byte.slice(0, shiftCount)
        return byte;
    }
    getByteByValue(text, degree){
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
    getValueByByte(text, degree){
        let temp = 0;
        let index = 0;
        for(let i = Math.pow(2, degree - 1); i >= 1; i /= 2){
            temp += text[index] === '1' ? i : 0;
            index++;
        }
        return temp;
    }
    encode(text){
        let encodeText = '';
        let arrayDataBlock = [];
        for(let i = 0; i < text.length; i+=16){
            arrayDataBlock.push(text.slice(i, i + 16));
        }
        for(let i = 0; i < arrayDataBlock.length; i++){
            let temp = '';
            for(let j = 0; j < arrayDataBlock[i].length; j++){
                temp += this.getByteByValue(arrayDataBlock[i].charCodeAt(j), 8);
            }
            console.log('Исходный 128-битный блок: ' + temp)
            temp = this.splitDataBlock(temp);
            console.log('Массив разбиения на 32-бит: ' + temp)
            temp = this.inputWhitening(temp);
            console.log(temp)
            for(let j = 0; j < this.#r; j++){
                //console.log(temp);
                let f = this.f(temp[0], temp[1], j);
                console.log('Результат 1-ой функции f: ' + f[0])
                console.log('Результат 2-ой функции f: ' + f[1])
                let c2 = '', c3 = '';
                temp[3] = this.ROL(temp[3], 1);
                for(let k = 0; k < 32; k++){
                    c2 += f[0][k] ^ temp[2][k];
                    c3 += f[1][k] ^ temp[3][k];
                }
                c2 = this.ROR(c2, 1);
                temp[2] = temp[0];
                temp[3] = temp[1];
                temp[0] = c2;
                temp[1] = c3;
            }
            let cup = temp[0];
            temp[0] = temp[2];
            temp[2] = cup;
            cup = temp[1];
            temp[1] = temp[3];
            temp[3] = cup;
            temp = this.outputWhitening(temp);
            for(let j = 0; j < 4; j++){
                for(let k = 0; k < 4; k++){
                    encodeText += String.fromCharCode(this.getValueByByte(temp[j].slice(k, k + 8), 8));
                }
            }
        }
        return encodeText;
    }
    splitDataBlock(text){
        let tempArray = [];
        for(let i = 0; i < 4; i++){
            tempArray.push(text.slice(i * 32, (i + 1) * 32));
        }
        return tempArray;
    }
    inputWhitening(tempArray){
        for(let i = 0; i < 4; i++){
            let temp = '';
            console.log('Исхдный 32 бит: ' + tempArray[i])
            console.log('Ключи 32 бит: ' + this.#arraySubKeys[i])
            for(let j = 0; j < tempArray[i].length; j++){
                temp += tempArray[i][j] ^ this.#arraySubKeys[i][j];
            }
            tempArray[i] = temp;
            console.log('Результат XOR 32 бит: ' + tempArray[i])
        }
        return tempArray;
    }
    outputWhitening(tempArray){
        for(let i = 0; i < 4; i++){
            let temp = '';
            for(let j = 0; j < tempArray[i].length; j++){
                temp += tempArray[i][j] ^ this.#arraySubKeys[i + 4][j];
            }
            tempArray[i] = temp;
        }
        return tempArray;
    }
    f(r0, r1, round){
        console.log('Полученный 1-й блок: ' + r0);
        console.log('Полученный 2-й блок: ' + r1);
        r1 = this.ROL(r1, 8);
        console.log('Полученный 2-й блок после сдвига: ' + r1);
        let t0 = this.g(r0, this.#S);
        let t1 = this.g(r1, this.#S);
        console.log('Результат 1-й функции g: ' + t0)
        console.log('Результат 2-й функции g: ' + t1)
        let temp = this.PHT(t0, t1);
        console.log('Результат 1-й функции PHT: ' + temp[0])
        console.log('Результат 2-й функции PHT: ' + temp[1])
        temp[0] = this.getByteByValue(((this.getValueByByte(temp[0], 32) + this.getValueByByte(this.#arraySubKeys[2 * round + 8], 32)) % 2**32), 32);
        temp[1] = this.getByteByValue(((this.getValueByByte(temp[1], 32) + this.getValueByByte(this.#arraySubKeys[2 * round + 9], 32)) % 2**32), 32);
        console.log('Результат 1-й функции сложение по модулю 32 с ключом: ' + temp[0])
        console.log('Результат 1-й функции сложение по модулю 32 с ключом: ' + temp[1])
        return temp;
    }
    g(value, subKeyByte){
        for (let i = 0; i <= subKeyByte.length; i++){
            console.log('Исходный value: ' + value);
            let tempQ = new Array(4);
            let qByte = '';
            for(let j = 0; j < 4; j++){
                tempQ[j] = value.slice(j * 8, (j + 1) * 8);
                console.log('Используемый q: ' + tempQ[j])
                let y = this.#q[i][j] === 1 ? this.permutation(tempQ[j], this.#q1) : this.permutation(tempQ[j], this.#q0);
                console.log('Результат перестановки q: ' + this.getByteByValue(y, 8))
                qByte += this.getByteByValue(y, 8);
            }
            if(i === subKeyByte.length){
                let tempArray = new Array(4);
                for(let j = 0; j < 4; j++){
                    tempArray[j] = this.getValueByByte(qByte.slice(j * 8, (j + 1) * 8), 8);
                    console.log('Исходное число: ' + tempArray[j]);
                    tempArray[j] = (tempArray[j] * this.#a + this.#b) % this.#n;
                    console.log('Зашифрованное число: ' + tempArray[j]);
                    //tempArray[j] = ((tempArray[j] - this.#b) * Math.ceil(this.#n / 2)) % this.#n;
                }
                let result = '';
                for(let j = 0; j < 4; j++){
                    result += this.getByteByValue(tempArray[j], 8);
                }
                return result;
            }
            value = '';
            for(let j = 0; j < qByte.length; j++){
                value += qByte[j] ^ subKeyByte[i][j];
            }
        }
    }
    PHT(a, b){

        let tempA = (2 * this.getValueByByte(a, 32) + this.getValueByByte(b, 32)) % 2**32;
        let tempB = (this.getValueByByte(a, 32) + this.getValueByByte(b, 32)) % 2**32;
        return [this.getByteByValue(tempA, 32), this.getByteByValue(tempB, 32)];
    }




}
const text = fs.readFileSync("text.txt", "ascii");
const key = fs.readFileSync("key.txt", "ascii").toString().split('\n')[0].slice(0, -1);
const k = fs.readFileSync("key.txt", "ascii").toString().split('\n')[1];
const twoFish = new TwoFish(key, k);
let encodeText = twoFish.encode(text);
console.log(encodeText);
//let decodeText = twoFish.decode(encodeText);
//console.log(decodeText);