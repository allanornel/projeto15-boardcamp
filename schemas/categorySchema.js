import joi from "joi";

export async function postCategorySchema(req, res, next) {
  const { name } = req.body;

  const categorySchema = joi.object({
    name: joi.string().required(),
  });

  const { error } = categorySchema.validate(req.body, { abortEarly: false });
  if (error)
    return res.status(400).send(error.details.map((detail) => detail.message));

  next();
}
