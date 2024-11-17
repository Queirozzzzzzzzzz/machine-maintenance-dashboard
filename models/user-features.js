const availableFeatures = new Set([
  // USER
  "create:user",
  "read:user:self",
  "update:user",
  "active",

  // SESSION
  "create:session",
  "read:session",

  // MANAGER
  "read:user",
  "read:users",
  "update:user:others",
  "deactivate:user",

  // ADMIN
  "admin",

  // UNACTIVE USER
  "unactive",
]);

export default availableFeatures;
