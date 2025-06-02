// src\app\pages\contact\contact.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Import this
// import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';


@Component({
  selector: 'app-contact',
  imports: [CommonModule,BreadcrumbComponent], //RouterLink
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

}
