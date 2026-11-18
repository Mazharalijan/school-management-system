<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StudentAndFeeSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('student_fines')->truncate();
        DB::table('fee_invoice_payment')->truncate();
        DB::table('fee_payments')->truncate();
        DB::table('fee_invoice_items')->truncate();
        DB::table('fee_invoices')->truncate();
        DB::table('student_fee_profile_items')->truncate();
        DB::table('student_fee_profiles')->truncate();
        DB::table('student_enrollments')->truncate();
        DB::table('students')->truncate();
        DB::table('fee_structures')->truncate();
        DB::table('fee_heads')->truncate();
        Schema::enableForeignKeyConstraints();

        // ---------------------------------------------------------------------
        // 1. Fee Heads (8 Standard Primary School Fee Heads)
        // ---------------------------------------------------------------------
        $heads = [
            ['id' => 1, 'title' => 'Monthly Tuition Fee', 'type' => 'recurring', 'description' => 'Standard monthly curriculum and instruction fee.'],
            ['id' => 2, 'title' => 'Annual Admission Fee', 'type' => 'one_time', 'description' => 'One-time admission and registration charge.'],
            ['id' => 3, 'title' => 'Exam Paper & Hall Fee', 'type' => 'recurring', 'description' => 'Term exam paper printing and evaluation charges.'],
            ['id' => 4, 'title' => 'Computer Lab Fee', 'type' => 'recurring', 'description' => 'IT lab maintenance and software license charges.'],
            ['id' => 5, 'title' => 'Library Fund', 'type' => 'recurring', 'description' => 'Library books and reading room facilities.'],
            ['id' => 6, 'title' => 'Sports & Gala Fund', 'type' => 'recurring', 'description' => 'Physical education, sports gear, and annual gala.'],
            ['id' => 7, 'title' => 'Transport Van Fee', 'type' => 'optional', 'description' => 'Door-to-door school transport van services.'],
            ['id' => 8, 'title' => 'Science Lab & STEM Fund', 'type' => 'recurring', 'description' => 'Primary science lab experiments and STEM activity kits.'],
        ];

        foreach ($heads as $h) {
            DB::table('fee_heads')->insert(array_merge($h, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // ---------------------------------------------------------------------
        // 2. Class Default Fee Structures (for 2025-2026 and 2026-2027)
        // ---------------------------------------------------------------------
        // Classes: 1: Nursery, 2: Prep, 3: Grade 1, 4: Grade 2, 5: Grade 3, 6: Grade 4, 7: Grade 5
        $classTuitionRates = [
            1 => 3500.00, // Nursery
            2 => 3800.00, // Prep
            3 => 4000.00, // Grade 1
            4 => 4200.00, // Grade 2
            5 => 4500.00, // Grade 3
            6 => 4800.00, // Grade 4
            7 => 5200.00, // Grade 5
        ];

        $sessions = ['2025-2026', '2026-2027'];
        foreach ($sessions as $session) {
            for ($cId = 1; $cId <= 7; $cId++) {
                $baseFee = $classTuitionRates[$cId];
                if ($session === '2026-2027') {
                    $baseFee += 300.00; // Realistic annual inflation adjustment
                }

                // Monthly Tuition
                DB::table('fee_structures')->insert([
                    'school_class_id' => $cId,
                    'fee_head_id' => 1,
                    'amount' => $baseFee,
                    'session_year' => $session,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Admission Fee
                DB::table('fee_structures')->insert([
                    'school_class_id' => $cId,
                    'fee_head_id' => 2,
                    'amount' => 5000.00 + ($cId * 500),
                    'session_year' => $session,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Exam Fee
                DB::table('fee_structures')->insert([
                    'school_class_id' => $cId,
                    'fee_head_id' => 3,
                    'amount' => 500.00,
                    'session_year' => $session,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Computer Lab Fee
                DB::table('fee_structures')->insert([
                    'school_class_id' => $cId,
                    'fee_head_id' => 4,
                    'amount' => 300.00,
                    'session_year' => $session,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ---------------------------------------------------------------------
        // 3. 100 Authentic Pakistani Students Data
        // ---------------------------------------------------------------------
        // 14 Nursery, 14 Prep, 15 Grade 1, 15 Grade 2, 14 Grade 3, 14 Grade 4, 14 Grade 5 = 100 Students!
        // Each class section 'A' has capacity 20 seats, so 14-15 fits safely within capacity.

        $pakistaniStudents = [
            // --- NURSERY (IDs 1 - 14) ---
            ['first_name' => 'Muhammad Ayaan', 'last_name' => 'Khan', 'gender' => 'male', 'father_name' => 'Tariq Mehmood Khan', 'dob' => '2022-04-10', 'blood' => 'B+'],
            ['first_name' => 'Anaya', 'last_name' => 'Fatima', 'gender' => 'female', 'father_name' => 'Syed Waqas Ali', 'dob' => '2022-05-18', 'blood' => 'A+'],
            ['first_name' => 'Rohaan', 'last_name' => 'Afridi', 'gender' => 'male', 'father_name' => 'Sher Zaman Afridi', 'dob' => '2022-03-22', 'blood' => 'O+'],
            ['first_name' => 'Zoya', 'last_name' => 'Gul', 'gender' => 'female', 'father_name' => 'Gul Faraz Khattak', 'dob' => '2022-07-14', 'blood' => 'AB+'],
            ['first_name' => 'Zayd', 'last_name' => 'Ahmed', 'gender' => 'male', 'father_name' => 'Dr. Ahmed Farooq', 'dob' => '2022-02-11', 'blood' => 'A+'],
            ['first_name' => 'Hareem', 'last_name' => 'Malik', 'gender' => 'female', 'father_name' => 'Malik Tahir Awan', 'dob' => '2022-06-29', 'blood' => 'B+'],
            ['first_name' => 'Muhammad Hashir', 'last_name' => 'Shinwari', 'gender' => 'male', 'father_name' => 'Noor Alam Shinwari', 'dob' => '2022-01-19', 'blood' => 'O+'],
            ['first_name' => 'Mirha', 'last_name' => 'Noor', 'gender' => 'female', 'father_name' => 'Noor Muhammad', 'dob' => '2022-08-04', 'blood' => 'B-'],
            ['first_name' => 'Shaheer', 'last_name' => 'Yousafzai', 'gender' => 'male', 'father_name' => 'Yousaf Khan', 'dob' => '2022-04-25', 'blood' => 'O+'],
            ['first_name' => 'Inaya', 'last_name' => 'Rehman', 'gender' => 'female', 'father_name' => 'Abdul Rehman Qureshi', 'dob' => '2022-09-12', 'blood' => 'A+'],
            ['first_name' => 'Muhammad Azlan', 'last_name' => 'Bangash', 'gender' => 'male', 'father_name' => 'Haji Akbar Bangash', 'dob' => '2022-03-08', 'blood' => 'B+'],
            ['first_name' => 'Ayesha', 'last_name' => 'Umar', 'gender' => 'female', 'father_name' => 'Umar Hayat', 'dob' => '2022-05-30', 'blood' => 'A+'],
            ['first_name' => 'Hamdan', 'last_name' => 'Durrani', 'gender' => 'male', 'father_name' => 'Rashid Durrani', 'dob' => '2022-02-17', 'blood' => 'O-'],
            ['first_name' => 'Hoorain', 'last_name' => 'Bilal', 'gender' => 'female', 'father_name' => 'Muhammad Bilal', 'dob' => '2022-07-02', 'blood' => 'AB+'],

            // --- PREP (IDs 15 - 28) ---
            ['first_name' => 'Muhammad Rayan', 'last_name' => 'Mohmand', 'gender' => 'male', 'father_name' => 'Gul Badshah Mohmand', 'dob' => '2021-03-15', 'blood' => 'B+'],
            ['first_name' => 'Eshaal', 'last_name' => 'Zahra', 'gender' => 'female', 'father_name' => 'Syed Asad Bukhari', 'dob' => '2021-06-21', 'blood' => 'A+'],
            ['first_name' => 'Mustafa', 'last_name' => 'Kamal', 'gender' => 'male', 'father_name' => 'Kamal Uddin', 'dob' => '2021-04-09', 'blood' => 'O+'],
            ['first_name' => 'Seema', 'last_name' => 'Bibi', 'gender' => 'female', 'father_name' => 'Gul Faraz Khan', 'dob' => '2021-08-14', 'blood' => 'B+'],
            ['first_name' => 'Muhammad Daniyal', 'last_name' => 'Qazi', 'gender' => 'male', 'father_name' => 'Qazi Inamullah', 'dob' => '2021-01-28', 'blood' => 'A-'],
            ['first_name' => 'Manha', 'last_name' => 'Kashif', 'gender' => 'female', 'father_name' => 'Kashif Mehmood', 'dob' => '2021-05-19', 'blood' => 'AB+'],
            ['first_name' => 'Ahmad', 'last_name' => 'Shayan', 'gender' => 'male', 'father_name' => 'Shayan Tariq', 'dob' => '2021-07-11', 'blood' => 'O+'],
            ['first_name' => 'Rameen', 'last_name' => 'Fatima', 'gender' => 'female', 'father_name' => 'Ghulam Sarwar', 'dob' => '2021-02-24', 'blood' => 'B+'],
            ['first_name' => 'Muhammad Wali', 'last_name' => 'Khan', 'gender' => 'male', 'father_name' => 'Wali Muhammad Khan', 'dob' => '2021-09-03', 'blood' => 'A+'],
            ['first_name' => 'Aiza', 'last_name' => 'Hassan', 'gender' => 'female', 'father_name' => 'Hassan Raza', 'dob' => '2021-04-18', 'blood' => 'O+'],
            ['first_name' => 'Talha', 'last_name' => 'Junaid', 'gender' => 'male', 'father_name' => 'Junaid Jamshed', 'dob' => '2021-06-05', 'blood' => 'B+'],
            ['first_name' => 'Zunaira', 'last_name' => 'Naeem', 'gender' => 'female', 'father_name' => 'Muhammad Naeem', 'dob' => '2021-10-12', 'blood' => 'A+'],
            ['first_name' => 'Subhan', 'last_name' => 'Ali', 'gender' => 'male', 'father_name' => 'Liaquat Ali', 'dob' => '2021-03-31', 'blood' => 'AB-'],
            ['first_name' => 'Fatima', 'last_name' => 'Jahangir', 'gender' => 'female', 'father_name' => 'Jahangir Khan', 'dob' => '2021-07-28', 'blood' => 'O+'],

            // --- GRADE 1 (IDs 29 - 43) ---
            ['first_name' => 'Muhammad Musa', 'last_name' => 'Khattak', 'gender' => 'male', 'father_name' => 'Sohail Khattak', 'dob' => '2020-02-14', 'blood' => 'B+'],
            ['first_name' => 'Hafsa', 'last_name' => 'Suleman', 'gender' => 'female', 'father_name' => 'Haji Suleman Shah', 'dob' => '2020-05-22', 'blood' => 'A+'],
            ['first_name' => 'Saad', 'last_name' => 'Abdullah', 'gender' => 'male', 'father_name' => 'Abdullah Jan', 'dob' => '2020-03-08', 'blood' => 'O+'],
            ['first_name' => 'Minahil', 'last_name' => 'Arshad', 'gender' => 'female', 'father_name' => 'Muhammad Arshad', 'dob' => '2020-08-16', 'blood' => 'AB+'],
            ['first_name' => 'Huzaifa', 'last_name' => 'Nawaz', 'gender' => 'male', 'father_name' => 'Rab Nawaz Khan', 'dob' => '2020-01-20', 'blood' => 'B+'],
            ['first_name' => 'Abeeha', 'last_name' => 'Tanveer', 'gender' => 'female', 'father_name' => 'Tanveer Iqbal', 'dob' => '2020-06-30', 'blood' => 'A-'],
            ['first_name' => 'Muhammad Bilal', 'last_name' => 'Shinwari', 'gender' => 'male', 'father_name' => 'Farhad Shinwari', 'dob' => '2020-04-17', 'blood' => 'O+'],
            ['first_name' => 'Khadija', 'last_name' => 'Rehman', 'gender' => 'female', 'father_name' => 'Shafiq ur Rehman', 'dob' => '2020-09-05', 'blood' => 'B+'],
            ['first_name' => 'Zubair', 'last_name' => 'Habib', 'gender' => 'male', 'father_name' => 'Habibullah Khan', 'dob' => '2020-02-28', 'blood' => 'A+'],
            ['first_name' => 'Syeda Maryam', 'last_name' => 'Kazmi', 'gender' => 'female', 'father_name' => 'Syed Imtiaz Kazmi', 'dob' => '2020-07-19', 'blood' => 'O-'],
            ['first_name' => 'Arham', 'last_name' => 'Fawad', 'gender' => 'male', 'father_name' => 'Fawad Alam', 'dob' => '2020-03-12', 'blood' => 'B+'],
            ['first_name' => 'Amna', 'last_name' => 'Saleem', 'gender' => 'female', 'father_name' => 'Saleem Akhtar', 'dob' => '2020-10-25', 'blood' => 'A+'],
            ['first_name' => 'Muhammad Yahya', 'last_name' => 'Baig', 'gender' => 'male', 'father_name' => 'Mirza Aslam Baig', 'dob' => '2020-05-04', 'blood' => 'AB+'],
            ['first_name' => 'Jannat', 'last_name' => 'Waqar', 'gender' => 'female', 'father_name' => 'Waqar Younis', 'dob' => '2020-08-11', 'blood' => 'O+'],
            ['first_name' => 'Taha', 'last_name' => 'Shahzad', 'gender' => 'male', 'father_name' => 'Shahzad Anwar', 'dob' => '2020-11-09', 'blood' => 'B+'],

            // --- GRADE 2 (IDs 44 - 58) ---
            ['first_name' => 'Muhammad Ibrahim', 'last_name' => 'Tariq', 'gender' => 'male', 'father_name' => 'Tariq Aziz', 'dob' => '2019-03-17', 'blood' => 'A+'],
            ['first_name' => 'Aleena', 'last_name' => 'Farooq', 'gender' => 'female', 'father_name' => 'Farooq Azam', 'dob' => '2019-06-25', 'blood' => 'O+'],
            ['first_name' => 'Faizan', 'last_name' => 'Ali', 'gender' => 'male', 'father_name' => 'Ali Raza Khan', 'dob' => '2019-02-09', 'blood' => 'B+'],
            ['first_name' => 'Mahnoor', 'last_name' => 'Rauf', 'gender' => 'female', 'father_name' => 'Abdul Rauf', 'dob' => '2019-07-14', 'blood' => 'AB+'],
            ['first_name' => 'Muhammad Affan', 'last_name' => 'Qureshi', 'gender' => 'male', 'father_name' => 'Zia ur Rehman Qureshi', 'dob' => '2019-01-30', 'blood' => 'A+'],
            ['first_name' => 'Dua', 'last_name' => 'Fatima', 'gender' => 'female', 'father_name' => 'Syed Naveed Shah', 'dob' => '2019-05-18', 'blood' => 'O+'],
            ['first_name' => 'Ammar', 'last_name' => 'Yasir', 'gender' => 'male', 'father_name' => 'Yasir Hameed', 'dob' => '2019-08-22', 'blood' => 'B-'],
            ['first_name' => 'Bisma', 'last_name' => 'Nadeem', 'gender' => 'female', 'father_name' => 'Nadeem Abbas', 'dob' => '2019-04-12', 'blood' => 'A+'],
            ['first_name' => 'Muhammad Haris', 'last_name' => 'Bangash', 'gender' => 'male', 'father_name' => 'Shaukat Bangash', 'dob' => '2019-09-08', 'blood' => 'O+'],
            ['first_name' => 'Laiba', 'last_name' => 'Javed', 'gender' => 'female', 'father_name' => 'Javed Iqbal', 'dob' => '2019-02-23', 'blood' => 'B+'],
            ['first_name' => 'Osama', 'last_name' => 'Zia', 'gender' => 'male', 'father_name' => 'Zia Mohiuddin', 'dob' => '2019-06-03', 'blood' => 'AB+'],
            ['first_name' => 'Hania', 'last_name' => 'Rashid', 'gender' => 'female', 'father_name' => 'Rashid Mehmood', 'dob' => '2019-10-15', 'blood' => 'A+'],
            ['first_name' => 'Muhammad Umar', 'last_name' => 'Farooq', 'gender' => 'male', 'father_name' => 'Farooq Shah', 'dob' => '2019-03-01', 'blood' => 'O+'],
            ['first_name' => 'Alishba', 'last_name' => 'Khalid', 'gender' => 'female', 'father_name' => 'Khalid Mehmood', 'dob' => '2019-07-29', 'blood' => 'B+'],
            ['first_name' => 'Rohit', 'last_name' => 'Kumar', 'gender' => 'male', 'father_name' => 'Ramesh Lal', 'dob' => '2019-11-20', 'blood' => 'A+'],

            // --- GRADE 3 (IDs 59 - 72) ---
            ['first_name' => 'Muhammad Usman', 'last_name' => 'Ghani', 'gender' => 'male', 'father_name' => 'Usman Ghani Sr.', 'dob' => '2018-04-14', 'blood' => 'B+'],
            ['first_name' => 'Zainab', 'last_name' => 'Bibi', 'gender' => 'female', 'father_name' => 'Noor ul Amin', 'dob' => '2018-06-19', 'blood' => 'A+'],
            ['first_name' => 'Shahmeer', 'last_name' => 'Khan', 'gender' => 'male', 'father_name' => 'Zahir Shah Khan', 'dob' => '2018-02-11', 'blood' => 'O+'],
            ['first_name' => 'Momina', 'last_name' => 'Tariq', 'gender' => 'female', 'father_name' => 'Tariq Jamil', 'dob' => '2018-08-27', 'blood' => 'AB+'],
            ['first_name' => 'Muhammad Abdullah', 'last_name' => 'Afridi', 'gender' => 'male', 'father_name' => 'Ajab Khan Afridi', 'dob' => '2018-01-25', 'blood' => 'B+'],
            ['first_name' => 'Noor', 'last_name' => 'Ul Huda', 'gender' => 'female', 'father_name' => 'Dr. Shams ul Huda', 'dob' => '2018-05-15', 'blood' => 'A-'],
            ['first_name' => 'Irfan', 'last_name' => 'Ullah', 'gender' => 'male', 'father_name' => 'Niamat Ullah', 'dob' => '2018-07-09', 'blood' => 'O+'],
            ['first_name' => 'Eman', 'last_name' => 'Zahra', 'gender' => 'female', 'father_name' => 'Syed Mazhar Abbas', 'dob' => '2018-03-30', 'blood' => 'B+'],
            ['first_name' => 'Muhammad Hassan', 'last_name' => 'Wali', 'gender' => 'male', 'father_name' => 'Wali ur Rehman', 'dob' => '2018-09-18', 'blood' => 'A+'],
            ['first_name' => 'Anum', 'last_name' => 'Mukhtar', 'gender' => 'female', 'father_name' => 'Mukhtar Ahmad', 'dob' => '2018-04-03', 'blood' => 'O+'],
            ['first_name' => 'Sameer', 'last_name' => 'Ahmed', 'gender' => 'male', 'father_name' => 'Mushtaq Ahmed', 'dob' => '2018-10-10', 'blood' => 'B+'],
            ['first_name' => 'Rumaisa', 'last_name' => 'Khurram', 'gender' => 'female', 'father_name' => 'Khurram Shahzad', 'dob' => '2018-06-08', 'blood' => 'AB-'],
            ['first_name' => 'Muhammad Zarrar', 'last_name' => 'Khan', 'gender' => 'male', 'father_name' => 'Jalil Khan', 'dob' => '2018-02-22', 'blood' => 'A+'],
            ['first_name' => 'Bareera', 'last_name' => 'Kashif', 'gender' => 'female', 'father_name' => 'Kashif Ali', 'dob' => '2018-08-01', 'blood' => 'O+'],

            // --- GRADE 4 (IDs 73 - 86) ---
            ['first_name' => 'Muhammad Hamza', 'last_name' => 'Awan', 'gender' => 'male', 'father_name' => 'Malik Sarfraz Awan', 'dob' => '2017-03-12', 'blood' => 'A+'],
            ['first_name' => 'Areeba', 'last_name' => 'Shahid', 'gender' => 'female', 'father_name' => 'Shahid Afridi Khan', 'dob' => '2017-06-20', 'blood' => 'B+'],
            ['first_name' => 'Daniyal', 'last_name' => 'Munir', 'gender' => 'male', 'father_name' => 'Munir Akhtar', 'dob' => '2017-01-16', 'blood' => 'O+'],
            ['first_name' => 'Kinza', 'last_name' => 'Hashmi', 'gender' => 'female', 'father_name' => 'Syed Faisal Hashmi', 'dob' => '2017-07-24', 'blood' => 'AB+'],
            ['first_name' => 'Muhammad Anas', 'last_name' => 'Yousaf', 'gender' => 'male', 'father_name' => 'Yousaf Raza', 'dob' => '2017-04-05', 'blood' => 'A-'],
            ['first_name' => 'Iqra', 'last_name' => 'Nawaz', 'gender' => 'female', 'father_name' => 'Muhammad Nawaz', 'dob' => '2017-09-14', 'blood' => 'B+'],
            ['first_name' => 'Rehan', 'last_name' => 'Afzal', 'gender' => 'male', 'father_name' => 'Afzal Mehmood', 'dob' => '2017-02-27', 'blood' => 'O+'],
            ['first_name' => 'Wajiha', 'last_name' => 'Babar', 'gender' => 'female', 'father_name' => 'Babar Azam Khan', 'dob' => '2017-08-31', 'blood' => 'A+'],
            ['first_name' => 'Muhammad Sufyan', 'last_name' => 'Qazi', 'gender' => 'male', 'father_name' => 'Qazi Mujeebullah', 'dob' => '2017-05-19', 'blood' => 'B+'],
            ['first_name' => 'Fizza', 'last_name' => 'Bano', 'gender' => 'female', 'father_name' => 'Haji Ghulam Rasool', 'dob' => '2017-10-09', 'blood' => 'O-'],
            ['first_name' => 'Bilawal', 'last_name' => 'Shah', 'gender' => 'male', 'father_name' => 'Syed Zulfiqar Shah', 'dob' => '2017-03-29', 'blood' => 'AB+'],
            ['first_name' => 'Maliha', 'last_name' => 'Anwar', 'gender' => 'female', 'father_name' => 'Anwar ul Haq', 'dob' => '2017-06-11', 'blood' => 'B+'],
            ['first_name' => 'Muhammad Huzaifa', 'last_name' => 'Malik', 'gender' => 'male', 'father_name' => 'Malik Fayyaz', 'dob' => '2017-11-23', 'blood' => 'A+'],
            ['first_name' => 'Rida', 'last_name' => 'Zahra', 'gender' => 'female', 'father_name' => 'Syed Baqir Hussain', 'dob' => '2017-07-07', 'blood' => 'O+'],

            // --- GRADE 5 (IDs 87 - 100) ---
            ['first_name' => 'Muhammad Ahmed', 'last_name' => 'Siddiqui', 'gender' => 'male', 'father_name' => 'Abdul Quddus Siddiqui', 'dob' => '2016-02-18', 'blood' => 'B+'],
            ['first_name' => 'Syeda Fatima', 'last_name' => 'Zahra', 'gender' => 'female', 'father_name' => 'Syed Irfan Ali Shah', 'dob' => '2016-05-29', 'blood' => 'A+'],
            ['first_name' => 'Shahzaib', 'last_name' => 'Durrani', 'gender' => 'male', 'father_name' => 'Nasser Durrani', 'dob' => '2016-01-14', 'blood' => 'O+'],
            ['first_name' => 'Muntaha', 'last_name' => 'Noor', 'gender' => 'female', 'father_name' => 'Noor ul Hassan', 'dob' => '2016-08-03', 'blood' => 'AB+'],
            ['first_name' => 'Muhammad Arsalan', 'last_name' => 'Khan', 'gender' => 'male', 'father_name' => 'Inayat Khan', 'dob' => '2016-03-24', 'blood' => 'A+'],
            ['first_name' => 'Maham', 'last_name' => 'Tariq', 'gender' => 'female', 'father_name' => 'Tariq Mehmood', 'dob' => '2016-09-17', 'blood' => 'B+'],
            ['first_name' => 'Zeeshan', 'last_name' => 'Haider', 'gender' => 'male', 'father_name' => 'Haider Ali', 'dob' => '2016-04-08', 'blood' => 'O+'],
            ['first_name' => 'Haleema', 'last_name' => 'Sadia', 'gender' => 'female', 'father_name' => 'Muhammad Zubair', 'dob' => '2016-10-22', 'blood' => 'A-'],
            ['first_name' => 'Muhammad Farhan', 'last_name' => 'Afridi', 'gender' => 'male', 'father_name' => 'Zafar Khan Afridi', 'dob' => '2016-06-12', 'blood' => 'B+'],
            ['first_name' => 'Samreen', 'last_name' => 'Gul', 'gender' => 'female', 'father_name' => 'Gul Zaman', 'dob' => '2016-11-05', 'blood' => 'O+'],
            ['first_name' => 'Adeel', 'last_name' => 'Akhtar', 'gender' => 'male', 'father_name' => 'Akhtar Nawaz', 'dob' => '2016-03-31', 'blood' => 'AB+'],
            ['first_name' => 'Kashaf', 'last_name' => 'Ul Eman', 'gender' => 'female', 'father_name' => 'Ghulam Dastagir', 'dob' => '2016-07-16', 'blood' => 'B+'],
            ['first_name' => 'Muhammad Shayan', 'last_name' => 'Shinwari', 'gender' => 'male', 'father_name' => 'Haji Zarbat Shinwari', 'dob' => '2016-01-29', 'blood' => 'A+'],
            ['first_name' => 'Aiman', 'last_name' => 'Fatima', 'gender' => 'female', 'father_name' => 'Syed Kamran Shah', 'dob' => '2016-08-25', 'blood' => 'O+'],
        ];

        $peshawarAddresses = [
            'Sector F-3, Phase 6, Hayatabad, Peshawar',
            'Street 4, Sector N-2, Phase 4, Hayatabad, Peshawar',
            'House 18, University Town, Peshawar',
            'Main Circular Road, Saddar Cantt, Peshawar',
            'Street 7, Gulbahar No. 2, Peshawar City',
            'House 92, Sector D-1, Phase 1, Hayatabad, Peshawar',
            'Near Forest Bazaar, Forest Colony, Peshawar',
            'Street 12, Defense Officers Colony, Peshawar Cantt',
            'Mohallah Parachinar, Kohat Road, Peshawar',
            'Warsak Road near Police Public School, Peshawar',
            'Street 3, Canal Town, University Road, Peshawar',
            'House 45, Nauthia Jadeed, Peshawar Cantt',
            'Dalazak Road near City Railway Station, Peshawar',
            'Chughalpura, G.T Road, Peshawar',
            'House 8, Shami Road, Peshawar Cantt',
        ];

        // ---------------------------------------------------------------------
        // 4. Insert 100 Students with Enrollments & Multi-Year Promotions
        // ---------------------------------------------------------------------
        $retainedStudentIds = [3, 17, 33, 48, 63, 77, 92];

        foreach ($pakistaniStudents as $idx => $st) {
            $sId = $idx + 1;

            if ($sId <= 14) {
                $currentClassId = 1; // Nursery
                $classRoll = $sId;
            } elseif ($sId <= 28) {
                $currentClassId = 2; // Prep
                $classRoll = $sId - 14;
            } elseif ($sId <= 43) {
                $currentClassId = 3; // Grade 1
                $classRoll = $sId - 28;
            } elseif ($sId <= 58) {
                $currentClassId = 4; // Grade 2
                $classRoll = $sId - 43;
            } elseif ($sId <= 72) {
                $currentClassId = 5; // Grade 3
                $classRoll = $sId - 58;
            } elseif ($sId <= 86) {
                $currentClassId = 6; // Grade 4
                $classRoll = $sId - 72;
            } else {
                $currentClassId = 7; // Grade 5
                $classRoll = $sId - 86;
            }

            $currentSectionId = $currentClassId;

            // Admission Date & Tenure Cohorts
            if ($sId <= 25) {
                $admDate = '2024-08-01';
                $admYear = '2024';
            } elseif ($sId <= 50) {
                $admDate = '2025-02-01';
                $admYear = '2025';
            } elseif ($sId <= 75) {
                $admDate = '2025-08-01';
                $admYear = '2025';
            } else {
                $admDate = '2026-02-01';
                $admYear = '2026';
            }

            $admNo = sprintf('ADM-%s-%04d', $admYear, $sId);
            $rollNo = sprintf('%02d', $classRoll);
            $phone = sprintf('03%02d-%07d', rand(0, 4) + 30, rand(1000000, 9999999));
            $fatherCnic = sprintf('17301-%07d-%d', rand(1000000, 9999999), $st['gender'] === 'male' ? 1 : 2);
            $address = $peshawarAddresses[$sId % count($peshawarAddresses)];

            DB::table('students')->insert([
                'id' => $sId,
                'admission_number' => $admNo,
                'roll_number' => $rollNo,
                'first_name' => $st['first_name'],
                'last_name' => $st['last_name'],
                'gender' => $st['gender'],
                'date_of_birth' => $st['dob'],
                'blood_group' => $st['blood'],
                'guardian_name' => $st['father_name'],
                'guardian_relation' => 'Father',
                'guardian_phone' => $phone,
                'guardian_email' => 'parent.'.strtolower(str_replace(' ', '', $st['first_name']))."{$sId}@gmail.com",
                'father_cnic' => $fatherCnic,
                'address' => $address,
                'admission_date' => $admDate,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Multi-Year Enrollments (History & Promotion):
            if ($sId <= 75) {
                $isRetained = in_array($sId, $retainedStudentIds, true);
                $prevClassId = $isRetained ? $currentClassId : max(1, $currentClassId - 1);
                $prevSectionId = $prevClassId;

                DB::table('student_enrollments')->insert([
                    'student_id' => $sId,
                    'school_class_id' => $prevClassId,
                    'section_id' => $prevSectionId,
                    'session_year' => '2025-2026',
                    'is_current' => false,
                    'created_at' => Carbon::parse('2025-08-01'),
                    'updated_at' => Carbon::parse('2025-08-01'),
                ]);
            }

            // Current Year Enrollment (2026-2027):
            DB::table('student_enrollments')->insert([
                'student_id' => $sId,
                'school_class_id' => $currentClassId,
                'section_id' => $currentSectionId,
                'session_year' => '2026-2027',
                'is_current' => true,
                'created_at' => Carbon::parse('2026-08-01'),
                'updated_at' => Carbon::parse('2026-08-01'),
            ]);

            // -----------------------------------------------------------------
            // Student Fee Profiles (Current 2026-2027)
            // -----------------------------------------------------------------
            $baseClassRate = $classTuitionRates[$currentClassId] + 300.00;
            $monthlyDiscount = 0.00;
            $discountReason = null;

            if ($sId % 7 === 0) {
                $monthlyDiscount = round($baseClassRate * 0.20, 2);
                $discountReason = 'Sibling Concession 20% (Elder Sibling Enrolled)';
            } elseif ($sId % 13 === 0) {
                $monthlyDiscount = round($baseClassRate * 0.30, 2);
                $discountReason = 'Financial Hardship / Need-Based Support';
            } elseif ($sId === 10 || $sId === 25) {
                $monthlyDiscount = round($baseClassRate * 0.50, 2);
                $discountReason = 'School Staff Child Concession 50%';
            }

            $netMonthlyFee = $baseClassRate - $monthlyDiscount;

            $profileId = DB::table('student_fee_profiles')->insertGetId([
                'student_id' => $sId,
                'school_class_id' => $currentClassId,
                'session_year' => '2026-2027',
                'base_monthly_fee' => $baseClassRate,
                'monthly_discount' => $monthlyDiscount,
                'net_monthly_fee' => $netMonthlyFee,
                'waive_admission_fee' => ($sId % 10 === 0),
                'discount_reason' => $discountReason,
                'is_locked' => true,
                'approved_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('student_fee_profile_items')->insert([
                'student_fee_profile_id' => $profileId,
                'fee_head_id' => 1,
                'amount' => $netMonthlyFee,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Previous session profile for older cohorts
            if ($sId <= 75) {
                $prevBase = $classTuitionRates[max(1, $currentClassId - 1)];
                $prevDiscount = ($monthlyDiscount > 0) ? round($prevBase * 0.20, 2) : 0.00;
                $prevNet = $prevBase - $prevDiscount;

                $prevProfileId = DB::table('student_fee_profiles')->insertGetId([
                    'student_id' => $sId,
                    'school_class_id' => max(1, $currentClassId - 1),
                    'session_year' => '2025-2026',
                    'base_monthly_fee' => $prevBase,
                    'monthly_discount' => $prevDiscount,
                    'net_monthly_fee' => $prevNet,
                    'waive_admission_fee' => false,
                    'discount_reason' => $discountReason,
                    'is_locked' => true,
                    'approved_by' => 1,
                    'created_at' => Carbon::parse('2025-08-01'),
                    'updated_at' => Carbon::parse('2025-08-01'),
                ]);

                DB::table('student_fee_profile_items')->insert([
                    'student_fee_profile_id' => $prevProfileId,
                    'fee_head_id' => 1,
                    'amount' => $prevNet,
                    'created_at' => Carbon::parse('2025-08-01'),
                    'updated_at' => Carbon::parse('2025-08-01'),
                ]);
            }
        }

        // ---------------------------------------------------------------------
        // 5. 24 Months of Fee Invoices & Payment Scenarios
        // ---------------------------------------------------------------------
        $monthChronology = [
            // Session 2025-2026
            ['year' => 2024, 'month_num' => 11, 'month_name' => 'November', 'session' => '2025-2026', 'order' => 1],
            ['year' => 2024, 'month_num' => 12, 'month_name' => 'December', 'session' => '2025-2026', 'order' => 2],
            ['year' => 2025, 'month_num' => 1,  'month_name' => 'January',  'session' => '2025-2026', 'order' => 3],
            ['year' => 2025, 'month_num' => 2,  'month_name' => 'February', 'session' => '2025-2026', 'order' => 4],
            ['year' => 2025, 'month_num' => 3,  'month_name' => 'March',    'session' => '2025-2026', 'order' => 5],
            ['year' => 2025, 'month_num' => 4,  'month_name' => 'April',    'session' => '2025-2026', 'order' => 6],
            ['year' => 2025, 'month_num' => 5,  'month_name' => 'May',      'session' => '2025-2026', 'order' => 7],
            ['year' => 2025, 'month_num' => 6,  'month_name' => 'June',     'session' => '2025-2026', 'order' => 8],
            ['year' => 2025, 'month_num' => 7,  'month_name' => 'July',     'session' => '2025-2026', 'order' => 9],
            ['year' => 2025, 'month_num' => 8,  'month_name' => 'August',   'session' => '2025-2026', 'order' => 10],
            ['year' => 2025, 'month_num' => 9,  'month_name' => 'September', 'session' => '2025-2026', 'order' => 11],
            ['year' => 2025, 'month_num' => 10, 'month_name' => 'October',  'session' => '2025-2026', 'order' => 12],
            // Session 2026-2027
            ['year' => 2025, 'month_num' => 11, 'month_name' => 'November', 'session' => '2026-2027', 'order' => 1],
            ['year' => 2025, 'month_num' => 12, 'month_name' => 'December', 'session' => '2026-2027', 'order' => 2],
            ['year' => 2026, 'month_num' => 1,  'month_name' => 'January',  'session' => '2026-2027', 'order' => 3],
            ['year' => 2026, 'month_num' => 2,  'month_name' => 'February', 'session' => '2026-2027', 'order' => 4],
            ['year' => 2026, 'month_num' => 3,  'month_name' => 'March',    'session' => '2026-2027', 'order' => 5],
            ['year' => 2026, 'month_num' => 4,  'month_name' => 'April',    'session' => '2026-2027', 'order' => 6],
            ['year' => 2026, 'month_num' => 5,  'month_name' => 'May',      'session' => '2026-2027', 'order' => 7],
            ['year' => 2026, 'month_num' => 6,  'month_name' => 'June',     'session' => '2026-2027', 'order' => 8],
            ['year' => 2026, 'month_num' => 7,  'month_name' => 'July',     'session' => '2026-2027', 'order' => 9],
            ['year' => 2026, 'month_num' => 8,  'month_name' => 'August',   'session' => '2026-2027', 'order' => 10],
            ['year' => 2026, 'month_num' => 9,  'month_name' => 'September', 'session' => '2026-2027', 'order' => 11],
            ['year' => 2026, 'month_num' => 10, 'month_name' => 'October',  'session' => '2026-2027', 'order' => 12],
        ];

        $paymentSeq = 1;

        for ($sId = 1; $sId <= 100; $sId++) {
            if ($sId <= 25) {
                $startMonthIdx = 0;
            } elseif ($sId <= 50) {
                $startMonthIdx = 6;
            } elseif ($sId <= 75) {
                $startMonthIdx = 12;
            } else {
                $startMonthIdx = 18;
            }

            if ($sId <= 14) {
                $cId = 1;
            } elseif ($sId <= 28) {
                $cId = 2;
            } elseif ($sId <= 43) {
                $cId = 3;
            } elseif ($sId <= 58) {
                $cId = 4;
            } elseif ($sId <= 72) {
                $cId = 5;
            } elseif ($sId <= 86) {
                $cId = 6;
            } else {
                $cId = 7;
            }

            $arrears = 0.00;
            $skipPaymentThisMonth = false;

            for ($mIdx = $startMonthIdx; $mIdx < count($monthChronology); $mIdx++) {
                $mInfo = $monthChronology[$mIdx];
                $issueDate = sprintf('%04d-%02d-01', $mInfo['year'], $mInfo['month_num']);
                $dueDate = sprintf('%04d-%02d-10', $mInfo['year'], $mInfo['month_num']);
                $paymentDate = sprintf('%04d-%02d-06', $mInfo['year'], $mInfo['month_num']);

                $baseFee = $classTuitionRates[$cId] + ($mInfo['session'] === '2026-2027' ? 300.00 : 0.00);

                $discount = 0.00;
                if ($sId % 7 === 0) {
                    $discount = round($baseFee * 0.20, 2);
                } elseif ($sId % 13 === 0) {
                    $discount = round($baseFee * 0.30, 2);
                } elseif ($sId === 10 || $sId === 25) {
                    $discount = round($baseFee * 0.50, 2);
                }

                $isLastMonth = ($mIdx === count($monthChronology) - 1);
                $isSecondLastMonth = ($mIdx === count($monthChronology) - 2);

                $fine = 0.00;
                $paidAmount = 0.00;
                $status = 'unpaid';

                if ($sId % 10 === 0 && ($isLastMonth || $isSecondLastMonth)) {
                    // Scenario E: Recent Defaulter
                    $status = $isLastMonth ? 'unpaid' : 'overdue';
                    $fine = $isLastMonth ? 0.00 : 200.00;
                    $paidAmount = 0.00;
                } elseif ($sId % 6 === 0 && ! $isLastMonth) {
                    // Scenario C: 2-Months Lump Sum Payer
                    if (! $skipPaymentThisMonth) {
                        $status = 'unpaid';
                        $paidAmount = 0.00;
                        $skipPaymentThisMonth = true;
                    } else {
                        $status = 'paid';
                        $subtotalCharge = $baseFee;
                        $totalWithArrears = ($subtotalCharge + $arrears) - $discount;
                        $paidAmount = $totalWithArrears;
                        $skipPaymentThisMonth = false;
                    }
                } elseif ($sId % 5 === 0 && ! $isLastMonth) {
                    // Scenario B: Partial Payer
                    $status = 'partially_paid';
                    $paidAmount = max(1500.00, round(($baseFee - $discount) * 0.60, 2));
                } elseif ($sId % 9 === 0 && $mIdx % 4 === 0) {
                    // Scenario D: Overdue fine case
                    $fine = 250.00;
                    $totalNeeded = ($baseFee + $arrears + $fine) - $discount;
                    $status = 'paid';
                    $paidAmount = $totalNeeded;
                } else {
                    // Scenario A: Full On-Time Payer
                    $totalNeeded = ($baseFee + $arrears) - $discount;
                    $status = 'paid';
                    $paidAmount = $totalNeeded;
                }

                $subtotal = $baseFee;
                $totalAmount = max(0.00, ($subtotal + $arrears + $fine) - $discount);
                $dueAmount = max(0.00, $totalAmount - $paidAmount);

                if ($paidAmount >= $totalAmount && $totalAmount > 0) {
                    $status = 'paid';
                    $dueAmount = 0.00;
                } elseif ($paidAmount > 0 && $paidAmount < $totalAmount) {
                    $status = 'partially_paid';
                }

                $invoiceNo = sprintf('INV-%04d%02d-%04d', $mInfo['year'], $mInfo['month_num'], $sId);

                $invoiceId = DB::table('fee_invoices')->insertGetId([
                    'invoice_no' => $invoiceNo,
                    'student_id' => $sId,
                    'school_class_id' => $cId,
                    'section_id' => $cId,
                    'month' => $mInfo['month_name'],
                    'month_order' => $mInfo['order'],
                    'session_year' => $mInfo['session'],
                    'issue_date' => $issueDate,
                    'due_date' => $dueDate,
                    'subtotal' => $subtotal,
                    'previous_arrears' => $arrears,
                    'discount' => $discount,
                    'fine' => $fine,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'status' => $status,
                    'remarks' => "Monthly fee voucher for {$mInfo['month_name']} {$mInfo['year']}",
                    'created_at' => Carbon::parse($issueDate),
                    'updated_at' => Carbon::parse($paidAmount > 0 ? $paymentDate : $issueDate),
                ]);

                // Line items
                DB::table('fee_invoice_items')->insert([
                    'fee_invoice_id' => $invoiceId,
                    'fee_head_id' => 1,
                    'title' => 'Monthly Tuition Fee',
                    'amount' => $subtotal,
                    'created_at' => Carbon::parse($issueDate),
                    'updated_at' => Carbon::parse($issueDate),
                ]);

                // If payment was made, generate receipt and allocation
                if ($paidAmount > 0) {
                    $receiptNo = sprintf('REC-%04d%02d-%04d', $mInfo['year'], $mInfo['month_num'], $paymentSeq++);
                    $payMethod = ($sId % 3 === 0) ? 'bank_transfer' : (($sId % 5 === 0) ? 'online' : 'cash');
                    $txnRef = ($payMethod !== 'cash') ? sprintf('FT%06d', rand(100000, 999999)) : null;

                    $paymentId = DB::table('fee_payments')->insertGetId([
                        'receipt_no' => $receiptNo,
                        'student_id' => $sId,
                        'received_by' => 1,
                        'amount_paid' => $paidAmount,
                        'payment_date' => $paymentDate,
                        'payment_method' => $payMethod,
                        'transaction_reference' => $txnRef,
                        'note' => "Fee received for {$mInfo['month_name']} {$mInfo['year']}",
                        'created_at' => Carbon::parse($paymentDate),
                        'updated_at' => Carbon::parse($paymentDate),
                    ]);

                    DB::table('fee_invoice_payment')->insert([
                        'fee_invoice_id' => $invoiceId,
                        'fee_payment_id' => $paymentId,
                        'amount_allocated' => $paidAmount,
                        'created_at' => Carbon::parse($paymentDate),
                        'updated_at' => Carbon::parse($paymentDate),
                    ]);
                }

                // Carry forward unpaid remaining balance as arrears
                $arrears = $dueAmount;
            }
        }

        // ---------------------------------------------------------------------
        // 6. Student Fines (Varied Scenarios: Leave, Exam, Uniform, Discipline)
        // ---------------------------------------------------------------------
        $fineSamples = [
            ['student_id' => 4,  'type' => 'leave',      'mode' => 'on_the_spot', 'amt' => 300, 'status' => 'paid',   'reason' => '3 consecutive days unnotified absence without leave application', 'method' => 'cash'],
            ['student_id' => 12, 'type' => 'discipline', 'mode' => 'on_the_spot', 'amt' => 200, 'status' => 'paid',   'reason' => 'Repeated improper school uniform and unpolished shoes', 'method' => 'cash'],
            ['student_id' => 19, 'type' => 'exam',       'mode' => 'on_the_spot', 'amt' => 500, 'status' => 'paid',   'reason' => 'Unexcused absence in First Term English exam', 'method' => 'bank_transfer'],
            ['student_id' => 27, 'type' => 'test',       'mode' => 'on_the_spot', 'amt' => 150, 'status' => 'paid',   'reason' => 'Missed monthly class assessment without prior notification', 'method' => 'cash'],
            ['student_id' => 35, 'type' => 'other',      'mode' => 'on_the_spot', 'amt' => 250, 'status' => 'paid',   'reason' => 'Damaged library storybook replacement surcharge', 'method' => 'cash'],
            ['student_id' => 42, 'type' => 'leave',      'mode' => 'on_the_spot', 'amt' => 200, 'status' => 'paid',   'reason' => 'Short leave violation leaving campus early without permission gate pass', 'method' => 'cash'],

            ['student_id' => 8,  'type' => 'discipline', 'mode' => 'monthly',     'amt' => 300, 'status' => 'unpaid', 'reason' => 'Classroom indiscipline and disruption during science lecture', 'method' => null],
            ['student_id' => 23, 'type' => 'exam',       'mode' => 'year_end',    'amt' => 500, 'status' => 'unpaid', 'reason' => 'Retest administrative arrangement fee for Mid Term Mathematics', 'method' => null],
            ['student_id' => 38, 'type' => 'leave',      'mode' => 'monthly',     'amt' => 400, 'status' => 'unpaid', 'reason' => 'Unapproved 4 days leave extension following Eid break', 'method' => null],
            ['student_id' => 54, 'type' => 'test',       'mode' => 'on_the_spot', 'amt' => 200, 'status' => 'unpaid', 'reason' => 'Late reporting to monthly assessment hall', 'method' => null],
            ['student_id' => 67, 'type' => 'discipline', 'mode' => 'year_end',    'amt' => 500, 'status' => 'unpaid', 'reason' => 'Cafeteria queue disruption and damaging canteen tray', 'method' => null],
            ['student_id' => 81, 'type' => 'other',      'mode' => 'monthly',     'amt' => 350, 'status' => 'unpaid', 'reason' => 'Lost student RFID identity smart card reissuance fee', 'method' => null],
            ['student_id' => 95, 'type' => 'leave',      'mode' => 'on_the_spot', 'amt' => 200, 'status' => 'unpaid', 'reason' => 'Unexcused short leave after recess period', 'method' => null],

            ['student_id' => 15, 'type' => 'leave',      'mode' => 'on_the_spot', 'amt' => 300, 'status' => 'waived', 'reason' => 'Absent without leave during fever outbreak', 'waive_reason' => 'Hospital medical fitness certificate submitted by parents and approved by Principal.', 'method' => null],
            ['student_id' => 49, 'type' => 'exam',       'mode' => 'monthly',     'amt' => 500, 'status' => 'waived', 'reason' => 'Absent in Science practical exam', 'waive_reason' => 'Represented school in inter-district debate championship on exam date.', 'method' => null],
            ['student_id' => 62, 'type' => 'discipline', 'mode' => 'on_the_spot', 'amt' => 200, 'status' => 'waived', 'reason' => 'Wearing casual sweater instead of school uniform blazer', 'waive_reason' => 'Parent informed blazer was sent for dry cleaning; first-time pardon.', 'method' => null],
        ];

        $fineReceiptSeq = 1;
        foreach ($fineSamples as $f) {
            $student = DB::table('students')->find($f['student_id']);
            $enrollment = DB::table('student_enrollments')->where('student_id', $f['student_id'])->where('is_current', true)->first();
            $classId = $enrollment ? $enrollment->school_class_id : 1;

            $paidDate = ($f['status'] === 'paid') ? '2026-10-15' : null;
            $paidAmt = ($f['status'] === 'paid') ? $f['amt'] : 0.00;
            $receipt = ($f['status'] === 'paid') ? sprintf('FINE-REC-2026-%04d', $fineReceiptSeq++) : null;

            DB::table('student_fines')->insert([
                'student_id' => $f['student_id'],
                'school_class_id' => $classId,
                'fine_type' => $f['type'],
                'collection_mode' => $f['mode'],
                'amount' => $f['amt'],
                'paid_amount' => $paidAmt,
                'reason' => $f['reason'],
                'fine_date' => '2026-10-10',
                'status' => $f['status'],
                'receipt_no' => $receipt,
                'paid_date' => $paidDate,
                'payment_method' => $f['method'],
                'fee_invoice_id' => null,
                'waived_reason' => $f['waive_reason'] ?? null,
                'imposed_by' => 1,
                'collected_by' => ($f['status'] === 'paid') ? 1 : null,
                'created_at' => Carbon::parse('2026-10-10'),
                'updated_at' => Carbon::parse($paidDate ?? '2026-10-10'),
            ]);
        }
    }
}
