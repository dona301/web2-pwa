import { openDB } from 'idb'

const DB_NAME = 'mic-test-db'
const STORE_NAME = 'tests'

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        })
      }
    }
  })
}

export async function saveTest(test) {
  const db = await initDB()
  await db.add(STORE_NAME, {
    ...test,
    synced: false
  })
}

export async function getUnsyncedTests() {
  const db = await initDB()
  const all = await db.getAll(STORE_NAME)
  return all.filter(t => !t.synced)
}

export async function markAsSynced(id) {
  const db = await initDB()
  const test = await db.get(STORE_NAME, id)
  test.synced = true
  await db.put(STORE_NAME, test)
}

export async function getAllTests() {
  const db = await initDB()
  return await db.getAll('tests')
}

