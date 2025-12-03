// index.mjs
import express from "express";
import mysql from "mysql2/promise";

const app = express();
const PORT = process.env.PORT || 3000;

// engine & static files
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// MySQL pool
const pool = mysql.createPool({
  host: "kil9uzd3tgem3naa.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "ien57e36gujfj6xo",
  password: "bjhw6a52a4tk7wze",
  database: "k3xo4f9uwydcj4qs",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// dbTest route
app.get("/dbTest", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT CURDATE() AS today");
    res.send(rows);
  } catch (err) {
    console.error("Database error in /dbTest:", err);
    res.status(500).send("Database error");
  }
});

// home page
app.get("/", async (req, res) => {
  try {
    // authors
    const [authors] = await pool.query(
      `SELECT authorId, firstName, lastName
       FROM q_authors
       ORDER BY lastName, firstName`
    );

    // categories
    const [categories] = await pool.query(
      `SELECT DISTINCT category
       FROM q_quotes
       ORDER BY category`
    );

    res.render("index", { authors, categories });
  } catch (err) {
    console.error("Error loading /:", err);
    res.status(500).send("Database error");
  }
});

// search w keyword
app.get("/searchByKeyword", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const sql = `
      SELECT q.quoteId,
             q.quote,
             q.likes,
             a.authorId,
             a.firstName,
             a.lastName
      FROM q_quotes q
      JOIN q_authors a ON q.authorId = a.authorId
      WHERE q.quote LIKE ?
    `;
    const params = [`%${keyword}%`];

    const [rows] = await pool.query(sql, params);

    res.render("results", {
      title: `Quotes containing "${keyword}"`,
      quotes: rows
    });
  } catch (err) {
    console.error("Error in /searchByKeyword:", err);
    res.status(500).send("Database error");
  }
});

// search w author
app.get("/searchByAuthor", async (req, res) => {
  try {
    const authorId = req.query.authorId;

    const sql = `
      SELECT q.quoteId,
             q.quote,
             q.likes,
             a.authorId,
             a.firstName,
             a.lastName
      FROM q_quotes q
      JOIN q_authors a ON q.authorId = a.authorId
      WHERE a.authorId = ?
    `;
    const [rows] = await pool.query(sql, [authorId]);

    res.render("results", {
      title: "Quotes by selected author",
      quotes: rows
    });
  } catch (err) {
    console.error("Error in /searchByAuthor:", err);
    res.status(500).send("Database error");
  }
});

// search w category
app.get("/searchByCategory", async (req, res) => {
  try {
    const category = req.query.category || "";

    const sql = `
      SELECT q.quoteId,
             q.quote,
             q.likes,
             a.authorId,
             a.firstName,
             a.lastName
      FROM q_quotes q
      JOIN q_authors a ON q.authorId = a.authorId
      WHERE q.category = ?
    `;
    const [rows] = await pool.query(sql, [category]);

    res.render("results", {
      title: `Quotes in category "${category}"`,
      quotes: rows
    });
  } catch (err) {
    console.error("Error in /searchByCategory:", err);
    res.status(500).send("Database error");
  }
});

// search w likes range
app.get("/searchByLikes", async (req, res) => {
  try {
    const minLikes = parseInt(req.query.minLikes || "0", 10);
    const maxLikes = parseInt(req.query.maxLikes || "999999", 10);

    const sql = `
      SELECT q.quoteId,
             q.quote,
             q.likes,
             a.authorId,
             a.firstName,
             a.lastName
      FROM q_quotes q
      JOIN q_authors a ON q.authorId = a.authorId
      WHERE q.likes BETWEEN ? AND ?
      ORDER BY q.likes DESC
    `;
    const [rows] = await pool.query(sql, [minLikes, maxLikes]);

    res.render("results", {
      title: `Quotes with likes between ${minLikes} and ${maxLikes}`,
      quotes: rows
    });
  } catch (err) {
    console.error("Error in /searchByLikes:", err);
    res.status(500).send("Database error");
  }
});

// local API to get author info
app.get("/api/author/:id", async (req, res) => {
  try {
    const authorId = req.params.id;

    const sql = `
      SELECT *
      FROM q_authors
      WHERE authorId = ?
    `;
    const [rows] = await pool.query(sql, [authorId]);

    res.send(rows);
  } catch (err) {
    console.error("Error in /api/author/:id:", err);
    res.status(500).send("Database error");
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
