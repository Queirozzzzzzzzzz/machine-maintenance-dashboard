import nextConnect from "next-connect";

import authentication from "models/authentication";
import authorization from "models/authorization";
import validator from "models/validator";
import controller from "models/controller";
import maintenance from "models/maintenance";
import { ForbiddenError } from "errors";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectUser)
  .use(controller.logRequest)
  .get(getValidationHandler, getHandler)
  .delete(authorization.canRequest("update:maintenances"), deleteHandler)
  .patch(
    authorization.canRequest("update:maintenances:self"),
    patchValidationHandler,
    patchHandler,
  );

async function getValidationHandler(req, res, next) {
  const cleanValues = validator(req.query, {
    id: "required",
  });

  req.query = cleanValues;

  next();
}

async function getHandler(req, res) {
  const reqUser = req.context.user;

  let resMaintenance = [];
  try {
    resMaintenance = await maintenance.findById(req.query.id);

    if (
      !reqUser.features.includes("admin") &&
      resMaintenance.responsible != reqUser.id
    ) {
      throw new ForbiddenError({
        message: `Você não possui permissão para carregar esta manutenção.`,
        action: `Verifique se este usuário possui a feature "admin".`,
        errorLocationCode:
          "CONTROLLER:MAINTENANCES:ID:GET_HANDLER:CAN_NOT_READ_MAINTENANCE",
      });
    }
  } catch (err) {
    throw err;
  }

  return res.status(200).json(resMaintenance);
}

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
  const cleanQueryValues = validator(req.query, {
    id: "required",
  });

  req.query = cleanQueryValues;

  const cleanValues = validator(req.body, {
    machine: "optional",
    role: "optional",
    criticality: "optional",
    responsible: "optional",
    problem: "optional",
    progress: "optional",
    expires_at: "optional",
    concluded_at: "optional",
    price: "optional",
  });

  req.body = cleanValues;

  next();
}

async function patchHandler(req, res) {
  const oldMaintenance = await maintenance.findById(req.query.id);
  const reqUser = req.context.user;

  let newMaintenance = {};
  try {
    if (
      !reqUser.features.includes("admin") &&
      oldMaintenance.responsible != reqUser.id
    ) {
      throw new ForbiddenError({
        message: `Você não possui permissão para carregar esta manutenção.`,
        action: `Verifique se este usuário possui a feature "admin".`,
        errorLocationCode:
          "CONTROLLER:MAINTENANCES:ID:GET_HANDLER:CAN_NOT_READ_MAINTENANCE",
      });
    }

    newMaintenance = await maintenance.update(req.query.id, req.body);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(newMaintenance);
}
