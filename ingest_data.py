import sqlite3
import csv
import os
from datetime import datetime

# Database file name
DB_FILE = 'ecommerce.db'

def create_database():
    """Create SQLite database and tables"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Drop tables if they exist (for clean setup)
    cursor.execute('DROP TABLE IF EXISTS order_items')
    cursor.execute('DROP TABLE IF EXISTS orders')
    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('DROP TABLE IF EXISTS customers')
    cursor.execute('DROP TABLE IF EXISTS categories')
    
    # Create categories table
    cursor.execute('''
        CREATE TABLE categories (
            category_id INTEGER PRIMARY KEY,
            category_name TEXT NOT NULL,
            description TEXT,
            parent_category_id INTEGER,
            FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
        )
    ''')
    
    # Create customers table
    cursor.execute('''
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
        )
    ''')
    
    # Create products table
    cursor.execute('''
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
        )
    ''')
    
    # Create orders table
    cursor.execute('''
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
        )
    ''')
    
    # Create order_items table
    cursor.execute('''
        CREATE TABLE order_items (
            order_item_id INTEGER PRIMARY KEY,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(order_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        )
    ''')
    
    conn.commit()
    return conn, cursor

def load_csv_to_table(cursor, csv_file, table_name, conn):
    """Load data from CSV file into database table"""
    if not os.path.exists(csv_file):
        print(f"Warning: {csv_file} not found. Skipping...")
        return
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
        if not rows:
            print(f"Warning: {csv_file} is empty. Skipping...")
            return
        
        # Get column names from CSV
        columns = reader.fieldnames
        
        # Create placeholders for INSERT statement
        placeholders = ','.join(['?' for _ in columns])
        columns_str = ','.join(columns)
        
        # Insert data
        for row in rows:
            values = [row[col] if row[col] else None for col in columns]
            try:
                cursor.execute(f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})', values)
            except sqlite3.IntegrityError as e:
                print(f"Error inserting row into {table_name}: {e}")
                print(f"Row data: {row}")
    
    conn.commit()
    print(f"Loaded {len(rows)} rows from {csv_file} into {table_name}")

def main():
    print("Creating database and tables...")
    conn, cursor = create_database()
    
    # Load data in the correct order (respecting foreign key constraints)
    print("\nLoading data from CSV files...")
    
    # 1. Categories first (no dependencies)
    load_csv_to_table(cursor, 'categories.csv', 'categories', conn)
    
    # 2. Customers (no dependencies)
    load_csv_to_table(cursor, 'customers.csv', 'customers', conn)
    
    # 3. Products (depends on categories)
    load_csv_to_table(cursor, 'products.csv', 'products', conn)
    
    # 4. Orders (depends on customers)
    load_csv_to_table(cursor, 'orders.csv', 'orders', conn)
    
    # 5. Order items (depends on orders and products)
    load_csv_to_table(cursor, 'order_items.csv', 'order_items', conn)
    
    # Verify data
    print("\nVerifying data...")
    tables = ['categories', 'customers', 'products', 'orders', 'order_items']
    for table in tables:
        cursor.execute(f'SELECT COUNT(*) FROM {table}')
        count = cursor.fetchone()[0]
        print(f"  {table}: {count} rows")
    
    conn.close()
    print(f"\nDatabase '{DB_FILE}' created successfully!")

if __name__ == '__main__':
    main()

