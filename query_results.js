const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('ecommerce.db');

// Create output file
const outputFile = 'query_output.txt';
let output = '';

function log(message) {
    console.log(message);
    output += message + '\n';
}

log('='.repeat(80));
log('E-COMMERCE ANALYTICS REPORT - MULTI-TABLE JOIN QUERY');
log('='.repeat(80));
log('\n');

// Query 1: Customer Order Details with Products and Categories
console.log('QUERY 1: Customer Order Details with Products and Categories');
console.log('-'.repeat(80));
const query1 = `
    SELECT 
        c.customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.email,
        o.order_id,
        o.order_date,
        o.order_status,
        o.total_amount,
        p.product_name,
        p.brand,
        cat.category_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.product_id
    INNER JOIN categories cat ON p.category_id = cat.category_id
    ORDER BY o.order_date DESC, c.customer_id
    LIMIT 15
`;

const results1 = db.prepare(query1).all();
console.table(results1);
log('\nQUERY 1 RESULTS:');
log(JSON.stringify(results1, null, 2));
log(`\nTotal rows: ${results1.length}\n`);

// Query 2: Sales Summary by Category
console.log('\nQUERY 2: Sales Summary by Category');
console.log('-'.repeat(80));
const query2 = `
    SELECT 
        cat.category_name,
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(oi.order_item_id) AS total_items_sold,
        SUM(oi.quantity) AS total_quantity,
        SUM(oi.subtotal) AS total_revenue,
        AVG(oi.unit_price) AS avg_product_price
    FROM categories cat
    INNER JOIN products p ON cat.category_id = p.category_id
    INNER JOIN order_items oi ON p.product_id = oi.product_id
    INNER JOIN orders o ON oi.order_id = o.order_id
    GROUP BY cat.category_id, cat.category_name
    ORDER BY total_revenue DESC
`;

const results2 = db.prepare(query2).all();
console.table(results2);
log('\nQUERY 2 RESULTS:');
log(JSON.stringify(results2, null, 2));
log(`\nTotal categories: ${results2.length}\n`);

// Query 3: Top Customers by Total Spending
console.log('\nQUERY 3: Top Customers by Total Spending');
console.log('-'.repeat(80));
const query3 = `
    SELECT 
        c.customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.city,
        c.state,
        COUNT(DISTINCT o.order_id) AS order_count,
        SUM(o.total_amount) AS total_spent,
        AVG(o.total_amount) AS avg_order_value
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.first_name, c.last_name, c.city, c.state
    ORDER BY total_spent DESC
    LIMIT 10
`;

const results3 = db.prepare(query3).all();
console.table(results3);
log('\nQUERY 3 RESULTS:');
log(JSON.stringify(results3, null, 2));
log(`\nTop ${results3.length} customers\n`);

// Query 4: Product Performance with Category
console.log('\nQUERY 4: Product Performance with Category');
console.log('-'.repeat(80));
const query4 = `
    SELECT 
        p.product_id,
        p.product_name,
        p.brand,
        cat.category_name,
        p.price,
        p.stock_quantity,
        COUNT(oi.order_item_id) AS times_ordered,
        SUM(oi.quantity) AS total_quantity_sold,
        SUM(oi.subtotal) AS total_revenue,
        (p.stock_quantity - COALESCE(SUM(oi.quantity), 0)) AS remaining_stock
    FROM products p
    INNER JOIN categories cat ON p.category_id = cat.category_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.product_id, p.product_name, p.brand, cat.category_name, p.price, p.stock_quantity
    ORDER BY total_revenue DESC
    LIMIT 10
`;

const results4 = db.prepare(query4).all();
console.table(results4);
log('\nQUERY 4 RESULTS:');
log(JSON.stringify(results4, null, 2));
log(`\nTop ${results4.length} products by revenue\n`);

// Query 5: Order Status Breakdown with Customer Info
console.log('\nQUERY 5: Order Status Breakdown with Customer Info');
console.log('-'.repeat(80));
const query5 = `
    SELECT 
        o.order_status,
        COUNT(DISTINCT o.order_id) AS order_count,
        COUNT(DISTINCT o.customer_id) AS unique_customers,
        SUM(o.total_amount) AS total_revenue,
        AVG(o.total_amount) AS avg_order_value,
        SUM(o.shipping_cost) AS total_shipping_cost
    FROM orders o
    GROUP BY o.order_status
    ORDER BY order_count DESC
`;

const results5 = db.prepare(query5).all();
console.table(results5);
log('\nQUERY 5 RESULTS:');
log(JSON.stringify(results5, null, 2));
log(`\nStatus breakdown complete\n`);

// Query 6: Complete Order Details (Most Complex Join)
console.log('\nQUERY 6: Complete Order Details - All Tables Joined');
console.log('-'.repeat(80));
const query6 = `
    SELECT 
        o.order_id,
        o.order_date,
        o.order_status,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.email AS customer_email,
        c.city AS customer_city,
        p.product_name,
        cat.category_name,
        p.brand,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        o.total_amount AS order_total,
        o.payment_method,
        o.shipping_cost
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.product_id
    INNER JOIN categories cat ON p.category_id = cat.category_id
    WHERE o.order_id IN (1001, 1002, 1003, 1004, 1005)
    ORDER BY o.order_id, oi.order_item_id
`;

const results6 = db.prepare(query6).all();
console.table(results6);
log('\nQUERY 6 RESULTS:');
log(JSON.stringify(results6, null, 2));
log(`\nSample order details: ${results6.length} items\n`);

log('='.repeat(80));
log('END OF REPORT');
log('='.repeat(80));

// Save output to file
fs.writeFileSync(outputFile, output);
console.log(`\nOutput saved to ${outputFile}`);

db.close();

