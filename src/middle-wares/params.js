module.exports = (req, res, next,id) => {
  try {
    if (isNaN(id)) {
      res.status(400).send('Invalid ID');
    } else {
      // store the id parameter in the request object for later use
      req.id = id;
      console.log({id});
      next();
    }
    next();
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Could not sanitize body",
    });
  }
};
