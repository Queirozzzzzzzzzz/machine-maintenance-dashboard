const availableFeatures = new Set([
  // USER
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "active",

  // SESSION
  "create:session",
  "read:session",

  // MODERATION
  "admin",
  "read:users",
  "update:user:others",
  "deactivate:user",

  // UNACTIVE USER
  "unactive",
]);

export default availableFeatures;
