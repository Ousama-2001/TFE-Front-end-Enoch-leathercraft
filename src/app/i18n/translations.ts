// src/app/i18n/translations.ts
export type Lang = 'fr' | 'en';

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  fr: {
    // ===== NAVBAR =====
    'nav.home': 'Accueil',
    'nav.men': 'Homme',
    'nav.women': 'Femme',
    'nav.small-leather': 'Petite maroquinerie',
    'nav.new': 'Nouveautés',
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

    'account.tabs.overview': 'Vue d’ensemble',
    'account.tabs.profile': '👤 Profil',
    'account.tabs.address': '📍 Adresse',
    'account.tabs.orders': '📦 Commandes',
    'account.tabs.security': '🔒 Sécurité',

    // OVERVIEW
    'account.overview.totalOrders': 'Commandes',
    'account.overview.totalSpent': 'Total dépensé',
    'account.overview.lastOrder': 'Dernière commande',
    'account.overview.profileShort': 'Profil',
    'account.overview.addressShort': 'Adresse principale',

    'account.address.missing': 'Aucune adresse enregistrée',

    // PROFIL
    'account.profile.title': 'Informations personnelles',
    'account.profile.firstName': 'Prénom',
    'account.profile.lastName': 'Nom',
    'account.profile.email': 'Email',
    'account.profile.phone': 'Téléphone',
    'account.profile.save': 'Mettre à jour',
    'account.profile.saving': '...Enregistrement',

    // ADRESSE
    'account.address.title': 'Adresse de livraison',
    'account.address.address': 'Adresse',
    'account.address.postalCode': 'Code postal',
    'account.address.city': 'Ville',
    'account.address.country': 'Pays',
    'account.address.save': 'Mettre à jour',
    'account.address.saving': '...Enregistrement',

    // COMMANDES
    'account.orders.title': 'Mes commandes',
    'account.orders.loading': 'Chargement...',
    'account.orders.ref': 'Réf',
    'account.orders.date': 'Date',
    'account.orders.total': 'Total',
    'account.orders.status': 'Statut',
    'account.orders.empty': 'Aucune commande.',

    // SÉCURITÉ
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
    'products.filters.segment.smallLeather': 'Petite maroquinerie',

    'products.filters.category': 'Catégorie',
    'products.filters.category.all': 'Toutes',
    'products.filters.category.bags': 'Sacs & sacoches',
    'products.filters.category.belts': 'Ceintures',
    'products.filters.category.smallLeather': 'Petite maroquinerie',
    // 🔥 nouvelles clés pour la liste déroulante
    'products.filters.category.wallets': 'Portefeuilles',
    'products.filters.category.cardHolders': 'Portes-cartes',
    'products.filters.category.placemats': 'Sets de table',

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
    'products.filters.reset': 'Réinitialiser',

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
    'reviews.form.error':
      'Une erreur est survenue lors de l’envoi de votre avis.',
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
    'contact.info.email': 'Email : saidenoch@gmail.com',
    'contact.info.instagram': 'Instagram : @enoch.leathercraft',

    // ===== CHECKOUT =====
    'checkout.title': 'Finaliser ma commande',
    'checkout.subtitle':
      'Vérifiez votre panier et remplissez vos informations pour valider la commande.',

    'checkout.customerInfo.title': 'Informations client',
    'checkout.shipping.title': 'Adresse de livraison',

    'checkout.form.firstName.label': 'Prénom',
    'checkout.form.firstName.errorRequired': 'Prénom obligatoire.',

    'checkout.form.lastName.label': 'Nom',
    'checkout.form.lastName.errorRequired': 'Nom obligatoire.',

    'checkout.form.email.label': 'Email',
    'checkout.form.email.errorInvalid': 'Email valide obligatoire.',

    'checkout.form.phone.label': 'Téléphone',
    'checkout.form.phone.errorRequired': 'Téléphone obligatoire.',

    'checkout.form.street.label': 'Rue et numéro',
    'checkout.form.street.errorRequired': 'Adresse obligatoire.',

    'checkout.form.postalCode.label': 'Code postal',
    'checkout.form.postalCode.errorRequired': 'Code postal obligatoire.',

    'checkout.form.city.label': 'Ville',
    'checkout.form.city.errorRequired': 'Ville obligatoire.',

    'checkout.form.country.label': 'Pays',
    'checkout.form.country.errorRequired': 'Pays obligatoire.',

    'checkout.form.notes.label': 'Commentaire / instructions (optionnel)',

    'checkout.form.submit.loading': 'Validation en cours...',
    'checkout.form.submit.default': 'Valider la commande',

    'checkout.cart.title': 'Mon panier',
    'checkout.cart.empty': 'Votre panier est vide.',
    'checkout.cart.quantityPrefix': 'x',
    'checkout.cart.totalLabel': 'Total',
    'checkout.cart.backToCart': '← Retour au panier',

    // ===== TERMS (CGV Belgique) =====
    'terms.title': 'Conditions Générales de Vente',
    'terms.lastUpdate.label': 'Dernière mise à jour',

    'terms.section1.title': '1. Informations légales',
    'terms.section1.body':
      'Le site Enoch Leathercraft est exploité par un artisan basé en Belgique. Les présentes Conditions Générales de Vente (CGV) s’appliquent à toutes les commandes passées via le site et encadrent les relations contractuelles entre Enoch Leathercraft et ses clients.',

    'terms.section2.title': '2. Produits',
    'terms.section2.body':
      'Les articles proposés sont fabriqués à la main. Chaque pièce étant unique, de légères variations peuvent exister. Les photos présentées sur le site sont non contractuelles mais représentent le plus fidèlement possible les produits.',

    'terms.section3.title': '3. Commandes',
    'terms.section3.body':
      'Toute commande vaut acceptation pleine et entière des présentes CGV. Le vendeur se réserve le droit d’annuler toute commande en cas de litige existant avec le client ou en cas de suspicion de fraude.',

    'terms.section4.title': '4. Prix',
    'terms.section4.body':
      'Les prix affichés sont en euros (€) TTC. Enoch Leathercraft n’est pas assujetti à la TVA en tant qu’artisan (régime franchise – article 56bis CTVA). Les frais de livraison sont indiqués lors du passage en caisse.',

    'terms.section5.title': '5. Paiement',
    'terms.section5.body1':
      'Les paiements sont sécurisés via un prestataire externe (par exemple Stripe). Les moyens acceptés peuvent inclure : carte bancaire, Visa, Mastercard, Apple Pay, Google Pay (selon disponibilité).',
    'terms.section5.body2':
      'La commande n’est confirmée qu’après validation définitive du paiement.',

    'terms.section6.title': '6. Livraison',
    'terms.section6.intro':
      'Les envois sont effectués depuis la Belgique, avec numéro de suivi. Les délais indicatifs sont :',
    'terms.section6.item1': 'Belgique : 2 à 4 jours ouvrables',
    'terms.section6.item2': 'Europe : 4 à 7 jours ouvrables',
    'terms.section6.item3': 'International : 7 à 14 jours ouvrables',
    'terms.section6.outro':
      'Enoch Leathercraft ne peut être tenu responsable des retards liés au transporteur.',

    'terms.section7.title': '7. Droit de rétractation (Belgique & UE)',
    'terms.section7.body1':
      'Conformément au droit européen, vous disposez d’un délai de 14 jours à compter de la réception du produit pour exercer votre droit de rétractation, sans devoir motiver votre décision.',
    'terms.section7.body2':
      'Le produit doit être renvoyé dans son état d’origine, non utilisé, et correctement emballé. Les frais de retour sont à charge du client, sauf erreur de la part du vendeur.',

    'terms.section8.title': '8. Produits personnalisés',
    'terms.section8.body':
      'Conformément à la loi, les produits fabriqués sur mesure ou personnalisés ne sont pas éligibles au droit de rétractation.',

    'terms.section9.title': '9. Garanties',
    'terms.section9.body':
      'Tous les produits bénéficient de la garantie légale de conformité prévue par le droit belge et européen (2 ans). En cas de défaut constaté, merci de nous contacter dans les plus brefs délais avec une description et des photos du problème.',

    'terms.section10.title': '10. Responsabilité',
    'terms.section10.body':
      'Le vendeur n’est pas responsable des dommages indirects, pertes de données ou mauvaise utilisation des produits. L’utilisation des produits se fait sous la responsabilité du client.',

    'terms.section11.title': '11. Données personnelles',
    'terms.section11.body':
      'Les données collectées sont nécessaires à la gestion des commandes et à la relation client. Elles ne sont en aucun cas revendues à des tiers. Vous disposez d’un droit d’accès, de rectification et de suppression de vos données, sur simple demande ou via la page de contact.',

    'terms.section12.title': '12. Litiges',
    'terms.section12.body':
      'En cas de litige, une solution à l’amiable sera privilégiée. À défaut, les tribunaux compétents seront ceux de Bruxelles (Belgique).',

    'terms.section13.title': '13. Contact',
    'terms.section13.body':
      'Pour toute question concernant ces Conditions Générales de Vente, vous pouvez nous contacter via le formulaire de contact ou à l’adresse indiquée sur le site.',

    // ===== PRIVACY (Politique de confidentialité) =====
    'privacy.title': 'Politique de confidentialité',
    'privacy.intro':
      'Cette politique explique comment Enoch Leathercraft collecte, utilise et protège vos données personnelles lorsque vous utilisez notre site et nos services.',

    'privacy.section1.title': '1. Responsable du traitement',
    'privacy.section1.body':
      'Le responsable du traitement des données est l’atelier Enoch Leathercraft, basé en Belgique. Pour toute question liée à la protection de vos données, vous pouvez nous contacter via la page Contact.',

    'privacy.section2.title': '2. Données collectées',
    'privacy.section2.intro':
      'Nous collectons uniquement les données nécessaires au bon fonctionnement du site :',
    'privacy.section2.item1':
      'Données de compte : prénom, nom, adresse e-mail, mot de passe (haché), numéro de téléphone (facultatif).',
    'privacy.section2.item2':
      'Données de commande / livraison : adresse postale, pays, informations liées à vos commandes et à votre historique d’achats.',
    'privacy.section2.item3':
      'Données techniques : adresses IP, logs techniques, informations de navigation (via notamment des cookies techniques).',
    'privacy.section2.item4':
      'Données de paiement : les paiements sont traités par un prestataire externe (par exemple Stripe) ; nous ne stockons pas vos numéros de carte bancaire sur ce site.',

    'privacy.section3.title': '3. Finalités du traitement',
    'privacy.section3.intro': 'Vos données sont utilisées uniquement pour :',
    'privacy.section3.item1': 'Créer et gérer votre compte client.',
    'privacy.section3.item2':
      'Traiter vos commandes et assurer la livraison des produits.',
    'privacy.section3.item3':
      'Gérer le service après-vente et répondre à vos demandes via le formulaire de contact.',
    'privacy.section3.item4':
      'Assurer la sécurité du site (logs techniques, prévention de la fraude) et réaliser des statistiques internes.',

    'privacy.section4.title': '4. Base légale',
    'privacy.section4.intro':
      'Conformément au RGPD, le traitement de vos données repose sur :',
    'privacy.section4.item1':
      'L’exécution du contrat : traitement et livraison de vos commandes.',
    'privacy.section4.item2':
      'Votre consentement : lorsque vous créez un compte ou acceptez certains cookies.',
    'privacy.section4.item3':
      'L’intérêt légitime : amélioration du site, lutte contre la fraude, statistiques internes.',

    'privacy.section5.title': '5. Durée de conservation',
    'privacy.section5.item1':
      'Les données de compte et d’achats sont conservées pendant la durée de vie de votre compte, puis archivées pendant les délais légaux applicables (par exemple en matière comptable).',
    'privacy.section5.item2':
      'Les logs techniques sont conservés pour une durée limitée, uniquement pour la sécurité et la maintenance du site.',

    'privacy.section6.title': '6. Destinataires des données',
    'privacy.section6.intro':
      'Vos données sont accessibles uniquement aux personnes et prestataires qui en ont besoin :',
    'privacy.section6.item1':
      'L’atelier Enoch Leathercraft (gestion des commandes, support client).',
    'privacy.section6.item2':
      'Le prestataire de paiement (ex. Stripe) pour le traitement sécurisé des paiements.',
    'privacy.section6.item3':
      'Les éventuels prestataires techniques (hébergement, e-mail, etc.) agissant en tant que sous-traitants.',
    'privacy.section6.outro':
      'Nous ne vendons pas vos données personnelles à des tiers.',

    'privacy.section7.title': '7. Vos droits (RGPD)',
    'privacy.section7.intro':
      'Conformément au Règlement Général sur la Protection des Dononnées (RGPD), vous disposez notamment des droits suivants :',
    'privacy.section7.item1':
      'Droit d’accès : obtenir une copie des données personnelles vous concernant.',
    'privacy.section7.item2':
      'Droit de rectification : corriger des données inexactes ou incomplètes.',
    'privacy.section7.item3':
      'Droit à l’effacement : demander la suppression de vos données, dans les limites prévues par la loi.',
    'privacy.section7.item4':
      'Droit à la limitation : demander la suspension temporaire du traitement de certaines données.',
    'privacy.section7.item5':
      'Droit d’opposition : vous opposer à certains traitements fondés sur l’intérêt légitime.',
    'privacy.section7.item6':
      'Droit à la portabilité : recevoir vos données dans un format structuré, lorsque cela s’applique.',
    'privacy.section7.outro':
      'Pour exercer vos droits, vous pouvez nous contacter via la page Contact. Vous disposez également du droit d’introduire une réclamation auprès de l’Autorité de protection des données en Belgique.',

    'privacy.section8.title': '8. Cookies',
    'privacy.section8.body':
      'Le site utilise principalement des cookies techniques nécessaires au fonctionnement (session, panier, connexion). Des cookies de mesure d’audience ou de suivi peuvent également être utilisés, sous réserve de votre consentement lorsque cela est requis.',

    'privacy.section9.title': '9. Sécurité',
    'privacy.section9.body':
      'Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos données contre l’accès non autorisé, la perte, la destruction ou l’altération.',

    'privacy.section10.title': '10. Mise à jour de la politique',
    'privacy.section10.body':
      'Cette politique de confidentialité peut être mise à jour en fonction de l’évolution du site ou de la législation. La version en vigueur est celle affichée sur cette page.',

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
    'nav.new': 'New in',
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

    'account.tabs.overview': 'Overview',
    'account.tabs.profile': '👤 Profile',
    'account.tabs.address': '📍 Address',
    'account.tabs.orders': '📦 Orders',
    'account.tabs.security': '🔒 Security',

    // OVERVIEW
    'account.overview.totalOrders': 'Orders',
    'account.overview.totalSpent': 'Total spent',
    'account.overview.lastOrder': 'Last order',
    'account.overview.profileShort': 'Profile',
    'account.overview.addressShort': 'Main address',

    'account.address.missing': 'No address saved yet',

    // PROFILE
    'account.profile.title': 'Personal information',
    'account.profile.firstName': 'First name',
    'account.profile.lastName': 'Last name',
    'account.profile.email': 'Email',
    'account.profile.phone': 'Phone',
    'account.profile.save': 'Update',
    'account.profile.saving': '...Saving',

    // ADDRESS
    'account.address.title': 'Shipping address',
    'account.address.address': 'Address',
    'account.address.postalCode': 'Postal code',
    'account.address.city': 'City',
    'account.address.country': 'Country',
    'account.address.save': 'Update',
    'account.address.saving': '...Saving',

    // ORDERS
    'account.orders.title': 'My orders',
    'account.orders.loading': 'Loading...',
    'account.orders.ref': 'Ref',
    'account.orders.date': 'Date',
    'account.orders.total': 'Total',
    'account.orders.status': 'Status',
    'account.orders.empty': 'No orders yet.',

    // SECURITY
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
    'products.filters.segment.smallLeather': 'Small leather goods',

    'products.filters.category': 'Category',
    'products.filters.category.all': 'All',
    'products.filters.category.bags': 'Bags & satchels',
    'products.filters.category.belts': 'Belts',
    'products.filters.category.smallLeather': 'Small leather goods',
    'products.filters.category.wallets': 'Wallets',
    'products.filters.category.cardHolders': 'Card holders',
    'products.filters.category.placemats': 'Placemats',

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
    'products.filters.reset': 'Reset',


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
    'reviews.form.error':
      'An error occurred while submitting your review.',
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
    'contact.info.email': 'Email: saidenoch@gmail.com',
    'contact.info.instagram': 'Instagram: @enoch.leathercraft',

    // ===== CHECKOUT =====
    'checkout.title': 'Finalize my order',
    'checkout.subtitle':
      'Review your cart and fill in your details to confirm your order.',

    'checkout.customerInfo.title': 'Customer information',
    'checkout.shipping.title': 'Shipping address',

    'checkout.form.firstName.label': 'First name',
    'checkout.form.firstName.errorRequired': 'First name is required.',

    'checkout.form.lastName.label': 'Last name',
    'checkout.form.lastName.errorRequired': 'Last name is required.',

    'checkout.form.email.label': 'Email',
    'checkout.form.email.errorInvalid': 'A valid email is required.',

    'checkout.form.phone.label': 'Phone',
    'checkout.form.phone.errorRequired': 'Phone number is required.',

    'checkout.form.street.label': 'Street and number',
    'checkout.form.street.errorRequired': 'Address is required.',

    'checkout.form.postalCode.label': 'Postal code',
    'checkout.form.postalCode.errorRequired': 'Postal code is required.',

    'checkout.form.city.label': 'City',
    'checkout.form.city.errorRequired': 'City is required.',

    'checkout.form.country.label': 'Country',
    'checkout.form.country.errorRequired': 'Country is required.',

    'checkout.form.notes.label': 'Comment / instructions (optional)',

    'checkout.form.submit.loading': 'Submitting...',
    'checkout.form.submit.default': 'Confirm order',

    'checkout.cart.title': 'My cart',
    'checkout.cart.empty': 'Your cart is empty.',
    'checkout.cart.quantityPrefix': 'x',
    'checkout.cart.totalLabel': 'Total',
    'checkout.cart.backToCart': '← Back to cart',

    // ===== TERMS (CGV) =====
    'terms.title': 'Terms & Conditions of Sale',
    'terms.lastUpdate.label': 'Last updated',

    'terms.section1.title': '1. Legal information',
    'terms.section1.body':
      'The Enoch Leathercraft website is operated by an artisan based in Belgium. These Terms & Conditions of Sale apply to all orders placed via the site and govern the contractual relationship between Enoch Leathercraft and its customers.',

    'terms.section2.title': '2. Products',
    'terms.section2.body':
      'The items offered are handmade. Because each piece is unique, slight variations may exist. The photos shown on the website are not contractual but are intended to represent the products as faithfully as possible.',

    'terms.section3.title': '3. Orders',
    'terms.section3.body':
      'Any order implies full acceptance of these Terms & Conditions. The seller reserves the right to cancel any order in the event of an existing dispute with the customer or in case of suspected fraud.',

    'terms.section4.title': '4. Prices',
    'terms.section4.body':
      'Prices are displayed in euros (€), all taxes included. Enoch Leathercraft is not subject to VAT as an artisan (small business exemption). Shipping costs are indicated during checkout.',

    'terms.section5.title': '5. Payment',
    'terms.section5.body1':
      'Payments are processed securely through an external provider (for example Stripe). Accepted methods may include: bank card, Visa, Mastercard, Apple Pay, Google Pay (depending on availability).',
    'terms.section5.body2':
      'The order is only confirmed after final validation of the payment.',

    'terms.section6.title': '6. Delivery',
    'terms.section6.intro':
      'Shipments are made from Belgium, with tracking number. Estimated delivery times are:',
    'terms.section6.item1': 'Belgium: 2 to 4 business days',
    'terms.section6.item2': 'Europe: 4 to 7 business days',
    'terms.section6.item3': 'International: 7 to 14 business days',
    'terms.section6.outro':
      'Enoch Leathercraft cannot be held responsible for delays caused by the carrier.',

    'terms.section7.title': '7. Right of withdrawal (Belgium & EU)',
    'terms.section7.body1':
      'In accordance with European law, you have 14 days from receipt of the product to exercise your right of withdrawal, without having to justify your decision.',
    'terms.section7.body2':
      'The product must be returned in its original condition, unused, and properly packaged. Return costs are borne by the customer, except in the case of an error on the part of the seller.',

    'terms.section8.title': '8. Custom products',
    'terms.section8.body':
      'In accordance with the law, made-to-measure or personalised products are not eligible for the right of withdrawal.',

    'terms.section9.title': '9. Warranty',
    'terms.section9.body':
      'All products benefit from the legal guarantee of conformity provided for by Belgian and European law (2 years). In case of a defect, please contact us as soon as possible with a description and photos of the issue.',

    'terms.section10.title': '10. Liability',
    'terms.section10.body':
      'The seller is not liable for indirect damage, data loss or misuse of the products. The use of the products is under the customer’s responsibility.',

    'terms.section11.title': '11. Personal data',
    'terms.section11.body':
      'The data collected are necessary for order management and customer relations. They are never sold to third parties. You have the right to access, rectify and delete your data, on simple request or via the contact page.',

    'terms.section12.title': '12. Disputes',
    'terms.section12.body':
      'In the event of a dispute, an amicable solution will always be sought first. Failing that, the competent courts will be those of Brussels (Belgium).',

    'terms.section13.title': '13. Contact',
    'terms.section13.body':
      'For any question regarding these Terms & Conditions of Sale, you can contact us via the contact form or at the address indicated on the website.',

    // ===== PRIVACY (Privacy policy) =====
    'privacy.title': 'Privacy policy',
    'privacy.intro':
      'This policy explains how Enoch Leathercraft collects, uses and protects your personal data when you use our website and services.',

    'privacy.section1.title': '1. Data controller',
    'privacy.section1.body':
      'The data controller is the Enoch Leathercraft workshop, based in Belgium. For any question related to the protection of your data, you can contact us via the Contact page.',

    'privacy.section2.title': '2. Data collected',
    'privacy.section2.intro':
      'We only collect the data necessary for the proper functioning of the site:',
    'privacy.section2.item1':
      'Account data: first name, last name, email address, password (hashed), phone number (optional).',
    'privacy.section2.item2':
      'Order / shipping data: postal address, country, and information related to your orders and purchase history.',
    'privacy.section2.item3':
      'Technical data: IP addresses, technical logs, browsing information (in particular via technical cookies).',
    'privacy.section2.item4':
      'Payment data: payments are processed by an external provider (for example Stripe); we do not store your card numbers on this site.',

    'privacy.section3.title': '3. Purposes of processing',
    'privacy.section3.intro': 'Your data are used only to:',
    'privacy.section3.item1': 'Create and manage your customer account.',
    'privacy.section3.item2':
      'Process your orders and ensure product delivery.',
    'privacy.section3.item3':
      'Provide after-sales service and answer your requests via the contact form.',
    'privacy.section3.item4':
      'Ensure the security of the website (technical logs, fraud prevention) and produce internal statistics.',

    'privacy.section4.title': '4. Legal basis',
    'privacy.section4.intro':
      'In accordance with the GDPR, the processing of your data is based on:',
    'privacy.section4.item1':
      'Performance of the contract: processing and delivery of your orders.',
    'privacy.section4.item2':
      'Your consent: for example when you create an account or accept certain cookies.',
    'privacy.section4.item3':
      'Legitimate interest: website improvement, fraud prevention, internal statistics.',

    'privacy.section5.title': '5. Data retention period',
    'privacy.section5.item1':
      'Account and purchase data are kept for as long as your account is active, then archived for the legally required periods (for example for accounting purposes).',
    'privacy.section5.item2':
      'Technical logs are kept for a limited time, only for security and maintenance purposes.',

    'privacy.section6.title': '6. Recipients of the data',
    'privacy.section6.intro':
      'Your data are only accessible to people and service providers who need them:',
    'privacy.section6.item1':
      'The Enoch Leathercraft workshop (order management, customer support).',
    'privacy.section6.item2':
      'The payment provider (e.g. Stripe) for secure payment processing.',
    'privacy.section6.item3':
      'Any technical providers (hosting, email, etc.) acting as processors.',
    'privacy.section6.outro':
      'We do not sell your personal data to third parties.',

    'privacy.section7.title': '7. Your rights (GDPR)',
    'privacy.section7.intro':
      'In accordance with the General Data Protection Regulation (GDPR), you have the following rights:',
    'privacy.section7.item1':
      'Right of access: obtain a copy of the personal data concerning you.',
    'privacy.section7.item2':
      'Right to rectification: correct inaccurate or incomplete data.',
    'privacy.section7.item3':
      'Right to erasure: request the deletion of your data, within the limits provided by law.',
    'privacy.section7.item4':
      'Right to restriction: request temporary suspension of the processing of certain data.',
    'privacy.section7.item5':
      'Right to object: object to certain processing operations based on legitimate interest.',
    'privacy.section7.item6':
      'Right to data portability: receive your data in a structured format, when applicable.',
    'privacy.section7.outro':
      'To exercise your rights, you can contact us via the Contact page. You also have the right to lodge a complaint with the Data Protection Authority in your country of residence, in particular the Belgian Data Protection Authority for Belgium.',

    'privacy.section8.title': '8. Cookies',
    'privacy.section8.body':
      'The website mainly uses technical cookies that are necessary for operation (session, cart, login). Audience measurement or tracking cookies may also be used, subject to your consent when required.',

    'privacy.section9.title': '9. Security',
    'privacy.section9.body':
      'We implement reasonable technical and organisational measures to protect your data against unauthorised access, loss, destruction or alteration.',

    'privacy.section10.title': '10. Updates to this policy',
    'privacy.section10.body':
      'This privacy policy may be updated as the website or legislation evolves. The version in force is the one displayed on this page.',

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
