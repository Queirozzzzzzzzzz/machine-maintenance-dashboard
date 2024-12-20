exports.up = (pgm) => {
  pgm.createTable("maintenances", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },

    machine: {
      type: "varchar(20)",
      notNull: true,
    },

    criticality: {
      type: "varchar(10)",
      check: "criticality IN ('light', 'moderate', 'high', 'critical')",
    },

    responsible: {
      type: "uuid",
      references: "users(id)",
    },

    problem: {
      type: "varchar(256)",
    },

    role: {
      type: "varchar(10)",
      check: "role IN ('pending', 'corrective', 'preventive', 'predictive')",
    },

    progress: {
      type: "varchar(10)",
      notNull: true,
      check: "progress IN ('ongoing', 'concluded', 'aborted')",
      default: "ongoing",
    },

    price: {
      type: "float",
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },

    expires_at: {
      type: "timestamp with time zone",
    },

    concluded_at: {
      type: "timestamp with time zone",
    },

    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("maintenances");
};
