import type {
  FullConfiguration,
  PaletteData,
} from "@yelbolt/engine-ui-color-palette";

const DB_NAME = "ui-color-palette-web";
const DB_VERSION = 1;

let _db: IDBDatabase | null = null;
let _dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("palettes"))
        db.createObjectStore("palettes", { keyPath: "meta.id" });
    };

    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

export const initDb = async (): Promise<void> => {
  await ensureDb();
};

function ensureDb(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  if (!_dbPromise) _dbPromise = openDb().then((db) => (_db = db));
  return _dbPromise;
}

export const getPalette = async (
  id: string,
): Promise<FullConfiguration | undefined> => {
  const db = await ensureDb();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("palettes", "readonly")
      .objectStore("palettes")
      .get(id);
    req.onsuccess = () =>
      resolve((req.result as FullConfiguration) ?? undefined);
    req.onerror = () => reject(req.error);
  });
};

export const setPalette = async (palette: FullConfiguration): Promise<void> => {
  const db = await ensureDb();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("palettes", "readwrite")
      .objectStore("palettes")
      .put(palette);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const deletePalette = async (id: string): Promise<void> => {
  const db = await ensureDb();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("palettes", "readwrite")
      .objectStore("palettes")
      .delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const getAllPalettes = async (): Promise<Array<PaletteData>> => {
  const db = await ensureDb();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("palettes", "readonly")
      .objectStore("palettes")
      .getAll();
    req.onsuccess = () => resolve((req.result as Array<PaletteData>) ?? []);
    req.onerror = () => reject(req.error);
  });
};
