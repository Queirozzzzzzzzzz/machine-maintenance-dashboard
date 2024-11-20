import nextConnect from "next-connect";

import authentication from "models/authentication";
import authorization from "models/authorization";
import validator from "models/validator";
import controller from "models/controller";
import maintenance from "models/maintenance";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectUser)
  .use(controller.logRequest)
  .get(getHandler)
  .post(
    authorization.canRequest("post:maintenances:manager"),
    postValidationHandler,
    postHandler,
  );

async function getHandler(req, res) {
  const reqUser = req.context.user;

  let resMaintenances = [];
  try {
    if (!reqUser.features.includes("admin")) {
      resMaintenances = await maintenance.findByUserId(reqUser.id);
    } else {
      resMaintenances = await maintenance.findAll();
    }
  } catch (err) {
    throw err;
  }

  return res.status(200).json(resMaintenances);
}

async function postValidationHandler(req, res, next) {
  const cleanValues = validator(req.body, {
    machine: "required",
    role: "required",
    criticality: "required",
    responsible: "optional",
    problem: "optional",
    expires_at: "required",
    price: "optional",
  });

  req.body = cleanValues;

  next();
}

async function postHandler(req, res) {
  let newMaintenance = {};
  try {
    newMaintenance = await maintenance.create(req.body);
  } catch (err) {
    throw err;
  }

  return res.status(201).json(newMaintenance);
}
