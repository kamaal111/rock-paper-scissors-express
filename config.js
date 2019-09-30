module.exports = {
  port: process.env.PORT || 4000,
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://postgres:secret@localhost:5432/postgres',
};
