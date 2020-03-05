module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "sadasdasdasdasd",
  DOMAIN_NAME: process.env.DOMAIN_NAME || "localhost",
  PAGE_URL: process.env.PAGE_URL || "http://localhost:3000",
  PORT_RANGE: { min: 5000, max: 6000 }
};
