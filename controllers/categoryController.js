import db from "./../db.js";

export async function getCategories(req, res) {
  const { order, desc } = req.query;
  try {
    let categories;
    if (order) {
      if (desc) {
        categories = await db.query(
          `SELECT * FROM categories ORDER BY ${order} DESC`
        );
      } else {
        categories = await db.query(
          `SELECT * FROM categories ORDER BY ${order}`
        );
      }
    } else {
      categories = await db.query("SELECT * FROM categories");
    }
    res.status(200).send(categories.rows);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao obter as categorias");
  }
}

export async function postCategories(req, res) {
  const { name } = req.body;
  try {
    const findCategory = await db.query(
      "SELECT * FROM categories WHERE name = $1",
      [name]
    );
    if (findCategory.rowCount > 0) {
      return res.status(409).send("Nome de categoria já existente");
    }
    await db.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao postar a categoria");
  }
}
