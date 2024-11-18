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
  .delete(authorization.canRequest("update:maintenances"), deleteHandler)
  .patch(
    authorization.canRequest("update:maintenances"),
    patchValidationHandler,
    patchHandler,
  );

async function deleteHandler(req, res) {
  let deletedMaintenance = [];
  try {
    deletedMaintenance = await maintenance.removeById(req.query.id);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(deletedMaintenance);
}

async function patchValidationHandler(req, res, next) {
  const cleanValues = validator(req.body, {
    machine: "required",
    role: "required",
    criticality: "required",
    responsible: "optional",
    problem: "required",
    expires_at: "required",
  });

  req.body = cleanValues;

  next();
}

async function patchHandler(req, res) {
  let newMaintenance = {};
  try {
    newMaintenance = await maintenance.update(req.query.id, req.body);
  } catch (err) {
    throw err;
  }

  return res.status(201).json(newMaintenance);
}
