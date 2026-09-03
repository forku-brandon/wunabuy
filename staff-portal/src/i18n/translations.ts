export type Language = 'en' | 'fr';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Navigation & Header
    'nav.dashboard': 'Executive Overview',
    'nav.kyc': 'Merchant & Driver KYC',
    'nav.disputes': 'Escrow Disputes',
    'nav.financials': 'Financials & Ledger',
    'nav.logistics': 'Logistics & Fleet Ops',
    'nav.hr_ops': 'HR & Staff Operations',
    'nav.settings': 'System Settings & RBAC',
    'nav.profile': 'My Staff Profile',

    // Language Selector
    'lang.select': 'Language',
    'lang.english': 'English (EN)',
    'lang.french': 'Français (FR)',

    // Common UI & Action Controls
    'action.search': 'Search...',
    'action.filter': 'Filter',
    'action.save': 'Save Changes',
    'action.cancel': 'Cancel',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.approve': 'Approve',
    'action.reject': 'Reject',
    'action.authorize': 'Authorize',
    'action.override': 'Manual Override',
    'action.accepted': 'Accepted (In Progress)',
    'action.completed': 'Completed',
    'action.print': 'Print Payslip',

    // Status Badges
    'status.active': 'ACTIVE',
    'status.suspended': 'SUSPENDED',
    'status.pending': 'PENDING',
    'status.approved': 'APPROVED',
    'status.rejected': 'REJECTED',
    'status.completed': 'COMPLETED',
    'status.locked': 'Locked (Admin Only)',

    // Header Working Clock & Telemetry
    'clock.title': 'Company Standard Employee Working Clock',
    'clock.active_shift': 'ACTIVE DUTY SHIFT',
    'clock.node_status': '28°C Douala Node Live',
    'clock.timezone': 'WAT (UTC+1)',

    // Task Directives Section
    'tasks.title': 'Assigned Work Directives & Operational Tasks',
    'tasks.accept_btn': 'Click to Accept Task',
    'tasks.mark_completed_btn': 'Click to Mark Completed',
    'tasks.due_date': 'Due Date',
    'tasks.assigned_by': 'Assigned By',
    'tasks.priority': 'Priority',

    // Staff Directory & HR
    'hr.title': 'Corporate Staff Directory & Roster',
    'hr.provision_btn': 'Provision Staff Account',
    'hr.salary_ledger': 'Monthly Staff Payroll Disbursal Ledger',

    // RBAC & Governance
    'rbac.title': 'Security, Audit Logs & RBAC Governance',
    'rbac.clearance_level': 'Security Clearance Level',
  },
  fr: {
    // Top Navigation & Header
    'nav.dashboard': 'Tableau de Bord Exécutif',
    'nav.kyc': 'Vérification KYC Marchands & Chauffeurs',
    'nav.disputes': 'Gestion des Litiges Escrow',
    'nav.financials': 'Finances & Grand Livre',
    'nav.logistics': 'Logistique & Gestion de Flotte',
    'nav.hr_ops': 'Ressources Humaines & Personnel',
    'nav.settings': 'Paramètres Système & RBAC',
    'nav.profile': 'Mon Profil Employé',

    // Language Selector
    'lang.select': 'Langue',
    'lang.english': 'English (EN)',
    'lang.french': 'Français (FR)',

    // Common UI & Action Controls
    'action.search': 'Rechercher...',
    'action.filter': 'Filtrer',
    'action.save': 'Enregistrer les modifications',
    'action.cancel': 'Annuler',
    'action.edit': 'Modifier',
    'action.delete': 'Supprimer',
    'action.approve': 'Approuver',
    'action.reject': 'Rejeter',
    'action.authorize': 'Autoriser',
    'action.override': 'Forçage Manuel',
    'action.accepted': 'Accepté (En cours)',
    'action.completed': 'Terminé',
    'action.print': 'Imprimer la Fiche de Paie',

    // Status Badges
    'status.active': 'ACTIF',
    'status.suspended': 'SUSPENDU',
    'status.pending': 'EN ATTENTE',
    'status.approved': 'APPROUVÉ',
    'status.rejected': 'REJETÉ',
    'status.completed': 'TERMINÉ',
    'status.locked': 'Verrouillé (Admin Uniquement)',

    // Header Working Clock & Telemetry
    'clock.title': 'Horloge Digitale de Travail du Personnel Standard Corporate',
    'clock.active_shift': 'POSTE DE TRAVAIL ACTIF',
    'clock.node_status': 'Nœud Douala En Direct (28°C)',
    'clock.timezone': 'WAT (UTC+1)',

    // Task Directives Section
    'tasks.title': 'Directives de Travail Assignées & Tâches Opérationnelles',
    'tasks.accept_btn': 'Cliquer pour Accepter la Tâche',
    'tasks.mark_completed_btn': 'Cliquer pour Marquer comme Terminé',
    'tasks.due_date': 'Date d\'échéance',
    'tasks.assigned_by': 'Assigné par',
    'tasks.priority': 'Priorité',

    // Staff Directory & HR
    'hr.title': 'Annuaire du Personnel & Effectifs Corporate',
    'hr.provision_btn': 'Créer un Compte Employé',
    'hr.salary_ledger': 'Grand Livre des Salaires du Personnel',

    // RBAC & Governance
    'rbac.title': 'Sécurité, Registres d\'Audit & Governance RBAC',
    'rbac.clearance_level': 'Niveau d\'Habilitation de Sécurité',
  },
};

