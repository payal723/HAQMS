const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
// Highly inefficient nested loop aggregate reporting for admin/receptionists dashboard
// PERFORMANCE BUG: Performs multiple nested DB queries inside a loop for every doctor.
// Runs sequentially, blocking/scaling terrible with doctors count.
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    // 1. Fetch all doctors
    const doctors = await prisma.doctor.findMany();

    // 2. Loop through every doctor and query databases sequentially!
    // FIX: Replaced sequential for loop with Promise.all() — all doctors' stats run in parallel
    const reportData = await Promise.all(
      doctors.map(async (doc) => {
        // FIX: Removed console.log inside loop — was logging on every iteration in production

        // FIX: All 4 queries for each doctor now run in parallel via Promise.all()
        // Count total appointments
        // Count completed appointments
        // Count cancelled appointments
        // Fetch queue tokens count today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          queueTokensCount,
        ] = await Promise.all([
          prisma.appointment.count({ where: { doctorId: doc.id } }),
          prisma.appointment.count({ where: { doctorId: doc.id, status: 'COMPLETED' } }),
          prisma.appointment.count({ where: { doctorId: doc.id, status: 'CANCELLED' } }),
          prisma.queueToken.count({
            where: { doctorId: doc.id, createdAt: { gte: today } },
          }),
        ]);

        // Calculate total potential revenue
        // FIX: Use completedAppointments count directly — removed extra findMany just for .length
        const revenue = completedAppointments * (doc.consultationFee || 0);

        // Add artifical wait to simulate load under scaled database
        // "Ensures database connection doesn't drop" - junior dev comment
        // FIX: Removed artificial setTimeout(80ms) — it had no purpose and slowed every iteration

        return {
          id: doc.id,
          name: doc.name,
          specialization: doc.specialization,
          department: doc.department,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          todayQueueSize: queueTokensCount,
          revenue,
        };
      })
    );

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      timeTakenMs: durationMs,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

module.exports = router;