import db from "./../db.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {
  const { customerId, gameId, order, desc, offset, limit } = req.query;
  try {
    let rentals;
    if (customerId) {
      rentals = await db.query(
        `SELECT 
      rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
      categories.name AS "categoryName" 
      FROM rentals 
        JOIN customers ON rentals."customerId"=customers.id
        JOIN games ON rentals."gameId"=games.id
        JOIN categories ON games."categoryId"=categories.id WHERE "customerId"=$1`,
        [customerId]
      );
    } else if (gameId) {
      rentals = await db.query(
        `SELECT 
      rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
      categories.name AS "categoryName" 
      FROM rentals 
        JOIN customers ON rentals."customerId"=customers.id
        JOIN games ON rentals."gameId"=games.id
        JOIN categories ON games."categoryId"=categories.id WHERE "gameId"=$1`,
        [gameId]
      );
    } else if (order) {
      if (desc) {
        rentals = await db.query(
          `SELECT 
          rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
          categories.name AS "categoryName" 
          FROM rentals 
            JOIN customers ON rentals."customerId"=customers.id
            JOIN games ON rentals."gameId"=games.id
            JOIN categories ON games."categoryId"=categories.id ORDER BY "${order}" DESC`
        );
      } else {
        rentals = await db.query(`SELECT 
        rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
        categories.name AS "categoryName" 
        FROM rentals 
          JOIN customers ON rentals."customerId"=customers.id
          JOIN games ON rentals."gameId"=games.id
          JOIN categories ON games."categoryId"=categories.id ORDER BY "${order}"`);
      }
    } else if (offset || limit) {
      if (offset && limit) {
        rentals = await db.query(
          `SELECT 
        rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
        categories.name AS "categoryName" 
        FROM rentals 
          JOIN customers ON rentals."customerId"=customers.id
          JOIN games ON rentals."gameId"=games.id
          JOIN categories ON games."categoryId"=categories.id LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
      } else if (offset) {
        rentals = await db.query(
          `SELECT 
        rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
        categories.name AS "categoryName" 
        FROM rentals 
          JOIN customers ON rentals."customerId"=customers.id
          JOIN games ON rentals."gameId"=games.id
          JOIN categories ON games."categoryId"=categories.id OFFSET $1`,
          [offset]
        );
      } else if (limit) {
        rentals = await db.query(
          `SELECT 
        rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
        categories.name AS "categoryName" 
        FROM rentals 
          JOIN customers ON rentals."customerId"=customers.id
          JOIN games ON rentals."gameId"=games.id
          JOIN categories ON games."categoryId"=categories.id LIMIT $1`,
          [limit]
        );
      }
    } else {
      rentals = await db.query(`SELECT 
      rentals.*, customers.name AS "customerName", games.name AS "gameName", games."categoryId", 
      categories.name AS "categoryName" 
      FROM rentals 
        JOIN customers ON rentals."customerId"=customers.id
        JOIN games ON rentals."gameId"=games.id
        JOIN categories ON games."categoryId"=categories.id;`);
    }

    const newRentals = rentals.rows.map((rental) => {
      return {
        id: rental.id,
        customerId: rental.customerId,
        gameId: rental.gameId,
        rentDate: rental.rentDate,
        daysRented: rental.daysRented,
        returnDate: rental.returnDate,
        originalPrice: rental.originalPrice,
        delayFee: rental.delayFee,
        customer: { id: rental.customerId, name: rental.customerName },
        game: {
          id: rental.gameId,
          name: rental.gameName,
          categoryId: rental.categoryId,
          categoryName: rental.categoryName,
        },
      };
    });
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
