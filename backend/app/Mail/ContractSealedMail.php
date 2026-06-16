<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractSealedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contract;

    public function __construct($contract)
    {
        $this->contract = $contract;
    }

    public function build()
    {
        return $this->subject('Contract Officially Sealed on Blockchain')
                    ->view('emails.contract_sealed');
    }
}