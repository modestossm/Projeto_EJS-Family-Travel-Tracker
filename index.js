import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

app.disable("x-powered-by");
app.set("trust proxy", 1);

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;
let users = [];

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1;", [currentUserId]);
  const countries = result.rows.map((country) => country.country_code);
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return res.render("new.ejs", {
      error: "Cadastre o primeiro membro da família para começar.",
    });
  }

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
    error: req.query.error === "last-user"
      ? "Mantenha pelo menos um membro da família!"
      : req.query.error === "country-not-found"
        ? "Não encontramos um país com esse nome ou código. Verifique se digitou corretamente."
        : null,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"]?.trim();

  if (!input) {
    return res.redirect("/?error=country-not-found");
  }

  try {
    const result = await db.query(
      `SELECT country_code
       FROM countries
       WHERE UPPER(country_code) = UPPER($1)
          OR LOWER(country_name) LIKE '%' || LOWER($1) || '%'
       ORDER BY CASE
         WHEN UPPER(country_code) = UPPER($1) THEN 0
         ELSE 1
       END, country_name
       LIMIT 1;`,
      [input]
    );

    if (result.rows.length === 0) {
      return res.redirect("/?error=country-not-found");
    }

    const data = result.rows[0];
    const countryCode = data.country_code;

    await db.query(
      "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
      [countryCode, currentUserId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/user", (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    // console.log(req.body);
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name?.trim();
  const color = req.body.color;
  const validColors = [
    "#ff4500",
    "#21ba45",
    "#fbbd08",
    "#b5cc18",
    "#f2711c",
    "#00b5ad",
    "#2185d0",
    "#6435c9",
    "#a333c8",
    "#e03997",
  ];

  if (!name || name.length > 15 || !validColors.includes(color)) {
    return res.status(400).render("new.ejs", {
      error: "Informe um nome de até 15 caracteres e selecione uma cor!",
    });
  }

  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
      [name, color]
    );

    const id = result.rows[0].id;
    currentUserId = id;
  } catch (err) {
    console.log(err);
    const error = err.code === "23505"
      ? "Já existe um membro com esse nome."
      : "Não foi possível adicionar!";

    return res.status(400).render("new.ejs", { error });
  }

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const userId = req.body.userId;

  const countResult = await db.query("SELECT COUNT(*)::int AS count FROM users");
  if (countResult.rows[0].count <= 1) {
    return res.redirect("/?error=last-user");
  }

  await db.query("DELETE FROM visited_countries WHERE user_id = $1", [userId]);
  await db.query("DELETE FROM users WHERE id = $1", [userId]);

  if (currentUserId == userId) {
    const nextUser = await db.query("SELECT id FROM users ORDER BY id LIMIT 1");
    currentUserId = nextUser.rows[0].id;
  }

  res.redirect("/");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
