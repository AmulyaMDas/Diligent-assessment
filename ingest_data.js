const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_FILE = 'ecommerce.db';

function createDatabase() {
    // Remove existing database if it exists
    if (fs.existsSync(DB_FILE)) {
        fs.unlinkSync(DB_FILE);
    }
    
    const db = new Database(DB_FILE);
    
    // Create tables
    db.exec(`
        CREATE TABLE categories (
            category_id INTEGER PRIMARY KEY,
            category_name TEXT NOT NULL,
            description TEXT,
            parent_category_id INTEGER,
            FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
        );
        
        CREATE TABLE customers (
            customer_id INTEGER PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            country TEXT,
            registration_date TEXT
        );
        
        CREATE TABLE products (
            product_id INTEGER PRIMARY KEY,
            product_name TEXT NOT NULL,
            category_id INTEGER,
            price REAL NOT NULL,
            stock_quantity INTEGER,
            description TEXT,
            brand TEXT,
            sku TEXT,
            created_date TEXT,
            FOREIGN KEY (category_id) REFERENCES categories(category_id)
        );
        
        CREATE TABLE orders (
            order_id INTEGER PRIMARY KEY,
            customer_id INTEGER NOT NULL,
            order_date TEXT NOT NULL,
            order_status TEXT NOT NULL,
            total_amount REAL NOT NULL,
            shipping_address TEXT,
            shipping_city TEXT,
            shipping_state TEXT,
            shipping_zip TEXT,
            payment_method TEXT,
            shipping_cost REAL,
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        );
        
        CREATE TABLE order_items (
            order_item_id INTEGER PRIMARY KEY,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(order_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        );
    `);
    
    return db;
}

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, index) => {
            let value = values[index] ? values[index].trim() : null;
            // Convert "NULL" string to actual null
            if (value === 'NULL' || value === '') {
                value = null;
            }
            row[header.trim()] = value;
        });
        return row;
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result;
}

function loadCSVToTable(db, csvFile, tableName) {
    if (!fs.existsSync(csvFile)) {
        console.log(`Warning: ${csvFile} not found. Skipping...`);
        return;
    }
    
    const rows = parseCSV(csvFile);
    
    if (rows.length === 0) {
        console.log(`Warning: ${csvFile} is empty. Skipping...`);
        return;
    }
    
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(',');
    const columnsStr = columns.join(',');
    
    const stmt = db.prepare(`INSERT INTO ${tableName} (${columnsStr}) VALUES (${placeholders})`);
    const insertMany = db.transaction((rows) => {
        for (const row of rows) {
            try {
                const values = columns.map(col => {
                    let val = row[col];
                    // Convert numeric strings to numbers
                    if (val !== null && val !== undefined) {
                        // Check if it's a numeric field (for IDs, prices, quantities)
                        if (col.includes('_id') || col.includes('price') || col.includes('quantity') || col.includes('cost') || col.includes('amount') || col.includes('subtotal')) {
                            const numVal = parseFloat(val);
                            if (!isNaN(numVal)) {
                                val = numVal;
                            }
                        }
                    }
                    return val;
                });
                stmt.run(values);
            } catch (error) {
                console.log(`Error inserting row into ${tableName}: ${error.message}`);
                console.log(`Row data:`, row);
            }
        }
    });
    
    insertMany(rows);
    console.log(`Loaded ${rows.length} rows from ${csvFile} into ${tableName}`);
}

function main() {
    console.log('Creating database and tables...');
    const db = createDatabase();
    
    console.log('\nLoading data from CSV files...');
    
    // Load data in the correct order (respecting foreign key constraints)
    loadCSVToTable(db, 'categories.csv', 'categories');
    loadCSVToTable(db, 'customers.csv', 'customers');
    loadCSVToTable(db, 'products.csv', 'products');
    loadCSVToTable(db, 'orders.csv', 'orders');
    loadCSVToTable(db, 'order_items.csv', 'order_items');
    
    // Verify data
    console.log('\nVerifying data...');
    const tables = ['categories', 'customers', 'products', 'orders', 'order_items'];
    tables.forEach(table => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
        console.log(`  ${table}: ${count} rows`);
    });
    
    db.close();
    console.log(`\nDatabase '${DB_FILE}' created successfully!`);
}

main();

