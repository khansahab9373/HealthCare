import Appointment from "../models/Appointment.js";
import Report from "../models/Report.js";
import Test from "../models/Test.js";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { createNotification } from "../services/notificationService.js";
import { recordAudit } from "../services/auditService.js";
import Counter from "../models/Counter.js";

const dayNames = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

const getDateRange = (date) => ({
  $gte: new Date(`${date}T00:00:00`),
  $lt: new Date(`${date}T23:59:59.999`),
});

const createSampleId = async () => {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { key: `sample-${year}` },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return `BL-${year}-${String(counter.value).padStart(6, "0")}`;
};

const isSlotAvailable = async ({ technician, date, startTime, excludeId }) => {
  const appointmentStart = new Date(`${date}T${startTime}:00`);
  const endMinutes = toMinutes(startTime) + 30;
  const day = dayNames[new Date(`${date}T00:00:00`).getDay()];
  const period = technician.availability?.find((item) => item.day === day);
  if (!period || period.off)
    return "This technician is not working on that day.";
  if (
    toMinutes(startTime) < toMinutes(period.startTime) ||
    endMinutes > toMinutes(period.endTime)
  )
    return "This slot is outside the technician working hours.";
  if (appointmentStart <= new Date())
    return "Appointment time must be in the future.";
  if (
    technician.blockedSlots?.some(
      (slot) =>
        slot.date === date &&
        toMinutes(startTime) < toMinutes(slot.endTime) &&
        endMinutes > toMinutes(slot.startTime),
    )
  )
    return "This slot is blocked by the technician.";
  const conflict = await Appointment.findOne({
    technician: technician._id,
    appointmentDate: {
      $lt: new Date(appointmentStart.getTime() + 30 * 60 * 1000),
      $gte: new Date(appointmentStart.getTime() - 30 * 60 * 1000),
    },
    status: { $nin: ["CANCELLED", "REJECTED"] },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  return conflict ? "This selected slot is no longer available." : null;
};

export const createAppointment = async (req, res) => {
  try {
    const {
      testId,
      technicianId,
      appointmentDate,
      startTime,
      collectionType,
      notes,
      address,
    } = req.body;

    if (!testId || !appointmentDate || !startTime || !collectionType) {
      return sendError(
        res,
        "Test, date, time, and collection type are required.",
        400,
      );
    }

    const test = await Test.findById(testId);
    if (!test || !test.active) {
      return sendError(res, "Selected test is not available.", 400);
    }

    if (collectionType === "HOME_COLLECTION" && !test.homeCollectionAvailable) {
      return sendError(
        res,
        "Home collection is not available for this test.",
        400,
      );
    }

    if (collectionType === "LAB_VISIT" && !test.labVisitAvailable) {
      return sendError(res, "Lab visits are not available for this test.", 400);
    }

    if (
      collectionType === "HOME_COLLECTION" &&
      (!address?.street || !address?.city || !address?.pincode)
    ) {
      return sendError(
        res,
        "Street, city, and pincode are required for home collection.",
        400,
      );
    }

    const technician = await User.findOne({
      ...(technicianId ? { _id: technicianId } : {}),
      role: "TECHNICIAN",
      technicianStatus: "VERIFIED",
      isActive: true,
      qualifiedTests: test._id,
    }).lean();

    if (!technician) {
      return sendError(
        res,
        "No verified technician is available for this test at the moment.",
        400,
      );
    }

    const appointmentStart = new Date(`${appointmentDate}T${startTime}:00`);
    const endTime = new Date(appointmentStart.getTime() + 30 * 60 * 1000);

    if (
      !isValidDate(appointmentDate) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
      toMinutes(startTime) % 30 !== 0
    ) {
      return sendError(res, "Enter a valid appointment date and time.", 400);
    }

    if (appointmentStart <= new Date()) {
      return sendError(res, "Appointment time must be in the future.", 400);
    }

    const day = dayNames[new Date(`${appointmentDate}T00:00:00`).getDay()];
    const workingPeriod = technician.availability?.find(
      (period) => period.day === day,
    );
    const startMinutes = toMinutes(startTime);
    if (
      !workingPeriod ||
      startMinutes < toMinutes(workingPeriod.startTime) ||
      startMinutes + 30 > toMinutes(workingPeriod.endTime)
    ) {
      return sendError(
        res,
        "This time is outside the technician working hours.",
        400,
      );
    }

    const blocked = technician.blockedSlots?.some(
      (slot) =>
        slot.date === appointmentDate &&
        startMinutes < toMinutes(slot.endTime) &&
        startMinutes + 30 > toMinutes(slot.startTime),
    );
    if (blocked)
      return sendError(res, "This slot is blocked by the technician.", 409);

    const availabilityError = await isSlotAvailable({
      technician,
      date: appointmentDate,
      startTime,
    });
    if (availabilityError) return sendError(res, availabilityError, 409);

    const appointment = await Appointment.create({
      patient: req.user._id,
      test: test._id,
      technician: technician._id,
      slotKey: `${technician._id}_${appointmentDate}_${startTime}`,
      appointmentDate: appointmentStart,
      startTime,
      endTime: endTime.toTimeString().slice(0, 5),
      collectionType,
      notes: notes || "",
      address: collectionType === "HOME_COLLECTION" ? address : undefined,
      status: "TECHNICIAN_ASSIGNED",
      sampleStatus: "PENDING_COLLECTION",
      reportStatus: "DRAFT",
      statusHistory: [
        { status: "TECHNICIAN_ASSIGNED", changedBy: req.user._id },
      ],
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("test", "name code price")
      .populate("technician", "name email phone");

    await createNotification({
      recipient: req.user._id,
      type: "APPOINTMENT_BOOKED",
      title: "Appointment booked",
      message: `Your ${test.name} appointment is confirmed for ${appointmentDate}.`,
      metadata: { appointmentId: appointment._id },
    });
    await recordAudit({
      actor: req.user._id,
      action: "APPOINTMENT_BOOKED",
      entityType: "Appointment",
      entityId: appointment._id,
      ipAddress: req.ip,
    });
    await createNotification({
      recipient: technician._id,
      type: "APPOINTMENT_ASSIGNED",
      title: "New appointment assigned",
      message: `A ${test.name} appointment has been assigned to you for ${appointmentDate}.`,
      metadata: { appointmentId: appointment._id },
    });
    await recordAudit({
      actor: req.user._id,
      action: "APPOINTMENT_ASSIGNED",
      entityType: "Appointment",
      entityId: appointment._id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, populated, "Appointment booked successfully.", 201);
  } catch (error) {
    if (error.code === 11000)
      return sendError(res, "This selected slot is no longer available.", 409);
    return sendError(
      res,
      error.message || "Unable to create appointment.",
      500,
    );
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { testId, date } = req.query;
    if (!testId || !isValidDate(date))
      return sendError(res, "Test and date are required.", 400);

    const test = await Test.findOne({ _id: testId, active: true });
    if (!test) return sendError(res, "Selected test is not available.", 404);

    const technicians = await User.find({
      role: "TECHNICIAN",
      technicianStatus: "VERIFIED",
      isActive: true,
      qualifiedTests: test._id,
    }).lean();
    const day = dayNames[new Date(`${date}T00:00:00`).getDay()];
    const appointments = await Appointment.find({
      technician: { $in: technicians.map((technician) => technician._id) },
      appointmentDate: getDateRange(date),
      status: { $nin: ["CANCELLED", "REJECTED"] },
    }).lean();
    const slots = [];

    technicians.forEach((technician) => {
      const period = technician.availability?.find((item) => item.day === day);
      if (!period || period.off) return;
      const booked = appointments.filter(
        (appointment) =>
          String(appointment.technician) === String(technician._id),
      );
      for (
        let minutes = toMinutes(period.startTime);
        minutes + 30 <= toMinutes(period.endTime);
        minutes += 30
      ) {
        const startTime = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
        const endMinutes = minutes + 30;
        const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
        const unavailable = technician.blockedSlots?.some(
          (slot) =>
            slot.date === date &&
            minutes < toMinutes(slot.endTime) &&
            endMinutes > toMinutes(slot.startTime),
        );
        const occupied = booked.some(
          (appointment) =>
            toMinutes(appointment.startTime) < endMinutes &&
            toMinutes(appointment.endTime) > minutes,
        );
        const slotDateTime = new Date(`${date}T${startTime}:00`);
        if (!unavailable && !occupied && slotDateTime > new Date())
          slots.push({
            technicianId: technician._id,
            technicianName: technician.name,
            startTime,
            endTime,
          });
      }
    });

    return sendSuccess(res, slots, "Available slots fetched successfully.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to generate available slots.",
      500,
    );
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("test", "name code price")
      .populate("technician", "name email phone")
      .sort({ appointmentDate: 1 });

    return sendSuccess(res, appointments, "Appointments fetched successfully.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to fetch appointments.",
      500,
    );
  }
};

export const cancelMyAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) {
      return sendError(res, "Appointment not found.", 404);
    }

    if (
      ["CANCELLED", "COMPLETED", "REPORT_APPROVED"].includes(appointment.status)
    ) {
      return sendError(
        res,
        "This appointment can no longer be cancelled.",
        400,
      );
    }

    const assignedTechnician = appointment.technician;
    appointment.status = "CANCELLED";
    appointment.technician = null;
    appointment.slotKey = `CANCELLED_${appointment._id}_${Date.now()}`;
    appointment.sampleStatus = "CANCELLED";
    appointment.statusHistory.push({
      status: "CANCELLED",
      changedBy: req.user._id,
    });
    await appointment.save();
    await recordAudit({
      actor: req.user._id,
      action: "APPOINTMENT_CANCELLED",
      entityType: "Appointment",
      entityId: appointment._id,
      ipAddress: req.ip,
    });
    await createNotification({
      recipient: req.user._id,
      type: "APPOINTMENT_CANCELLED",
      title: "Appointment cancelled",
      message: "Your appointment was cancelled successfully.",
      metadata: { appointmentId: appointment._id },
    });
    if (assignedTechnician) {
      await createNotification({
        recipient: assignedTechnician,
        type: "APPOINTMENT_CANCELLED",
        title: "Appointment cancelled",
        message: "A patient cancelled an appointment assigned to you.",
        metadata: { appointmentId: appointment._id },
      });
    }

    return sendSuccess(res, appointment, "Appointment cancelled successfully.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to cancel appointment.",
      500,
    );
  }
};

export const rescheduleMyAppointment = async (req, res) => {
  try {
    const { appointmentDate, startTime, technicianId } = req.body;
    if (
      !isValidDate(appointmentDate) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
      toMinutes(startTime) % 30 !== 0
    )
      return sendError(res, "A valid future 30-minute slot is required.", 400);
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    }).populate("test", "name");
    if (!appointment) return sendError(res, "Appointment not found.", 404);
    if (
      !["REQUESTED", "CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(
        appointment.status,
      )
    )
      return sendError(
        res,
        "This appointment can no longer be rescheduled.",
        400,
      );
    const technician = await User.findOne({
      _id: technicianId,
      role: "TECHNICIAN",
      technicianStatus: "VERIFIED",
      isActive: true,
      qualifiedTests: appointment.test._id,
    }).lean();
    if (!technician)
      return sendError(
        res,
        "The selected technician is not qualified or available.",
        400,
      );
    const availabilityError = await isSlotAvailable({
      technician,
      date: appointmentDate,
      startTime,
      excludeId: appointment._id,
    });
    if (availabilityError) return sendError(res, availabilityError, 409);
    const previousTechnician = appointment.technician;
    appointment.technician = technician._id;
    appointment.appointmentDate = new Date(
      `${appointmentDate}T${startTime}:00`,
    );
    appointment.startTime = startTime;
    appointment.endTime = `${String(Math.floor((toMinutes(startTime) + 30) / 60)).padStart(2, "0")}:${String((toMinutes(startTime) + 30) % 60).padStart(2, "0")}`;
    appointment.slotKey = `${technician._id}_${appointmentDate}_${startTime}`;
    appointment.status = "CONFIRMED";
    appointment.statusHistory.push({
      status: "CONFIRMED",
      changedBy: req.user._id,
    });
    await appointment.save();
    await recordAudit({
      actor: req.user._id,
      action: "APPOINTMENT_RESCHEDULED",
      entityType: "Appointment",
      entityId: appointment._id,
      metadata: { appointmentDate, startTime, technicianId },
      ipAddress: req.ip,
    });
    if (previousTechnician && String(previousTechnician) !== String(technician._id)) {
      await createNotification({
        recipient: previousTechnician,
        type: "APPOINTMENT_RESCHEDULED",
        title: "Appointment assignment removed",
        message: "An appointment previously assigned to you was rescheduled.",
        metadata: { appointmentId: appointment._id },
      });
    }
    await createNotification({
      recipient: technician._id,
      type: "APPOINTMENT_ASSIGNED",
      title: "Appointment rescheduled",
      message: `An appointment has been rescheduled for ${appointmentDate}.`,
      metadata: { appointmentId: appointment._id },
    });
    await createNotification({
      recipient: appointment.patient,
      type: "APPOINTMENT_RESCHEDULED",
      title: "Appointment rescheduled",
      message: `Your appointment is now scheduled for ${appointmentDate} at ${startTime}.`,
      metadata: { appointmentId: appointment._id },
    });
    const populated = await Appointment.findById(appointment._id)
      .populate("test", "name code price")
      .populate("technician", "name email phone");
    return sendSuccess(res, populated, "Appointment rescheduled successfully.");
  } catch (error) {
    if (error.code === 11000)
      return sendError(res, "This selected slot is no longer available.", 409);
    return sendError(
      res,
      error.message || "Unable to reschedule appointment.",
      500,
    );
  }
};

export const getTechnicianAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ technician: req.user._id })
      .populate("patient", "name email phone")
      .populate("test", "name code price")
      .sort({ appointmentDate: 1 });

    return sendSuccess(
      res,
      appointments,
      "Technician appointments fetched successfully.",
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to fetch technician appointments.",
      500,
    );
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const nextStatuses = {
      CONFIRMED: ["SAMPLE_COLLECTED", "NO_SHOW"],
      TECHNICIAN_ASSIGNED: ["SAMPLE_COLLECTED", "NO_SHOW"],
      SAMPLE_COLLECTED: ["SAMPLE_RECEIVED", "NO_SHOW"],
      SAMPLE_RECEIVED: ["TESTING"],
    };
    const { status } = req.body;
    const note = String(req.body.note || "").trim();

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      technician: req.user._id,
    });

    if (!appointment) {
      return sendError(
        res,
        "Appointment not found or not assigned to you.",
        404,
      );
    }

    if (!nextStatuses[appointment.status]?.includes(status)) {
      return sendError(
        res,
        `Cannot move appointment from ${appointment.status} to ${status}.`,
        400,
      );
    }

    appointment.status = status;
    if (status === "SAMPLE_COLLECTED" && !appointment.sampleId) {
      appointment.sampleId = await createSampleId();
    }
    appointment.statusHistory.push({ status, changedBy: req.user._id });
    if (status === "SAMPLE_COLLECTED") appointment.sampleStatus = "COLLECTED";
    if (status === "SAMPLE_RECEIVED") appointment.sampleStatus = "RECEIVED";
    if (status === "TESTING") appointment.sampleStatus = "IN_TESTING";
    if (["SAMPLE_COLLECTED", "SAMPLE_RECEIVED"].includes(status)) {
      const sampleStatus =
        status === "SAMPLE_COLLECTED" ? "COLLECTED" : "RECEIVED";
      appointment.sampleStatusHistory.push({
        status: sampleStatus,
        changedBy: req.user._id,
        note,
      });
    }
    if (status === "TESTING") {
      appointment.sampleStatusHistory.push({
        status: "IN_TESTING",
        changedBy: req.user._id,
        note,
      });
    }
    await appointment.save();
      await recordAudit({
        actor: req.user._id,
        action: status === "SAMPLE_COLLECTED" ? "SAMPLE_COLLECTED" : status === "SAMPLE_RECEIVED" ? "SAMPLE_RECEIVED" : "TESTING_STARTED",
        entityType: "Appointment",
        entityId: appointment._id,
        metadata: { note },
        ipAddress: req.ip,
      });
        await recordAudit({
          actor: req.user._id,
          action: "APPOINTMENT_STATUS_CHANGED",
          entityType: "Appointment",
          entityId: appointment._id,
          metadata: { status },
          ipAddress: req.ip,
        });
    await createNotification({
      recipient: appointment.patient,
      type: "SAMPLE_STATUS_UPDATED",
      title: "Sample status updated",
      message: `Your sample is now ${status.replaceAll("_", " ").toLowerCase()}.`,
      metadata: { appointmentId: appointment._id, status },
    });
    if (status === "SAMPLE_COLLECTED") {
      await createNotification({
        recipient: appointment.patient,
        type: "SAMPLE_COLLECTED",
        title: "Sample collected",
        message: `Your sample ${appointment.sampleId} has been collected.`,
        metadata: {
          appointmentId: appointment._id,
          sampleId: appointment.sampleId,
        },
      });
    }

    const populated = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("test", "name code price");

    return sendSuccess(
      res,
      populated,
      "Appointment status updated successfully.",
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to update appointment status.",
      500,
    );
  }
};

export const getAdminAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email phone")
      .populate("test", "name code price")
      .populate("technician", "name email phone")
      .sort({ appointmentDate: 1 });

    return sendSuccess(
      res,
      appointments,
      "Admin appointment queue fetched successfully.",
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to fetch admin appointments.",
      500,
    );
  }
};

export const updateAdminAppointmentStatus = async (req, res) => {
  try {
    const adminTransitions = {
      REQUESTED: ["CONFIRMED", "REJECTED", "CANCELLED"],
      CONFIRMED: ["TECHNICIAN_ASSIGNED", "CANCELLED"],
      TECHNICIAN_ASSIGNED: ["CANCELLED"],
      REPORT_APPROVED: ["COMPLETED"],
    };
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, "Appointment not found.", 404);
    if (!adminTransitions[appointment.status]?.includes(status))
      return sendError(
        res,
        `Cannot move appointment from ${appointment.status} to ${status}.`,
        400,
      );
    appointment.status = status;
    if (status === "CANCELLED") {
      appointment.technician = null;
      appointment.sampleStatus = "CANCELLED";
      appointment.slotKey = `CANCELLED_${appointment._id}_${Date.now()}`;
    }
    appointment.statusHistory.push({ status, changedBy: req.user._id });
    if (status === "REPORT_APPROVED") appointment.reportStatus = "APPROVED";
    await appointment.save();
    await recordAudit({
      actor: req.user._id,
      action: "APPOINTMENT_STATUS_CHANGED",
      entityType: "Appointment",
      entityId: appointment._id,
      metadata: { status },
      ipAddress: req.ip,
    });
    if (status === "CANCELLED") {
      await createNotification({
        recipient: appointment.patient,
        type: "APPOINTMENT_CANCELLED",
        title: "Appointment cancelled",
        message: "Your appointment was cancelled by the lab administrator.",
        metadata: { appointmentId: appointment._id },
      });
    }

    const populated = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("test", "name code price")
      .populate("technician", "name email phone");

    return sendSuccess(
      res,
      populated,
      "Admin appointment status updated successfully.",
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Unable to update admin appointment status.",
      500,
    );
  }
};

export const reassignAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "test",
      "name",
    );
    if (
      !appointment ||
      ["CANCELLED", "COMPLETED", "REPORT_APPROVED"].includes(appointment.status)
    )
      return sendError(res, "This appointment cannot be reassigned.", 400);
    const technician = await User.findOne({
      _id: req.body.technicianId,
      role: "TECHNICIAN",
      technicianStatus: "VERIFIED",
      isActive: true,
      qualifiedTests: appointment.test._id,
    }).lean();
    if (!technician)
      return sendError(
        res,
        "The technician is not verified or qualified for this test.",
        400,
      );
    const date = appointment.appointmentDate.toISOString().slice(0, 10);
    const availabilityError = await isSlotAvailable({
      technician,
      date,
      startTime: appointment.startTime,
      excludeId: appointment._id,
    });
    if (availabilityError) return sendError(res, availabilityError, 409);
    appointment.technician = technician._id;
    appointment.slotKey = `${technician._id}_${date}_${appointment.startTime}`;
    appointment.status = "TECHNICIAN_ASSIGNED";
    appointment.statusHistory.push({
      status: "TECHNICIAN_ASSIGNED",
      changedBy: req.user._id,
    });
    await appointment.save();
    await recordAudit({
      actor: req.user._id,
      action: "APPOINTMENT_REASSIGNED",
      entityType: "Appointment",
      entityId: appointment._id,
      metadata: { technicianId: technician._id },
      ipAddress: req.ip,
    });
    await createNotification({
      recipient: technician._id,
      type: "APPOINTMENT_ASSIGNED",
      title: "Appointment assigned",
      message: `You have been assigned a ${appointment.test.name} appointment.`,
      metadata: { appointmentId: appointment._id },
    });
    await createNotification({
      recipient: appointment.patient,
      type: "APPOINTMENT_REASSIGNED",
      title: "Appointment technician updated",
      message: `Your appointment has been assigned to ${technician.name}.`,
      metadata: { appointmentId: appointment._id },
    });
    return sendSuccess(
      res,
      await Appointment.findById(appointment._id)
        .populate("patient", "name email phone")
        .populate("test", "name code price")
        .populate("technician", "name email phone"),
      "Appointment reassigned successfully.",
    );
  } catch (error) {
    if (error.code === 11000)
      return sendError(
        res,
        "This technician is already booked for that slot.",
        409,
      );
    return sendError(
      res,
      error.message || "Unable to reassign appointment.",
      500,
    );
  }
};
