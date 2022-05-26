import db from "./../db.js";

export async function getGames(req, res) {
  // TODO - - Caso seja passado um parâmetro `name` na **query string** da requisição,
  // os jogos devem ser filtrados para retornar somente os que começam com a string passada (case insensitive).
  // Exemplo:
  // Para a rota `/games?name=ba`, deve ser retornado uma array somente com
  //  os jogos que comecem com "ba", como "Banco Imobiliário", "Batalha Naval", etc
  //   const queryString = req.query;
  try {
    const games = await db.query("SELECT * FROM games");
    const gamesWithCategory = await games.rows.map(async (game) => {
      const categoryName = await db.query(
        "SELECT name FROM categories WHERE id = $1",
        [game.categoryId]
      );
      return { ...game, categoryName };
    });
    res.status(200).send(gamesWithCategory);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao obter os jogos");
  }
}

export async function postGames(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  try {
    const findGame = await db.query("SELECT * FROM games WHERE name = $1", [
      name,
    ]);
    if (findGame.rowCount > 0) {
      return res.status(409).send("Nome do jogo já existente");
    }

    const findCategoryById = await db.query(
      "SELECT * FROM categories WHERE id = $1",
      [categoryId]
    );
    if (findCategoryById.rowCount === 0) {
      return res.status(400).send("CategoryId não existente.");
    }

    await db.query(
      "INSERT INTO games (name, image, stockTotal, categoryId, pricePerDay) VALUES ($1, $2, $3, $4, $5)",
      [name, image, stockTotal, categoryId, pricePerDay]
    );
    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao postar o jogo");
  }
}
