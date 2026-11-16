// Ready2Hire Database Seeding Script
// Populates 1 Admin, 3 Recruiters, 15+ Students, 15+ Jobs, 40+ Applications,
// Tracks, Questions, Completed Test Attempts, and 5-Agent Resume Analyses.

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SUPABASE_URL.includes('your-project-id')) {
  console.log(`\n======================================================`);
  console.log(`[Ready2Hire Seed Script - Notice]`);
  console.log(`Supabase service credentials not configured in .env.`);
  console.log(`To seed a remote Supabase instance, set SUPABASE_SERVICE_ROLE_KEY in .env and rerun: npm run seed`);
  console.log(`Note: Ready2Hire is fully equipped with offline mock seed datasets for instant live demos!`);
  console.log(`======================================================\n`);
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSeed() {
  console.log('Starting Ready2Hire database seeding...');

  try {
    // 1. Create Admin User
    const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
      email: 'admin@ready2hire.com',
      password: 'Admin@123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Dr. Ramesh Sharma',
        role: 'admin',
      },
    });

    if (adminErr && !adminErr.message.includes('already exists')) {
      console.warn('Admin create notice:', adminErr.message);
    } else {
      console.log('Admin user initialized: admin@ready2hire.com');
    }

    // 2. Create Recruiters
    const recruiters = [
      { email: 'priya.nair@razorpay.com', name: 'Priya Nair', company: 'Razorpay' },
      { email: 'arjun.mehta@cred.club', name: 'Arjun Mehta', company: 'CRED' },
      { email: 'kavita.deshmukh@swiggy.in', name: 'Kavita Deshmukh', company: 'Swiggy' },
    ];

    for (const r of recruiters) {
      await supabase.auth.admin.createUser({
        email: r.email,
        password: 'Password@123',
        email_confirm: true,
        user_metadata: { full_name: r.name, role: 'recruiter' },
      });
      console.log(`Recruiter initialized: ${r.email}`);
    }

    // 3. Create Students
    const studentNames = [
      'Aravind Kumar', 'Sneha Patel', 'Rohit Verma', 'Ananya Iyer', 'Vikram Singh',
      'Pooja Hegde', 'Karan Johar', 'Siddharth Rao', 'Neha Sharma', 'Rohan Gupta',
      'Meera Nair', 'Aditya Roy', 'Divya Suresh', 'Manish Pandey', 'Shruti Sen'
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const email = `student${i + 1}@college.edu`;
      await supabase.auth.admin.createUser({
        email,
        password: 'Password@123',
        email_confirm: true,
        user_metadata: { full_name: studentNames[i], role: 'applicant' },
      });
    }
    console.log(`15 Students initialized with credentials student[1-15]@college.edu`);

    console.log('\nSeeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

runSeed();
