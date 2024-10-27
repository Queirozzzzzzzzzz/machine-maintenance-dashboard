import nextConnect from "next-connect";

import controller from "models/controller";
import validator from "models/validator";
import user from "models/user";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(controller.logRequest)
  .post(postValidationHandler, postHandler);

async function postValidationHandler(req, res, next) {
  const values = {
    full_name: process.env.ADMIN_FULL_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };

  const cleanValues = validator(values, {
    full_name: "required",
    email: "required",
    password: "required",
  });

  req.body = cleanValues;

  next();
}

async function postHandler(req, res) {
  const newUser = await user.createAdmin(req.body);

  return res.status(201).json(newUser);
}
