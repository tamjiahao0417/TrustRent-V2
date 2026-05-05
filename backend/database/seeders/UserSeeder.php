<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            [
                'id' => 8,
                'email' => 'wei@gmail.com',
                'password' => '$2y$12$ZAA62ePpeiomWe8IqK2MleGszCRcfpayicCJI9RaEqBKD.QBQmLXe',
                'role' => 'landlord',
                'status' => 'Active',
                'name' => 'weijia',
                'ic' => '030303-30-3030',
                'phone_number' => '011-35568552',
                'house_address' => 'sasa',
                'wallet_address' => '0x47C4714181fbb8eb131d32ED02284DfFA2899c37',
                'created_at' => '2026-04-12 09:39:38'
            ],
            [
                'id' => 9,
                'email' => 'hao@gmail.com',
                'password' => '$2y$12$Mgq7tA6Ykxxb.oPdq7DdqeB3OZVWjinX/.Ou9belH7xTXxdM7dzQm',
                'role' => 'tenant',
                'status' => 'Suspended',
                'name' => 'haohao',
                'ic' => '303003-00-3300',
                'phone_number' => '014-6666666',
                'house_address' => 'sasas',
                'wallet_address' => null,
                'created_at' => '2026-04-13 08:59:47'
            ],
            [
                'id' => 10,
                'email' => 'landlord@gmail.com',
                'password' => '$2y$12$Pewwo5SMXGht96.ecnE0V.4gj.aPFODzVNsQROPdyyx7chmQbaPW.',
                'role' => 'landlord',
                'status' => 'Active',
                'name' => 'Orlando L',
                'ic' => '030405-01-0101',
                'phone_number' => '019-2229393',
                'house_address' => 'No. 45, Jalan Indah 3/2, Taman Indahpura, 81000 Kulai, Johor',
                'wallet_address' => '0x05F940269A84c04c691F59032075AB55E27808Cf',
                'created_at' => '2026-04-17 14:37:55'
            ],
            [
                'id' => 11,
                'email' => 'tenant@gmail.com',
                'password' => '$2y$12$rTwYus6US.G3cE2auBJZPu8mQLk4JdUVUKJnkABs8L8OOoiVH1QxC',
                'role' => 'tenant',
                'status' => 'Suspended',
                'name' => 'James T',
                'ic' => '030405-09-4435',
                'phone_number' => '017-23245353',
                'house_address' => 'Unit 08-01, Teega Residences, Persiaran Laksamana, Puteri Harbour, 79250 Iskandar Puteri, Johor',
                'wallet_address' => null,
                'created_at' => '2026-04-17 14:38:21'
            ],
            [
                'id' => 12,
                'email' => 'admin@gmail.com',
                'password' => '$2y$12$sRKnzdSRaFvfjGJM/NzzAuXVt7RzDCFnI/ZQJ6rx3dxqxj.Mtz.yK',
                'role' => 'admin',
                'status' => 'Active',
                'name' => 'admin',
                'ic' => '002020-20-2022',
                'phone_number' => null,
                'house_address' => null,
                'wallet_address' => null,
                'created_at' => '2026-05-04 16:17:38'
            ]
        ]);
        
        // This line resets the Postgres counting sequence so future signups don't crash!
        DB::statement("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
    }
}