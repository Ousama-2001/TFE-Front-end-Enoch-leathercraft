import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SuperAdminUsersService,
  SaUser,
  UserRole
} from '../../services/super-admin.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

type StatusFilter = 'all' | 'active' | 'deleted';
type RoleFilter = 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, UpperCasePipe, SlicePipe, TranslatePipe],
  templateUrl: './super-admin-users.html',
  styleUrls: ['./super-admin-users.scss'],
})
export class SuperAdminUsersPageComponent implements OnInit {

  users: SaUser[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  actionLoadingId: number | null = null;
  deleteConfirmId: number | null = null;
  deleteConfirmName = '';

  pageSize = 9;
  currentPage = 1;
  statusFilter: StatusFilter = 'all';
  roleFilter: RoleFilter = 'ALL'; // Nouveau filtre

  constructor(private superAdminService: SuperAdminUsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.superAdminService.getAll().subscribe({
      next: (data: SaUser[]) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      },
    });
  }

  get filteredUsers(): SaUser[] {
    let list = this.users;

    // 1. Filtre Statut
    if (this.statusFilter === 'active') list = list.filter(u => !u.deleted);
    if (this.statusFilter === 'deleted') list = list.filter(u => !!u.deleted);

    // 2. Filtre Rôle
    if (this.roleFilter !== 'ALL') {
      list = list.filter(u => u.role === this.roleFilter);
    }

    // 3. Filtre Recherche
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(u =>
        u.email.toLowerCase().includes(s) ||
        (u.firstName || '').toLowerCase().includes(s) ||
        (u.lastName || '').toLowerCase().includes(s) ||
        (u.username || '').toLowerCase().includes(s)
      );
    }
    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get paginatedUsers(): SaUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  getDisplayName(u: SaUser): string {
    const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return full || u.username || u.email;
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'SUPER_ADMIN': return 'Super admin';
      default: return 'Client';
    }
  }

  isDeleted(u: SaUser): boolean { return !!u.deleted; }

  changeRole(user: SaUser, newRole: UserRole): void {
    if (this.isDeleted(user) || this.actionLoadingId !== null) return;
    this.actionLoadingId = user.id;
    this.superAdminService.updateRole(user.id, newRole).subscribe({
      next: (updated) => {
        this.users = this.users.map(u => u.id === updated.id ? updated : u);
        this.actionLoadingId = null;
      },
      error: () => this.actionLoadingId = null
    });
  }

  openDeleteConfirm(user: SaUser): void {
    this.deleteConfirmId = user.id;
    this.deleteConfirmName = this.getDisplayName(user);
  }

  cancelDelete(): void { this.deleteConfirmId = null; }

  confirmDelete(): void {
    if (this.deleteConfirmId == null) return;
    this.superAdminService.softDelete(this.deleteConfirmId).subscribe({
      next: (updated) => {
        this.users = this.users.map(u => u.id === updated.id ? updated : u);
        this.cancelDelete();
        this.adjustPagination();
      },
      error: () => this.cancelDelete()
    });
  }

  restoreUser(user: SaUser): void {
    this.superAdminService.restore(user.id).subscribe({
      next: (updated) => {
        this.users = this.users.map(u => u.id === updated.id ? updated : u);
        this.adjustPagination();
      }
    });
  }

  private adjustPagination(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
}
