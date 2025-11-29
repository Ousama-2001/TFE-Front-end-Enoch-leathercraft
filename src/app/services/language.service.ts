import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Lang = 'fr' | 'en';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  fr: {
    // Navbar
    'nav.home': 'Accueil',
    'nav.men': 'Homme',
    'nav.women': 'Femme',
    'nav.small-leather': 'Petite maroquinerie',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.cart': 'Panier',
    'nav.account': 'Mon compte',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.register': "S'inscrire",

    // Homepage / général
    'home.heroTitle': 'Sacs & accessoires faits main',
    'home.heroSubtitle': 'Pièces uniques en cuir et matériaux de qualité.',
    'home.ctaShop': 'Découvrir la collection',

    // Produit
    'product.material': 'Matériau',
    'product.outOfStock': 'Ce produit est actuellement en rupture de stock.',
    'product.stockWarning': 'Stock insuffisant pour la quantité demandée.',
    'product.addToCart': 'Ajouter au panier',

    // Compte / commandes
    'orders.title': 'Mes commandes',
    'orders.empty': 'Vous n’avez pas encore passé de commande.',
    'orders.total': 'Total',
    'orders.status': 'Statut',
    'orders.details': 'Détail de la commande',

    // Admin
    'admin.title': 'Tableau de bord administrateur',
    'admin.tab.sales': 'Statistiques de vente',
    'admin.tab.orders': 'Commandes',
    'admin.tab.products': 'Gestion des produits',
    'admin.tab.stock': 'Gestion du stock',

    // Avis
    'reviews.title': 'Avis clients',
    'reviews.noReviews': 'Aucun avis pour le moment.',
    'reviews.leaveReview': 'Laisser un avis',
    'reviews.rating': 'Note',
    'reviews.comment': 'Commentaire',
    'reviews.submit': 'Envoyer mon avis',
    'reviews.mustLogin': 'Connectez-vous pour laisser un avis.',
  },

  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.men': 'Men',
    'nav.women': 'Women',
    'nav.small-leather': 'Small leather goods',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.account': 'My account',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Sign up',

    // Homepage / général
    'home.heroTitle': 'Handcrafted bags & accessories',
    'home.heroSubtitle': 'Unique pieces made with quality materials.',
    'home.ctaShop': 'Discover the collection',

    // Produit
    'product.material': 'Material',
    'product.outOfStock': 'This product is currently out of stock.',
    'product.stockWarning': 'Not enough stock for the requested quantity.',
    'product.addToCart': 'Add to cart',

    // Compte / commandes
    'orders.title': 'My orders',
    'orders.empty': 'You have not placed any orders yet.',
    'orders.total': 'Total',
    'orders.status': 'Status',
    'orders.details': 'Order details',

    // Admin
    'admin.title': 'Admin dashboard',
    'admin.tab.sales': 'Sales statistics',
    'admin.tab.orders': 'Orders',
    'admin.tab.products': 'Products',
    'admin.tab.stock': 'Stock',

    // Avis
    'reviews.title': 'Customer reviews',
    'reviews.noReviews': 'No reviews yet.',
    'reviews.leaveReview': 'Leave a review',
    'reviews.rating': 'Rating',
    'reviews.comment': 'Comment',
    'reviews.submit': 'Submit my review',
    'reviews.mustLogin': 'Please log in to leave a review.',
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'enoch_lang';
  private currentLangSubject: BehaviorSubject<Lang>;

  currentLang$;

  constructor() {
    const saved = (localStorage.getItem(this.STORAGE_KEY) as Lang) || 'fr';
    this.currentLangSubject = new BehaviorSubject<Lang>(saved);
    this.currentLang$ = this.currentLangSubject.asObservable();
  }

  get currentLang(): Lang {
    return this.currentLangSubject.value;
  }

  setLanguage(lang: Lang): void {
    if (lang === this.currentLang) return;
    this.currentLangSubject.next(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  t(key: string): string {
    const dict = TRANSLATIONS[this.currentLang] || {};
    return dict[key] || key;
  }
}
