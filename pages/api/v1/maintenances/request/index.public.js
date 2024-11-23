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
  .post(postValidationHandler, postHandler);

async function postValidationHandler(req, res, next) {
  const cleanValues = validator(req.body, {
    machine: "required",
    problem: "optional",
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
