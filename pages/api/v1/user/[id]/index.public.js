import nextConnect from "next-connect";

import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import controller from "models/controller.js";
import user from "models/user.js";
import validator from "models/validator";
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
  .delete(authorization.canRequest("update:user:others"), deleteHandler)
  .patch(
    authorization.canRequest("update:user:others"),
    patchValidationHandler,
    patchHandler,
  );

async function getValidationHandler(req, res, next) {
  const cleanQueryValues = validator(req.query, {
    id: "required",
  });

  req.query = cleanQueryValues;

  next();
}

async function getHandler(req, res) {
  const reqUser = req.context.user;
  const targetUserId = req.query.id;

  if (reqUser.id != targetUserId && !reqUser.features.includes("read:user")) {
    throw new ForbiddenError({
      message: `Usuário não pode executar esta operação.`,
      action: `Verifique se este usuário possui a feature "read:user".`,
      errorLocationCode: "API:USER:GET_USER_BY_ID:USER_CANT_READ_USER",
    });
  }

  let resUser;
  try {
    resUser = await user.findById(req.query.id);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(resUser);
}

async function deleteHandler(req, res) {
  let deletedUser;
  try {
    deletedUser = await user.removeById(req.query.id);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(deletedUser);
}

async function patchValidationHandler(req, res, next) {
  const cleanQueryValues = validator(req.query, {
    id: "required",
  });

  req.query = cleanQueryValues;

  const cleanBodyValues = validator(req.body, {
    full_name: "optional",
    email: "optional",
    password: "optional",
    role: "optional",
  });

  req.body = cleanBodyValues;

  next();
}

async function patchHandler(req, res) {
  let newUser;
  try {
    newUser = await user.update(req.query.id, req.body);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(newUser);
}
