const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const app = express();
const port = process.env.PORT ?? 3000;

app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.BD_USER,
  host: process.env.BD_HOST,
  database: process.env.BD_DATABASE,
  password: process.env.BD_PASSWORD,
  port: process.env.BD_PORT,
  ssl: {
    rejectUnauthorized: true,
  },
});

app.use(express.static("public"));

app.get("*", (req, res) => {
  res.redirect("/");
});

app.post("/webhook", async (req, res) => {
  const payment = req.body;

  try {
    // Insertar el JSON completo del pago en la base de datos
    const insertQuery = `
          INSERT INTO payments (payment_json)
          VALUES ($1)
        `;
    const insertValues = [payment];
    await pool.query(insertQuery, insertValues);

    console.log("¡Pago recibido y guardado en la base de datos!");
    console.log(payment);
  } catch (error) {
    console.error("Error al insertar el pago en la base de datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
    return;
  }

  res.status(200).end();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
