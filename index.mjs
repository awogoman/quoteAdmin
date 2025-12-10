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
    const sql = `
      SELECT
        authorId,
        firstName,
        lastName,
        DATE_FORMAT(dob, '%M %e, %Y') AS dobFormatted,
        DATE_FORMAT(dod, '%M %e, %Y') AS dodFormatted,
        dob,
        dod,
        sex,
        profession,
        country,
        portrait,
        biography
      FROM q_authors
      WHERE authorId = ?
    `;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error in /api/author/:id", err);
    res.status(500).json({ error: "Database error" });
  }
});

// authors
app.get("/author/new", (req, res) => {
  res.render("newAuthor");
});

//add author
app.post("/author/new", async (req, res) => {
  try {
    const {
      fName,
      lName,
      dob,
      dod,
      sex,
      profession,
      country,
      portrait,
      biography,
    } = req.body;

    const sql = `
      INSERT INTO q_authors
        (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const isAlive = !!req.body.alive;

    const params = [
      fName,
      lName,
      dob || null,
      isAlive ? null : (dod || null),
      sex || null,
      profession || null,
      country || null,
      portrait || null,
      biography || null,
    ];

    await pool.query(sql, params);

    res.render("newAuthor", { message: "Author added!" });
  } catch (err) {
    console.error("Error in POST /author/new:", err);
    res.status(500).send("Database error");
  }
});

app.get("/authors", async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM q_authors
      ORDER BY lastName, firstName
    `;
    const [rows] = await pool.query(sql);
    res.render("authorList", { authors: rows });
  } catch (err) {
    console.error("Error in GET /authors:", err);
    res.status(500).send("Database error");
  }
});

app.get("/author/edit", async (req, res) => {
  try {
    const authorId = req.query.authorId;

    const sql = `
      SELECT *,
             DATE_FORMAT(dob, '%Y-%m-%d')  AS dobISO,
             DATE_FORMAT(dod, '%Y-%m-%d')  AS dodISO
      FROM q_authors
      WHERE authorId = ?
    `;
    const [rows] = await pool.query(sql, [authorId]);

    if (!rows.length) {
      return res.status(404).send("Author not found");
    }

    res.render("editAuthor", { author: rows[0] });
  } catch (err) {
    console.error("Error in GET /author/edit:", err);
    res.status(500).send("Database error");
  }
});

// edit author
app.post("/author/edit", async (req, res) => {
  try {
    const {
      authorId,
      fName,
      lName,
      dob,
      dod,
      sex,
      profession,
      country,
      portrait,
      biography,
    } = req.body;

    const sql = `
      UPDATE q_authors
      SET firstName  = ?,
          lastName   = ?,
          dob        = ?,
          dod        = ?,
          sex        = ?,
          profession = ?,
          country    = ?,
          portrait   = ?,
          biography  = ?
      WHERE authorId = ?
    `;

    const isAlive = !!req.body.alive;

    const params = [
      fName,
      lName,
      dob || null,
      isAlive ? null : (dod || null),
      sex || null,
      profession || null,
      country || null,
      portrait || null,
      biography || null,
      authorId,
    ];

    await pool.query(sql, params);
    res.redirect("/authors");
  } catch (err) {
    console.error("Error in POST /author/edit:", err);
    res.status(500).send("Database error");
  }
});

// delete author
app.get("/author/delete", async (req, res) => {
  try {
    const authorId = req.query.authorId;

    const sql = `DELETE FROM q_authors WHERE authorId = ?`;
    await pool.query(sql, [authorId]);

    res.redirect("/authors");
  } catch (err) {
    console.error("Error in GET /author/delete:", err);
    res.status(500).send("Database error");
  }
});

// quotes
// show add quote
app.get("/quote/new", async (req, res) => {
  try {
    const [authors] = await pool.query(
      `SELECT authorId, firstName, lastName
       FROM q_authors
       ORDER BY lastName, firstName`
    );

    const [categories] = await pool.query(
      `SELECT DISTINCT category
       FROM q_quotes
       ORDER BY category`
    );

    res.render("newQuote", { authors, categories });
  } catch (err) {
    console.error("Error in GET /quote/new:", err);
    res.status(500).send("Database error");
  }
});

// new quote submission
app.post("/quote/new", async (req, res) => {
  try {
    const { quote, authorId, category, likes } = req.body;

    const sql = `
      INSERT INTO q_quotes
        (quote, authorId, category, likes)
      VALUES (?, ?, ?, ?)
    `;
    const params = [quote, authorId, category, likes || null];

    await pool.query(sql, params);

    res.redirect("/quotes");
  } catch (err) {
    console.error("Error in POST /quote/new:", err);
    res.status(500).send("Database error");
  }
});

// list all quotes
app.get("/quotes", async (req, res) => {
  try {
    const sql = `
      SELECT q.quoteId,
             q.quote,
             q.category,
             q.likes,
             a.firstName,
             a.lastName
      FROM q_quotes q
      JOIN q_authors a ON q.authorId = a.authorId
      ORDER BY a.lastName, a.firstName, q.quoteId
    `;
    const [rows] = await pool.query(sql);
    res.render("quoteList", { quotes: rows });
  } catch (err) {
    console.error("Error in GET /quotes:", err);
    res.status(500).send("Database error");
  }
});

// edit quote w/ pre-filled values
app.get("/quote/edit", async (req, res) => {
  try {
    const quoteId = req.query.quoteId;

    const [quotes] = await pool.query(
      `SELECT *
       FROM q_quotes
       WHERE quoteId = ?`,
      [quoteId]
    );

    if (!quotes.length) {
      return res.status(404).send("Quote not found");
    }

    const quote = quotes[0];

    const [authors] = await pool.query(
      `SELECT authorId, firstName, lastName
       FROM q_authors
       ORDER BY lastName, firstName`
    );

    const [categories] = await pool.query(
      `SELECT DISTINCT category
       FROM q_quotes
       ORDER BY category`
    );

    res.render("editQuote", { quote, authors, categories });
  } catch (err) {
    console.error("Error in GET /quote/edit:", err);
    res.status(500).send("Database error");
  }
});

// edit quote
app.post("/quote/edit", async (req, res) => {
  try {
    const { quoteId, quote, authorId, category, likes } = req.body;

    const sql = `
      UPDATE q_quotes
      SET quote    = ?,
          authorId = ?,
          category = ?,
          likes    = ?
      WHERE quoteId = ?
    `;
    const params = [quote, authorId, category, likes || null, quoteId];

    await pool.query(sql, params);
    res.redirect("/quotes");
  } catch (err) {
    console.error("Error in POST /quote/edit:", err);
    res.status(500).send("Database error");
  }
});

// delete quote
app.get("/quote/delete", async (req, res) => {
  try {
    const quoteId = req.query.quoteId;

    const sql = `DELETE FROM q_quotes WHERE quoteId = ?`;
    await pool.query(sql, [quoteId]);

    res.redirect("/quotes");
  } catch (err) {
    console.error("Error in GET /quote/delete:", err);
    res.status(500).send("Database error");
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
