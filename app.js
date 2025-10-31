const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Helper function to read JSON files
const readJSONFile = (filename) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Helper function to write JSON files
const writeJSONFile = (filename, data) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        return false;
    }
};

// Make helpers available to routes
app.locals.readJSONFile = readJSONFile;
app.locals.writeJSONFile = writeJSONFile;

// Public Routes (return HTML)
app.get('/', (req, res) => {
    const products = readJSONFile('products.json');
    res.render('index', {
        title: 'Welcome to Our Store',
        products: products
    });
});

app.get('/products', (req, res) => {
    const products = readJSONFile('products.json');
    res.render('index', {
        title: 'All Products',
        products: products
    });
});

app.get('/product/:id', (req, res) => {
    const products = readJSONFile('products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
        return res.status(404).render('error', {
            title: 'Product Not Found',
            message: 'The product you are looking for does not exist.'
        });
    }

    res.render('product', {
        title: product.name,
        product: product
    });
});

// API Routes (return JSON) - Start with /api
app.get('/api/products', (req, res) => {
    const products = readJSONFile('products.json');
    res.json({
        success: true,
        data: products,
        count: products.length
    });
});

app.get('/api/product/:id', (req, res) => {
    const products = readJSONFile('products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    res.json({
        success: true,
        data: product
    });
});

// Users API
app.get('/api/users', (req, res) => {
    const users = readJSONFile('users.json');
    res.json({
        success: true,
        data: users,
        count: users.length
    });
});

app.get('/api/user/:id', (req, res) => {
    const users = readJSONFile('users.json');
    const user = users.find(u => u.id === parseInt(req.params.id));

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.json({
        success: true,
        data: user
    });
});

// Orders API
app.get('/api/orders', (req, res) => {
    const orders = readJSONFile('orders.json');
    res.json({
        success: true,
        data: orders,
        count: orders.length
    });
});

// POST, PUT, DELETE examples for products API
app.post('/api/products', (req, res) => {
    const products = readJSONFile('products.json');
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: req.body.name,
        price: parseFloat(req.body.price),
        category: req.body.category,
        description: req.body.description,
        stock: parseInt(req.body.stock)
    };

    products.push(newProduct);

    if (writeJSONFile('products.json', products)) {
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
});

app.put('/api/product/:id', (req, res) => {
    let products = readJSONFile('products.json');
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    products[productIndex] = {
        ...products[productIndex],
        ...req.body,
        id: parseInt(req.params.id) // Ensure ID doesn't change
    };

    if (writeJSONFile('products.json', products)) {
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: products[productIndex]
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
});

app.delete('/api/product/:id', (req, res) => {
    let products = readJSONFile('products.json');
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];

    if (writeJSONFile('products.json', products)) {
        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: deletedProduct
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🛍️  Store server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});