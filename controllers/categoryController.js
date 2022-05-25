import db from "./../db.js";

export async function getCategories(req, res) {
  try {
    const categories = await db.query("SELECT * FROM categories");
    res.status(200).send(categories.rows);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao obter as categorias");
  }
}

export async function postCategories(req, res) {}
