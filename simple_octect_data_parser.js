/**
 * Convert a JavaScript number to IEEE 754 bytes
 * @param {number} num - The number to convert
 * @param {number} precision - 32 for float32, 64 for float64
 * @param {boolean} littleEndian - true for little-endian, false for big-endian
 * @returns {Uint8Array} - Raw bytes of the IEEE 754 representation
 */
function toIEEE754Bytes(num, precision = 64, littleEndian = false) {
    if (typeof num !== 'number' || (!isFinite(num) && !isNaN(num) === false)) {
        throw new Error("Input must be a number (finite, NaN, or Infinity).");
    }
    if (![32, 64].includes(precision)) {
        throw new Error("Precision must be 32 or 64.");
    }

    const byteLength = precision / 8;
    const buffer = new ArrayBuffer(byteLength);
    const view = new DataView(buffer);

    if (precision === 32) {
        view.setFloat32(0, num, littleEndian);
    } else {
        view.setFloat64(0, num, littleEndian);
    }

    return new Uint8Array(buffer);
}

function Uint32(bytes) {
    return (BigInt(bytes[0])<<24n)|(BigInt(bytes[1])<<16n)|(BigInt(bytes[2])<<8n)|BigInt(bytes[3])
}

function Uint64(bytes){
    return (BigInt(bytes[0])<<56n) |
           (BigInt(bytes[1])<<48n) |
           (BigInt(bytes[2])<<40n) |
           (BigInt(bytes[3])<<32n) |
           (BigInt(bytes[4])<<24n) |
           (BigInt(bytes[5])<<16n) |
           (BigInt(bytes[6])<<8n) |
           BigInt(bytes[7])
}

/**
 * Convert IEEE 754 bytes back to a JavaScript number
 * @param {Uint8Array} bytes - Raw IEEE 754 bytes
 * @param {number} precision - 32 for float32, 64 for float64
 * @param {boolean} littleEndian - true if bytes are little-endian
 * @returns {number} - Decoded JavaScript number
 */
function fromIEEE754Bytes(bytes, precision = 64, littleEndian = false) {
    if (!(bytes instanceof Uint8Array)) {
        throw new Error("Input must be a Uint8Array.");
    }
    if (![32, 64].includes(precision)) {
        throw new Error("Precision must be 32 or 64.");
    }
    const byteLength = precision / 8;
    if (bytes.length !== byteLength) {
        throw new Error(`Byte array length must be ${byteLength} for ${precision}-bit precision.`);
    }

    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const view = new DataView(buffer);

    return precision === 32
        ? view.getFloat32(0, littleEndian)
        : view.getFloat64(0, littleEndian);
}

/**
 * Convert SODF to JS Array
 * @param {Uint8Array | ArrayBuffer | Array | String} view - Bytes
 * @returns {Object} - Decoded Simple Octect Data File
 */
function readSODF(view){
    let bytes = [...view]
    if(typeof view == 'string'){
        bytes = view.split('').map(x=>x.charCodeAt(0))
    }

    let dataObj = [], step = 0

    while(step < bytes.length){
        let byte = bytes[step]

        sw: switch(byte){
            case 0:
                dataObj.push(null)
                step++
                break sw;
            case 1: 
            case 2: 
                dataObj.push(!!(byte-1))
                step++
                break sw;
            case 3: {
                dataObj.push(bytes[step+1])
                step+=2
                break sw;
            }
            case 4: {
                dataObj.push(Uint32(bytes.slice(step+1,step+5)))
                step+=5
                break sw;
            }
            case 5: {
                dataObj.push(Uint64(bytes.slice(step+1,step+9)))
                step+=9
                break sw;
            }
            case 6: {
                dataObj.push(fromIEEE754Bytes(bytes.slice(step+1,step+5),32,false))
                step+=5
                break sw;
            }
            case 7: {
                dataObj.push(fromIEEE754Bytes(bytes.slice(step+1,step+9),64,false))
                step+=9
                break sw;
            }
            case 8: {
                dataObj.push(String.fromCharCode(bytes[step+1]))
                step+=2
                break sw;
            }
            case 9: {
                let len = bytes[step+1]
                let val = bytes.slice(step+2,step+2+len).map(k=>String.fromCharCode(k)).join('')
                dataObj.push(val)
                step+=2+len
                break sw;
            }
            case 0xA: {
                let len = (bytes[step+1]<<8)|bytes[step+2]
                let val = bytes.slice(step+3,step+3+len).map(k=>String.fromCharCode(k)).join('')
                dataObj.push(val)
                step+=3+len
                break sw;
            }
            case 0xB: {
                let len = Number(Uint32(bytes.slice(step+1,step+5)))
                let val = bytes.slice(step+5,step+5+len).map(k=>String.fromCharCode(k)).join('')
                dataObj.push(val)
                step+=5+len
                break sw;
            }
        }
    }
}