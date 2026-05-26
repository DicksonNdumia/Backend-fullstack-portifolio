import rateLimit from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 Minutes
  max: 40, //Number of requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many Requests made!',
      message: 'You have tried so many attempts',
      standardHeaders: true,
      legacyHeaders: false,
    })
  },
})
