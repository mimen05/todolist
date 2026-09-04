// Anything a route hands to next(err) lands here instead of crashing the server.
// Express only treats a middleware as an error handler if it takes 4 arguments,
// so "next" has to stay in the signature even though it is unused.
module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
};
