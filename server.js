const path = require("path");
const express = require("express");

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}...`);
})