import express from "express";
import {
  createAppointment,
  getAvailableSlots,
  getMyAppointments,
  cancelMyAppointment,
  getTechnicianAppointments,
  updateAppointmentStatus,
  getAdminAppointments,
  updateAdminAppointmentStatus,
  rescheduleMyAppointment,
  reassignAppointment,
} from "../controllers/appointmentController.js";
import {
  authorizeVerifiedTechnician,
  protect,
  authorize,
} from "../middleware/authMiddleware.js";
import {
  validateBooking,
  validateReschedule,
  validateStatus,
} from "../validators/requestValidators.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("PATIENT"),
  validateBooking,
  createAppointment,
);
router.get("/slots", protect, authorize("PATIENT"), getAvailableSlots);
router.get("/my", protect, authorize("PATIENT"), getMyAppointments);
router.patch("/:id/cancel", protect, authorize("PATIENT"), cancelMyAppointment);
router.patch(
  "/:id/reschedule",
  protect,
  authorize("PATIENT"),
  validateReschedule,
  rescheduleMyAppointment,
);
router.get(
  "/technician",
  protect,
  authorize("TECHNICIAN"),
  authorizeVerifiedTechnician,
  getTechnicianAppointments,
);
router.patch(
  "/:id/status",
  protect,
  authorize("TECHNICIAN"),
  authorizeVerifiedTechnician,
  validateStatus(["SAMPLE_COLLECTED", "SAMPLE_RECEIVED", "TESTING", "NO_SHOW"]),
  updateAppointmentStatus,
);
router.patch(
  "/admin/:id/reassign",
  protect,
  authorize("ADMIN"),
  reassignAppointment,
);
router.get("/admin", protect, authorize("ADMIN"), getAdminAppointments);
router.patch(
  "/admin/:id/status",
  protect,
  authorize("ADMIN"),
  validateStatus([
    "REQUESTED",
    "CONFIRMED",
    "TECHNICIAN_ASSIGNED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ]),
  updateAdminAppointmentStatus,
);

export default router;
