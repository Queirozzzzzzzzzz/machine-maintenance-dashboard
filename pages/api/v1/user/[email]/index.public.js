import nextConnect from "next-connect";

import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import controller from "models/controller.js";
import user from "models/user.js";
import validator from "models/validator";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectUser)
  .use(controller.logRequest)
  .get(getValidationHandler, authorization.canRequest("read:user"), getHandler)
  .delete(authorization.canRequest("update:user:others"), deleteHandler);

async function getValidationHandler(req, res, next) {
  const cleanQueryValues = validator(req.query, {
    email: "required",
  });

  req.query = cleanQueryValues;

  next();
}

async function getHandler(req, res) {
  let resUser;
  try {
    resUser = await user.findByEmail(req.query.email);
  } catch (err) {
    throw err;
  }
  console.log(resUser);

  return res.status(200).json(resUser);
}

async function deleteHandler(req, res) {
  let deletedUser;
  try {
    deletedUser = await user.removeByEmail(req.query.email);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(deletedUser);
}
