exports.up = (pgm) => {
  pgm.createTable("available_days", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },

    date: {
      type: "timestamp with time zone",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("available_days");
};
