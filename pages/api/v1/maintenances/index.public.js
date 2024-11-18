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
  .get(authorization.canRequest("read:maintenances:all"), getHandler);

async function getHandler(req, res) {
  let resMaintenances = [];
  try {
    resMaintenances = await maintenance.findAll();
  } catch (err) {
    throw err;
  }

  return res.status(200).json(resMaintenances);
}
