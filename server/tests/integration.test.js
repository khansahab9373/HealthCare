import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import request from "supertest";
import User from "../src/models/User.js";
import TestModel from "../src/models/Test.js";
import Appointment from "../src/models/Appointment.js";
import Report from "../src/models/Report.js";
import Notification from "../src/models/Notification.js";
import AuditLog from "../src/models/AuditLog.js";

const password = "Passw0rd!123";
const nextMonday = () => {
  const date = new Date();
  const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + daysUntilMonday);
  return date.toISOString().slice(0, 10);
};
const date = nextMonday();
const testMongoUri = "mongodb://127.0.0.1:27017/bloodcare_test";
let app;
let vercelHandler;
let admin;
let technician;
let patient;
let otherPatient;
let testDefinition;
let adminToken;
let technicianToken;
let patientToken;
let otherPatientToken;

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const login = async (email) => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  assert.equal(response.status, 200);
  return response.body.data.token;
};

before(async () => {
  // Set these before loading app.js so dotenv cannot point the test at server/.env.
  process.env.MONGO_URI = testMongoUri;
  process.env.JWT_SECRET = "integration-test-secret";
  ({ default: vercelHandler } = await import("../api/index.js"));
  ({ default: app } = await import("../src/app.js"));
  await mongoose.connect(testMongoUri);
  await Promise.all([
    User.deleteMany({}),
    TestModel.deleteMany({}),
    Appointment.deleteMany({}),
    Report.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  testDefinition = await TestModel.create({
    name: "QA Complete Blood Count",
    code: "QA-CBC",
    description: "QA diagnostic test",
    category: "Haematology",
    price: 100,
    sampleType: "Blood",
    preparationInstructions: "No preparation",
    fastingRequired: false,
    estimatedReportTime: "24 hours",
    homeCollectionAvailable: true,
    labVisitAvailable: true,
    active: true,
  });
  [admin, technician, patient, otherPatient] = await User.create([
    {
      name: "QA Admin",
      email: "qa-admin@example.com",
      password,
      role: "ADMIN",
    },
    {
      name: "QA Technician",
      email: "qa-tech@example.com",
      password,
      role: "TECHNICIAN",
      technicianStatus: "VERIFIED",
      qualifiedTests: [testDefinition._id],
      availability: [
        { day: "MONDAY", startTime: "08:00", endTime: "12:00", off: false },
      ],
    },
    {
      name: "QA Patient",
      email: "qa-patient@example.com",
      password,
      role: "PATIENT",
    },
    {
      name: "QA Other",
      email: "qa-other@example.com",
      password,
      role: "PATIENT",
    },
  ]);
  adminToken = await login(admin.email);
  technicianToken = await login(technician.email);
  patientToken = await login(patient.email);
  otherPatientToken = await login(otherPatient.email);
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("API health endpoint", async () => {
  const response = await request(vercelHandler).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "BloodCare API is running");
  assert.ok(response.body.timestamp);
});

test("Vercel rewrite preserves the API health path", async () => {
  const response = await request(vercelHandler).get(
    "/api?__bloodcare_path=%2Fapi%2Fhealth&probe=preserved",
  );
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "BloodCare API is running");
});

test("authentication and role authorization", async () => {
  const invalidRole = await request(app).post("/api/auth/register").send({
    name: "No Admin",
    email: "no-admin@example.com",
    password,
    role: "ADMIN",
  });
  assert.equal(invalidRole.status, 400);
  const missingAuth = await request(app).get("/api/tests/admin");
  assert.equal(missingAuth.status, 401);
  const wrongRole = await request(app)
    .get("/api/tests/admin")
    .set(auth(patientToken));
  assert.equal(wrongRole.status, 403);
  const currentUser = await request(app)
    .get("/api/auth/me")
    .set(auth(patientToken));
  assert.equal(currentUser.status, 200);
  assert.equal(currentUser.body.data.role, "PATIENT");
});

test("admin test management and technician qualification", async () => {
  const catalog = await request(app)
    .get("/api/tests/admin")
    .set(auth(adminToken));
  assert.equal(catalog.status, 200);
  const invalid = await request(app)
    .post("/api/tests")
    .set(auth(adminToken))
    .send({
      name: "Bad",
      code: "BAD",
      description: "Bad",
      category: "QA",
      price: -1,
      sampleType: "Blood",
      preparationInstructions: "None",
      estimatedReportTime: "1h",
      fastingRequired: false,
      homeCollectionAvailable: true,
      labVisitAvailable: true,
    });
  assert.equal(invalid.status, 400);
  const qualifications = await request(app)
    .patch(`/api/users/technicians/${technician._id}/qualifications`)
    .set(auth(adminToken))
    .send({ qualifiedTests: [testDefinition._id] });
  assert.equal(qualifications.status, 200);
  assert.ok(qualifications.body.data.qualifiedTests.length === 1);
});

test("availability and generated slots", async () => {
  const availability = await request(app)
    .get("/api/users/me/availability")
    .set(auth(technicianToken));
  assert.equal(availability.status, 200);
  const slots = await request(app)
    .get(`/api/appointments/slots?testId=${testDefinition._id}&date=${date}`)
    .set(auth(patientToken));
  assert.equal(slots.status, 200);
  assert.ok(slots.body.data.some((slot) => slot.startTime === "09:00"));
  const invalidDate = await request(app)
    .get(`/api/appointments/slots?testId=${testDefinition._id}&date=2026-02-30`)
    .set(auth(patientToken));
  assert.equal(invalidDate.status, 400);
});

let appointment;

test("booking, duplicate protection, cancellation, and rescheduling", async () => {
  const booking = await request(app)
    .post("/api/appointments")
    .set(auth(patientToken))
    .send({
      testId: testDefinition._id,
      technicianId: technician._id,
      appointmentDate: date,
      startTime: "09:00",
      collectionType: "LAB_VISIT",
    });
  assert.equal(booking.status, 201);
  appointment = booking.body.data;
  assert.equal(appointment.status, "TECHNICIAN_ASSIGNED");
  const duplicate = await request(app)
    .post("/api/appointments")
    .set(auth(otherPatientToken))
    .send({
      testId: testDefinition._id,
      technicianId: technician._id,
      appointmentDate: date,
      startTime: "09:00",
      collectionType: "LAB_VISIT",
    });
  assert.equal(duplicate.status, 409);
  const concurrentPayload = {
    testId: testDefinition._id,
    technicianId: technician._id,
    appointmentDate: date,
    startTime: "10:00",
    collectionType: "LAB_VISIT",
  };
  const concurrent = await Promise.all([
    request(app)
      .post("/api/appointments")
      .set(auth(patientToken))
      .send(concurrentPayload),
    request(app)
      .post("/api/appointments")
      .set(auth(otherPatientToken))
      .send(concurrentPayload),
  ]);
  assert.deepEqual(
    concurrent.map((response) => response.status).sort(),
    [201, 409],
  );
  const concurrentWinner = concurrent.find(
    (response) => response.status === 201,
  );
  await request(app)
    .patch(`/api/appointments/${concurrentWinner.body.data._id}/cancel`)
    .set(auth(patientToken));
  const rescheduled = await request(app)
    .patch(`/api/appointments/${appointment._id}/reschedule`)
    .set(auth(patientToken))
    .send({
      testId: testDefinition._id,
      technicianId: technician._id,
      appointmentDate: date,
      startTime: "09:30",
    });
  assert.equal(rescheduled.status, 200);
  appointment = rescheduled.body.data;
  const cancelled = await request(app)
    .patch(`/api/appointments/${appointment._id}/cancel`)
    .set(auth(patientToken));
  assert.equal(cancelled.status, 200);
  const cancelledAgain = await request(app)
    .patch(`/api/appointments/${appointment._id}/reschedule`)
    .set(auth(patientToken))
    .send({
      technicianId: technician._id,
      appointmentDate: date,
      startTime: "10:00",
    });
  assert.equal(cancelledAgain.status, 400);
});

let report;

test("sample lifecycle, report review, patient ownership, PDF, notifications, and audit", async () => {
  const booking = await request(app)
    .post("/api/appointments")
    .set(auth(patientToken))
    .send({
      testId: testDefinition._id,
      technicianId: technician._id,
      appointmentDate: date,
      startTime: "10:00",
      collectionType: "LAB_VISIT",
    });
  assert.equal(booking.status, 201);
  const id = booking.body.data._id;
  for (const status of ["SAMPLE_COLLECTED", "SAMPLE_RECEIVED", "TESTING"]) {
    const response = await request(app)
      .patch(`/api/appointments/${id}/status`)
      .set(auth(technicianToken))
      .send({ status, note: `QA ${status}` });
    assert.equal(response.status, 200);
  }
  const current = await Appointment.findById(id);
  assert.equal(current.sampleStatus, "IN_TESTING");
  assert.match(
    current.sampleId,
    new RegExp(`^BL-${new Date().getFullYear()}-\\d{6}$`),
  );
  assert.deepEqual(
    current.sampleStatusHistory.map((entry) => entry.status),
    ["COLLECTED", "RECEIVED", "IN_TESTING"],
  );
  const submitted = await request(app)
    .post(`/api/reports/appointments/${id}`)
    .set(auth(technicianToken))
    .send({
      results: [
        {
          marker: "Hemoglobin",
          value: "14",
          unit: "g/dL",
          referenceRange: "12-16",
          remarks: "Within range",
          flag: "NORMAL",
        },
      ],
      interpretation: "QA interpretation",
    });
  assert.equal(submitted.status, 201);
  report = submitted.body.data;
  const review = await request(app)
    .patch(`/api/reports/${report._id}/review`)
    .set(auth(adminToken))
    .send({});
  assert.equal(review.status, 200);
  const approved = await request(app)
    .patch(`/api/reports/${report._id}/approve`)
    .set(auth(adminToken));
  assert.equal(approved.status, 200);
  const published = await request(app)
    .patch(`/api/reports/${report._id}/publish`)
    .set(auth(adminToken));
  assert.equal(published.status, 200);
  const completedAppointment = await Appointment.findById(id);
  assert.equal(completedAppointment.status, "COMPLETED");
  assert.equal(completedAppointment.reportStatus, "PUBLISHED");
  assert.equal(completedAppointment.sampleStatus, "COMPLETED");
  assert.deepEqual(
    completedAppointment.sampleStatusHistory.map((entry) => entry.status),
    ["COLLECTED", "RECEIVED", "IN_TESTING", "COMPLETED"],
  );
  assert.deepEqual(
    completedAppointment.statusHistory.map((entry) => entry.status),
    [
      "TECHNICIAN_ASSIGNED",
      "SAMPLE_COLLECTED",
      "SAMPLE_RECEIVED",
      "TESTING",
      "REPORT_SUBMITTED",
      "REPORT_APPROVED",
      "COMPLETED",
    ],
  );
  const visible = await request(app)
    .get("/api/reports/my")
    .set(auth(patientToken));
  assert.equal(visible.status, 200);
  assert.equal(visible.body.data.length, 1);
  const stolen = await request(app)
    .get(`/api/reports/${report._id}/download`)
    .set(auth(otherPatientToken));
  assert.equal(stolen.status, 404);
  const pdf = await request(app)
    .get(`/api/reports/${report._id}/download`)
    .set(auth(patientToken));
  assert.equal(pdf.status, 200);
  assert.equal(pdf.headers["content-type"], "application/pdf");
  await new Promise((resolve) => setTimeout(resolve, 100));
  const notifications = await Notification.find({ recipient: patient._id });
  assert.ok(notifications.some((item) => item.type === "APPOINTMENT_BOOKED"));
  assert.ok(notifications.some((item) => item.type === "SAMPLE_COLLECTED"));
  assert.ok(notifications.some((item) => item.type === "REPORT_SUBMITTED"));
  assert.ok(notifications.some((item) => item.type === "REPORT_APPROVED"));
  const audit = await AuditLog.find({ entityId: String(report._id) });
  assert.ok(audit.some((item) => item.action === "REPORT_SUBMITTED"));
  assert.ok(audit.some((item) => item.action === "REPORT_APPROVED"));
});

test("notification read-all and technician ownership", async () => {
  const notifications = await request(app)
    .get("/api/notifications/my")
    .set(auth(patientToken));
  assert.equal(notifications.status, 200);
  const readAll = await request(app)
    .patch("/api/notifications/read-all")
    .set(auth(patientToken));
  assert.equal(readAll.status, 200);
  const unread = await Notification.countDocuments({
    recipient: patient._id,
    readAt: null,
  });
  assert.equal(unread, 0);
  const wrongTechnician = await request(app)
    .get("/api/appointments/technician")
    .set(auth(patientToken));
  assert.equal(wrongTechnician.status, 403);
});

test("report correction and rejection workflow", async () => {
  const booking = await request(app)
    .post("/api/appointments")
    .set(auth(patientToken))
    .send({
      testId: testDefinition._id,
      technicianId: technician._id,
      appointmentDate: date,
      startTime: "11:00",
      collectionType: "LAB_VISIT",
    });
  assert.equal(booking.status, 201);
  const appointmentId = booking.body.data._id;
  for (const status of ["SAMPLE_COLLECTED", "SAMPLE_RECEIVED", "TESTING"]) {
    assert.equal(
      (
        await request(app)
          .patch(`/api/appointments/${appointmentId}/status`)
          .set(auth(technicianToken))
          .send({ status })
      ).status,
      200,
    );
  }
  const submit = await request(app)
    .post(`/api/reports/appointments/${appointmentId}`)
    .set(auth(technicianToken))
    .send({
      results: [{ marker: "QA", value: "1" }],
      interpretation: "Initial",
    });
  assert.equal(submit.status, 201);
  const correction = await request(app)
    .patch(`/api/reports/${submit.body.data._id}/correction`)
    .set(auth(adminToken))
    .send({ reason: "Add reference range" });
  assert.equal(correction.status, 200);
  assert.equal((await Appointment.findById(appointmentId)).status, "TESTING");
  const resubmitted = await request(app)
    .post(`/api/reports/appointments/${appointmentId}`)
    .set(auth(technicianToken))
    .send({
      results: [{ marker: "QA", value: "1", referenceRange: "0-2" }],
      interpretation: "Updated",
    });
  assert.equal(resubmitted.status, 201);
  const rejected = await request(app)
    .patch(`/api/reports/${submit.body.data._id}/reject`)
    .set(auth(adminToken))
    .send({ reason: "Invalid result" });
  assert.equal(rejected.status, 200);
  assert.equal(rejected.body.data.rejectionReason, "Invalid result");
});
