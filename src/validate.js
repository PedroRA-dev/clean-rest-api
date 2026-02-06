function validate({ bodySchema, querySchema }) {
  return (req, res, next) => {
    try {
      if (bodySchema) req.body = bodySchema.parse(req.body);
      if (querySchema) req.query = querySchema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}


module.exports = { validate };
