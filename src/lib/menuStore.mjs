const DB_NAME = 'bhola-inn-assets';
const STORE_NAME = 'menus';
const KEY = 'published-menu';
function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>req.result.createObjectStore(STORE_NAME);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
export async function saveMenu(file){
  const db=await openDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    tx.objectStore(STORE_NAME).put({blob:file,name:file.name,size:file.size,updatedAt:new Date().toISOString()},KEY);
    tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
  });
}
export async function loadMenu(){
  try{
    const db=await openDb();
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE_NAME,'readonly');
      const req=tx.objectStore(STORE_NAME).get(KEY);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
  }catch{return null}
}