# E-Commerce Database Project

A complete e-commerce database system with synthetic data, SQLite database, and complex multi-table join queries.

## 📋 Overview

This project contains:
- **5 CSV files** with synthetic e-commerce data (customers, products, orders, order items, categories)
- **SQLite database** (`ecommerce.db`) with all data properly structured and linked
- **Data ingestion script** to load CSV data into the database
- **Query scripts** with complex multi-table joins and analytics
- **Query output file** with formatted results

## 📁 Project Structure

```
diligent/
├── customers.csv          # 20 customer records
├── products.csv           # 20 product records
├── orders.csv             # 25 order records
├── order_items.csv        # 40 order item records
├── categories.csv         # 17 category records
├── ingest_data.js         # Script to load CSV data into SQLite
├── query_results.js       # Script to run complex queries
├── complex_query.sql      # SQL queries for reference
├── query_output.txt       # Formatted query results
├── ecommerce.db           # SQLite database (generated)
└── README.md              # This file
```

## 🗄️ Database Schema

### Tables

1. **categories**
   - `category_id` (PRIMARY KEY)
   - `category_name`
   - `description`
   - `parent_category_id` (FOREIGN KEY to categories)

2. **customers**
   - `customer_id` (PRIMARY KEY)
   - `first_name`, `last_name`
   - `email` (UNIQUE)
   - `phone`, `address`, `city`, `state`, `zip_code`, `country`
   - `registration_date`

3. **products**
   - `product_id` (PRIMARY KEY)
   - `product_name`, `brand`, `sku`
   - `category_id` (FOREIGN KEY to categories)
   - `price`, `stock_quantity`
   - `description`, `created_date`

4. **orders**
   - `order_id` (PRIMARY KEY)
   - `customer_id` (FOREIGN KEY to customers)
   - `order_date`, `order_status`
   - `total_amount`, `shipping_cost`
   - `shipping_address`, `shipping_city`, `shipping_state`, `shipping_zip`
   - `payment_method`

5. **order_items**
   - `order_item_id` (PRIMARY KEY)
   - `order_id` (FOREIGN KEY to orders)
   - `product_id` (FOREIGN KEY to products)
   - `quantity`, `unit_price`, `subtotal`

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. Install the required npm package:
```bash
npm install better-sqlite3
```

### Setup Database

1. Run the data ingestion script to create the database and load CSV data:
```bash
node ingest_data.js
```

This will:
- Create `ecommerce.db` SQLite database
- Create all tables with proper relationships
- Load data from all 5 CSV files
- Display verification counts for each table

Expected output:
```
Loaded 17 rows from categories.csv into categories
Loaded 20 rows from customers.csv into customers
Loaded 20 rows from products.csv into products
Loaded 25 rows from orders.csv into orders
Loaded 40 rows from order_items.csv into order_items
```

### Run Queries

Execute the query script to run complex multi-table joins:
```bash
node query_results.js
```

This will:
- Execute 6 different complex queries
- Display formatted tables in the console
- Save all results to `query_output.txt`

## 📊 Query Examples

### Query 1: Customer Order Details
Joins customers, orders, order_items, products, and categories to show complete order information.

### Query 2: Sales Summary by Category
Aggregates sales data grouped by product categories.

### Query 3: Top Customers by Spending
Ranks customers by total spending with order statistics.

### Query 4: Product Performance
Shows product sales performance with category information and remaining stock.

### Query 5: Order Status Breakdown
Summarizes orders by status with revenue metrics.

### Query 6: Complete Order Details
Most complex join - combines all 5 tables for detailed order analysis.

## 🔍 Using the Database

### Direct SQLite Access

You can query the database directly using SQLite command-line tools:

```bash
sqlite3 ecommerce.db
```

Example queries:
```sql
-- View all customers
SELECT * FROM customers;

-- Find top-selling products
SELECT p.product_name, SUM(oi.quantity) as total_sold
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id
ORDER BY total_sold DESC
LIMIT 5;

-- Get customer order history
SELECT c.first_name || ' ' || c.last_name AS customer_name,
       o.order_id, o.order_date, o.total_amount
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
ORDER BY o.order_date DESC;
```

### Using Node.js

```javascript
const Database = require('better-sqlite3');
const db = new Database('ecommerce.db');

// Run a query
const results = db.prepare('SELECT * FROM customers LIMIT 5').all();
console.table(results);

db.close();
```

## 📈 Data Statistics

- **Categories**: 17 (with hierarchical structure)
- **Customers**: 20
- **Products**: 20
- **Orders**: 25
- **Order Items**: 40

## 🔗 Relationships

- Customers → Orders (one-to-many)
- Orders → Order Items (one-to-many)
- Products → Order Items (one-to-many)
- Categories → Products (one-to-many)
- Categories → Categories (self-referential for parent categories)

## 📝 Files Description

- **customers.csv**: Customer personal information and addresses
- **products.csv**: Product catalog with prices, stock, and categories
- **orders.csv**: Order records with customer references and payment info
- **order_items.csv**: Individual items within each order
- **categories.csv**: Product categories with hierarchical relationships
- **ingest_data.js**: Script to create database schema and load CSV data
- **query_results.js**: Script with 6 complex multi-table join queries
- **complex_query.sql**: SQL reference file with query examples
- **query_output.txt**: Formatted output of all query results (JSON format)

## 🛠️ Customization

### Adding More Data

1. Edit the CSV files to add more records
2. Run `node ingest_data.js` again (it will recreate the database)

### Creating New Queries

1. Add your SQL query to `query_results.js`
2. Execute it using `db.prepare(query).all()`
3. Display results with `console.table(results)`
4. Save to output using the `log()` function

## 📄 License

This is a sample project for educational and development purposes.

## 🤝 Contributing

Feel free to extend this project with:
- Additional queries
- More synthetic data
- Data visualization
- API endpoints
- Web interface

## 📞 Support

For questions or issues, refer to the SQLite documentation or Node.js better-sqlite3 package documentation.

---

**Last Updated**: November 2025

