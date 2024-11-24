import Joi from "joi";

import { ValidationError } from "errors";
import availableFeatures from "models/user-features";

const MAX_INTEGER = 2147483647;
const MIN_INTEGER = -2147483648;

const cachedSchemas = {};

const defaultSchema = Joi.object()
  .label("body")
  .required()
  .min(1)
  .messages({
    "any.invalid": '{#label} possui o valor inválido "{#value}".',
    "any.only": "{#label} deve possuir um dos seguintes valores: {#valids}.",
    "any.required": "{#label} é um campo obrigatório.",
    "array.base": "{#label} deve ser do tipo Array.",
    "boolean.base": "{#label} deve ser do tipo Boolean.",
    "date.base": "{#label} deve conter uma data válida.",
    "markdown.empty": "Markdown deve conter algum texto.",
    "number.base": "{#label} deve ser do tipo Number.",
    "number.integer": "{#label} deve ser um Inteiro.",
    "number.max": "{#label} deve possuir um valor máximo de {#limit}.",
    "number.min": "{#label} deve possuir um valor mínimo de {#limit}.",
    "number.unsafe": `{#label} deve possuir um valor entre ${MIN_INTEGER} e ${MAX_INTEGER}.`,
    "object.base": "{#label} enviado deve ser do tipo Object.",
    "object.min": "Objeto enviado deve ter no mínimo uma chave.",
    "string.alphanum": "{#label} deve conter apenas caracteres alfanuméricos.",
    "string.base": "{#label} deve ser do tipo String.",
    "string.email": "{#label} deve conter um email válido.",
    "string.empty": "{#label} não pode estar em branco.",
    "string.length":
      '{#label} deve possuir {#limit} {if(#limit==1, "caractere", "caracteres")}.',
    "string.ip": "{#label} deve possuir um IP válido.",
    "string.guid": "{#label} deve possuir um token UUID na versão 4.",
    "string.max":
      '{#label} deve conter no máximo {#limit} {if(#limit==1, "caractere", "caracteres")}.',
    "string.min":
      '{#label} deve conter no mínimo {#limit} {if(#limit==1, "caractere", "caracteres")}.',
    "combined_passwords.no_match": "As senhas não coincidem.",
    "string.pattern.base": "{#label} está no formato errado.",
  });

export default function validator(obj, keys) {
  try {
    obj = JSON.parse(JSON.stringify(obj));
  } catch (error) {
    throw new ValidationError({
      message: "Não foi possível interpretar o valor enviado.",
      action: "Verifique se o valor enviado é um JSON válido.",
      errorLocationCode: "MODEL:VALIDATOR:ERROR_PARSING_JSON",
      stack: new Error().stack,
      key: "object",
    });
  }

  const keysString = Object.keys(keys).join(",");

  if (!cachedSchemas[keysString]) {
    let finalSchema = defaultSchema;

    for (const key of Object.keys(keys)) {
      const keyValidationFunction = schemas[key];
      finalSchema = finalSchema.concat(keyValidationFunction());
    }
    cachedSchemas[keysString] = finalSchema;
  }

  const { error, value } = cachedSchemas[keysString].validate(obj, {
    stripUnknown: true,
    context: {
      required: keys,
    },
    errors: {
      escapeHtml: true,
      wrap: {
        array: false,
        string: '"',
      },
    },
  });

  if (error) {
    throw new ValidationError({
      message: error.details[0].message,
      key:
        error.details[0].context.key ||
        error.details[0].context.type ||
        "object",
      errorLocationCode: "MODEL:VALIDATOR:FINAL_SCHEMA",
      stack: new Error().stack,
      type: error.details[0].type,
    });
  }

  return value;
}

const schemas = {
  features: function () {
    return Joi.object({
      features: Joi.array()
        .when("$required.features", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .items(Joi.string().valid(...availableFeatures))
        .messages({
          "any.only": '{#label} não aceita o valor "{#value}".',
        }),
    });
  },

  full_name: function () {
    return Joi.object({
      full_name: Joi.string()
        .pattern(/^[a-zA-Z0-9\u00C0-\u017F ]+$/)
        .min(1)
        .max(100)
        .trim()
        .when("$required.full_name", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  email: function () {
    return Joi.object({
      email: Joi.string()
        .email()
        .min(7)
        .max(254)
        .lowercase()
        .trim()
        .when("$required.email", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  password: function () {
    return Joi.object({
      password: Joi.string().min(8).max(72).trim().when("$required.password", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  combined_passwords: function () {
    return Joi.object({
      combined_passwords: Joi.boolean()
        .strict()
        .custom(checkCombinedPasswords, "check if passwords matches")
        .when("$required.combined_passwords", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  token_id: function () {
    return Joi.object({
      token_id: Joi.string()
        .trim()
        .guid({ version: "uuidv4" })
        .when("$required.token_id", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  session_id: function () {
    return Joi.object({
      session_id: Joi.string()
        .length(96)
        .alphanum()
        .when("$required.session_id", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  role: function () {
    return Joi.object({
      role: Joi.string()
        .valid("technical", "manager")
        .min(0)
        .when("$required.role", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  machine: function () {
    return Joi.object({
      machine: Joi.string().max(20).when("$required.machine", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  role: function () {
    return Joi.object({
      role: Joi.string()
        .valid("corrective", "preventive", "predictive", "pending")
        .max(10)
        .when("$required.role", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  criticality: function () {
    return Joi.object({
      criticality: Joi.string()
        .valid("light", "moderate", "high", "critical")
        .max(10)
        .when("$required.criticality", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  responsible: function () {
    return Joi.object({
      responsible: Joi.string()
        .guid()
        .allow(null)
        .when("$required.responsible", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  problem: function () {
    return Joi.object({
      problem: Joi.string().max(256).allow(null).when("$required.problem", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  progress: function () {
    return Joi.object({
      progress: Joi.string()
        .valid("ongoing", "concluded", "aborted")
        .max(10)
        .when("$required.progress", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  expires_at: function () {
    return Joi.object({
      expires_at: Joi.date().iso().when("$required.expires_at", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  price: function () {
    return Joi.object({
      price: Joi.number().allow(null).when("$required.price", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  id: function () {
    return Joi.object({
      id: Joi.string().guid().allow(null).when("$required.id", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },
};

function checkCombinedPasswords(combined_passwords, helpers) {
  if (combined_passwords != true)
    return helpers.error("combined_passwords.no_match");

  return combined_passwords;
}
