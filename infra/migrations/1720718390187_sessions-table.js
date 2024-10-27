exports.up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },

    token: {
      type: "varchar(96)",
      notNull: true,
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },

    expires_at: {
      type: "timestamp with time zone",
      notNull: true,
    },

    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("sessions");
};
