import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query
} from '@angular/animations';
interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalProducts: number;
  totalReports: number;
}

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  customer: string;
  price: number;
  seller: string;
  date: Date;
  status: 'Pendiente' | 'Nuevo' | 'Sin stock' | 'Delivery';
  isPaid: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.6s ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('staggerAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(100, [
            animate('0.4s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DashboardComponent {
  trackByOrderId(index: number, item: any): any {
      return item.orderId; // o la propiedad única que identifique cada item
    }

  stats: DashboardStats = {
    totalOrders: 1250,
    totalCustomers: 890,
    totalRevenue: 45300,
    totalProducts: 340,
    totalReports: 25
  };

  recentOrders: OrderItem[] = [
    {
      id: 'ORD-001',
      productName: 'iPhone 15 Pro Max',
      productImage: '/api/placeholder/60/60',
      customer: 'Juan Pérez',
      price: 1299,
      seller: 'TechStore',
      date: new Date('2024-01-15'),
      status: 'Delivery',
      isPaid: true
    },
    {
      id: 'ORD-002',
      productName: 'Samsung Galaxy S24',
      productImage: '/api/placeholder/60/60',
      customer: 'María González',
      price: 899,
      seller: 'MobileWorld',
      date: new Date('2024-01-14'),
      status: 'Pendiente',
      isPaid: false
    },
    {
      id: 'ORD-003',
      productName: 'MacBook Air M3',
      productImage: '/api/placeholder/60/60',
      customer: 'Carlos Rivera',
      price: 1199,
      seller: 'AppleStore',
      date: new Date('2024-01-13'),
      status: 'Nuevo',
      isPaid: true
    },
    {
      id: 'ORD-004',
      productName: 'AirPods Pro 2',
      productImage: '/api/placeholder/60/60',
      customer: 'Ana Martínez',
      price: 249,
      seller: 'AudioTech',
      date: new Date('2024-01-12'),
      status: 'Sin stock',
      isPaid: false
    },
    {
      id: 'ORD-005',
      productName: 'iPad Pro 12.9"',
      productImage: '/api/placeholder/60/60',
      customer: 'Luis Rodríguez',
      price: 1099,
      seller: 'TabletZone',
      date: new Date('2024-01-11'),
      status: 'Delivery',
      isPaid: true
    },
    {
      id: 'ORD-006',
      productName: 'PlayStation 5',
      productImage: '/api/placeholder/60/60',
      customer: 'Sofia López',
      price: 499,
      seller: 'GameStore',
      date: new Date('2024-01-10'),
      status: 'Nuevo',
      isPaid: true
    }
  ];

  
// Producto más vendido del mes
topProduct = {
  name: 'iPhone 15 Pro Max',
  image: '/api/placeholder/120/120',
  sales: 156,
  revenue: 202644,
  growth: 23.5
};

// Stock crítico
criticalStock = [
  { name: 'AirPods Pro 2', stock: 2, minStock: 10 },
  { name: 'Samsung Galaxy S24', stock: 3, minStock: 15 },
  { name: 'MacBook Air M3', stock: 1, minStock: 5 },
  { name: 'iPad Pro 12.9"', stock: 4, minStock: 8 }
];

// Datos para gráfico de categorías (torta)
categoryData = [
  { name: 'Electrónicos', value: 45, color: '#007bff' },
  { name: 'Moda', value: 30, color: '#28a745' },
  { name: 'Hogar', value: 15, color: '#ffc107' },
  { name: 'Otros', value: 10, color: '#dc3545' }
];

// Contador animado de ganancias
monthlyEarnings = 0;
targetEarnings = 23450;

// Datos para gráfico de barras (pedidos por día)
weeklyOrders = [
  { day: 'Lun', orders: 45 },
  { day: 'Mar', orders: 62 },
  { day: 'Mié', orders: 38 },
  { day: 'Jue', orders: 71 },
  { day: 'Vie', orders: 55 },
  { day: 'Sáb', orders: 29 },
  { day: 'Dom', orders: 18 }
];

// Datos para gráfico de ventas mensuales
salesData = [
  { month: 'Ene', sales: 4500 },
  { month: 'Feb', sales: 5200 },
  { month: 'Mar', sales: 4800 },
  { month: 'Abr', sales: 6100 },
  { month: 'May', sales: 5900 },
  { month: 'Jun', sales: 7200 }
];

// Eventos del calendario
calendarEvents = [
  { day: 15, event: 'Promoción Black Friday' },
  { day: 22, event: 'Restock productos' },
  { day: 28, event: 'Reunión proveedores' }
];

  constructor() { }

  ngOnInit(): void {
     setTimeout(() => this.animateEarnings(), 500);
  }

  getStatusClass(status: string): string {
    const statusClasses: {[key: string]: string} = {
      'Pendiente': 'bg-warning',
      'Nuevo': 'bg-primary',
      'Sin stock': 'bg-danger',
      'Delivery': 'bg-success'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  
// AGREGAR estas nuevas funciones después de formatDate()

animateEarnings(): void {
  const duration = 2000; // 2 segundos
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    this.monthlyEarnings = Math.floor(this.targetEarnings * progress);
    
    if (progress < 1) {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(animate);
      } else {
        // Puedes utilizar setTimeout como alternativa
        setTimeout(animate, 16); // 16ms es aproximadamente el tiempo entre frames para 60fps
      }
    }
  };
  animate();
}

getMaxOrders(): number {
  return Math.max(...this.weeklyOrders.map(d => d.orders));
}

getMaxSales(): number {
  return Math.max(...this.salesData.map(d => d.sales));
}

}
