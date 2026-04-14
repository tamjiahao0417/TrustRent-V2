import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-contract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-contract.html',
  styleUrl: './edit-contract.css'
})
export class EditContract implements OnInit {
  @ViewChild('signatureCanvas', { static: false }) signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  contractId: string | null = '';
  formData: any = {};
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.contractId = this.route.snapshot.paramMap.get('id');

    this.http.get(`http://localhost:8000/api/contracts/${this.contractId}`).subscribe({
      next: (data: any) => {
        // Security: Only allow editing if it's a Draft!
        if (data.status !== 'Draft') {
          alert('This contract cannot be edited.');
          this.router.navigate(['/contracts']);
          return;
        }

        // Pre-fill the form with existing contract data
        this.formData = {
          landlord_ic: data.landlord_ic,
          landlord_address: data.landlord_address,
          tenant_ic: data.tenant_ic,
          tenant_address: data.tenant_address,
          start_date: data.start_date,
          end_date: data.end_date,
          rent_amount: data.rent_amount,
          utilities_deposit: data.utilities_deposit,
          security_deposit: data.security_deposit,
          notice_period: data.notice_period,
          additional_terms: data.additional_terms
        };
        
        this.cdr.detectChanges();
        this.initSignaturePad();
      },
      error: () => {
        alert('Contract not found.');
        this.router.navigate(['/contracts']);
      }
    });
  }

  // --- HTML5 Canvas Signature Logic ---
  initSignaturePad() {
    setTimeout(() => {
      if (!this.signatureCanvas) return;
      const canvas = this.signatureCanvas.nativeElement;
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
    const canvas = this.signatureCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  isCanvasBlank(): boolean {
    const canvas = this.signatureCanvas.nativeElement;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
  }

  onSubmit() {
    if (this.isCanvasBlank()) {
      alert('Please draw your new signature to confirm these edits.');
      return;
    }

    const payload = {
      ...this.formData,
      landlord_signature: this.signatureCanvas.nativeElement.toDataURL('image/png')
    };

    this.http.put(`http://localhost:8000/api/contracts/${this.contractId}/redraft`, payload).subscribe({
      next: () => {
        alert('Contract edited, re-signed, and sent back to the tenant!');
        this.router.navigate(['/contracts/details', this.contractId]); 
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update contract.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack() { this.location.back(); }
}