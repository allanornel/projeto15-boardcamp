import db from "./../db.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {
  const { customerId, gameId, order, desc, offset, limit } = req.query;
  try {
    let rentals;
    if (customerId) {
      rentals = await db.query(`SELECT * FROM rentals WHERE "customerId"=$1`, [
        customerId,
      ]);
    } else if (gameId) {
      rentals = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1`, [
        gameId,
      ]);
    } else if (order) {
      if (desc) {
        rentals = await db.query(
          `SELECT * FROM rentals ORDER BY ${order} DESC`
        );
      } else {
        rentals = await db.query(`SELECT * FROM rentals ORDER BY ${order}`);
      }
    } else if (offset || limit) {
      if (offset && limit) {
        rentals = await db.query("SELECT * FROM rentals LIMIT $1 OFFSET $2", [
          limit,
          offset,
        ]);
      } else if (offset) {
        rentals = await db.query("SELECT * FROM rentals OFFSET $1", [offset]);
      } else if (limit) {
        rentals = await db.query("SELECT * FROM rentals LIMIT $1", [limit]);
      }
    } else {
      rentals = await db.query(`SELECT * FROM rentals`);
    }
    const newRentals = await Promise.all(
      rentals.rows.map(async (rental) => {
        const customer = await db.query(
          `SELECT id, name FROM customers WHERE id=$1`,
          [rental.customerId]
        );
        const game = await db.query(
          `SELECT id, name, "categoryId" FROM games WHERE id=$1`,
          [rental.gameId]
        );
        const categoryName = await db.query(
          "SELECT name FROM categories WHERE id=$1",
          [game.rows[0].categoryId]
        );
        return {
          ...rental,
          customer: customer.rows[0],
          game: { ...game.rows[0], categoryName: categoryName.rows[0].name },
        };
      })
    );
    res.status(200).send(newRentals);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao listar os aluguéis");
  }
}

export async function postRentals(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = dayjs().format("YYYY-MM-DD");
  try {
    const findGame = await db.query("SELECT * FROM games WHERE id=$1", [
      gameId,
    ]);
    if (findGame.rowCount === 0) {
      return res.status(400).send("Jogo não encontrado.");
    }
    const findCostumer = await db.query(`SELECT * FROM customers WHERE id=$1`, [
      customerId,
    ]);
    if (findCostumer.rowCount === 0) {
      return res.status(400).send("Consumidor não encontrado.");
    }
    const findRentals = await db.query(
      `SELECT * FROM rentals WHERE "gameId"=$1`,
      [gameId]
    );
    if (findRentals.rowCount >= findGame.rows[0].stockTotal) {
      return res.status(400).send("Stock insuficiente.");
    }

    const originalPrice = daysRented * findGame.rows[0].pricePerDay;
    await db.query(
      `INSERT INTO rentals 
      ("customerId", "gameId", "daysRented", "rentDate", "originalPrice", "returnDate", "delayFee")
       VALUES ($1, $2, $3, $4, $5, null, null);`,
      [customerId, gameId, daysRented, rentDate, originalPrice]
    );
    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao postar o aluguel");
  }
}
export async function finalRental(req, res) {
  const { id } = req.params;
  try {
    const findRental = await db.query("SELECT * FROM rentals WHERE id=$1", [
      id,
    ]);
    if (findRental.rowCount === 0) {
      return res.sendStatus(404);
    }
    if (findRental.rows[0].returnDate !== null) {
      return res.sendStatus(400);
    }
    let delayFee = null;
    const diffDays = dayjs().diff(findRental.rows[0].rentDate, "day");
    if (diffDays > findRental.rows[0].daysRented) {
      let daysLate = diffDays - findRental.rows[0].daysRented;
      const findGame = await db.query("SELECT * FROM games WHERE id=$1", [
        findRental.rows[0].gameId,
      ]);
      delayFee = daysLate * findGame.rows[0].pricePerDay;
    }
    const returnDate = dayjs().format("YYYY-MM-DD");
    await db.query(
      `UPDATE rentals SET
    "returnDate"=$1,
    "delayFee"=$2
    WHERE id=$3`,
      [returnDate, delayFee, id]
    );
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao finalizar o aluguel");
  }
}
export async function deleteRental(req, res) {
  const { id } = req.params;
  try {
    const findRental = await db.query("SELECT * FROM rentals WHERE id=$1", [
      id,
    ]);
    if (findRental.rowCount === 0) {
      return res.sendStatus(404);
    }
    if (findRental.rows[0].returnDate !== null) {
      return res.sendStatus(400);
    }
    await db.query("DELETE FROM rentals WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao deletar o aluguel");
  }
}
