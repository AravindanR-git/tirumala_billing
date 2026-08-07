import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

let db = null;

export const initDB = async () => {
  try {
    const sqlite = new SQLiteConnection(CapacitorSQLite);

    db = await sqlite.createConnection("tirumalaDB", false, "no-encryption", 1);
    await db.open();

    // Create bills table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        truckNumber TEXT,
        truckName TEXT,
        materialName TEXT,
        netQty REAL,
        dacNumber TEXT,
        party TEXT,
        loading TEXT,
        unloading TEXT,
        transport TEXT,
        paymentMode TEXT,
        date TEXT,
        time TEXT,
        createdAt TEXT
      );
    `;
    await db.execute(createTableQuery);

    console.log("✅ SQLite initialized & table ready");
    return true;
  } catch (err) {
    console.error("❌ SQLite init error:", err);
    return false;
  }
};

export const insertBill = async (bill) => {
  if (!db) return;

  const query = `
    INSERT INTO bills 
    (truckNumber, truckName, materialName, netQty, dacNumber, party, loading, unloading, transport, paymentMode, date, time, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    bill.truck.number,
    bill.truck.name,
    bill.material.name,
    bill.netQty,
    bill.dacNumber,
    bill.party,
    bill.loading,
    bill.unloading,
    bill.transport,
    bill.paymentMode,
    bill.date,
    bill.time,
    bill.createdAt
  ];

  await db.run(query, values);
};

export const getLastDAC = async () => {
  if (!db) return null;

  const res = await db.query("SELECT dacNumber FROM bills ORDER BY id DESC LIMIT 1;");
  return res.values?.[0]?.dacNumber || null;
};

export const getAllBills = async () => {
  if (!db) return [];
  const res = await db.query("SELECT * FROM bills ORDER BY id DESC;");
  return res.values || [];
};
