// src/app/pages/super-admin-users/super-admin-users.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  SuperAdminUsersService,
  SaUser,
  UserRole
} from '../../services/super-admin.service';

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './super-admin-users.html',
  styleUrls: ['./super-admin-users.scss'],
})
export class SuperAdminUsersPageComponent implements OnInit {

  users: SaUser[] = [];
  loading = false;
  error = '';

  // id en cours d'action (changement de rôle / delete)
  actionLoadingId: number | null = null;

  // soft delete (modale de confirmation)
  deleteConfirmId: number | null = null;
  deleteConfirmName = '';

  // Pagination
  pageSize = 6;
  currentPage = 1;

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
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs', err);
        this.error = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      },
    });
  }

  // ---------- pagination ----------

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.users.length / this.pageSize));
  }

  get paginatedUsers(): SaUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // ---------- helpers d'affichage ----------

  getDisplayName(u: SaUser): string {
    const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    if (full) return full;
    if (u.username) return `@${u.username}`;
    return u.email;
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'CUSTOMER':    return 'Client';
      case 'ADMIN':       return 'Admin';
      case 'SUPER_ADMIN': return 'Super admin';
    }
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case 'CUSTOMER':
        return 'role-pill role-customer';
      case 'ADMIN':
        return 'role-pill role-admin';
      case 'SUPER_ADMIN':
        return 'role-pill role-superadmin';
    }
  }

  canModify(_u: SaUser): boolean {
    // Pour l’instant tout est géré côté back (SUPER_ADMIN seulement)
    return true;
  }

  // ---------- changement de rôle ----------

  changeRole(user: SaUser, newRole: UserRole): void {
    if (!this.canModify(user) || this.actionLoadingId !== null) return;

    this.actionLoadingId = user.id;

    this.superAdminService.updateRole(user.id, newRole).subscribe({
      next: (updated: SaUser) => {
        this.users = this.users.map(u => (u.id === updated.id ? updated : u));
        this.actionLoadingId = null;
      },
      error: (err: any) => {
        console.error('Erreur changement de rôle', err);
        alert('Impossible de changer le rôle de cet utilisateur.');
        this.actionLoadingId = null;
      },
    });
  }

  // ---------- soft delete avec modale ----------

  openDeleteConfirm(user: SaUser): void {
    if (!this.canModify(user) || this.actionLoadingId !== null) return;
    this.deleteConfirmId = user.id;
    this.deleteConfirmName = this.getDisplayName(user);
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
    this.deleteConfirmName = '';
  }

  confirmDelete(): void {
    if (this.deleteConfirmId == null) return;

    const id = this.deleteConfirmId;
    this.actionLoadingId = id;

    this.superAdminService.softDelete(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        this.actionLoadingId = null;
        this.cancelDelete();

        // si on supprime le dernier user de la page, on recule d'une page
        if ((this.currentPage - 1) * this.pageSize >= this.users.length && this.currentPage > 1) {
          this.currentPage--;
        }
      },
      error: (err: any) => {
        console.error('Erreur suppression utilisateur', err);
        alert('Impossible de supprimer cet utilisateur.');
        this.actionLoadingId = null;
        this.cancelDelete();
      },
    });
  }
}
