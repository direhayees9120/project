const errorMiddleware = (err, req, res, next) => {
    const defaultError = {
      statusCode: 500, // default to 500 if error code is not provided
      success: "failed",
      message: err.message || err, // Use err.message if available
    };
  
    if (err?.name === "ValidationError") {
      defaultError.statusCode = 400;
      defaultError.message = Object.values(err.errors)
        .map((el) => el.message)
        .join(",");
    }
  
    // Duplicate error (MongoDB unique key error)
    if (err.code && err.code === 11000) {
      defaultError.statusCode = 400;
      defaultError.message = `${Object.values(err.keyValue)} field has to be unique!`;
    }
  
    // Log the error in the console
    console.error("Error Middleware:", err);
  
    res.status(defaultError.statusCode).json({
      success: defaultError.success,
      message: defaultError.message,
    });
  };
  
  export default errorMiddleware;
  