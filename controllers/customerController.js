import db from "../db.js";

export async function getCustomers(req, res) {
  const { order, desc, offset, limit, cpf } = req.query;
  try {
    let customers;
    if (cpf) {
      customers = await db.query(
        `SELECT * FROM customers where (cpf LIKE '${cpf}%')`
      );
    } else if (order) {
      if (desc) {
        customers = await db.query(
          `SELECT * FROM customers ORDER BY ${order} DESC`
        );
      } else {
        customers = await db.query(`SELECT * FROM customers ORDER BY ${order}`);
      }
    } else if (offset || limit) {
      if (offset && limit) {
        customers = await db.query(
          "SELECT * FROM customers LIMIT $1 OFFSET $2",
          [limit, offset]
        );
      } else if (offset) {
        customers = await db.query("SELECT * FROM customers OFFSET $1", [
          offset,
        ]);
      } else if (limit) {
        customers = await db.query("SELECT * FROM customers LIMIT $1", [limit]);
      }
    } else {
      customers = await db.query("SELECT * FROM customers");
    }
    res.status(200).send(customers.rows);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao obter os consumidores");
  }
}
export async function getCustomersId(req, res) {
  const { id } = req.params;
  try {
    const customer = await db.query("SELECT * FROM customers WHERE id = $1", [
      id,
    ]);
    if (customer.rowCount > 0) {
      res.status(200).send(customer.rows[0]);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao obter o consumidor");
  }
}
export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  try {
    const findCpf = await db.query("SELECT * FROM customers WHERE cpf = $1", [
      cpf,
    ]);
    if (findCpf.rowCount > 0) {
      return res.status(409).send("CPF já cadastrado!");
    }
    await db.query(
      "INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)",
      [name, phone, cpf, birthday]
    );
    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao cadastrar o consumidor");
  }
}
export async function updateCustomers(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;
  try {
    const findCpf = await db.query("SELECT * FROM customers WHERE cpf = $1", [
      cpf,
    ]);
    if (findCpf.rowCount > 0) {
      if (findCpf.rows[0].id !== parseInt(id)) {
        return res.status(409).send("CPF já cadastrado!");
      }
    }
    await db.query(
      `UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5 ;`,
      [name, phone, cpf, birthday, id]
    );
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send("Ocorreu um erro ao cadastrar o consumidor");
  }
}
