import nextConnect from "next-connect";

import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import controller from "models/controller.js";
import user from "models/user.js";
import validator from "models/validator.js";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectUser)
  .use(controller.logRequest)
  .patch(
    patchValidationHandler,
    authorization.canRequest("update:user:others"),
    patchHandler,
  )
  .delete(
    deleteValidationHandler,
    authorization.canRequest("update:user:others"),
    deleteHandler,
  );

async function patchValidationHandler(req, res, next) {
  const cleanQueryValues = validator(req.query, {
    email: "required",
  });

  req.query = cleanQueryValues;

  const cleanBodyValues = validator(req.body, {
    features: "required",
  });

  req.body = cleanBodyValues;

  next();
}

async function patchHandler(req, res) {
  const targetUser = await user.findByEmail(req.query.email);
  let updatedUser;
  try {
    updatedUser = await user.insertFeatures(targetUser.id, req.body.features);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(updatedUser);
}

async function deleteValidationHandler(req, res, next) {
  const cleanQueryValues = validator(req.query, {
    email: "required",
  });

  req.query = cleanQueryValues;

  const cleanBodyValues = validator(req.body, {
    features: "required",
  });

  req.body = cleanBodyValues;

  next();
}

async function deleteHandler(req, res) {
  const targetUser = await user.findByEmail(req.query.email);

  let updatedUser;
  try {
    updatedUser = await user.removeFeatures(targetUser.id, req.body.features);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(updatedUser);
}
