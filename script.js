//const fs = require('fs');
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function getByteByValue(text, degree){
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
function getValueByByte(text, degree){
    let temp = 0;
    let index = 0;
    for(let i = Math.pow(2, degree - 1); i >= 1; i /= 2){
        temp += text[index] === '1' ? i : 0;
        index++;
    }
    return temp;
}
var link = '000110011111111100110000001001010001100111111111001100000010010';
var vectorInit = '10101011000010010000011101100100101010110000100100000111011001001010101100001001000001110110010010101011000010010000011101100100';
//Hello, its TwhFish in CFB mode implemented by Dmitry Khomyakov from the O-20-PRI-rps-b group.
class TwoFish{
    #key;
    #k = 0;
    #r = 16;
    #gamma = '';
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
    constructor(key, k, vectorInit) {
        if(k < 2){
            this.#k = 7;
        }
        else {
            this.#k = k;
        }
        if(key.length > 32){
            key = key.slice(0, 32);
        }
        else if(key.length < 16){
            key += ' '.repeat(16 - key.length)
        }
        else if(key.length > 16){
            key += ' '.repeat(24 - key.length)
        }
        else if(key.length > 24){
            key += ' '.repeat(32 - key.length)
        }
        this.#key = key;
        this.generationSubKeys(key);
        if(this.#key.length <= 24){
            this.#q.shift();
            if(this.#key.length <= 16) {
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
        let a0 = this.getValueByByte(this.getByteByValue(value, 8).slice(0, 4), 4);
        let b0 =  this.getValueByByte(this.getByteByValue(value, 8).slice(4, 8), 4);
        let a1 = a0 ^ b0;
        let b1 = a0 ^ this.getValueByByte(this.ROR((this.getByteByValue(b0, 4)), 1), 4) ^ ((8 * a0) % 16);
        let a2 = qTable[0][a1];
        let b2 = qTable[1][b1];
        let a3 = a2 ^ b2;
        let b3 = a2 ^ this.getValueByByte(this.ROR((this.getByteByValue(b2, 4)), 1), 4) ^ ((8 * a2) % 16);
        let a4 = qTable[2][a3];
        let b4 = qTable[3][b3];
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
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    XOR(value1, value2, length){
        let res = '';
        for(let i = 0; i < length; i++){
            res += value1[i] ^ value2[i]
        }
        return res;
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
        arrayDataBlock[arrayDataBlock.length - 1] += ' '.repeat(16 - arrayDataBlock[arrayDataBlock.length - 1].length);
        for(let i = 0; i < arrayDataBlock.length; i++){
            let temp = '';
            for(let j = 0; j < arrayDataBlock[i].length; j++){
                temp += this.getByteByValue(arrayDataBlock[i].charCodeAt(j), 8);
            }
            temp = this.splitDataBlock(temp);
            temp = this.inputWhitening(temp);
            for(let j = 0; j < this.#r; j++){
                temp = this.oneRound(temp, j);
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
                    encodeText += String.fromCharCode(this.getValueByByte(temp[j].slice(k * 8, (k + 1) * 8), 8));
                }
            }

        }
        return encodeText;
    }
    decode(text){
        let decodeText = '';
        let arrayDataBlock = [];
        for(let i = 0; i < text.length; i+=16){
            arrayDataBlock.push(text.slice(i, i + 16));
        }
        for(let i = 0; i < arrayDataBlock.length; i++){
            let temp = '';
            for(let j = 0; j < arrayDataBlock[i].length; j++){
                temp += this.getByteByValue(arrayDataBlock[i].charCodeAt(j), 8);
            }
            temp = this.splitDataBlock(temp);
            temp = this.outputWhitening(temp);
            let cup = temp[0];
            temp[0] = temp[2];
            temp[2] = cup;
            cup = temp[1];
            temp[1] = temp[3];
            temp[3] = cup;
            for(let j = this.#r - 1; j >= 0; j--) {
                temp = this.oneRoundReverse(temp, j);
            }
            temp = this.inputWhitening(temp);
            for(let j = 0; j < 4; j++){
                for(let k = 0; k < 4; k++){
                    decodeText += String.fromCharCode(this.getValueByByte(temp[j].slice(k * 8, (k + 1) * 8), 8));
                }
            }

        }
        return decodeText;
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
            for(let j = 0; j < tempArray[i].length; j++){
                temp += tempArray[i][j] ^ this.#arraySubKeys[i][j];
            }
            tempArray[i] = temp;
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
        let t0 = this.g(r0, this.#S);
        let t1 = this.g(r1, this.#S);
        let temp = this.PHT(t0, t1);
        temp[0] = (temp[0] + this.getValueByByte(this.#arraySubKeys[2 * round + 8], 32)) % 2**32;
        temp[0] = (temp[1] + this.getValueByByte(this.#arraySubKeys[2 * round + 9], 32)) % 2**32;
        return temp;
    }
    g(value, subKeyByte){
        for (let i = 0; i <= subKeyByte.length; i++){
            let tempQ = new Array(4);
            let qByte = '';
            for(let j = 0; j < 4; j++){
                tempQ[j] = value.slice(j * 8, (j + 1) * 8);
                let y = this.#q[i][j] === 1 ? this.permutation(tempQ[j], this.#q1) : this.permutation(tempQ[j], this.#q0);
                qByte += this.getByteByValue(y, 8);
            }
            if(i === subKeyByte.length){
                let tempArray = new Array(4);
                for(let j = 0; j < 4; j++){
                    tempArray[j] = this.getValueByByte(qByte.slice(j * 8, (j + 1) * 8), 8);
                }
                tempArray = this.multiplyVectorByMatrix(tempArray, this.#MDS);
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
        let tempA = (this.getValueByByte(a, 32) + this.getValueByByte(b, 32)) % 2**32;
        let tempB = (this.getValueByByte(a, 32) + 2 * this.getValueByByte(b, 32)) % 2**32;
        return [tempA, tempB];
    }
    oneRound(roundArray, round) {
        let tempRA1 = roundArray[1];
        tempRA1 = this.ROL(tempRA1, 8);
        let f = this.f(roundArray[0], tempRA1, round);
        let c2 = '', c3 = '';
        roundArray[3] = this.ROL(roundArray[3], 1);
        c2 = this.XOR(this.getByteByValue(f[0], 32), roundArray[2], 32);
        c3 = this.XOR(this.getByteByValue(f[1], 32), roundArray[3], 32);
        c2 = this.ROR(c2, 1);
        roundArray[3] = roundArray[1];
        roundArray[2] = roundArray[0];
        roundArray[1] = c3;
        roundArray[0] = c2;
        return roundArray;
    }
    oneRoundReverse(roundArray, round) {
        let tempRA3 = roundArray[3];
        tempRA3 = this.ROL(tempRA3, 8);
        let f = this.f(roundArray[2], tempRA3, round);
        let c2 = '', c3 = '';
        roundArray[0] = this.ROL(roundArray[0], 1);
        c2 = this.XOR(this.getByteByValue(f[0], 32), roundArray[0], 32);
        c3 = this.XOR(this.getByteByValue(f[1], 32), roundArray[1], 32);
        c3 = this.ROR(c3, 1);
        roundArray[0] = roundArray[2];
        roundArray[1] = roundArray[3];
        roundArray[2] = c2;
        roundArray[3] = c3;
        return roundArray;
    }
    getNewByte(textByte){
        let temp = textByte.slice(textByte.length - link.length,textByte.length);
        let res = '';
        for(let i = 0; i < temp.length; i++){
            if(link[i] == 1) res += temp[i];
        }
        let resultByte = '0';
        for(let i = 0; i < res.length; i++){
            resultByte = resultByte ^ res[i];
        }
        return resultByte;
    }
    shiftRegister(textByte){
        let temp = '';
        for(let i = 0; i < 128; i++){
            let newByte = this.getNewByte(textByte);
            textByte = textByte.slice(1, textByte.length) + newByte;
            temp += newByte;
        }
        return temp;
    }
    CFB(text, arrayByte, type){
        let newBlockByte = this.shiftRegister(arrayByte);
        let symbols = '';
        for(let i = 0 ; i < newBlockByte.length; i+=8){
            symbols += String.fromCharCode(this.getValueByByte(newBlockByte.slice(i, i + 8), 8));
        }
        symbols = this.encode(symbols);
        let sybmolsByte = '';
        for(let i = 0; i < symbols.length; i++){
            sybmolsByte += this.getByteByValue(symbols.charCodeAt(i), 8);
        }
        let kByte = sybmolsByte.slice(0, this.#k);
        let textByte = '';
        for(let i = 0; i < text.length; i++){
            textByte += this.getByteByValue(text.charCodeAt(i), 8);
        }
        console.log('Начало: ' + textByte);
        textByte = textByte.slice(this.#gamma.length, this.#gamma.length + this.#k);
        let tempGamma = '';
        for(let i = 0; i < this.#k; i++){
            tempGamma += kByte[i] ^ textByte[i]
        }
        this.#gamma += tempGamma;
        if(type === 1){
            arrayByte = arrayByte.slice(this.#k, arrayByte.length) + tempGamma;
        }
        else{
            arrayByte = arrayByte.slice(this.#k, arrayByte.length) + textByte;
        }
        let res;
        if((this.#gamma.length / 8) < text.length){
            res = this.CFB(text, arrayByte, type);
        }
        else{
            let result = '';
            for(let i = 0 ; i < this.#gamma.length; i+=8){
                result += String.fromCharCode(this.getValueByByte(this.#gamma.slice(i, i + 8), 8));
            }
            console.log('Конец: ' + this.#gamma);
            this.#gamma = '';
            return result;
        }
        return res;
    }
}
function CFBEncode(){
    let checkboxText = document.getElementById('checkboxTextEncode');
    let inputText = document.getElementById('textEncode');
    let text;
    if(checkboxText.checked){
        text = fileTextEncode;
    }
    else{
        text = inputText.value;
    }
    let checkboxKey = document.getElementById('checkboxKeyEncode');
    let inputKey = document.getElementById('keyEncode');
    let key;
    let k = 0;
    if(checkboxKey.checked){
        key = fileKeyEncode;
    }
    else{
        key = inputKey.value;
    }
    k = parseInt(document.getElementById('numberEncode').value);
    console.log('TEXT:' + text);
    console.log('KEY: ' + key);
    console.log('K: ' + k)
    /*let value = getRandomInt(2**32);
    link = getByteByValue(value, 32).repeat(4);
    link = link.slice(0, k - 1);
    value = getRandomInt(2**32);
    vectorInit = getByteByValue(value, 32).repeat(4);
    console.log(vectorInit);
    console.log(link);*/
    let twoFish = new TwoFish(key, k);
    let encodeText = twoFish.CFB(text, vectorInit, 1);
    console.log(encodeText);
    let inputTextDecode = document.getElementById('textDecode');
    inputTextDecode.value = encodeText;
}
function CFBDecode(){
    let checkboxText = document.getElementById('checkboxTextDecode');
    let inputText = document.getElementById('textDecode');
    let text;
    if(checkboxText.checked){
        text = fileTextDecode;
    }
    else{
        text = inputText.value;
    }
    let checkboxKey = document.getElementById('checkboxKeyDecode');
    let inputKey = document.getElementById('keyDecode');
    let key;
    let k = 0;
    if(checkboxKey.checked){
        key = fileKeyDecode;
    }
    else{
        key = inputKey.value;
    }
    k = parseInt(document.getElementById('numberDecode').value);
    console.log('TEXT:' + text);
    console.log('KEY: ' + key);
    console.log('K: ' + k)
    let twoFish = new TwoFish(key, k);
    let decodeText = twoFish.CFB(text, vectorInit, 0);
    console.log(decodeText);
    let inputTextEncode = document.getElementById('textEncode');
    inputTextEncode.value = decodeText;
}
function switchTextEncode(){
    let checkbox = document.getElementById('checkboxTextEncode');
    let text = document.getElementById('textEncode');
    if(checkbox.checked) text.readOnly = true;
    else text.readOnly = false;
}
function switchKeyEncode(){
    let checkbox = document.getElementById('checkboxKeyEncode');
    let text = document.getElementById('keyEncode');
    if(checkbox.checked) text.readOnly = true;
    else text.readOnly = false;
}
function switchTextDecode(){
    let checkbox = document.getElementById('checkboxTextDecode');
    let text = document.getElementById('textDecode');
    if(checkbox.checked) text.readOnly = true;
    else text.readOnly = false;
}
function switchKeyDecode(){
    let checkbox = document.getElementById('checkboxKeyDecode');
    let text = document.getElementById('keyDecode');
    if(checkbox.checked) text.readOnly = true;
    else text.readOnly = false;
}
var fileTextEncode = '';
var fileKeyEncode = '';
var fileTextDecode = '';
var fileKeyDecode = '';
function setFileTextEncode(array){
    let file = array.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        console.log('Файла загружен');
        fileTextEncode = reader.result;
    };
    reader.onerror = function() {
        console.log(reader.error);
    };
}
function setFileKeyEncode(array){
    let file = array.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        console.log('Файла загружен');
        fileKeyEncode = reader.result;
    };
    reader.onerror = function() {
        console.log(reader.error);
    };
}
function setFileTextDecode(array){
    let file = array.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        console.log('Файла загружен');
        fileTextDecode = reader.result;
    };
    reader.onerror = function() {
        console.log(reader.error);
    };
}
function setFileKeyDecode(array){
    let file = array.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        console.log('Файла загружен');
        fileKeyDecode = reader.result;
    };
    reader.onerror = function() {
        console.log(reader.error);
    };
}
function startEncode(){
    let checkboxText = document.getElementById('checkboxTextEncode');
    let inputText = document.getElementById('textEncode');
    let text;
    if(checkboxText.checked){
        text = fileTextEncode;
    }
    else{
        text = inputText.value;
    }
    let checkboxKey = document.getElementById('checkboxKeyEncode');
    let inputKey = document.getElementById('keyEncode');
    let key;
    if(checkboxKey.checked){
        key = fileKeyEncode;
    }
    else{
        key = inputKey.value;
    }
    console.log('TEXT:' + text);
    console.log('KEY: ' + key);
    let twoFish = new TwoFish(key);
    let encodeText = twoFish.encode(text);
    console.log(encodeText);
    let inputTextDecode = document.getElementById('textDecode');
    inputTextDecode.value = encodeText;
}
function startDecode(){
    let checkboxText = document.getElementById('checkboxTextDecode');
    let inputText = document.getElementById('textDecode');
    let text;
    if(checkboxText.checked){
        text = fileTextDecode;
    }
    else{
        text = inputText.value;
    }
    let checkboxKey = document.getElementById('checkboxKeyDecode');
    let inputKey = document.getElementById('keyDecode');
    let key;
    if(checkboxKey.checked){
        key = fileKeyDecode;
    }
    else{
        key = inputKey.value;
    }
    console.log('TEXT:' + text);
    console.log('KEY: ' + key);
    let twoFish = new TwoFish(key);
    let decodeText = twoFish.decode(text);
    console.log(decodeText);
    let inputTextEncode = document.getElementById('textEncode');
    inputTextEncode.value = decodeText;
}
//const text = fs.readFileSync("text.txt", "ascii");
//const key = fs.readFileSync("key.txt", "ascii").toString().split('\n')[0].slice(0, -1);
//const k = fs.readFileSync("key.txt", "ascii").toString().split('\n')[1];
//const twoFish = new TwoFish(key, k);
//let encodeText = twoFish.encode(text);
//console.log(encodeText);
//let decodeText = twoFish.decode(encodeText);
//console.log(decodeText);