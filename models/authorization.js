import { ForbiddenError, ValidationError } from "errors";
import availableFeatures from "models/user-features";

function can(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);

  if (!user.features.includes(feature)) return false;

  switch (feature) {
    case "update:user":
      return resource?.id && user.id === resource.id;
  }

  if (!resource) return true;

  return false;
}

function filterInput(user, feature, input, target) {
  validateUser(user);
  validateFeature(feature);
  validateInput(input);

  let filteredInputValues = {};

  if (feature === "create:session" && can(user, feature)) {
    filteredInputValues = {
      email: input.email,
      password: input.password,
    };
  }

  if (feature === "create:user" && can(user, feature)) {
    filteredInputValues = {
      full_name: input.full_name,
      email: input.email,
      password: input.password,
    };
  }

  if (feature === "update:user:others" && can(user, feature, target)) {
    filteredInputValues = {
      full_name: input.full_name,
      email: input.email,
      password: input.password,
      features: input.features,
    };
  }

  return JSON.parse(JSON.stringify(filteredInputValues));
}

function filterOutput(user, feature, output) {
  validateUser(user);
  validateFeature(feature);
  validateOutput(output);

  let filteredOutputValues = {};

  if (feature === "read:user:self") {
    if (user.id && user.id === output.id) {
      filteredOutputValues = {
        id: output.id,
        full_name: output.full_name,
        email: output.email,
        features: output.features,
        created_at: output.created_at,
        updated_at: output.updated_at,
      };
    }
  }

  if (feature === "create:session" && can(user, feature)) {
    if (user.id && user.id === output.user_id) {
      filteredOutputValues = {
        id: output.id,
        token: output.token,
        expires_at: output.expires_at,
        created_at: output.created_at,
        updated_at: output.updated_at,
      };
    }
  }

  if (feature === "read:session" && can(user, feature)) {
    if (user.id && user.id === output.user_id) {
      filteredOutputValues = {
        id: output.id,
        expires_at: output.expires_at,
        created_at: output.created_at,
        updated_at: output.updated_at,
      };
    }
  }

  if (feature === "read:user" && can(user, feature)) {
    filteredOutputValues = {
      id: output.id,
      full_name: output.full_name,
      features: output.features,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  return JSON.parse(JSON.stringify(filteredOutputValues));
}

function validateUser(user) {
  if (!user) {
    throw new ValidationError({
      message: `Nenhum "user" foi especificado para a ação de autorização.`,
      action: `Contate o suporte informado o campo "errorId".`,
    });
  }

  if (!user.features || !Array.isArray(user.features)) {
    throw new ValidationError({
      message: `"user" não possui "features" ou não é um array.`,
      action: `Contate o suporte informado o campo "errorId".`,
    });
  }
}

function validateFeature(feature) {
  if (!feature) {
    throw new ValidationError({
      message: `Nenhuma "feature" foi especificada para a ação de autorização.`,
      action: `Contate o suporte informado o campo "errorId".`,
    });
  }

  if (!availableFeatures.has(feature)) {
    throw new ValidationError({
      message: `A feature utilizada não está disponível na lista de features existentes.`,
      action: `Contate o suporte informado o campo "errorId".`,
      context: {
        feature: feature,
      },
    });
  }
}

function validateInput(input) {
  if (!input) {
    throw new ValidationError({
      message: `Nenhum "input" foi especificado para a ação de filtro.`,
      action: `Contate o suporte informado o campo "errorId".`,
    });
  }
}

function validateOutput(output) {
  if (!output) {
    throw new ValidationError({
      message: `Nenhum "output" foi especificado para a ação de filtro.`,
      action: `Contate o suporte informado o campo "errorId".`,
    });
  }
}

function canRequest(feature) {
  return function (req, res, next) {
    const reqUser = req.context.user;

    if (!reqUser.features.includes(feature)) {
      throw new ForbiddenError({
        message: `Usuário não pode executar esta operação.`,
        action: `Verifique se este usuário possui a feature "${feature}".`,
        errorLocationCode: "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
      });
    }

    next();
  };
}

export default {
  can,
  canRequest,
  filterInput,
  filterOutput,
};
