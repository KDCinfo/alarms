/*
    Storage (local; client-side [window])
    https://developer.mozilla.org/en-US/docs/Web/API/Storage
*/
export const setStorageItem = (storage, key, value) => {
    try {
        storage.setItem(key, value)
    } catch(e) {
        console.error(e)
    }
}
export const getStorageItem = (storage, key) => {
    try {
        return storage.getItem(key)
    } catch(e) {
        console.error(e)
        return null
    }
}
