const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Orders page
app.get('/orders', (req, res) => {
    res.sendFile(__dirname + '/public/orders.html');
});

// Order details page
app.get('/order/:id', (req, res) => {
    res.sendFile(__dirname + '/public/order-details.html');
});

// Purchase page
app.get('/purchase', (req, res) => {
    res.sendFile(__dirname + '/public/purchase.html');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
