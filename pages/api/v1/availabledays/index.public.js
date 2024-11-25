import nextConnect from "next-connect";

import authentication from "models/authentication";
import authorization from "models/authorization";
import validator from "models/validator";
import controller from "models/controller";
import availabledays from "models/availabledays";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectUser)
  .use(controller.logRequest)
  .get(authorization.canRequest("admin"), getHandler)
  .post(authorization.canRequest("admin"), postValidationHandler, postHandler);

async function getHandler(req, res) {
  let resAvailabledays = [];
  try {
    resAvailabledays = await availabledays.findAll();
  } catch (err) {
    throw err;
  }

  return res.status(200).json(resAvailabledays);
}

async function postValidationHandler(req, res, next) {
  const cleanValues = validator(req.body, {
    date: "required",
  });

  req.body = cleanValues;

  next();
}

async function postHandler(req, res) {
  let newAvailableday = {};
  try {
    newAvailableday = await availabledays.create(req.body.date);
  } catch (err) {
    throw err;
  }

  return res.status(201).json(newAvailableday);
}
