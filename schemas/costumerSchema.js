import joi from "joi";

export async function postCostumerSchema(req, res, next) {
  const costumerSchema = joi.object({
    name: joi.string().required(),
    phone: joi
      .string()
      .min(10)
      .max(11)
      .pattern(/^[0-9]+$/)
      .required(),
    cpf: joi
      .string()
      .length(11)
      .pattern(/^[0-9]+$/)
      .required(),
    birthday: joi.date().required(),
  });

  const { error } = costumerSchema.validate(req.body, { abortEarly: false });
  if (error)
    return res.status(400).send(error.details.map((detail) => detail.message));

  next();
}
