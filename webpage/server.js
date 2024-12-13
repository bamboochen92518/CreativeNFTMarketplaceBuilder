const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

// 提供靜態檔案
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/orderbook", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "orderbook.html"));
});

app.listen(PORT, () => {
	console.log(`伺服器已啟動：http://localhost:${PORT}`);
});

