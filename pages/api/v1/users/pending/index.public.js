import nextConnect from "next-connect";

import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import controller from "models/controller.js";
import user from "models/user.js";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(authentication.injectUser)
  .use(controller.logRequest)
  .get(authorization.canRequest("read:users"), getHandler);

async function getHandler(req, res) {
  let users = [];
  try {
    users = await user.findByMissingFeature("active");
  } catch (err) {
    throw err;
  }

  return res.status(200).json(users);
}
