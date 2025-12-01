export type Lang = 'fr' | 'en';

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  fr: {
    // ===== NAVBAR =====
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

    // ===== CART (général + mini-cart) =====
    'cart.title': 'Votre panier',
    'cart.view': 'Voir le panier →',
    'cart.empty': 'Votre panier est vide.',
    'cart.itemsCount': 'article(s)',

    'cart.page.title': 'Mon panier',
    'cart.table.product': 'Produit',
    'cart.table.unitPrice': 'Prix unitaire',
    'cart.table.quantity': 'Quantité',
    'cart.table.lineTotal': 'Total ligne',
    'cart.table.remove': 'Supprimer',
    'cart.summary.totalPrefix': 'Total',
    'cart.summary.itemsSuffix': 'article(s)',
    'cart.actions.clear': 'Vider le panier',
    'cart.actions.checkout': 'Valider ma commande',
    'cart.actions.continue': '← Continuer mes achats',
    'cart.empty.message': 'Votre panier est vide.',
    'cart.empty.backToShop': '← Retour à la boutique',

    // ===== HOMEPAGE / HERO =====
    'home.hero.title': 'Pièces artisanales en cuir, pensées pour durer.',
    'home.hero.subtitle':
      'Sacs, sacoches et petite maroquinerie fabriqués à la main en petites séries. Chaque pièce est conçue pour vous accompagner des années.',
    'home.hero.cta': 'Voir la collection',
    'home.hero.tag.artisanal': '✓ Fabrication artisanale',
    'home.hero.tag.unique': '✓ Pièces uniques',
    'home.hero.tag.trackedShipping': '✓ Envoi suivi',

    'home.highlight.newSelection': 'NOUVELLE SÉLECTION',
    'home.highlight.cta': 'Découvrir maintenant',

    // ===== HOMEPAGE / CATÉGORIES =====
    'home.categories.title': 'Catégories',
    'home.categories.men.title': 'Homme',
    'home.categories.men.text':
      'Sacs, ceintures et accessoires adaptés au quotidien.',
    'home.categories.men.cta': 'Découvrir →',

    'home.categories.women.title': 'Femme',
    'home.categories.women.text':
      'Sacoches, sacs à main & petite maroquinerie.',
    'home.categories.women.cta': 'Voir les pièces →',

    'home.categories.smallLeather.title': 'Petite maroquinerie',
    'home.categories.smallLeather.text':
      'Portefeuilles, porte-cartes & sets artisanaux.',
    'home.categories.smallLeather.cta': 'Explorer →',

    // ===== HOMEPAGE / NOUVEAUTÉS =====
    'home.latest.title': 'Dernières pièces ajoutées',
    'home.latest.seeAll': 'Voir tout →',
    'home.latest.loading': 'Chargement...',
    'home.latest.viewProduct': 'Voir le produit',

    // ===== HOMEPAGE / AVIS CLIENTS =====
    'home.reviews.title': 'Avis de nos clients',
    'home.reviews.1.text': '« Super qualité, la finesse du cuir est incroyable. »',
    'home.reviews.1.author': '— Karim L.',
    'home.reviews.2.text': '« J’ai offert un sac à mon mari, il ne l’a jamais quitté ! »',
    'home.reviews.2.author': '— Sarah D.',
    'home.reviews.3.text':
      '« Rapport qualité/prix exceptionnel, je recommande sans hésiter. »',
    'home.reviews.3.author': '— Julie M.',

    // ===== HOMEPAGE / À PROPOS COURT =====
    'home.about.title': 'Qui sommes-nous ?',
    'home.about.p1':
      'Enoch Leathercraft est un atelier artisanal dédié aux pièces uniques : sacs, ceintures et portefeuilles faits main. Chaque création est conçue pour durer, avec des matériaux nobles et un savoir-faire raffiné.',
    'home.about.p2':
      'Plus de 500 clients satisfaits — 10 ans de passion pour le cuir et l’artisanat d’excellence.',

    // ===== ABOUT PAGE =====
    'about.title': 'À propos d’Enoch Leathercraft',
    'about.subtitle':
      'Atelier artisanal de maroquinerie, spécialisé dans les pièces en cuir uniques : sacs, ceintures, portefeuilles et petite maroquinerie faits main.',

    'about.section.passion.title': 'Une passion pour le cuir',
    'about.section.passion.body':
      'Depuis plus de 10 ans, l’atelier Enoch Leathercraft conçoit et fabrique des pièces en cuir en petites séries. Chaque création est pensée pour durer dans le temps, avec une attention particulière portée aux matières, aux finitions et au confort d’utilisation.',

    'about.section.clients.title': '500+ clients satisfaits',
    'about.section.clients.body':
      'Au fil des années, plus de 500 clients ont fait confiance à l’atelier pour leurs sacs, ceintures et accessoires du quotidien. L’objectif est simple : proposer des pièces élégantes, robustes et authentiques.',

    'about.section.craft.title': 'Fabrication artisanale',
    'about.section.craft.body':
      'Chaque pièce est réalisée à la main, depuis la découpe du cuir jusqu’aux coutures finales. Les cuirs sont sélectionnés avec soin, et chaque détail est pensé pour offrir un produit unique, qui se patinera avec le temps.',

    // ===== COMPTE / ACCOUNT =====
    'account.title': 'Mon compte',
    'account.tabs.profile': '👤 Profil',
    'account.tabs.address': '📍 Adresse',
    'account.tabs.orders': '📦 Commandes',
    'account.tabs.security': '🔒 Sécurité',

    'account.profile.title': 'Informations personnelles',
    'account.profile.firstName': 'Prénom',
    'account.profile.lastName': 'Nom',
    'account.profile.email': 'Email',
    'account.profile.phone': 'Téléphone',
    'account.profile.save': 'Mettre à jour',
    'account.profile.saving': '...Enregistrement',

    'account.address.title': 'Adresse de livraison',
    'account.address.address': 'Adresse',
    'account.address.postalCode': 'Code postal',
    'account.address.city': 'Ville',
    'account.address.country': 'Pays',
    'account.address.save': 'Mettre à jour',
    'account.address.saving': '...Enregistrement',

    'account.orders.title': 'Mes commandes',
    'account.orders.loading': 'Chargement...',
    'account.orders.ref': 'Réf',
    'account.orders.date': 'Date',
    'account.orders.total': 'Total',
    'account.orders.status': 'Statut',
    'account.orders.empty': 'Aucune commande.',

    'account.security.title': 'Changer le mot de passe',
    'account.security.oldPassword': 'Ancien mot de passe',
    'account.security.newPassword': 'Nouveau mot de passe',
    'account.security.confirm': 'Confirmer',
    'account.security.change': 'Changer le mot de passe',
    'account.security.changing': '...',

    // ===== ORDERS PAGE =====
    'orders.title': 'Mes commandes',
    'orders.subtitle':
      'Retrouvez ici l’historique de vos commandes Enoch Leathercraft.',
    'orders.loading': 'Chargement de vos commandes...',
    'orders.error': 'Une erreur est survenue lors du chargement de vos commandes.',
    'orders.empty': 'Vous n’avez encore passé aucune commande.',
    'orders.datePrefix': 'Passée le',
    'orders.itemsSuffix': 'article(s)',
    'orders.detailLink': 'Voir le détail →',

    // ===== PRODUITS GENERIC =====
    'product.material': 'Matériau',
    'product.outOfStock': 'Ce produit est actuellement en rupture de stock.',
    'product.stockWarning': 'Stock insuffisant pour la quantité demandée.',
    'product.addToCart': 'Ajouter au panier',

    'product.detail.back': '← Retour aux produits',
    'product.detail.stockAvailablePrefix': 'Stock disponible :',
    'product.detail.stockAvailableSuffix': 'pièce(s).',
    'product.detail.outOfStock': 'Produit actuellement en rupture de stock.',
    'product.detail.addToCart': 'Ajouter au panier',
    'product.detail.loading': 'Chargement...',
    'product.detail.error': 'Impossible de charger ce produit.',

    // ===== LISTE PRODUITS / PRODUCTS PAGE =====
    'products.hero.title': 'Enoch Leathercraft',
    'products.hero.subtitle':
      'Découvrez nos sacs, sacoches, ceintures et petite maroquinerie faits main.',
    'products.search.placeholder':
      'Rechercher un produit (sac, portefeuille, ceinture...)',

    'products.filters.segment': 'Segment',
    'products.filters.segment.all': 'Tous',
    'products.filters.segment.men': 'Homme',
    'products.filters.segment.women': 'Femme',
    'products.filters.segment.mixte': 'Mixte',

    'products.filters.category': 'Catégorie',
    'products.filters.category.all': 'Toutes',
    'products.filters.category.bags': 'Sacs & sacoches',
    'products.filters.category.belts': 'Ceintures',
    'products.filters.category.smallLeather': 'Petite maroquinerie',

    'products.filters.material': 'Matériau',
    'products.filters.material.all': 'Tous',
    'products.filters.material.leather': 'Cuir',
    'products.filters.material.fabric': 'Tissu',
    'products.filters.material.mix': 'Mixte',

    'products.filters.price': 'Prix (€)',
    'products.filters.sort': 'Tri',
    'products.filters.sort.default': 'Par défaut',
    'products.filters.sort.priceAsc': 'Prix croissant',
    'products.filters.sort.priceDesc': 'Prix décroissant',
    'products.filters.sort.newest': 'Nouveautés',

    'products.section.title': 'Nos produits',
    'products.description.missing': 'Description à venir.',
    'products.stock.inStockPrefix': '',
    'products.stock.inStockSuffix': 'en stock',
    'products.stock.outOfStock': 'Rupture de stock',
    'products.stock.maxReached': 'Stock maximum atteint pour ce produit.',

    'products.pagination.prev': '← Précédent',
    'products.pagination.next': 'Suivant →',
    'products.pagination.pageInfo': 'Page',
    'products.empty': 'Aucun produit disponible pour le moment.',

    // ===== AVIS (reviews) =====
    'reviews.title': 'Avis clients',
    'reviews.noReviews': 'Aucun avis pour le moment.',
    'reviews.leaveReview': 'Laisser un avis',
    'reviews.rating': 'Note',
    'reviews.comment': 'Commentaire',
    'reviews.submit': 'Envoyer mon avis',
    'reviews.mustLogin': 'Connectez-vous pour laisser un avis.',

    'reviews.header.title': 'Avis clients',
    'reviews.basedOn': 'Basé sur',
    'reviews.countLabel': 'avis',
    'reviews.loading': 'Chargement des avis...',
    'reviews.error': 'Impossible de charger les avis pour le moment.',
    'reviews.emptyState': 'Soyez le premier à donner votre avis sur ce produit !',

    'reviews.edit': 'Modifier',
    'reviews.delete': 'Supprimer',
    'reviews.edit.cancel': 'Annuler',
    'reviews.edit.save': 'Enregistrer',
    'reviews.edit.saving': 'Enregistrement...',

    'reviews.form.title': 'Donnez votre avis',
    'reviews.form.loginPrompt.prefix': 'Pour partager votre expérience,',
    'reviews.form.loginPrompt.link': 'connectez-vous',
    'reviews.form.loginPrompt.suffix': '.',
    'reviews.form.ratingLabel': 'Votre note globale',
    'reviews.form.commentLabel': 'Votre commentaire',
    'reviews.form.placeholder':
      "Qu'avez-vous pensé de la qualité, du design...",
    'reviews.form.submit': 'Publier mon avis',
    'reviews.form.submitting': 'Envoi...',
    'reviews.form.error': 'Une erreur est survenue lors de l’envoi de votre avis.',
    'reviews.form.success': 'Merci, votre avis a bien été publié.',

    'reviews.rating.5': '★★★★★ - Excellent',
    'reviews.rating.4': '★★★★☆ - Très bon',
    'reviews.rating.3': '★★★☆☆ - Correct',
    'reviews.rating.2': '★★☆☆☆ - Moyen',
    'reviews.rating.1': '★☆☆☆☆ - Mauvais',

    // ===== CONTACT =====
    'contact.title': 'Contact',
    'contact.subtitle':
      'Une question sur un produit, une commande ou une demande personnalisée ? N’hésitez pas à nous écrire.',
    'contact.form.name': 'Nom / Prénom',
    'contact.form.email': 'Adresse e-mail',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Envoyer le message',
    'contact.form.success':
      'Merci, votre message a bien été envoyé (simulation).',
    'contact.info.title': 'Informations atelier',
    'contact.info.description':
      'Enoch Leathercraft — Atelier basé à Bruxelles.',
    'contact.info.email': 'Email : contact@enoch-leathercraft.shop',
    'contact.info.instagram': 'Instagram : @enoch.leathercraft',

    // ===== FOOTER =====
    'footer.title': 'Enoch Leathercraft',
    'footer.description':
      'Atelier artisanal de maroquinerie.\nPièces uniques fabriquées à la main depuis 10 ans.',
    'footer.shop': 'Boutique',
    'footer.shop.all': 'Tous les produits',
    'footer.shop.men': 'Homme',
    'footer.shop.women': 'Femme',
    'footer.shop.smallLeather': 'Petite maroquinerie',

    'footer.info': 'Informations',
    'footer.info.about': 'À propos de l’atelier',
    'footer.info.contact': 'Contact',
    'footer.info.terms': 'Conditions générales',
    'footer.info.privacy': 'Politique de confidentialité',

    'footer.follow': 'Nous suivre',
    'footer.follow.instagram': 'Instagram',
    'footer.follow.facebook': 'Facebook',

    'footer.bottom': 'Enoch Leathercraft — Tous droits réservés.',
  },

  en: {
    // ===== NAVBAR =====
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

    // ===== CART =====
    'cart.title': 'Your cart',
    'cart.view': 'View cart →',
    'cart.empty': 'Your cart is empty.',
    'cart.itemsCount': 'item(s)',

    'cart.page.title': 'My cart',
    'cart.table.product': 'Product',
    'cart.table.unitPrice': 'Unit price',
    'cart.table.quantity': 'Quantity',
    'cart.table.lineTotal': 'Line total',
    'cart.table.remove': 'Remove',
    'cart.summary.totalPrefix': 'Total',
    'cart.summary.itemsSuffix': 'item(s)',
    'cart.actions.clear': 'Empty cart',
    'cart.actions.checkout': 'Checkout',
    'cart.actions.continue': '← Continue shopping',
    'cart.empty.message': 'Your cart is empty.',
    'cart.empty.backToShop': '← Back to shop',

    // ===== HOMEPAGE / HERO =====
    'home.hero.title': 'Handcrafted leather pieces made to last.',
    'home.hero.subtitle':
      'Bags, satchels and small leather goods handcrafted in small batches. Each piece is designed to stay with you for years.',
    'home.hero.cta': 'View the collection',
    'home.hero.tag.artisanal': '✓ Handcrafted',
    'home.hero.tag.unique': '✓ Unique pieces',
    'home.hero.tag.trackedShipping': '✓ Tracked shipping',

    'home.highlight.newSelection': 'NEW SELECTION',
    'home.highlight.cta': 'Discover now',

    // ===== HOMEPAGE / CATEGORIES =====
    'home.categories.title': 'Categories',
    'home.categories.men.title': 'Men',
    'home.categories.men.text':
      'Bags, belts and accessories for everyday use.',
    'home.categories.men.cta': 'Discover →',

    'home.categories.women.title': 'Women',
    'home.categories.women.text':
      'Handbags, shoulder bags & small leather goods.',
    'home.categories.women.cta': 'View pieces →',

    'home.categories.smallLeather.title': 'Small leather goods',
    'home.categories.smallLeather.text':
      'Wallets, card holders & artisan table sets.',
    'home.categories.smallLeather.cta': 'Explore →',

    // ===== HOMEPAGE / LATEST =====
    'home.latest.title': 'Latest additions',
    'home.latest.seeAll': 'See all →',
    'home.latest.loading': 'Loading...',
    'home.latest.viewProduct': 'View product',

    // ===== HOMEPAGE / REVIEWS =====
    'home.reviews.title': 'What our customers say',
    'home.reviews.1.text': '“Amazing quality, the leather is incredible.”',
    'home.reviews.1.author': '— Karim L.',
    'home.reviews.2.text':
      '“I offered a bag to my husband, he never leaves it!”',
    'home.reviews.2.author': '— Sarah D.',
    'home.reviews.3.text':
      '“Outstanding value for money, I recommend without hesitation.”',
    'home.reviews.3.author': '— Julie M.',

    // ===== HOMEPAGE / ABOUT SHORT =====
    'home.about.title': 'Who are we?',
    'home.about.p1':
      'Enoch Leathercraft is a craft workshop dedicated to unique pieces: handmade bags, belts and wallets. Each creation is made to last, using noble materials and refined know-how.',
    'home.about.p2':
      'More than 500 satisfied customers — 10 years of passion for leather and craftsmanship.',

    // ===== ABOUT PAGE =====
    'about.title': 'About Enoch Leathercraft',
    'about.subtitle':
      'A handcrafted leather goods workshop specialising in unique leather pieces: bags, belts, wallets and small leather goods.',

    'about.section.passion.title': 'A passion for leather',
    'about.section.passion.body':
      'For more than 10 years, the Enoch Leathercraft workshop has been designing and making leather pieces in small series. Each creation is made to last, with special attention paid to materials, finishes and comfort of use.',

    'about.section.clients.title': '500+ happy customers',
    'about.section.clients.body':
      'Over the years, more than 500 customers have trusted the workshop for their bags, belts and everyday accessories. The goal is simple: offer elegant, robust and authentic pieces.',

    'about.section.craft.title': 'Handcrafted manufacturing',
    'about.section.craft.body':
      'Each piece is handmade, from leather cutting to the final stitches. The leathers are carefully selected and every detail is designed to offer a unique product that will develop a patina over time.',

    // ===== ACCOUNT =====
    'account.title': 'My account',
    'account.tabs.profile': '👤 Profile',
    'account.tabs.address': '📍 Address',
    'account.tabs.orders': '📦 Orders',
    'account.tabs.security': '🔒 Security',

    'account.profile.title': 'Personal information',
    'account.profile.firstName': 'First name',
    'account.profile.lastName': 'Last name',
    'account.profile.email': 'Email',
    'account.profile.phone': 'Phone',
    'account.profile.save': 'Update',
    'account.profile.saving': '...Saving',

    'account.address.title': 'Shipping address',
    'account.address.address': 'Address',
    'account.address.postalCode': 'Postal code',
    'account.address.city': 'City',
    'account.address.country': 'Country',
    'account.address.save': 'Update',
    'account.address.saving': '...Saving',

    'account.orders.title': 'My orders',
    'account.orders.loading': 'Loading...',
    'account.orders.ref': 'Ref',
    'account.orders.date': 'Date',
    'account.orders.total': 'Total',
    'account.orders.status': 'Status',
    'account.orders.empty': 'No orders yet.',

    'account.security.title': 'Change password',
    'account.security.oldPassword': 'Current password',
    'account.security.newPassword': 'New password',
    'account.security.confirm': 'Confirm',
    'account.security.change': 'Change password',
    'account.security.changing': '...',

    // ===== ORDERS PAGE =====
    'orders.title': 'My orders',
    'orders.subtitle':
      'Find here the history of your Enoch Leathercraft orders.',
    'orders.loading': 'Loading your orders...',
    'orders.error': 'An error occurred while loading your orders.',
    'orders.empty': 'You have not placed any orders yet.',
    'orders.datePrefix': 'Placed on',
    'orders.itemsSuffix': 'item(s)',
    'orders.detailLink': 'View details →',

    // ===== PRODUCT GENERIC =====
    'product.material': 'Material',
    'product.outOfStock': 'This product is currently out of stock.',
    'product.stockWarning': 'Not enough stock for the requested quantity.',
    'product.addToCart': 'Add to cart',

    'product.detail.back': '← Back to products',
    'product.detail.stockAvailablePrefix': 'Available stock:',
    'product.detail.stockAvailableSuffix': 'item(s).',
    'product.detail.outOfStock': 'Product currently out of stock.',
    'product.detail.addToCart': 'Add to cart',
    'product.detail.loading': 'Loading...',
    'product.detail.error': 'Could not load this product.',

    // ===== PRODUCTS PAGE =====
    'products.hero.title': 'Enoch Leathercraft',
    'products.hero.subtitle':
      'Discover our handcrafted bags, belts and small leather goods.',
    'products.search.placeholder':
      'Search a product (bag, wallet, belt...)',

    'products.filters.segment': 'Segment',
    'products.filters.segment.all': 'All',
    'products.filters.segment.men': 'Men',
    'products.filters.segment.women': 'Women',
    'products.filters.segment.mixte': 'Unisex',

    'products.filters.category': 'Category',
    'products.filters.category.all': 'All',
    'products.filters.category.bags': 'Bags & satchels',
    'products.filters.category.belts': 'Belts',
    'products.filters.category.smallLeather': 'Small leather goods',

    'products.filters.material': 'Material',
    'products.filters.material.all': 'All',
    'products.filters.material.leather': 'Leather',
    'products.filters.material.fabric': 'Fabric',
    'products.filters.material.mix': 'Mixed',

    'products.filters.price': 'Price (€)',
    'products.filters.sort': 'Sort by',
    'products.filters.sort.default': 'Default',
    'products.filters.sort.priceAsc': 'Price: Low to high',
    'products.filters.sort.priceDesc': 'Price: High to low',
    'products.filters.sort.newest': 'Newest',

    'products.section.title': 'Our products',
    'products.description.missing': 'Description coming soon.',
    'products.stock.inStockPrefix': '',
    'products.stock.inStockSuffix': 'in stock',
    'products.stock.outOfStock': 'Out of stock',
    'products.stock.maxReached': 'Maximum stock reached for this product.',

    'products.pagination.prev': '← Previous',
    'products.pagination.next': 'Next →',
    'products.pagination.pageInfo': 'Page',
    'products.empty': 'No products available at the moment.',

    // ===== REVIEWS =====
    'reviews.title': 'Customer reviews',
    'reviews.noReviews': 'No reviews yet.',
    'reviews.leaveReview': 'Leave a review',
    'reviews.rating': 'Rating',
    'reviews.comment': 'Comment',
    'reviews.submit': 'Submit my review',
    'reviews.mustLogin': 'Please log in to leave a review.',

    'reviews.header.title': 'Customer reviews',
    'reviews.basedOn': 'Based on',
    'reviews.countLabel': 'reviews',
    'reviews.loading': 'Loading reviews...',
    'reviews.error': 'Could not load reviews at the moment.',
    'reviews.emptyState': 'Be the first to review this product!',

    'reviews.edit': 'Edit',
    'reviews.delete': 'Delete',
    'reviews.edit.cancel': 'Cancel',
    'reviews.edit.save': 'Save',
    'reviews.edit.saving': 'Saving...',

    'reviews.form.title': 'Share your review',
    'reviews.form.loginPrompt.prefix': 'To share your experience,',
    'reviews.form.loginPrompt.link': 'log in',
    'reviews.form.loginPrompt.suffix': '.',
    'reviews.form.ratingLabel': 'Your overall rating',
    'reviews.form.commentLabel': 'Your comment',
    'reviews.form.placeholder':
      'What did you think about the quality, design...',
    'reviews.form.submit': 'Publish my review',
    'reviews.form.submitting': 'Sending...',
    'reviews.form.error': 'An error occurred while submitting your review.',
    'reviews.form.success': 'Thank you, your review has been published.',

    'reviews.rating.5': '★★★★★ - Excellent',
    'reviews.rating.4': '★★★★☆ - Very good',
    'reviews.rating.3': '★★★☆☆ - Fair',
    'reviews.rating.2': '★★☆☆☆ - Poor',
    'reviews.rating.1': '★☆☆☆☆ - Bad',

    // ===== CONTACT =====
    'contact.title': 'Contact',
    'contact.subtitle':
      'A question about a product, an order or a custom request? Feel free to write to us.',
    'contact.form.name': 'Name / First name',
    'contact.form.email': 'Email address',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send message',
    'contact.form.success':
      'Thank you, your message has been sent (simulation).',
    'contact.info.title': 'Workshop information',
    'contact.info.description':
      'Enoch Leathercraft — Workshop based in Brussels.',
    'contact.info.email': 'Email: contact@enoch-leathercraft.shop',
    'contact.info.instagram': 'Instagram: @enoch.leathercraft',

    // ===== FOOTER =====
    'footer.title': 'Enoch Leathercraft',
    'footer.description':
      'Handcrafted leather goods workshop.\nUnique pieces handmade for 10 years.',
    'footer.shop': 'Shop',
    'footer.shop.all': 'All products',
    'footer.shop.men': 'Men',
    'footer.shop.women': 'Women',
    'footer.shop.smallLeather': 'Small leather goods',

    'footer.info': 'Information',
    'footer.info.about': 'About the workshop',
    'footer.info.contact': 'Contact',
    'footer.info.terms': 'Terms & conditions',
    'footer.info.privacy': 'Privacy policy',

    'footer.follow': 'Follow us',
    'footer.follow.instagram': 'Instagram',
    'footer.follow.facebook': 'Facebook',

    'footer.bottom': 'Enoch Leathercraft — All rights reserved.',
  },
};
