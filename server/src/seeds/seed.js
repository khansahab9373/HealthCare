import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Test from "../models/Test.js";
import Appointment from "../models/Appointment.js";
import Report from "../models/Report.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import Counter from "../models/Counter.js";

dotenv.config();

const seed = async () => {
  try {
    if (!process.env.MONGO_URI?.trim())
      throw new Error("MONGO_URI must be configured.");
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany({});
    await Test.deleteMany({});
    await Appointment.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await Counter.deleteMany({});

    const [admin] = await User.create([
      {
        name: "System Admin",
        email: "admin@bloodcare.local",
        password: "Admin@12345",
        phone: "9999999999",
        role: "ADMIN",
      },
      {
        name: "Dr. Meera Shah",
        email: "technician1@bloodcare.local",
        password: "Technician@12345",
        phone: "8888888888",
        role: "TECHNICIAN",
        technicianStatus: "VERIFIED",
        qualification: "BSc MLT",
        experience: "5 years",
        professionalSkills: ["CBC", "Lipid Profile"],
        availability: [
          { day: "MONDAY", startTime: "08:00", endTime: "16:00" },
          { day: "TUESDAY", startTime: "08:00", endTime: "16:00" },
          { day: "WEDNESDAY", startTime: "08:00", endTime: "16:00" },
          { day: "THURSDAY", startTime: "08:00", endTime: "16:00" },
          { day: "FRIDAY", startTime: "08:00", endTime: "16:00" },
          { day: "SATURDAY", startTime: "08:00", endTime: "12:00" },
        ],
      },
      {
        name: "John Patient",
        email: "patient1@bloodcare.local",
        password: "Patient@12345",
        phone: "7777777777",
        role: "PATIENT",
      },
    ]);

    const demoTests = [
      {
        name: "CBC",
        code: "CBC",
        description:
          "Complete blood count to evaluate red cells, white cells, and platelets.",
        category: "Haematology",
        price: 499,
        sampleType: "Whole Blood",
        preparationInstructions:
          "No special preparation required. Eat normally before the test.",
        fastingRequired: false,
        fastingDuration: "N/A",
        estimatedReportTime: "24 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
      {
        name: "Fasting Blood Sugar",
        code: "FBS",
        description:
          "Measures blood sugar after fasting to assess glucose control.",
        category: "Diabetes",
        price: 299,
        sampleType: "Blood",
        preparationInstructions:
          "Fast for 8-10 hours before the sample collection.",
        fastingRequired: true,
        fastingDuration: "8-10 hours",
        estimatedReportTime: "12 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
      {
        name: "Post Meal Blood Sugar",
        code: "PPBS",
        description: "Checks blood sugar levels after eating.",
        category: "Diabetes",
        price: 349,
        sampleType: "Blood",
        preparationInstructions: "Have the test done 2 hours after a meal.",
        fastingRequired: false,
        fastingDuration: "2 hours after meal",
        estimatedReportTime: "12 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
      {
        name: "HbA1c",
        code: "HBA1C",
        description:
          "Shows average blood sugar levels over the past 2-3 months.",
        category: "Diabetes",
        price: 599,
        sampleType: "Blood",
        preparationInstructions:
          "No fasting needed. Continue regular meals unless advised otherwise.",
        fastingRequired: false,
        fastingDuration: "N/A",
        estimatedReportTime: "24 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
      {
        name: "Lipid Profile",
        code: "LIPID",
        description: "Assess cholesterol and triglyceride levels.",
        category: "Cardiac",
        price: 699,
        sampleType: "Blood",
        preparationInstructions:
          "Fast for 10-12 hours before the sample. Water is allowed.",
        fastingRequired: true,
        fastingDuration: "10-12 hours",
        estimatedReportTime: "24 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
      {
        name: "Thyroid Profile",
        code: "THYROID",
        description: "Measures thyroid hormones to evaluate function.",
        category: "Endocrine",
        price: 799,
        sampleType: "Blood",
        preparationInstructions: "No special preparation required.",
        fastingRequired: false,
        fastingDuration: "N/A",
        estimatedReportTime: "24 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
      {
        name: "Liver Function Test",
        code: "LFT",
        description: "Evaluates liver enzymes and related health markers.",
        category: "Liver",
        price: 699,
        sampleType: "Blood",
        preparationInstructions:
          "No fasting needed unless your physician advises otherwise.",
        fastingRequired: false,
        fastingDuration: "N/A",
        estimatedReportTime: "24 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
      {
        name: "Kidney Function Test",
        code: "KFT",
        description: "Checks creatinine, urea, and other renal markers.",
        category: "Renal",
        price: 699,
        sampleType: "Blood",
        preparationInstructions:
          "No special preparation needed; drink water normally.",
        fastingRequired: false,
        fastingDuration: "N/A",
        estimatedReportTime: "24 hours",
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        active: true,
      },
    ];

    await Test.insertMany(demoTests);
    const allTests = await Test.find().select("_id name").sort({ name: 1 });
    const techOne = await User.findOne({ email: "technician1@bloodcare.local" });
    techOne.qualifiedTests = allTests.map((test) => test._id);
    await techOne.save();
    const [techTwo, techThree, ...patients] = await User.create([
      { name: "Dr. Arjun Rao", email: "technician2@bloodcare.local", password: "Technician@12345", phone: "8888888881", role: "TECHNICIAN", technicianStatus: "VERIFIED", qualification: "MSc MLT", experience: "8 years", qualifiedTests: allTests.slice(0, 4).map((test) => test._id), availability: [{ day: "TUESDAY", startTime: "09:00", endTime: "17:00" }], blockedSlots: [{ date: "2099-01-01", startTime: "12:00", endTime: "13:00" }] },
      { name: "Dr. Sana Iyer", email: "technician3@bloodcare.local", password: "Technician@12345", phone: "8888888882", role: "TECHNICIAN", technicianStatus: "VERIFIED", qualification: "BSc MLT", experience: "6 years", qualifiedTests: allTests.slice(4).map((test) => test._id), availability: [{ day: "WEDNESDAY", startTime: "08:00", endTime: "16:00" }] },
      { name: "Priya Patient", email: "patient2@bloodcare.local", password: "Patient@12345", role: "PATIENT" },
      { name: "Rahul Patient", email: "patient3@bloodcare.local", password: "Patient@12345", role: "PATIENT" },
      { name: "Aisha Patient", email: "patient4@bloodcare.local", password: "Patient@12345", role: "PATIENT" },
      { name: "Noah Patient", email: "patient5@bloodcare.local", password: "Patient@12345", role: "PATIENT" },
    ]);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + ((8 - futureDate.getDay()) % 7 || 7));
    futureDate.setHours(10, 0, 0, 0);
    const seededAppointment = await Appointment.create({
      patient: patients[0], test: allTests[0], technician: techOne._id,
      slotKey: `${techOne._id}_seed_${futureDate.toISOString()}`,
      appointmentDate: futureDate, startTime: "10:00", endTime: "10:30", collectionType: "LAB_VISIT",
      status: "COMPLETED", sampleStatus: "COMPLETED", sampleId: `BL-${futureDate.getFullYear()}-000001`, reportStatus: "PUBLISHED",
      statusHistory: [{ status: "TECHNICIAN_ASSIGNED", changedBy: techOne._id }, { status: "SAMPLE_COLLECTED", changedBy: techOne._id }, { status: "SAMPLE_RECEIVED", changedBy: techOne._id }, { status: "TESTING", changedBy: techOne._id }, { status: "REPORT_SUBMITTED", changedBy: techOne._id }, { status: "REPORT_APPROVED", changedBy: admin._id }, { status: "COMPLETED", changedBy: admin._id }],
      sampleStatusHistory: [{ status: "COLLECTED", changedBy: techOne._id }, { status: "RECEIVED", changedBy: techOne._id }, { status: "IN_TESTING", changedBy: techOne._id }, { status: "COMPLETED", changedBy: admin._id }],
    });
    await Report.create({ appointment: seededAppointment._id, patient: patients[0]._id, technician: techOne._id, test: allTests[0]._id, results: [{ marker: "Hemoglobin", value: "14", unit: "g/dL", referenceRange: "12-16", remarks: "Within range", flag: "NORMAL" }], interpretation: "Seeded completed report", status: "PUBLISHED", approvedAt: new Date(), approvedBy: admin._id, submittedAt: new Date(), publishedAt: new Date() });
    await Notification.insertMany([{ recipient: patients[0]._id, type: "REPORT_PUBLISHED", title: "Report published", message: "Your seeded report is available.", metadata: { reportId: seededAppointment._id } }, { recipient: techTwo._id, type: "APPOINTMENT_ASSIGNED", title: "Assignment available", message: "A seeded assignment is available for review.", metadata: {} }]);

    console.log("Demo data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
