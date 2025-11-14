-- Complex Multi-Table Join Query
-- This query joins all 5 tables: customers, orders, order_items, products, and categories

SELECT 
    c.customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email,
    c.city AS customer_city,
    c.state AS customer_state,
    o.order_id,
    o.order_date,
    o.order_status,
    o.total_amount AS order_total,
    o.payment_method,
    o.shipping_cost,
    p.product_id,
    p.product_name,
    p.brand,
    p.price AS product_price,
    cat.category_id,
    cat.category_name,
    cat.description AS category_description,
    oi.order_item_id,
    oi.quantity,
    oi.unit_price,
    oi.subtotal AS item_subtotal
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN categories cat ON p.category_id = cat.category_id
ORDER BY o.order_date DESC, o.order_id, oi.order_item_id;

-- Alternative: Sales Summary by Category with Customer Demographics
SELECT 
    cat.category_name,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(oi.order_item_id) AS total_items_sold,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.subtotal) AS total_revenue,
    AVG(oi.unit_price) AS avg_product_price,
    AVG(o.total_amount) AS avg_order_value
FROM categories cat
INNER JOIN products p ON cat.category_id = p.category_id
INNER JOIN order_items oi ON p.product_id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.order_id
INNER JOIN customers c ON o.customer_id = c.customer_id
GROUP BY cat.category_id, cat.category_name
ORDER BY total_revenue DESC;

