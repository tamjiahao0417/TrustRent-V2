<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class ProfileRepository
{
    public function findByEmail($email)
    {
        return DB::table('users')->where('email', $email)->first();
    }

    public function update($id, array $data)
    {
        // DB::table doesn't automatically update timestamps
        $data['updated_at'] = now();
        
        return DB::table('users')->where('id', $id)->update($data);
    }
}