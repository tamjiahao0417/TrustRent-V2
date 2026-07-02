import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
// Import your newly created Model from the shared folder
import { ContractDetailsModel } from '../../models/shared/contract-details.model';

// If you haven't installed web3 via npm, we can declare it for the window object
declare let window: any;
declare let Web3: any;

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // Pointing to the new views folder
  templateUrl: '../../views/shared/contract-details.html',
  styleUrl: '../../views/shared/contract-details.css'
})
export class ContractDetailsController implements OnInit {
  @ViewChild('tenantSignatureCanvas', { static: false }) tenantSignatureCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  contract: any = null;
  userRole: string | null = '';
  
  // Calculated UI fields
  durationText: string = '';
  totalInitial: number = 0;

  // Status Banner Info
  statusClass: string = 'status-draft';
  statusText: string = 'Status: Unknown';
  statusIcon: string = 'fa-circle-info';

  // Web3 Settings
  contractABI: any[] = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "_dbId", "type": "uint256" },
            { "internalType": "address", "name": "_tenant", "type": "address" },
            { "internalType": "string", "name": "_docHash", "type": "string" }
        ],
        "name": "createContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_dbId", "type": "uint256" }],
        "name": "getContract",
        "outputs": [
            { "internalType": "address", "name": "", "type": "address" },
            { "internalType": "address", "name": "", "type": "address" },
            { "internalType": "string", "name": "", "type": "string" },
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
  ];
  contractAddress = environment.contractAddress;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private contractModel: ContractDetailsModel // INJECTING THE MODEL HERE
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role')?.toLowerCase() || null;
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Use the Model to fetch the contract data
      this.contractModel.getContract(id).subscribe({
        next: (data: any) => {
          this.contract = data;
          
          this.totalInitial = parseFloat(data.security_deposit) + parseFloat(data.utilities_deposit) + parseFloat(data.rent_amount);
          this.durationText = data.lease_term.toUpperCase(); 

          this.determineStatusBanner();
          this.cdr.detectChanges();

          if (this.userRole === 'tenant' && this.contract.status === 'Pending Tenant') {
            this.initSignaturePad();
          }
          
        },
        error: () => {
          alert('Contract not found.');
          this.router.navigate(['/contracts']);
        }
      });
    }
  }

  determineStatusBanner() {
    if (this.contract.status === 'Draft') {
        if (this.userRole === 'tenant') {
            this.statusClass = 'status-waiting'; 
            this.statusText = 'Waiting for Landlord Edits';
            this.statusIcon = 'fa-clock';
        } else {
            this.statusClass = 'status-draft'; 
            this.statusText = 'Needs edit: The tenant requested changes. Please edit & re-sign.';
            this.statusIcon = 'fa-pen-to-square';
        }
    } else if (this.contract.status === 'Pending Tenant') {
        if (this.userRole === 'tenant') {
            this.statusClass = 'status-needs-seal'; 
            this.statusText = 'Needs Signature: Please review the contract and sign below.';
            this.statusIcon = 'fa-pen-nib';
        } else {
            this.statusClass = 'status-waiting'; 
            this.statusText = 'Waiting on Tenant to sign';
            this.statusIcon = 'fa-clock';
        }
    } else if (this.contract.status === 'Active' && !this.contract.blockchain_hash) {
        if (this.userRole === 'tenant') {
            this.statusClass = 'status-waiting'; 
            this.statusText = 'Waiting for Landlord to Seal';
            this.statusIcon = 'fa-clock';
        } else {
            this.statusClass = 'status-needs-seal'; 
            this.statusText = 'Action Required: The tenant has signed! You must now Seal it on the Blockchain.';
            this.statusIcon = 'fa-link';
        }
    } else if (this.contract.status === 'Active' && this.contract.blockchain_hash) {
        this.statusClass = 'status-active'; 
        this.statusText = 'Sealed & Active';
        this.statusIcon = 'fa-shield-check';
    }
  }

  getContractDataString(): string {
    return `${this.contract.property_id}|${this.contract.landlord_ic || ''}|${this.contract.landlord_address || ''}|${this.contract.tenant_ic || ''}|${this.contract.tenant_address || ''}|${this.contract.rent_amount}|${this.contract.payment_frequency}|${this.contract.due_date}|${this.contract.start_date}|${this.contract.end_date}|${this.contract.lease_term}|${this.contract.additional_terms || ''}|${this.contract.utilities_deposit}|${this.contract.security_deposit}|${this.contract.notice_period}|${this.contract.landlord_signature || ''}|${this.contract.tenant_signature || ''}`;
  }

  async verifyContractIntegrity() {
    if (typeof window.ethereum === 'undefined' || typeof Web3 === 'undefined') {
        return alert("Please install MetaMask and ensure Web3 is loaded.");
    }

    try {
        const web3 = new Web3(window.ethereum);
        const currentHash = web3.utils.sha3(this.getContractDataString());

        const trustRentContract = new web3.eth.Contract(this.contractABI, this.contractAddress);
        const result = await trustRentContract.methods.getContract(this.contract.id).call();
        const originalBlockchainHash = result[2]; 

        if (originalBlockchainHash === "") {
            alert("⚠️ No blockchain record found for this contract.");
        } else if (currentHash === originalBlockchainHash) {
            alert("✅ VERIFIED: Every detail of this contract matches the blockchain record. No tampering detected.");
        } else {
            alert("🚨 TAMPER ALERT: A detail in this contract has been modified in the database since it was sealed!");
        }
    } catch (error) {
        console.error(error);
        alert("Error connecting to the blockchain.");
    }
  }

  initSignaturePad() {
    setTimeout(() => {
      if (!this.tenantSignatureCanvas) return;
      
      const canvas = this.tenantSignatureCanvas.nativeElement;
      this.ctx = canvas.getContext('2d')!;
      this.ctx.strokeStyle = '#111';
      this.ctx.lineWidth = 3;
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';

      const getPos = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
        const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
        return {
          x: (clientX - rect.left) * (canvas.width / rect.width),
          y: (clientY - rect.top) * (canvas.height / rect.height)
        };
      };

      canvas.addEventListener('mousedown', (e) => { this.isDrawing = true; const p = getPos(e); this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y); });
      canvas.addEventListener('mousemove', (e) => { if (this.isDrawing) { const p = getPos(e); this.ctx.lineTo(p.x, p.y); this.ctx.stroke(); }});
      canvas.addEventListener('mouseup', () => this.isDrawing = false);
      canvas.addEventListener('mouseout', () => this.isDrawing = false);
    }, 200); 
  }

  clearSignature() {
    const canvas = this.tenantSignatureCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  signContract() {
    const canvas = this.tenantSignatureCanvas.nativeElement;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    
    if (canvas.toDataURL() === blank.toDataURL()) {
      alert('Please draw your signature to agree to this contract.');
      return;
    }

    const payload = { tenant_signature: canvas.toDataURL('image/png') };

    // Use the Model to save the signature
    this.contractModel.signContract(this.contract.id, payload).subscribe({
      next: () => {
        alert('Contract signed successfully! It is now Active.');
        this.contract.status = 'Active';
        this.contract.tenant_signature = payload.tenant_signature;
        this.determineStatusBanner();
        this.cdr.detectChanges();
      },
      error: () => alert('Failed to sign contract.')
    });
  }

  printDocument() {
    window.print();
  }

  goBack() { 
    this.location.back(); 
  }

  requestEdit() {
    const reason = prompt("What needs to be changed? (e.g., 'Please change the move-in date to the 20th')");
    
    if (reason === null) return; 

    if (reason.trim() === '') {
      alert("You must provide a reason for the edit.");
      return;
    }

    // Use the Model to request an edit
    this.contractModel.requestEdit(this.contract.id, reason).subscribe({
        next: () => {
          alert('Request sent! The landlord has been notified to edit the contract.');
          this.router.navigate(['/contracts']); 
        },
        error: () => alert('Failed to send edit request.')
      });
  }

  async sealContractOnBlockchain() {
    if (typeof window.ethereum === 'undefined' || typeof Web3 === 'undefined') {
        return alert("Please install MetaMask and ensure it is unlocked.");
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0]; 
        const web3 = new Web3(window.ethereum);

        const documentHash = web3.utils.sha3(this.getContractDataString());

        const trustRentContract = new web3.eth.Contract(this.contractABI, this.contractAddress);

        alert("Please confirm the MetaMask transaction to pay the gas fee and seal the contract.");

        trustRentContract.methods.createContract(this.contract.id, account, documentHash)
            .send({ from: account })
            .on('transactionHash', (hash: string) => {
                this.saveHashToDatabase(hash);
            })
            .on('error', (error: any) => {
                console.error(error);
                alert("Transaction failed or rejected by user.");
            });

    } catch (error) {
        console.error(error);
        alert("Error connecting to MetaMask or Ganache.");
    }
  }

  saveHashToDatabase(txHash: string) {
    // Use the Model to save the hash
    this.contractModel.sealContract(this.contract.id, txHash).subscribe({
        next: () => {
            alert('Contract successfully sealed on the blockchain!');
            this.contract.blockchain_hash = txHash;
            this.determineStatusBanner(); 
            this.cdr.detectChanges();
        },
        error: (err: any) => {
            console.error(err);
            alert('MetaMask succeeded, but failed to save hash to database.');
        }
    });
  }
}