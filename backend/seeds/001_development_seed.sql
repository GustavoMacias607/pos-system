-- DEVELOPMENT ONLY: Never execute this seed in production.

\set ON_ERROR_STOP on

BEGIN;

-- Permite generar hashes bcrypt compatibles con Node.js bcrypt.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- USERS
-- Contraseña de desarrollo para todos: Pos2026!
-- =========================================================

INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    active
)
VALUES
    (
        'Administrador POS',
        'admin@pos.local',
        crypt('Pos2026!', gen_salt('bf', 10)),
        'ADMIN',
        TRUE
    ),
    (
        'Supervisor POS',
        'supervisor@pos.local',
        crypt('Pos2026!', gen_salt('bf', 10)),
        'SUPERVISOR',
        TRUE
    ),
    (
        'Empleado POS',
        'employee@pos.local',
        crypt('Pos2026!', gen_salt('bf', 10)),
        'EMPLOYEE',
        TRUE
    )
ON CONFLICT DO NOTHING;

-- =========================================================
-- CATEGORIES
-- =========================================================

INSERT INTO categories (
    name,
    description,
    active
)
VALUES
    ('Bebidas', 'Agua, refrescos, café y otras bebidas.', TRUE),
    ('Abarrotes', 'Productos básicos de despensa.', TRUE),
    ('Snacks', 'Botanas, galletas y productos similares.', TRUE),
    ('Limpieza', 'Productos de limpieza para el hogar.', TRUE),
    ('Papelería', 'Artículos escolares y de oficina.', TRUE)
ON CONFLICT DO NOTHING;

-- =========================================================
-- PRODUCTS
-- =========================================================

INSERT INTO products (
    name,
    description,
    price,
    stock,
    category_id,
    minimum_stock,
    active
)
VALUES
    (
        'Agua purificada 600 ml',
        'Botella individual de agua purificada.',
        15.00,
        40,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Bebidas')),
        10,
        TRUE
    ),
    (
        'Refresco cola 600 ml',
        'Refresco sabor cola en botella individual.',
        22.00,
        8,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Bebidas')),
        12,
        TRUE
    ),
    (
        'Café soluble 100 g',
        'Frasco de café soluble.',
        85.00,
        0,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Bebidas')),
        5,
        TRUE
    ),
    (
        'Refresco naranja 600 ml',
        'Refresco sabor naranja.',
        21.00,
        6,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Bebidas')),
        8,
        FALSE
    ),
    (
        'Arroz 1 kg',
        'Bolsa de arroz de un kilogramo.',
        32.00,
        25,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Abarrotes')),
        8,
        TRUE
    ),
    (
        'Frijol 1 kg',
        'Bolsa de frijol de un kilogramo.',
        38.00,
        6,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Abarrotes')),
        8,
        TRUE
    ),
    (
        'Aceite vegetal 1 L',
        'Botella de aceite vegetal de un litro.',
        49.00,
        18,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Abarrotes')),
        6,
        TRUE
    ),
    (
        'Papas fritas 45 g',
        'Bolsa individual de papas fritas.',
        18.00,
        30,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Snacks')),
        10,
        TRUE
    ),
    (
        'Galletas de chocolate 170 g',
        'Paquete de galletas con chocolate.',
        28.00,
        4,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Snacks')),
        8,
        TRUE
    ),
    (
        'Detergente líquido 1 L',
        'Detergente líquido para ropa.',
        42.00,
        12,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Limpieza')),
        5,
        TRUE
    ),
    (
        'Cloro 1 L',
        'Botella de cloro para limpieza.',
        24.00,
        0,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Limpieza')),
        4,
        TRUE
    ),
    (
        'Cuaderno profesional',
        'Cuaderno profesional de cuadro grande.',
        65.00,
        10,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Papelería')),
        3,
        TRUE
    ),
    (
        'Bolígrafo azul',
        'Bolígrafo de tinta azul.',
        8.00,
        50,
        (SELECT id FROM categories WHERE LOWER(name) = LOWER('Papelería')),
        15,
        TRUE
    )
ON CONFLICT DO NOTHING;

-- =========================================================
-- CLIENTS
-- =========================================================

INSERT INTO clients (
    name,
    email,
    phone,
    address,
    active
)
VALUES
    (
        'Cliente General',
        'general@clientes.local',
        NULL,
        NULL,
        TRUE
    ),
    (
        'María López',
        'maria.lopez@example.com',
        '3312345678',
        'Guadalajara, Jalisco',
        TRUE
    ),
    (
        'Carlos Ramírez',
        'carlos.ramirez@example.com',
        '3741234567',
        'Tequila, Jalisco',
        TRUE
    ),
    (
        'Ana Torres',
        'ana.torres@example.com',
        '3334567890',
        'Zapopan, Jalisco',
        FALSE
    )
ON CONFLICT DO NOTHING;

-- =========================================================
-- SUPPLIERS
-- =========================================================

INSERT INTO suppliers (
    name,
    contact_name,
    email,
    phone,
    address,
    active
)
VALUES
    (
        'Distribuidora La Central',
        'José Hernández',
        'ventas@central.local',
        '3330001000',
        'Guadalajara, Jalisco',
        TRUE
    ),
    (
        'Bebidas del Occidente',
        'Laura Martínez',
        'contacto@bebidas-occidente.local',
        '3330002000',
        'Zapopan, Jalisco',
        TRUE
    ),
    (
        'Limpieza Profesional',
        'Roberto Silva',
        'ventas@limpieza-profesional.local',
        '3330003000',
        'Tlaquepaque, Jalisco',
        TRUE
    ),
    (
        'Proveedor Inactivo',
        'Contacto Anterior',
        'inactivo@proveedores.local',
        '3330004000',
        'Jalisco, México',
        FALSE
    )
ON CONFLICT DO NOTHING;

-- =========================================================
-- SUPPLIER PRODUCTS
-- =========================================================

INSERT INTO supplier_products (
    supplier_id,
    product_id,
    supplier_product_code,
    unit_cost,
    active
)
VALUES
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Bebidas del Occidente')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Agua purificada 600 ml')),
        'BEB-AGUA-600',
        8.50,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Bebidas del Occidente')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Refresco cola 600 ml')),
        'BEB-COLA-600',
        14.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Bebidas del Occidente')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Café soluble 100 g')),
        'BEB-CAFE-100',
        62.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Distribuidora La Central')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Arroz 1 kg')),
        'CEN-ARROZ-1K',
        22.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Distribuidora La Central')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Frijol 1 kg')),
        'CEN-FRIJOL-1K',
        27.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Distribuidora La Central')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Aceite vegetal 1 L')),
        'CEN-ACEITE-1L',
        35.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Distribuidora La Central')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Papas fritas 45 g')),
        'CEN-PAPAS-45',
        11.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Distribuidora La Central')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Galletas de chocolate 170 g')),
        'CEN-GALLETAS-170',
        19.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Limpieza Profesional')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Detergente líquido 1 L')),
        'LIM-DETER-1L',
        29.00,
        TRUE
    ),
    (
        (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Limpieza Profesional')),
        (SELECT id FROM products WHERE LOWER(name) = LOWER('Cloro 1 L')),
        'LIM-CLORO-1L',
        14.50,
        TRUE
    )
ON CONFLICT DO NOTHING;

-- =========================================================
-- CASH REGISTERS
-- =========================================================

INSERT INTO cash_registers (
    name,
    location,
    active
)
VALUES
    ('Caja Principal', 'Mostrador principal', TRUE),
    ('Caja Secundaria', 'Área de atención secundaria', TRUE),
    ('Caja Temporal', 'Caja de respaldo', FALSE)
ON CONFLICT DO NOTHING;

COMMIT;
