exports.up = (pgm) => {
  pgm.createTable("machines", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },

    name: {
      type: "varchar(20)",
      notNull: true,
    },

    state: {
      type: "varchar(10)",
      notNull: true,
      check: "\"state\" IN ('active', 'disabled')",
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },

    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("machines");
};
