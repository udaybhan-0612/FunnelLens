export function notFound(req, res) {
  res.status(404).json({
    error: "API endpoint not found.",
    path: req.originalUrl
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "An unexpected server error occurred."
  });
}
