let q0 = [
    [ 8, 1, 7, 13, 6, 15, 3, 2, 0, 11, 5, 9, 14, 12, 10, 4 ],
    [ 14, 12, 11, 8, 1, 2, 3, 5, 15, 4, 10, 6, 7, 0, 9, 13 ],
    [ 11, 10, 5, 14, 6, 13, 9, 0, 12, 8, 15, 3, 2, 4, 7, 1 ],
    [ 13, 7, 15, 4, 1, 2, 6, 14, 9, 11, 3, 0, 8, 5, 12, 10 ]
]
let q1 = [
    [ 2, 8, 11, 13, 15, 7, 6, 14, 3, 1, 9, 4, 0, 10, 12, 5 ],
    [ 1, 14, 2, 11, 4, 12, 3, 7, 6, 13, 10, 5, 15, 9, 0, 8 ],
    [ 4, 12, 7, 5, 1, 6, 9, 10, 0, 14, 13, 8, 2, 11, 3, 15 ],
    [ 11, 9, 5, 1, 12, 3, 13, 14, 6, 4, 7, 15, 2, 0, 8, 10 ]
]
let q = [
    [ 1, 0, 0, 1 ],
    [ 1, 1, 0, 0 ],
    [ 0, 1, 0, 1 ],
    [ 0, 0, 1, 1 ],
    [ 1, 0, 1, 0 ]
]
let MDS = [
    [ 1, 239, 91, 91 ],
    [ 91, 239, 239, 1 ],
    [ 239, 91, 1, 239 ],
    [ 239, 1, 239, 91 ]
]

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
function ROR(byte, shiftCount){
    byte = byte.slice(byte.length - shiftCount, byte.length) + byte.slice(0, byte.length - shiftCount)
    return byte;
}
function permutation(x, qTable){
    let value = getValueByByte(x, 8);
    let a0 = value / 16;
    let b0 = value % 16;
    let a1 = a0 ^ b0;
    let b1 = a0 ^ getValueByByte(ROR(getByteByValue(b0), 1)) ^ ((8 * a0) % 16);
    let a2 = qTable[0][a1 % 8];
    let b2 = qTable[1][b1 % 8];
    let a3 = a2 ^ b2;
    let b3 = a2 ^ getValueByByte(ROR(getByteByValue(b2), 1)) ^ ((8 * a2) % 16);
    let a4 = qTable[2][a3 % 8];
    let b4 = qTable[3][b3 % 8];
    return 16 * b4 + a4;
}
function multiplyVectorByMatrix(matrix, vector) {
    var result = [];
    var rows = matrix.length;
    var cols = matrix[0].length;
    for (var i = 0; i < cols; i++) {
        var sum = 0;
        for (var j = 0; j < rows; j++) {
            sum += matrix[i][j] * vector[j];
        }
        result[i] = sum;
    }
    return result;
}
function test1 (value, subKeyByte){
    for (let i = 0, indexM = subKeyByte.length - 1; i <= subKeyByte.length; i++){
        let tempQ = new Array(4);
        let qByte = '';
        for(let j = 0; j < 4; j++){
            tempQ[j] = value.slice(j * 8, (j + 1) * 8);
            let y = q[i][j] === 1 ? permutation(tempQ[j], q1) : permutation(tempQ[j], q0);
            qByte += getByteByValue(y, 8);
        }
        if(i === subKeyByte.length){
            let tempArray = new Array(4)
            for(let j = 0; j < 4; j++){
                tempArray[j] = getValueByByte(qByte.slice(j * 8, (j + 1) * 8), 8);
            }
            console.log(tempArray);
            console.log(MDS);
            tempArray = multiplyVectorByMatrix(MDS, tempArray);
            console.log(tempArray);
            let resultByte = '';
            for(let j = 0; j < 4; j++){
                tempArray[j] = tempArray[j] % 2**8
                resultByte += getByteByValue(tempArray[j], 8);
            }
            console.log(tempArray);
            console.log(resultByte);
            return getValueByByte(resultByte, 32);
        }
        value = '';
        for(let j = 0; j < qByte.length; j++){
            value += qByte[j] ^ subKeyByte[indexM][j];
        }
    }
}
function Determinant(A)   // Используется алгоритм Барейса, сложность O(n^3)
{
    var N = A.length, B = [], denom = 1, exchanges = 0;
    for (var i = 0; i < N; ++i)
    { B[ i ] = [];
        for (var j = 0; j < N; ++j) B[ i ][j] = A[ i ][j];
    }
    for (var i = 0; i < N-1; ++i)
    { var maxN = i, maxValue = Math.abs(B[ i ][ i ]);
        for (var j = i+1; j < N; ++j)
        { var value = Math.abs(B[j][ i ]);
            if (value > maxValue){ maxN = j; maxValue = value; }
        }
        if (maxN > i)
        { var temp = B[ i ]; B[ i ] = B[maxN]; B[maxN] = temp;
            ++exchanges;
        }
        else { if (maxValue == 0) return maxValue; }
        var value1 = B[ i ][ i ];
        for (var j = i+1; j < N; ++j)
        { var value2 = B[j][ i ];
            B[j][ i ] = 0;
            for (var k = i+1; k < N; ++k) B[j][k] = (B[j][k]*value1-B[ i ][k]*value2)/denom;
        }
        denom = value1;
    }
    if (exchanges%2) return -B[N-1][N-1];
    else return B[N-1][N-1];
}
function AdjugateMatrix(A)   // A - двумерный квадратный массив
{
    var N = A.length, adjA = [];
    for (var i = 0; i < N; i++)
    { adjA[ i ] = [];
        for (var j = 0; j < N; j++)
        { var B = [], sign = ((i+j)%2==0) ? 1 : -1;
            for (var m = 0; m < j; m++)
            { B[m] = [];
                for (var n = 0; n < i; n++)   B[m][n] = A[m][n];
                for (var n = i+1; n < N; n++) B[m][n-1] = A[m][n];
            }
            for (var m = j+1; m < N; m++)
            { B[m-1] = [];
                for (var n = 0; n < i; n++)   B[m-1][n] = A[m][n];
                for (var n = i+1; n < N; n++) B[m-1][n-1] = A[m][n];
            }
            adjA[ i ][j] = sign*Determinant(B);   // Функцию Determinant см. выше
        }
    }
    return adjA;
}
function InverseMatrix(A)   // A - двумерный квадратный массив
{
    var det = Determinant(A);                // Функцию Determinant см. выше
    if (det == 0) return false;
    var N = A.length, A = AdjugateMatrix(A); // Функцию AdjugateMatrix см. выше
    for (var i = 0; i < N; i++)
    { for (var j = 0; j < N; j++) A[ i ][j] /= det; }
    return A;
}

function test2 (value, subKeyByte){
    console.log(value);
    let tempArray = new Array(4);
    for(let i = 0; i < 4; i++){
        tempArray[i] = getValueByByte(value.slice(i * 8, (i + 1) * 8), 8);
    }
    //tempArray = [ 72261, 83663, 127657, 94637 ];
    console.log(tempArray);
    let arr = InverseMatrix(MDS);
    console.log(arr);
    tempArray = multiplyVectorByMatrix(arr, tempArray);
    console.log(tempArray);
    let result = 0;
    for(let j = 0; j < 4; j++){
        result += tempArray[j] % 2**8;
    }
    return result;

}

test1('01001000011011110110110101111001', [
        '01001000011011110110110101111001',
        '01000100011011010110100101110100'
    ]
)

test2('01000101110011111010100110101101', [
        '01001000011011110110110101111001',
        '01000100011011010110100101110100'
    ]
)