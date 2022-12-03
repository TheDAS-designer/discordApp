import CryptoJS from "crypto-js";   
// key
const SECRET_KEY = CryptoJS.enc.Utf8.parse("");
// iv
const SECRET_IV = CryptoJS.enc.Utf8.parse("");

// window.localStorage,window.sessionStorage,
const config = {
    // storage: window.localStorage
    type: 'localStorage',
    // name prefix
    prefix: 'LoopssBot_0.0.1',
    // expires time
    expire: 30 * 86400 * 1000,
    // encrypt
    isEncrypt: true
}

/**
 * @description:  is Storage
 * @return {*}
 */
export const isSupportStorage = () => {
    return (typeof (Storage) !== "undefined") ? true : false
}
export const isSupportWindow = () => {  
    return (typeof window !== "undefined") ? true : false
}


/**
 * @description: set storage
 * @param {string} key
 * @param {any} value
 * @param {*} expire
 * @return {*}
 */
export const setStorage = (key: string, value: any, expire = 0) => {
    if(!isSupportWindow()) return
    if (value === '' || value === null || value === undefined) {
        value = null;
    }

    if (isNaN(expire) || expire < 0) throw new Error("Expire must be a number");

    expire = (expire ? expire : config.expire) * 1000;
    let data = {
        value: value,
        time: Date.now(),
        expire: expire
    }

    const encryptString = config.isEncrypt
        ? encrypt(JSON.stringify(data))
        : JSON.stringify(data);

    // @ts-ignore    
    window[config.type].setItem(autoAddPrefix(key), encryptString);
}


/**
 * @description:  get storage
 * @param {string} key
 * @return {*}
 */
export const getStorage = (key: string) => {

    key = autoAddPrefix(key);
    // is key not exist
    if(!isSupportWindow()) return
    // @ts-ignore    
    if (!window[config.type].getItem(key) || JSON.stringify(window[config.type].getItem(key)) === 'null') {
        return null;
    }


    const storage = config.isEncrypt
        // @ts-ignore    
        ? JSON.parse(decrypt(window[config.type].getItem(key)))
        // @ts-ignore    
        : JSON.parse(window[config.type].getItem(key));

    let nowTime = Date.now();

    // is expire
    if (storage.expire && config.expire * 6000 < (nowTime - storage.time)) {
        removeStorage(key);
        return null;
    } else {
        // auto add time
        setStorage(autoRemovePrefix(key), storage.value);
        return storage.value;
    }
}


/**
 * @description:  has storage
 * @param {string} key
 * @return {*}
 */
export const hasStorage = (key: string) => {
    key = autoAddPrefix(key);
    let arr = getStorageAll().filter((item) => {
        return item.key === key;
    })
    return arr.length ? true : false;
}


/**
 * @description:  get storage keys
 * @return {*}
 */
export const getStorageKeys = () => {
    let items = getStorageAll()
    let keys = []
    for (let index = 0; index < items.length; index++) {
        keys.push(items[index].key)
    }
    return keys
}


/**
 * @description:  get storage by index
 * @param {number} index
 * @return {*}
 */
export const getStorageForIndex = (index: number) => {
    // @ts-ignore    
    return window[config.type].key(index)
}


/**
 * @description:  get storage length
 * @return {*}
 */
export const getStorageLength = () => {
    // @ts-ignore    
    return window[config.type].length
}


/**
 * @description:  get storage all
 * @return {*}
 */
export const getStorageAll = () => {
    // @ts-ignore    
    let len = window[config.type].length
    let arr = new Array()
    for (let i = 0; i < len; i++) {
        // @ts-ignore    
        let getKey = window[config.type].key(i)
        // @ts-ignore    
        let getVal = window[config.type].getItem(getKey)
        arr[i] = { 'key': getKey, 'val': getVal, }
    }
    return arr
}


/**
 * @description:  remove storage
 * @param {string} key
 * @return {*}
 */
export const removeStorage = (key: string) => {
    // @ts-ignore    
    window[config.type].removeItem(autoAddPrefix(key));
}

/**
 * @description:  clear storage
 * @return {*}
 */
export const clearStorage = () => {
    // @ts-ignore    
    window[config.type].clear();
}


/**
 * @description:  add prefix
 * @param {string} key
 * @return {*}
 */
const autoAddPrefix = (key: string) => {
    const prefix = config.prefix ? config.prefix + '_' : '';
    return prefix + key;
}

/**
 * @description:  remove prefix
 * @param {string} key
 * @return {*}
 */
const autoRemovePrefix = (key: string) => {
    const len = config.prefix ? config.prefix.length + 1 : 0;
    return key.substring(len)
    // const prefix = config.prefix ? config.prefix + '_' : '';
    // return  prefix + key;
}

/**
 * @description:  encrypt
 * @param data
 * @returns {string}
 */
const encrypt = (data: any) => {
    if (typeof data === "object") {
        try {
            data = JSON.stringify(data);
        } catch (error) {
            console.log("encrypt error:", error);
        }
    }
    const dataHex = CryptoJS.enc.Utf8.parse(data);
    const encrypted = CryptoJS.AES.encrypt(dataHex, SECRET_KEY, {
        iv: SECRET_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString();
}

/**
 * @description:  decrypt
 * @param data
 * @returns {string}
 */
const decrypt = (data: any) => {
    const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
    const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
        iv: SECRET_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}