import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-contract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-contract.html',
  styleUrl: './create-contract.css'
})
export class CreateContract implements OnInit {
  @ViewChild('signatureCanvas', { static: false }) signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  req: any = null;
  formData: any = {
    payment_frequency: 'Monthly',
    due_date: '7th of each month',
    notice_period: 2
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const requestId = this.route.snapshot.paramMap.get('id');
    const landlordId = localStorage.getItem('user_id');

    // Fetch the approved request details to pre-fill the form
    this.http.get(`http://localhost:8000/api/rental-requests/${requestId}`).subscribe({
      next: (data: any) => {
        this.req = data;
        this.formData.landlord_name = data.landlord?.name;
        this.formData.landlord_ic = data.landlord?.ic || '';
        this.formData.landlord_address = data.landlord?.house_address || '';
        this.formData.tenant_name = data.tenant?.name;
        this.formData.tenant_ic = data.tenant?.ic || '';
        this.formData.tenant_address = data.tenant?.house_address || '';
        this.formData.start_date = data.start_date;
        this.formData.end_date = data.end_date;
        this.formData.rent_amount = data.property?.price;
        this.formData.utilities_deposit = data.property?.price * 0.5;
        this.formData.security_deposit = data.property?.price * 2;
        this.formData.additional_terms = `BANKING DETAILS FOR RENT PAYMENT:\nBank Name: \nAccount No: \nAccount Name: ${data.landlord?.name}\n\nADDITIONAL TERMS:\nTenant shall be responsible for all utility bills.`;
        
        this.cdr.detectChanges();
        this.initSignaturePad();
      }
    });
  }

  // --- HTML5 Canvas Signature Logic ---
  initSignaturePad() {
    setTimeout(() => {
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
    }, 100);
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
      alert('Please draw your signature before sending the contract.');
      return;
    }

    const payload = {
      ...this.formData,
      user_id: localStorage.getItem('user_id'),
      rental_request_id: this.req.id,
      tenant_id: this.req.tenant_id,
      property_id: this.req.property_id,
      landlord_signature: this.signatureCanvas.nativeElement.toDataURL('image/png')
    };

    this.http.post('http://localhost:8000/api/contracts', payload).subscribe({
      next: () => {
        alert('Contract generated and sent to tenant!');
        this.router.navigate(['/contracts']); // We will build the list next
      },
      error: (err) => alert(err.error?.message || 'Failed to create contract.')
    });
  }

  goBack() { this.location.back(); }
}