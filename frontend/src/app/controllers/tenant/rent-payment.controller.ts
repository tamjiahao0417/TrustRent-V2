import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import your newly created Model from the tenant folder
import { RentPaymentModel } from '../../models/tenant/rent-payment.model';

declare let window: any;
declare let Web3: any;

@Component({
  selector: 'app-rent-payment',
  standalone: true,
  imports: [CommonModule],
  // Pointing to the new views folder
  templateUrl: '../../views/tenant/rent-payment.html',
  styleUrl: '../../views/tenant/rent-payment.css'
})
export class RentPaymentController implements OnInit {
  // 🌟 FIX: Change from a single bill object to a bills array
  bills: any[] = []; 
  history: any[] = [];
  userId = localStorage.getItem('user_id');

  constructor(
    private cdr: ChangeDetectorRef,
    private paymentModel: RentPaymentModel 
  ) {}

  ngOnInit() {
    if (this.userId) {
      // 1. Fetch Bills
      this.paymentModel.getBilling(this.userId).subscribe({
        next: (data: any[]) => {
          this.bills = data; // Assign array of bills
          this.cdr.detectChanges();
        },
        error: () => console.log('No active balances found.')
      });

      // 2. Fetch History (We can use your existing history route here)
      this.paymentModel.getHistory(this.userId).subscribe({
          next: (data: any[]) => {
              this.history = data.slice(0, 5);
              this.cdr.detectChanges();
          }
      });
    }
  }

  // 🌟 FIX: We now pass the SPECIFIC bill into the pay function
  async payWithWeb3(targetBill: any) {
    if (typeof window.ethereum === 'undefined' || typeof Web3 === 'undefined') {
        return alert("Please install MetaMask.");
    }

    const landlordWallet = targetBill.contract.landlord.wallet_address || '0xYourGanacheTestingWalletAddressHere'; 

    try {
        let ethToMyrRate = 8237.87; 
        try {
            const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=myr');
            const priceData = await priceRes.json();
            if (priceData.ethereum?.myr) ethToMyrRate = priceData.ethereum.myr;
        } catch (e) { console.warn("Live price API failed. Using fallback."); }

        const exactEth = targetBill.total / ethToMyrRate;
        const safeEthString = exactEth.toFixed(6);

        alert(`Conversion: 1 ETH = RM ${ethToMyrRate}\nAmount to Pay: ${safeEthString} ETH`);

        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        
        const ethAmountWei = web3.utils.toWei(safeEthString, "ether"); 
        const hexAmount = "0x" + BigInt(ethAmountWei).toString(16);

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{ from: accounts[0], to: landlordWallet, value: hexAmount }],
        });

        this.savePaymentToDatabase(txHash, targetBill); // Pass the bill here too!

    } catch (error: any) {
        if (error.code === 4001) alert("Transaction cancelled by user.");
        else alert("Payment failed.");
    }
  }

  savePaymentToDatabase(hash: string, targetBill: any) {
    const payload = {
      tenant_id: this.userId,
      landlord_id: targetBill.contract.landlord_id,
      property_id: targetBill.contract.property_id,
      contract_id: targetBill.contract.id,
      amount: targetBill.total,
      type: targetBill.type,
      billing_period: targetBill.period,
      blockchain_hash: hash
    };

    this.paymentModel.savePayment(payload).subscribe(() => {
      alert('Payment successful and recorded on the blockchain!');
      this.ngOnInit(); 
    });
  }
}