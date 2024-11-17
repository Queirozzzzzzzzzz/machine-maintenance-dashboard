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
  .get(authorization.canRequest("read:users"), getHandler)
  .post(
    postValidationHandler,
    authorization.canRequest("create:user"),
    postHandler,
  );

async function postValidationHandler(req, res, next) {
  if (
    req.body.password !== undefined &&
    req.body.confirm_password !== undefined
  )
    req.body.combined_passwords =
      req.body.password === req.body.confirm_password;

  const cleanValues = validator(req.body, {
    full_name: "required",
    email: "required",
    password: "required",
    combined_passwords: "required",
  });

  req.body = cleanValues;

  next();
}

async function postHandler(req, res) {
  const reqUser = req.context.user;
  const insecureInputValues = req.body;
  const secureInputValues = authorization.filterInput(
    reqUser,
    "create:user",
    insecureInputValues,
  );

  let newUser;
  try {
    newUser = await user.create(secureInputValues);
  } catch (err) {
    throw err;
  }

  const secureOutputValues = authorization.filterOutput(
    newUser,
    "read:user:self",
    newUser,
  );

  return res.status(201).json(secureOutputValues);
}

async function getHandler(req, res) {
  let users = [];
  try {
    users = await user.findAll();
  } catch (err) {
    throw err;
  }

  return res.status(200).json(users);
}
