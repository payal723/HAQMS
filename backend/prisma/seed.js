const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');
  const hash = async (p) => bcrypt.hash(p, 10);

  await prisma.user.create({
    data: {
      email: 'admin@haqms.com',
      password: await hash('password123'),
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      email: 'reception1@haqms.com',
      password: await hash('password123'),
      name: 'Reception One',
      role: 'RECEPTIONIST',
    },
  });

  const doctor1User = await prisma.user.create({
    data: {
      email: 'doctor1@haqms.com',
      password: await hash('password123'),
      name: 'Dr. Rajesh Kumar',
      role: 'DOCTOR',
      doctor: {
        create: {
          name: 'Dr. Rajesh Kumar',
          specialization: 'Cardiology',
          department: 'Cardiology',
          consultationFee: 800,
          experience: 12,
        },
      },
    },
    include: { doctor: true },
  });

  const doctor2User = await prisma.user.create({
    data: {
      email: 'doctor2@haqms.com',
      password: await hash('password123'),
      name: 'Dr. Priya Sharma',
      role: 'DOCTOR',
      doctor: {
        create: {
          name: 'Dr. Priya Sharma',
          specialization: 'Neurology',
          department: 'Neurology',
          consultationFee: 1000,
          experience: 8,
        },
      },
    },
    include: { doctor: true },
  });

  const doctor3User = await prisma.user.create({
    data: {
      email: 'doctor3@haqms.com',
      password: await hash('password123'),
      name: 'Dr. Anil Mehta',
      role: 'DOCTOR',
      doctor: {
        create: {
          name: 'Dr. Anil Mehta',
          specialization: 'General Surgery',
          department: 'Surgery',
          consultationFee: 600,
          experience: 15,
        },
      },
    },
    include: { doctor: true },
  });

  const clarkKent = await prisma.patient.create({
    data: {
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      phoneNumber: '9876543201',
      age: 32,
      gender: 'Male',
      medicalHistory: null,
    },
  });

  const bruceWayne = await prisma.patient.create({
    data: {
      name: 'Bruce Wayne',
      email: 'bruce@wayneenterprises.com',
      phoneNumber: '9876543202',
      age: 38,
      gender: 'Male',
      medicalHistory: null,
    },
  });

  const tonyStark = await prisma.patient.create({
    data: {
      name: 'Tony Stark',
      email: 'tony@starkindustries.com',
      phoneNumber: '9876543203',
      age: 45,
      gender: 'Male',
      medicalHistory: 'Arc Reactor implant. Chest pain monitoring required.',
    },
  });

  const steveRogers = await prisma.patient.create({
    data: {
      name: 'Steve Rogers',
      email: 'steve@shield.com',
      phoneNumber: '9876543205',
      age: 105,
      gender: 'Male',
      medicalHistory: 'Super soldier serum. Accelerated healing.',
    },
  });

  const doc1 = doctor1User.doctor;
  const doc2 = doctor2User.doctor;
  const doc3 = doctor3User.doctor;

  const appt1 = await prisma.appointment.create({
    data: {
      appointmentDate: new Date('2026-06-01T10:00:00'),
      reason: 'Chest pain checkup',
      status: 'PENDING',
      patientId: clarkKent.id,
      doctorId: doc1.id,
    },
  });

  await prisma.appointment.create({
    data: {
      appointmentDate: new Date('2026-06-01T11:00:00'),
      reason: 'Routine checkup',
      status: 'COMPLETED',
      patientId: bruceWayne.id,
      doctorId: doc1.id,
    },
  });

  const appt3 = await prisma.appointment.create({
    data: {
      appointmentDate: new Date('2026-06-02T09:00:00'),
      reason: 'Arc reactor monitoring',
      status: 'PENDING',
      patientId: tonyStark.id,
      doctorId: doc2.id,
    },
  });

  await prisma.appointment.create({
    data: {
      appointmentDate: new Date('2026-06-03T10:00:00'),
      reason: 'General consultation',
      status: 'PENDING',
      patientId: steveRogers.id,
      doctorId: doc1.id,
    },
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 1,
      status: 'WAITING',
      patientId: clarkKent.id,
      doctorId: doc1.id,
      appointmentId: appt1.id,
    },
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 2,
      status: 'CALLING',
      patientId: tonyStark.id,
      doctorId: doc2.id,
      appointmentId: appt3.id,
    },
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 3,
      status: 'WAITING',
      patientId: steveRogers.id,
      doctorId: doc1.id,
    },
  });

  console.log(' Seeding complete!');
  console.log('Logins (password: password123)');
  console.log('  admin@haqms.com');
  console.log('  reception1@haqms.com');
  console.log('  doctor1@haqms.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());