import { sendError } from "../utils/apiResponse.js";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const validate = (check) => (req, res, next) => {
  const message = check(req);
  return message ? sendError(res, message, 400) : next();
};

export const validateRegistration = validate(({ body }) => {
  if (!isNonEmptyString(body.name) || body.name.trim().length < 2)
    return "A valid name is required.";
  if (!isEmail(body.email)) return "A valid email is required.";
  if (typeof body.password !== "string" || body.password.length < 8)
    return "Password must be at least 8 characters.";
  if (body.role && !["PATIENT", "TECHNICIAN"].includes(body.role))
    return "Public registration supports patients and technicians only.";
  if (
    body.role === "TECHNICIAN" &&
    (!isNonEmptyString(body.qualification) ||
      !isNonEmptyString(body.experience))
  )
    return "Technician qualification and experience are required.";
  if (body.phone && !/^[\d+ ()-]{7,20}$/.test(body.phone))
    return "Enter a valid phone number.";
  return null;
});

export const validateLogin = validate(({ body }) => {
  if (
    !isEmail(body.email) ||
    typeof body.password !== "string" ||
    body.password.length === 0
  )
    return "Email and password are required.";
  return null;
});

export const validateProfile = validate(({ body }) => {
  if (!isNonEmptyString(body.name)) return "Name is required.";
  if (body.phone && !/^[\d+ ()-]{7,20}$/.test(body.phone))
    return "Enter a valid phone number.";
  if (body.address && typeof body.address !== "object")
    return "Address must be an object.";
  return null;
});

export const validateBooking = validate(({ body }) => {
  if (!isObjectId(body.testId)) return "A valid test is required.";
  if (!isObjectId(body.technicianId))
    return "A valid technician slot is required.";
  if (!isValidDate(body.appointmentDate))
    return "A valid appointment date is required.";
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.startTime) ||
    (Number(body.startTime.slice(0, 2)) * 60 +
      Number(body.startTime.slice(3))) %
      30 !==
      0
  )
    return "A valid 30-minute appointment slot is required.";
  if (!["HOME_COLLECTION", "LAB_VISIT"].includes(body.collectionType))
    return "A valid collection type is required.";
  if (
    body.collectionType === "HOME_COLLECTION" &&
    (!isNonEmptyString(body.address?.street) ||
      !isNonEmptyString(body.address?.city) ||
      !isNonEmptyString(body.address?.pincode))
  )
    return "Street, city, and pincode are required for home collection.";
  return null;
});

export const validateReschedule = validate(({ body }) => {
  if (!isObjectId(body.technicianId) || !isValidDate(body.appointmentDate))
    return "A valid technician and appointment date are required.";
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.startTime) ||
    (Number(body.startTime.slice(0, 2)) * 60 +
      Number(body.startTime.slice(3))) %
      30 !==
      0
  )
    return "A valid 30-minute appointment slot is required.";
  return null;
});

export const validateStatus = (allowedStatuses, field = "status") =>
  validate(({ body }) =>
    allowedStatuses.includes(body[field]) ? null : "Invalid status value.",
  );

export const validateReport = validate(({ body }) => {
  if (!Array.isArray(body.results) || body.results.length === 0)
    return "At least one test result is required.";
  if (
    body.results.some(
      (result) =>
        !isNonEmptyString(result.marker) || !isNonEmptyString(result.value),
    )
  )
    return "Each result needs a marker and value.";
  if (!isNonEmptyString(body.interpretation))
    return "A clinical interpretation is required.";
  return null;
});

export const validateTest = validate(({ body }) => {
  const required = [
    "name",
    "code",
    "description",
    "category",
    "sampleType",
    "preparationInstructions",
    "estimatedReportTime",
  ];
  if (required.some((field) => !isNonEmptyString(body[field])))
    return "All test description fields are required.";
  if (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)
    return "A valid non-negative price is required.";
  if (typeof body.fastingRequired !== "boolean")
    return "Fasting requirement must be true or false.";
  if (
    typeof body.homeCollectionAvailable !== "boolean" ||
    typeof body.labVisitAvailable !== "boolean"
  )
    return "Collection modes must be true or false.";
  return null;
});

export const validateTestStatus = validate(({ body }) =>
  typeof body.active === "boolean"
    ? null
    : "Active status must be true or false.",
);

export const validateAvailability = validate(({ body }) => {
  if (!Array.isArray(body.availability))
    return "Availability must be an array.";
  const days = body.availability.map((period) => period.day);
  if (new Set(days).size !== days.length)
    return "Each weekday may only appear once.";
  if (
    body.availability.some(
      (period) =>
        typeof period.off !== "boolean" ||
        ![
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ].includes(period.day) ||
        (!period.off &&
          (!/^([01]\d|2[0-3]):[0-5]\d$/.test(period.startTime) ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(period.endTime) ||
            period.startTime >= period.endTime)),
    )
  )
    return "Each availability period needs a valid day and time range.";
  return null;
});

export const validateBlockedSlot = validate(({ body }) => {
  if (
    !isValidDate(body.date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.endTime) ||
    body.startTime >= body.endTime
  )
    return "A valid blocked date and time range are required.";
  return null;
});
