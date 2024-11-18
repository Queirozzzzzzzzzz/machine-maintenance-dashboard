const availableFeatures = new Set([
  // USER
  "create:user",
  "read:user:self",
  "update:user",
  "active",

  // SESSION
  "create:session",
  "read:session",

  // MAINTENANCES
  "read:maintenances:self",

  // MANAGER
  "read:user",
  "read:users",
  "update:user:others",
  "deactivate:user",
  "read:maintenances:all",
  "post:maintenances:manager",
  "update:maintenances",

  // ADMIN
  "admin",

  // UNACTIVE USER
  "unactive",
]);

export default availableFeatures;
