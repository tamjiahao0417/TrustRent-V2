import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// If you haven't installed web3 via npm, we can declare it for the window object
declare let window: any;
declare let Web3: any;

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-details.html',
  styleUrl: './contract-details.css'
})
export class ContractDetails implements OnInit {
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
  contractAddress = "0x1eBB5F5DaeE1c797e530BfDbcb8DDDE31946B435"; // Your Ganache Address

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role');
    const id = this.route.snapshot.paramMap.get('id');

    this.http.get(`http://localhost:8000/api/contracts/${id}`).subscribe({
      next: (data: any) => {
        this.contract = data;
        
        this.totalInitial = parseFloat(data.security_deposit) + parseFloat(data.utilities_deposit) + parseFloat(data.rent_amount);
        this.durationText = data.lease_term.toUpperCase(); 

        this.determineStatusBanner();
        this.cdr.detectChanges();

        // 🌟 ADD THESE 3 LINES RIGHT HERE 🌟
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

  determineStatusBanner() {
    // 1. DRAFT STATUS (Edits requested)
    if (this.contract.status === 'Draft') {
        if (this.userRole === 'tenant') {
            this.statusClass = 'status-waiting'; // Blue
            this.statusText = 'Waiting for Landlord Edits';
            this.statusIcon = 'fa-clock';
        } else {
            this.statusClass = 'status-draft'; // Yellow
            this.statusText = 'Needs edit: The tenant requested changes. Please edit & re-sign.';
            this.statusIcon = 'fa-pen-to-square';
        }
    } 
    // 2. PENDING TENANT STATUS (Waiting for tenant signature)
    else if (this.contract.status === 'Pending Tenant') {
        if (this.userRole === 'tenant') {
            this.statusClass = 'status-needs-seal'; // Yellow (Needs Action)
            this.statusText = 'Needs Signature: Please review the contract and sign below.';
            this.statusIcon = 'fa-pen-nib';
        } else {
            this.statusClass = 'status-waiting'; // Blue
            this.statusText = 'Waiting on Tenant to sign';
            this.statusIcon = 'fa-clock';
        }
    } 
    // 3. ACTIVE STATUS BUT NO BLOCKCHAIN HASH YET
    else if (this.contract.status === 'Active' && !this.contract.blockchain_hash) {
        if (this.userRole === 'tenant') {
            this.statusClass = 'status-waiting'; // Blue
            this.statusText = 'Waiting for Landlord to Seal';
            this.statusIcon = 'fa-clock';
        } else {
            this.statusClass = 'status-needs-seal'; // Yellow (Needs Action)
            this.statusText = 'Action Required: The tenant has signed! You must now Seal it on the Blockchain.';
            this.statusIcon = 'fa-link';
        }
    } 
    // 4. ACTIVE & SEALED ON BLOCKCHAIN
    else if (this.contract.status === 'Active' && this.contract.blockchain_hash) {
        this.statusClass = 'status-active'; // Green
        this.statusText = 'Sealed & Active';
        this.statusIcon = 'fa-shield-check';
    }
  }

  // --- EXACT HASH STRING REPLICATION ---
  getContractDataString(): string {
    // We strictly mimic the PHP pipe-separated string to ensure the hash matches!
    return `${this.contract.property_id}|${this.contract.landlord_ic || ''}|${this.contract.landlord_address || ''}|${this.contract.tenant_ic || ''}|${this.contract.tenant_address || ''}|${this.contract.rent_amount}|${this.contract.payment_frequency}|${this.contract.due_date}|${this.contract.start_date}|${this.contract.end_date}|${this.contract.lease_term}|${this.contract.additional_terms || ''}|${this.contract.utilities_deposit}|${this.contract.security_deposit}|${this.contract.notice_period}|${this.contract.landlord_signature || ''}|${this.contract.tenant_signature || ''}`;
  }

  // --- BLOCKCHAIN FUNCTIONS ---
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
    }, 200); // Slight delay to ensure the HTML has rendered
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

    this.http.patch(`http://localhost:8000/api/contracts/${this.contract.id}/sign`, payload).subscribe({
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

  goBack() { this.location.back(); }

  requestEdit() {
    const reason = prompt("What needs to be changed? (e.g., 'Please change the move-in date to the 20th')");
    
    // If they click 'Cancel' on the prompt, stop the function
    if (reason === null) return; 

    if (reason.trim() === '') {
      alert("You must provide a reason for the edit.");
      return;
    }

    this.http.patch(`http://localhost:8000/api/contracts/${this.contract.id}/request-edit`, { reason: reason })
      .subscribe({
        next: () => {
          alert('Request sent! The landlord has been notified to edit the contract.');
          this.router.navigate(['/contracts']); // Send them back to the list
        },
        error: () => alert('Failed to send edit request.')
      });
  }

  // --- ADD THESE METHODS FOR BLOCKCHAIN SEALING ---

  async sealContractOnBlockchain() {
    if (typeof window.ethereum === 'undefined' || typeof Web3 === 'undefined') {
        return alert("Please install MetaMask and ensure it is unlocked.");
    }

    try {
        // 1. Request MetaMask account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0]; // The Landlord's wallet address
        const web3 = new Web3(window.ethereum);

        // 2. Generate the exact SHA3 hash of the document string
        const documentHash = web3.utils.sha3(this.getContractDataString());

        // 3. Connect to your TrustRent Smart Contract on Ganache
        const trustRentContract = new web3.eth.Contract(this.contractABI, this.contractAddress);

        alert("Please confirm the MetaMask transaction to pay the gas fee and seal the contract.");

        // 4. Send the transaction! 
        // Note: The ABI requires a tenant address. If you don't store tenant wallet addresses yet, 
        // passing 'account' (landlord address) or a dummy address works perfectly for the prototype.
        trustRentContract.methods.createContract(this.contract.id, account, documentHash)
            .send({ from: account })
            .on('transactionHash', (hash: string) => {
                // 5. SUCCESS! MetaMask gave us a transaction hash. Save it to Laravel!
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
    this.http.patch(`http://localhost:8000/api/contracts/${this.contract.id}/seal`, { blockchain_hash: txHash })
        .subscribe({
            next: () => {
                alert('Contract successfully sealed on the blockchain!');
                this.contract.blockchain_hash = txHash;
                this.determineStatusBanner(); // Updates banner to "Sealed & Active"
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                alert('MetaMask succeeded, but failed to save hash to database.');
            }
        });
  }
}