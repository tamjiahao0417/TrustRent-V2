import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

declare let window: any;
declare let Web3: any;

@Component({
  selector: 'app-rent-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rent-payment.html',
  styleUrl: './rent-payment.css'
})
export class RentPayment implements OnInit {
  bill: any = null;
  history: any[] = [];
  userId = localStorage.getItem('user_id');

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get(`http://localhost:8000/api/billing/${this.userId}`).subscribe({
      next: (data: any) => {
        this.bill = data;
        this.history = data.history.slice(0, 5); // Just grab latest 5 for the mini-table
        this.cdr.detectChanges();
      },
      error: () => console.log('No active balances found.')
    });
  }

  async payWithWeb3() {
    if (typeof window.ethereum === 'undefined' || typeof Web3 === 'undefined') {
        return alert("Please install MetaMask.");
    }

    // Default testing wallet if landlord hasn't provided one
    const landlordWallet = this.bill.contract.landlord.wallet_address || '0xYourGanacheTestingWalletAddressHere'; 

    try {
        let ethToMyrRate = 8237.87; // Fallback
        try {
            const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=myr');
            const priceData = await priceRes.json();
            if (priceData.ethereum?.myr) ethToMyrRate = priceData.ethereum.myr;
        } catch (e) { console.warn("Live price API failed. Using fallback."); }

        const exactEth = this.bill.total / ethToMyrRate;
        const safeEthString = exactEth.toFixed(6);

        alert(`Conversion: 1 ETH = RM ${ethToMyrRate}\nAmount to Pay: ${safeEthString} ETH\n\nInitiating secure Web3 transaction...`);

        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        
        const ethAmountWei = web3.utils.toWei(safeEthString, "ether"); 
        const hexAmount = "0x" + BigInt(ethAmountWei).toString(16);

        // Send Transaction
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{ from: accounts[0], to: landlordWallet, value: hexAmount }],
        });

        // If approved, save to database!
        this.savePaymentToDatabase(txHash);

    } catch (error: any) {
        if (error.code === 4001) alert("Transaction cancelled by user.");
        else alert("Payment failed. Check console for details.");
    }
  }

  savePaymentToDatabase(hash: string) {
    const payload = {
      tenant_id: this.userId,
      landlord_id: this.bill.contract.landlord_id,
      property_id: this.bill.contract.property_id,
      contract_id: this.bill.contract.id,
      amount: this.bill.total,
      type: this.bill.type,
      billing_period: this.bill.period,
      blockchain_hash: hash
    };

    this.http.post('http://localhost:8000/api/payments', payload).subscribe(() => {
      alert('Payment successful and recorded on the blockchain!');
      this.ngOnInit(); // Reload page to update history
    });
  }
}