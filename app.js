// ============================================================
// HCT Healthcare — BBCode Generator (Form-based)
// ============================================================
(function () {
    'use strict';

    // --- DOM refs ---
    var tgEl = document.getElementById('tg-container');
    var fcEl = document.getElementById('fc');
    var formCard = document.getElementById('form-card');
    var formTitle = document.getElementById('form-title');
    var outputArea = document.getElementById('output-area');
    var bbOutput = document.getElementById('bbcode-output');
    var previewCard = document.getElementById('preview-card');
    var previewEl = document.getElementById('preview');
    var toastEl = document.getElementById('toast');
    var toastMsg = document.getElementById('toast-msg');
    var activeTemplate = null;

    // --- Helper: create field HTML ---
    function fieldHTML(f, cls) {
        var c = cls || '';
        var h = '<div class="fi ' + c + '"><label for="f_' + f.id + '">' + f.label + '</label>';
        if (f.type === 'select') {
            h += '<select id="f_' + f.id + '">';
            f.options.forEach(function (o) { h += '<option value="' + o + '">' + o + '</option>'; });
            h += '</select>';
        } else if (f.type === 'textarea') {
            h += '<textarea id="f_' + f.id + '" placeholder="' + (f.ph || '') + '" rows="' + (f.rows || 3) + '"></textarea>';
        } else {
            h += '<input type="' + (f.type || 'text') + '" id="f_' + f.id + '" placeholder="' + (f.ph || '') + '">';
        }
        return h + '</div>';
    }

    // --- Get field value ---
    function v(id) {
        var el = document.getElementById('f_' + id);
        return el ? el.value.trim() || 'Rep' : 'Rep';
    }
    function vr(id) {
        var el = document.getElementById('f_' + id);
        return el ? el.value.trim() : '';
    }

    // --- Common field sets ---
    var infoPerso = [
        { id: 'nom', label: 'Nom', ph: 'Votre nom de famille' },
        { id: 'prenom', label: 'Prénom', ph: 'Votre prénom' },
        { id: 'civilite', label: 'Civilité', type: 'select', options: ['Homme', 'Femme'] },
        { id: 'nationalite', label: 'Nationalité', ph: 'Ex: Américaine' },
        { id: 'ddn', label: 'Date de naissance', ph: 'JJ/MM/AAAA' },
        { id: 'ldn', label: 'Lieu de naissance', ph: 'Ex: Nashville, TN' },
        { id: 'adresse', label: 'Adresse', ph: 'Ex: 127 Fox Hollow Av., Townsend, TN', cls: 'fw' },
        { id: 'permis', label: 'Permis possédé(s)', ph: 'Ex: A / B' }
    ];

    var infoMedicale = [
        { id: 'lunettes', label: 'Port des lunettes de vue', type: 'select', options: ['Non', 'Oui'] },
        { id: 'traitement', label: 'Traitement(s) particulier(s)', ph: 'Problème d\'asthme...' },
        { id: 'oeil_g', label: 'Œil gauche (/10)', type: 'select', options: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'] },
        { id: 'oeil_d', label: 'Œil droit (/10)', type: 'select', options: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'] },
        { id: 'taille', label: 'Taille (cm)', ph: '180', type: 'number' },
        { id: 'poids', label: 'Masse (kg)', ph: '75', type: 'number' }
    ];

    var sigFields = [
        { id: 'date_fait', label: 'Fait le', ph: 'JJ/MM/AAAA' },
        { id: 'lieu_fait', label: 'À', ph: 'Nashville' }
    ];

    var oocDiscord = [
        { id: 'serveur', label: 'Serveur souhaité', type: 'select', options: ['#1', '#2'] },
        { id: 'discord', label: 'Pseudo Discord', ph: 'MonPseudo' }
    ];

    var oocFull = [
        { id: 'serveur', label: 'Serveur souhaité', type: 'select', options: ['#1', '#2'] },
        { id: 'discord', label: 'Avez-vous Discord ? (pseudo)', ph: 'MonPseudo' },
        { id: 'anciens_noms', label: 'Anciens noms IG', ph: 'Eddie Thawn' },
        { id: 'lien_forum', label: 'Lien compte forum GTACity', ph: 'https://gtacityrp.fr/index.php?members/...' },
        { id: 'histoire', label: 'Histoire du personnage (3 lignes min.)', type: 'textarea', ph: 'Racontez l\'histoire de votre personnage...', rows: 4, cls: 'fw' }
    ];

    var oocTS = [
        { id: 'serveur', label: 'Serveur souhaité', type: 'select', options: ['#1', '#2'] },
        { id: 'ts3', label: 'Avez-vous TeamSpeak 3 ?', ph: 'Oui / Non' },
        { id: 'anciens_noms', label: 'Anciens noms IG', ph: 'Eddie Thawn' },
        { id: 'lien_forum', label: 'Lien compte forum GTACity', ph: 'https://gtacityrp.fr/index.php?members/...' },
        { id: 'histoire', label: 'Histoire du personnage (3 lignes min.)', type: 'textarea', ph: 'Racontez l\'histoire de votre personnage...', rows: 4, cls: 'fw' }
    ];

    // ============================================================
    // TEMPLATE DEFINITIONS
    // ============================================================
    var templates = {

        // -------- 1. INTERNAT --------
        internat: {
            name: 'Candidature Internat', icon: '🎓',
            sections: [
                { title: 'Informations personnelles', fields: infoPerso },
                {
                    title: 'Parcours professionnel & diplômes', fields: [
                        { id: 'diplomes', label: 'Diplôme(s) obtenu(s)', ph: 'High School Diploma, etc.', cls: 'fw' },
                        { id: 'professions', label: 'Profession(s) antérieure(s)', ph: 'Charpentier', cls: 'fw' },
                        { id: 'affectation', label: 'Affectation souhaitée', type: 'select', options: ['TMC Townsend', 'NMH Nashville'], cls: 'fw' }
                    ]
                },
                { title: 'Informations médicales', fields: infoMedicale },
                {
                    title: 'Automatisme — Questions', fields: [
                        { id: 'q_spo2', label: 'Définissez simplement le terme SpO2', type: 'textarea', ph: 'Votre réponse...', rows: 2, cls: 'fw' },
                        { id: 'q_naloxone', label: 'Plus simplement, le naloxone est ?', type: 'textarea', ph: 'Votre réponse...', rows: 2, cls: 'fw' },
                        { id: 'q_dextro', label: 'Que permet de mesurer le Dextro ?', type: 'textarea', ph: 'Votre réponse...', rows: 2, cls: 'fw' },
                        { id: 'q_glasgow', label: 'Que permet d\'évaluer le score sur l\'échelle Glasgow ?', type: 'textarea', ph: 'Votre réponse...', rows: 2, cls: 'fw' }
                    ]
                },
                {
                    title: 'Mise en situation', fields: [
                        { id: 'q_accident', label: 'Que feriez-vous lors de votre arrivée sur un accident ?', type: 'textarea', ph: 'Décrivez votre démarche...', rows: 4, cls: 'fw' }
                    ]
                },
                { title: 'Signature', fields: sigFields },
                { title: 'OOC — Informations hors-jeu', fields: oocDiscord }
            ],
            generate: function () {
                return '[hide]\n\n[table style="border:1px solid black; background-color:#ffffff; padding:10px; font-family:arial; color:#000000; width:100%;margin:auto;"]\n[tr][td]\n[center][img(500px,250px)]https://zupimages.net/up/23/09/2rts.png[/img][/center]\n\n[center][b][size=18]DOSSIER DE CANDIDATURE - INTERNAT[/size][/b][/center]\n\n[hr]\n\n[left][b][u]Informations personnelles:[/u][/b]\n\n[b]Nom[/b]: ' + v('nom') + '\n[b]Prénom[/b]: ' + v('prenom') + '\n[b]Civilité[/b]: ' + v('civilite') + '\n[b]Nationalité[/b]: ' + v('nationalite') + '\n\n[b]Date de naissance[/b]: ' + v('ddn') + '\n[b]Lieu de naissance[/b]: ' + v('ldn') + '\n[b]Adresse[/b]: ' + v('adresse') + '\n\n[b]Permis possédé(s)[/b]: ' + v('permis') + '\n\n[b][u]Parcours professionnel(s) et diplôme(s):[/u][/b]\n\n[b]Diplôme(s) obtenu(s)[/b]: ' + v('diplomes') + '\n\n[b]Profession(s) antérieure(s)[/b]: ' + v('professions') + '\n\n[b]Affectation souhaité :[/b] TMC Townsend - NMH Nashville [size=12](Rayer les mentions inutiles)[/size]\n[i][size=10](Il s\'agit de l\'établissement hospitalier où vous souhaitez être affecté)[/size][/i]\n\n[b][u]Informations médicales:[/u][/b]\n\n[b]Port des lunettes de vue[/b]: ' + (v('lunettes') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Œil gauche[/b]: ' + v('oeil_g') + '/10\n[b]Œil droit[/b]: ' + v('oeil_d') + '/10\n\n[b]Traitement(s) particulier(s)[/b]: ' + v('traitement') + '\n\n[b]Taille [/b][size=12](cm)[/size]: ' + v('taille') + '\n[b]Poids [/b][size=12](kg)[/size]: ' + v('poids') + '\n\n[b][u]Automatisme - répondre aux questions suivantes[/u][/b]\n\n[b]Définissez simplement le terme Sp02[/b] : ' + v('q_spo2') + '\n\n[b]Plus simplement, le naloxone est ?[/b] : ' + v('q_naloxone') + '\n\n[b]Que permet de mesurer le Dextro ?[/b] : ' + v('q_dextro') + '\n\n[b]Que permet d\'évaluer le score sur l\'échelle Glasgow ?[/b] : ' + v('q_glasgow') + '\n\n[b][u]Mise en situation [/u][/b]\n\n[b]Que feriez vous lors de votre arrivée sur un accident ?[/b] :\n' + v('q_accident') + '\n[/left]\n\n[right]Fait le ' + v('date_fait') + ' à ' + v('lieu_fait') + '\nSignature du candidat[/right]\n\n[spoiler="OOC"]\n[b]Serveur souhaité (#1 ou #2)[/b]: ' + v('serveur') + '\n[b]Pseudo Discord [/b]: ' + v('discord') + '\n[/spoiler]\n\n[/td]\n[/tr]\n[/table]\n[/hide]';
            }
        },

        // -------- 2. CANDIDATURE GENERALE (nouveau branding) --------
        candidature: {
            name: 'Candidature Générale', icon: '📝',
            sections: [
                {
                    title: 'Informations personnelles', fields: infoPerso.concat([
                        { id: 'casier', label: 'Casier judiciaire ?', type: 'select', options: ['Non', 'Oui'] },
                        { id: 'situation', label: 'Situation familiale', type: 'select', options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'En concubinage'] }
                    ])
                },
                {
                    title: 'Parcours professionnel & diplômes', fields: [
                        { id: 'diplomes', label: 'Diplôme(s) obtenu(s)', ph: 'High School Diploma, etc.', cls: 'fw' },
                        { id: 'professions', label: 'Profession(s) ou poste antérieure(s)', ph: 'Précisez établissement, année, poste', cls: 'fw', type: 'textarea', rows: 2 },
                        { id: 'poste', label: 'Intitulé du poste souhaité', ph: 'Se référer aux Conditions des départements', cls: 'fw' }
                    ]
                },
                {
                    title: 'Lettre de motivation', fields: [
                        { id: 'motivation', label: 'Pourquoi postuler chez HCT ?', type: 'textarea', ph: 'Expliquez vos motivations...', rows: 5, cls: 'fw' }
                    ]
                },
                { title: 'Signature', fields: sigFields },
                { title: 'OOC — Informations hors-jeu', fields: oocFull }
            ],
            generate: function () {
                return '[table style="border:1px solid black; background-color:#ffffff; padding:10px; font-family:arial; color:#000000; width:100%;margin:auto;"]\n[tr][td][center][img(701px,251px)]https://zupimages.net/up/25/22/0b9z.png[/img][/center]\n\n[center][b]DOSSIER DE CANDIDATURE[/b][/center]\n\n\n[hr]\n\n[b][u]Informations personnelles:[/u][/b]\n\n[b]Nom[/b]: ' + v('nom') + '\n[b]Prénom[/b]: ' + v('prenom') + '\n[b]Civilité[/b]: ' + v('civilite') + '\n[b]Nationalité[/b]: ' + v('nationalite') + '\n\n[b]Date de naissance[/b]: ' + v('ddn') + '\n[b]Lieu de naissance[/b]: ' + v('ldn') + '\n[b]Adresse[/b]: ' + v('adresse') + '\n\n[b]Permis possédé(s)[/b]: ' + v('permis') + '\n[b]Possédez vous un casier judiciaire[/b]: ' + (v('casier') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Situation familiale[/b] : Marié(e) - Divorcé(e) - Célibataire - En concubinage [size=10](Rayez la mention inutile)[/size]\n\n[b][u]Parcours professionnel(s) et diplôme(s):[/u][/b]\n\n[b]Diplôme(s) obtenu(s)[/b]: ' + v('diplomes') + '\n\n[b]Profession(s) ou poste antérieure(s)[/b]: ' + v('professions') + '\n[i][size=10](Si employé dans un hôpital ou autre du domaine médical, précisez l\'établissement, l\'année et le poste)[/size][/i]\n\n[b]Intitulé du poste :[/b] ' + v('poste') + '\n[i][size=10](Se référer aux "[url=https://hct-intra.forumactif.com/t231-a-lire-conditions-des-departements-accreditations]Conditions des départements & Accréditations[/url]")[/size][/i]\n\n[b][u]Lettre de motivation:[/u][/b]\n[i][size=10](Vous rédigez une lettre de motivation dans laquelle vous expliquerez pourquoi postuler chez nous)[/size][/i]\n' + v('motivation') + '\n\n[right]Fait le ' + v('date_fait') + ' à ' + v('lieu_fait') + '\nSignature[/right]\n\n[spoiler="OOC"]\n[b]Serveur souhaité (#1 ou #2)[/b]: ' + v('serveur') + '\n[b]Avez-vous Discord (indiquez votre pseudo) ?[/b] [i](obligaroire)[/i] : ' + v('discord') + '\n[b]Anciens noms IG[/b]: ' + v('anciens_noms') + '\n[b]Lien de votre compte forum (GTACity RP)[/b]: ' + v('lien_forum') + '\n[b]Courte histoire du personnage[/b] [size=10](trois lignes)[/size]:\n[size=10](Histoire cohérente, impossibilité d\'avoir fait de l\'illégal)[/size]\n' + v('histoire') + '\n[/spoiler]\n\n[/td]\n[/tr]\n[/table]';
            }
        },

        // -------- 3. SURETE HOSPITALIERE --------
        surete: {
            name: 'Candidature Sûreté', icon: '🛡️',
            sections: [
                {
                    title: 'Informations personnelles', fields: infoPerso.concat([
                        { id: 'casier', label: 'Casier judiciaire ?', type: 'select', options: ['Non', 'Oui'] },
                        { id: 'situation', label: 'Situation familiale', type: 'select', options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'En concubinage'] }
                    ])
                },
                {
                    title: 'Parcours professionnel & diplômes', fields: [
                        { id: 'diplomes', label: 'Diplôme(s) obtenu(s)', ph: 'High School Diploma, etc.', cls: 'fw' },
                        { id: 'professions', label: 'Profession(s) antérieure(s)', ph: 'Ex: Agent de sécurité', cls: 'fw' },
                        { id: 'affectation', label: 'Affectation souhaitée', type: 'select', options: ['TMC Townsend', 'NMH Nashville'], cls: 'fw' }
                    ]
                },
                { title: 'Informations médicales', fields: infoMedicale },
                {
                    title: 'Lettre de motivation', fields: [
                        { id: 'motivation', label: 'Lettre de motivation (6 lignes min.)', type: 'textarea', ph: 'Rédigez votre lettre de motivation...', rows: 6, cls: 'fw' }
                    ]
                },
                { title: 'Signature', fields: sigFields },
                {
                    title: 'OOC — Informations hors-jeu', fields: [
                        { id: 'serveur', label: 'Serveur souhaité', type: 'select', options: ['#1', '#2'] },
                        { id: 'discord', label: 'Avez-vous Discord ? (pseudo)', ph: 'MonPseudo' },
                        { id: 'lien_forum', label: 'Lien compte forum GTACity', ph: 'https://gtacityrp.fr/...' },
                        { id: 'histoire', label: 'Histoire du personnage (3 lignes)', type: 'textarea', ph: 'Racontez...', rows: 3, cls: 'fw' }
                    ]
                }
            ],
            generate: function () {
                return '[table style="border:1px solid black; background-color:#ffffff; padding:10px; font-family:arial; color:#000000; width:100%;margin:auto;"]\n[tr][td]\n[center][img(500px,250px)]https://zupimages.net/up/23/09/2rts.png[/img][/center]\n\n[center][b][size=18]DOSSIER DE CANDIDATURE - SURETÉ HOSPITALIÈRE[/size][/b][/center]\n\n[hr]\n\n[left][b][u]Informations personnelles:[/u][/b]\n\n[b]Nom[/b]: ' + v('nom') + '\n[b]Prénom[/b]: ' + v('prenom') + '\n[b]Civilité[/b]: ' + v('civilite') + '\n[b]Nationalité[/b]: ' + v('nationalite') + '\n\n[b]Date de naissance[/b]: ' + v('ddn') + '\n[b]Lieu de naissance[/b]: ' + v('ldn') + '\n[b]Adresse[/b]: ' + v('adresse') + '\n\n[b]Permis possédé(s)[/b]: ' + v('permis') + '\n[b]Possédez vous un casier judiciaire[/b]: ' + (v('casier') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Situation familiale[/b] : Marié(e) - Divorcé(e) - Célibataire - En concubinage [size=12](Rayer les mentions inutiles)[/size]\n\n[b][u]Parcours professionnel(s) et diplôme(s):[/u][/b]\n\n[b]Diplôme(s) obtenu(s)[/b]: ' + v('diplomes') + '\n\n[b]Profession(s) antérieure(s)[/b]: ' + v('professions') + '\n\n[b]Affectation souhaité :[/b] TMC Townsend - NMH Nashville [size=12](Rayer les mentions inutiles)[/size]\n[i][size=10](Il s\'agit de l\'établissement hospitalier où vous souhaitez être affecté)[/size][/i]\n\n[b][u]Informations médicales:[/u][/b]\n\n[b]Port des lunettes de vue[/b]: ' + (v('lunettes') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Œil gauche[/b]: ' + v('oeil_g') + '/10\n[b]Œil droit[/b]:  ' + v('oeil_d') + '/10\n\n[b]Traitement(s) particulier(s)[/b]: ' + v('traitement') + '\n\n[b]Taille [/b][size=12](cm)[/size]: ' + v('taille') + '\n[b]Poids [/b][size=12](kg)[/size]: ' + v('poids') + '\n\n[b][u]Lettre de motivation[/u][/b]\n[i][size=12](Rédiger une lettre de motivation d\'environ 6 lignes minimum)[/size][/i]\n' + v('motivation') + '\n[/left]\n\n\n\n[right]Fait le ' + v('date_fait') + ' à ' + v('lieu_fait') + '\nSignature du candidat[/right]\n\n[spoiler="OOC"]\n[b]Serveur souhaité (#1 ou #2)[/b]: ' + v('serveur') + '\n[b]Avez-vous Discord (indiquez votre pseudo) ?[/b] [i](obligaroire)[/i] : ' + v('discord') + '\n[b]Lien de votre compte forum (GTACity RP)[/b]: ' + v('lien_forum') + '\n[b]Courte histoire du personnage[/b] [size=12](trois lignes)[/size]:\n' + v('histoire') + '\n[/spoiler]\n\n[/td]\n[/tr]\n[/table]';
            }
        },

        // -------- 4. CANDIDATURE MEDECIN (avec spécialité) --------
        medecin: {
            name: 'Candidature Médecin', icon: '🩺',
            sections: [
                {
                    title: 'Informations personnelles', fields: infoPerso.concat([
                        { id: 'casier', label: 'Casier judiciaire ?', type: 'select', options: ['Non', 'Oui'] },
                        { id: 'situation', label: 'Situation familiale', type: 'select', options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'En concubinage'] }
                    ])
                },
                {
                    title: 'Parcours professionnel & diplômes', fields: [
                        { id: 'diplomes', label: 'Diplôme(s) obtenu(s)', cls: 'fw', ph: 'High School Diploma...' },
                        { id: 'professions', label: 'Profession(s) ou poste antérieure(s)', type: 'textarea', rows: 2, cls: 'fw', ph: 'Si hôpital: établissement, année, poste' },
                        { id: 'affectation', label: 'Affectation souhaitée', ph: 'Établissement hospitalier', cls: 'fw' },
                        { id: 'specialite', label: 'Spécialité souhaitée', ph: 'Se référer aux Conditions des départements', cls: 'fw' }
                    ]
                },
                { title: 'Informations médicales', fields: infoMedicale },
                {
                    title: 'Lettre de motivation', fields: [
                        { id: 'motivation', label: 'Lettre de motivation', type: 'textarea', ph: 'Expliquez pourquoi postuler chez nous...', rows: 5, cls: 'fw' }
                    ]
                },
                { title: 'Signature', fields: sigFields },
                { title: 'OOC — Informations hors-jeu', fields: oocTS }
            ],
            generate: function () {
                return '[table style="border:1px solid black; background-color:#ffffff; padding:10px; font-family:arial; color:#000000; width:100%;margin:auto;"]\n[tr][td][center][img(500px,250px)]https://zupimages.net/up/23/09/2rts.png[/img][/center]\n\n[center][b]DOSSIER DE CANDIDATURE[/b][/center]\n\n\n[hr]\n\n[b][u]Informations personnelles:[/u][/b]\n\n[b]Nom[/b]: ' + v('nom') + '\n[b]Prénom[/b]: ' + v('prenom') + '\n[b]Civilité[/b]: ' + v('civilite') + '\n[b]Nationalité[/b]: ' + v('nationalite') + '\n\n[b]Date de naissance[/b]: ' + v('ddn') + '\n[b]Lieu de naissance[/b]: ' + v('ldn') + '\n[b]Adresse[/b]: ' + v('adresse') + '\n\n[b]Permis possédé(s)[/b]: ' + v('permis') + '\n[b]Possédez vous un casier judiciaire[/b]: ' + (v('casier') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Situation familiale[/b] : Marié(e) - Divorcé(e) - Célibataire - En concubinage [size=10](Rayez la mention inutile)[/size]\n\n[b][u]Parcours professionnel(s) et diplôme(s):[/u][/b]\n\n[b]Diplôme(s) obtenu(s)[/b]: ' + v('diplomes') + '\n\n[b]Profession(s) ou poste antérieure(s)[/b]: ' + v('professions') + '\n[i][size=10](Si employé dans un hôpital ou autre du domaine médical, précisez l\'établissement, l\'année et le poste)[/size][/i]\n\n[b]Affectation souhaité :[/b] ' + v('affectation') + '\n[i][size=10](Il s\'agit de l\'établissement hospitalier ou vous souhaitez être affecté)[/size][/i]\n\n[b]Spécialité souhaitée :[/b] ' + v('specialite') + '\n[i][size=10](Se référer aux "[url=https://hct-intra.forumactif.com/t231-a-lire-conditions-des-departements-accreditations]Conditions des départements & Accréditations[/url]")[/size][/i]\n\n[b][u]Informations médicales:[/u][/b]\n\n[b]Port des lunettes de vue[/b]: ' + (v('lunettes') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Œil gauche[/b]: ' + v('oeil_g') + '/10\n[b]Œil droit[/b]:  ' + v('oeil_d') + '/10\n\n[b]Traitement(s) particulier(s)[/b]:\n[size=10](Laissez vide si RAS)[/size]\n\n[b]Taille [/b][size=10](cm)[/size]:\n[b]Poids [/b][size=10](kg)[/size]:\n\n[b][u]Lettre de motivation:[/u][/b]\n[i][size=10](Vous rédigez une lettre de motivation dans laquelle vous expliquerez pourquoi postuler chez nous)[/size][/i]\n' + v('motivation') + '\n\n[right]Fait le ' + v('date_fait') + ' à ' + v('lieu_fait') + '\nSignature[/right]\n\n[spoiler="OOC"]\n[b]Serveur souhaité (#1 ou #2)[/b]: ' + v('serveur') + '\n[b]Avez-vous TeamSpeak 3 ?[/b] [i](obligaroire)[/i] : ' + v('ts3') + '\n[b]Anciens noms IG[/b]: ' + v('anciens_noms') + '\n[b]Lien de votre compte forum (GTACity RP)[/b]: ' + v('lien_forum') + '\n[b]Courte histoire du personnage[/b] [size=10](trois lignes)[/size]:\n[size=10](Histoire cohérente, impossibilité d\'avoir fait de l\'illégal)[/size]\n' + v('histoire') + '\n[/spoiler]\n\n[/td]\n[/tr]\n[/table]';
            }
        },

        // -------- 5. CANDIDATURE CLASSIQUE --------
        candidature_classique: {
            name: 'Candidature Classique', icon: '📋',
            sections: [
                {
                    title: 'Informations personnelles', fields: infoPerso.concat([
                        { id: 'casier', label: 'Casier judiciaire ?', type: 'select', options: ['Non', 'Oui'] },
                        { id: 'situation', label: 'Situation familiale', type: 'select', options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'En concubinage'] }
                    ])
                },
                {
                    title: 'Parcours professionnel & diplômes', fields: [
                        { id: 'diplomes', label: 'Diplôme(s) obtenu(s)', cls: 'fw', ph: 'High School Diploma...' },
                        { id: 'professions', label: 'Profession(s) ou poste antérieure(s)', type: 'textarea', rows: 2, cls: 'fw', ph: 'Si hôpital: établissement, année, poste' },
                        { id: 'affectation', label: 'Affectation souhaitée', ph: 'Établissement hospitalier', cls: 'fw' }
                    ]
                },
                { title: 'Informations médicales', fields: infoMedicale },
                {
                    title: 'Lettre de motivation', fields: [
                        { id: 'motivation', label: 'Lettre de motivation', type: 'textarea', ph: 'Expliquez pourquoi postuler chez nous...', rows: 5, cls: 'fw' }
                    ]
                },
                { title: 'Signature', fields: sigFields },
                { title: 'OOC — Informations hors-jeu', fields: oocTS }
            ],
            generate: function () {
                return '[table style="border:1px solid black; background-color:#ffffff; padding:10px; font-family:arial; color:#000000; width:100%;margin:auto;"]\n[tr][td][center][img(500px,250px)]https://zupimages.net/up/23/09/2rts.png[/img][/center]\n\n[size=16][center][b]DOSSIER DE CANDIDATURE[/b][/center]\n[/size]\n[hr]\n\n[b][u]Informations personnelles:[/u][/b]\n\n[b]Nom[/b]: ' + v('nom') + '\n[b]Prénom[/b]: ' + v('prenom') + '\n[b]Civilité[/b]: ' + v('civilite') + '\n[b]Nationalité[/b]: ' + v('nationalite') + '\n\n[b]Date de naissance[/b]: ' + v('ddn') + '\n[b]Lieu de naissance[/b]: ' + v('ldn') + '\n[b]Adresse[/b]: ' + v('adresse') + '\n\n[b]Permis possédé(s)[/b]: ' + v('permis') + '\n[b]Possédez vous un casier judiciaire[/b]: ' + (v('casier') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Situation familiale[/b] : Marié(e) - Divorcé(e) - Célibataire - En concubinage [size=10](Rayez la mention inutile)[/size]\n\n[b][u]Parcours professionnel(s) et diplôme(s):[/u][/b]\n\n[b]Diplôme(s) obtenu(s)[/b]: ' + v('diplomes') + '\n\n[b]Profession(s) ou poste antérieure(s)[/b]: ' + v('professions') + '\n[i][size=10](Si employé dans un hôpital ou autre du domaine médical, précisez l\'établissement, l\'année et le poste)[/size][/i]\n\n[b]Affectation souhaité :[/b] ' + v('affectation') + '\n[i][size=10](Il s\'agit de l\'établissement hospitalier ou vous souhaitez être affecté)[/size][/i]\n\n[b][u]Informations médicales:[/u][/b]\n\n[b]Port des lunettes de vue[/b]: ' + (v('lunettes') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Œil gauche[/b]: ' + v('oeil_g') + '/10\n[b]Œil droit[/b]:  ' + v('oeil_d') + '/10\n\n[b]Traitement(s) particulier(s)[/b]:\n[size=10](Laissez vide si RAS)[/size]\n\n[b]Taille [/b][size=10](cm)[/size]:\n[b]Poids [/b][size=10](kg)[/size]:\n\n[b][u]Lettre de motivation:[/u][/b]\n[i][size=10](Vous rédigez une lettre de motivation dans laquelle vous expliquerez pourquoi postuler chez nous)[/size][/i]\n' + v('motivation') + '\n\n[right]Fait le ' + v('date_fait') + ' à ' + v('lieu_fait') + '\nSignature[/right]\n\n[spoiler="OOC"]\n[b]Serveur souhaité (#1 ou #2)[/b]: ' + v('serveur') + '\n[b]Avez-vous TeamSpeak 3 ?[/b] [i](obligaroire)[/i] : ' + v('ts3') + '\n[b]Anciens noms IG[/b]: ' + v('anciens_noms') + '\n[b]Lien de votre compte forum (GTACity RP)[/b]: ' + v('lien_forum') + '\n[b]Courte histoire du personnage[/b] [size=10](trois lignes)[/size]:\n[size=10](Histoire cohérente, impossibilité d\'avoir fait de l\'illégal)[/size]\n' + v('histoire') + '\n[/spoiler]\n\n[/td]\n[/tr]\n[/table]';
            }
        },


        // -------- 7. DEMANDE FORMATION --------
        formation: {
            name: 'Demande Formation', icon: '🏫',
            sections: [
                {
                    title: 'Informations de la formation', fields: [
                        { id: 'soussigne', label: 'Nom du soussigné', ph: 'NOM Prénom' },
                        { id: 'type_formation', label: 'Type de formation', ph: 'Formation secourisme...' },
                        { id: 'au_nom', label: 'Au nom de / du', ph: 'Organisation...', cls: 'fw' },
                        { id: 'date_formation', label: 'Date de la formation', ph: 'XX/XX/XXXX' },
                        { id: 'heure_debut', label: 'Horaire début', ph: 'XXhXX' },
                        { id: 'heure_fin', label: 'Horaire fin', ph: 'XXhXX' },
                        { id: 'presence_debut', label: 'Présence nécessaire à partir de', ph: 'XXhXX' },
                        { id: 'presence_fin', label: 'Jusqu\'à / pendant', ph: 'XXhXX' },
                        { id: 'lieu_formation', label: 'Lieu (adresse)', ph: 'Adresse complète', cls: 'fw' },
                        { id: 'lien_docs', label: 'Lien documents relatifs', ph: '(lien)', cls: 'fw' }
                    ]
                },
                {
                    title: 'Signature', fields: [
                        { id: 'signataire', label: 'NOM Prénom (signataire)', ph: 'NOM Prénom' },
                        { id: 'date_fait', label: 'Fait le', ph: 'XX/XX/XXXX' },
                        { id: 'lieu_fait', label: 'À', ph: 'Réponse' }
                    ]
                }
            ],
            generate: function () {
                return '[table style="width:90%; margin: auto; background:#ffffff; color:#0b243e; font-size:20px"]\n[td style="font-family:Courier New; vertical-align:top;" width="90%"]<div style="border: solid; margin: -10px -10px -10px; box-shadow: 12px 12px 2px 1px #0b243e">\n[center][img(245px,242px)]https://zupimages.net/up/22/23/kij8.png[/img][/center]\n \n[center][size=21][b]DEMANDE A L\'ORGANISME DE FORMATION[/b][/size]\n [size=13]___________________________________________________[/size]\n[/center]\n\n[table style="width:90%; margin:10px 10px 30px 50px; background:#E5E8E8; color:#000000; font-size:11px; -moz-box-shadow: inset 0px 0px 2px 0px #000000; -webkit-box-shadow: inset 0px 0px 2px 0px #000000; -o-box-shadow: inset 0px 0px 2px 0px #fffff; box-shadow: inset 0px 0px 2px 0px #000000; filter:progid:DXImageTransform.Microsoft.Shadow(color=#000000, Direction=NaN, Strength=2);"]\n[tr][td style="font-family:Trebuchet MS; vertical-align:text-top;" width="90%"]<div style="margin-left:1em; margin-right:1em;">\n\n[size=13]Je soussigné ' + v('soussigne') + ', organisant une formation ' + v('type_formation') + ' au nom de/du ' + v('au_nom') + ', faire appel aux formateurs de l\'Hospital Corporation of Tennessee dans le cadre de la susdite formation.\n\nElle se déroulera le ' + v('date_formation') + ' de ' + v('heure_debut') + ' à ' + v('heure_fin') + '. Votre présence est nécessaire à partir de ' + v('presence_debut') + ' jusqu\'à ' + v('presence_fin') + '.\nLa formation aura lieu au ' + v('lieu_formation') + '.\n\nSi-join, voici les documents relatifs à la formation : ' + v('lien_docs') + '\n\nCordialement,\n' + v('signataire') + '.\n\n[right]Fait le ' + v('date_fait') + ' à ' + v('lieu_fait') + '.\nSignature[/right] [/size]\n\n<span style="width:100; float:left; display:inline-block;"><div class="candid-content" style="text-align:left;">\n </div style>\n </div></span>\n\n[/td]\n[/tr]\n\n[/table]\n[/td]\n[/tr]\n\n[/table]\n<br>';
            }
        },

        // -------- 8. REINTEGRATION --------
        reintegration: {
            name: 'Réintégration', icon: '🔄',
            sections: [
                {
                    title: 'Informations personnelles', fields: infoPerso.slice(0, 6).concat([
                        { id: 'adresse', label: 'Adresse', ph: 'Ex: 127 Fox Hollow Av., Townsend, TN', cls: 'fw' },
                        { id: 'casier', label: 'Casier judiciaire ?', type: 'select', options: ['Non', 'Oui'] },
                        { id: 'situation', label: 'Situation familiale', type: 'select', options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'En concubinage'] }
                    ])
                },
                {
                    title: 'Parcours professionnel & diplômes', fields: [
                        { id: 'diplomes', label: 'Diplôme(s) obtenu(s) et formation(s)', cls: 'fw', ph: 'Vos diplômes...' },
                        { id: 'poste_ant', label: 'Poste antérieur(s)', type: 'textarea', rows: 2, cls: 'fw', ph: 'Établissement, année, poste' },
                        { id: 'specialite', label: 'Spécialité(s) souhaitée(s)', ph: 'Impossible de combiner médical et paramédical', cls: 'fw' },
                        { id: 'affectation', label: 'Affectation souhaitée', ph: 'Établissement hospitalier', cls: 'fw' }
                    ]
                },
                {
                    title: 'Lettre de motivation', fields: [
                        { id: 'motivation', label: 'Lettre de motivation', type: 'textarea', ph: 'Pourquoi postuler chez nous ?', rows: 5, cls: 'fw' }
                    ]
                },
                { title: 'Signature', fields: sigFields },
                { title: 'OOC — Informations hors-jeu', fields: oocTS }
            ],
            generate: function () {
                return '[table style="border:1px solid black; background-color:#ffffff; padding:10px; font-family:arial; color:#000000; width:100%;margin:auto;"]\n[tr][td][center][img(500px,250px)]https://zupimages.net/up/23/09/2rts.png[/img][/center]\n\n[center][b]DOSSIER DE RÉINTÉGRATION[/b][/center]\n\n\n[hr]\n[size=16]\n\n[b][u]Informations personnelles:[/u][/b]\n\n[b]Nom[/b]: ' + v('nom') + '\n[b]Prénom[/b]: ' + v('prenom') + '\n[b]Civilité[/b]: ' + v('civilite') + '\n[b]Nationalité[/b]: ' + v('nationalite') + '\n\n[b]Date de naissance[/b]: ' + v('ddn') + '\n[b]Lieu de naissance[/b]: ' + v('ldn') + '\n[b]Adresse[/b]: ' + v('adresse') + '\n\n[b]Possédez vous un casier judiciaire[/b]: ' + (v('casier') === 'Oui' ? 'OUI' : 'NON') + '\n[b]Situation familiale[/b] : Marié(e) - Divorcé(e) - Célibataire - En concubinage [size=10](Rayez la mention inutile)[/size]\n\n[b][u]Parcours professionnel(s) et diplôme(s):[/u][/b]\n\n[b]Diplôme(s) obtenu(s) et formation(s)[/b]: ' + v('diplomes') + '\n\n[color=#006600][b]Poste antérieure(s)[/b]: ' + v('poste_ant') + '[/color]\n[i][size=10](Employé dans le médical, précisez l\'établissement, l\'année et le poste)[/size][/i]\n\n[b]Spécialité(s) souhaité(e)[/b] [i][size=10](impossible de combiné médical et paramédical)[/size][/i] : ' + v('specialite') + '\n[size=10][i](comme stipulé dans la présentation, vous avez le droit à 2 spécialités. Si vous n\'en avez qu\'une et que vous êtes recruté dans l\'HCT, vous aurez le droit de vous spécialiser plus tard dans votre deuxième possibilité)[/i][/size]\n\n[b]Affectation souhaité :[/b] ' + v('affectation') + '\n[i][size=10](Il s\'agit de l\'établissement hospitalier ou vous souhaitez être affecté)[/size][/i]\n\n[b][u]Lettre de motivation:[/u][/b]\n[i][size=10](Vous rédigez une lettre de motivation dans laquelle vous expliquerez pourquoi postuler chez nous)[/size][/i]\n' + v('motivation') + '\n\n[/size]\n[right]Fait le ' + v('date_fait') + ' à ' + v('lieu_fait') + '\nSignature[/right]\n[size=16]\n\n[spoiler="OOC"]\n[b]Serveur souhaité (#1 ou #2)[/b]: ' + v('serveur') + '\n[b]Avez-vous TeamSpeak 3 ?[/b] [i](obligaroire)[/i] : ' + v('ts3') + '\n[b]Anciens noms IG[/b]: ' + v('anciens_noms') + '\n[b]Lien de votre compte forum (GTACity RP)[/b]: ' + v('lien_forum') + '\n\n[/spoiler]\n[/size][/td]\n[/tr]\n[/table]';
            }
        }

    }; // end templates

    // ============================================================
    // CATEGORIES & RENDER TEMPLATE BUTTONS
    // ============================================================
    var categories = [
        { title: '📋 Candidatures', keys: ['internat', 'candidature', 'surete', 'medecin', 'candidature_classique', 'reintegration'] },
        { title: '🏫 Administration', keys: ['formation'] }
    ];
    categories.forEach(function (cat) {
        var catTitle = document.createElement('div');
        catTitle.style.cssText = 'font-size:.8rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:1rem 0 .5rem;padding-left:.2rem';
        catTitle.textContent = cat.title;
        tgEl.appendChild(catTitle);
        var grid = document.createElement('div');
        grid.className = 'tg';
        grid.style.marginBottom = '.5rem';
        cat.keys.forEach(function (key) {
            var t = templates[key];
            if (!t) return;
            var btn = document.createElement('button');
            btn.className = 'tb';
            btn.id = 'btn-' + key;
            btn.innerHTML = '<span>' + t.icon + '</span><span>' + t.name + '</span>';
            btn.addEventListener('click', function () { selectTemplate(key); });
            grid.appendChild(btn);
        });
        tgEl.appendChild(grid);
    });

    // ============================================================
    // SELECT TEMPLATE -> RENDER FORM
    // ============================================================
    function selectTemplate(key) {
        activeTemplate = key;
        var t = templates[key];
        // Update active button
        document.querySelectorAll('.tb').forEach(function (b) { b.classList.remove('active'); });
        document.getElementById('btn-' + key).classList.add('active');
        // Build form
        var html = '';
        t.sections.forEach(function (sec) {
            html += '<div class="fs"><div class="fst">' + sec.title + '</div><div class="fg">';
            sec.fields.forEach(function (f) {
                html += fieldHTML(f, f.cls || '');
            });
            html += '</div></div>';
        });
        fcEl.innerHTML = html;
        fcEl.style.display = 'block';
        formCard.style.display = 'block';
        formTitle.textContent = '✏️ ' + t.name;
        // Hide previous output
        outputArea.style.display = 'none';
        previewCard.style.display = 'none';
        // Smooth scroll
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ============================================================
    // GENERATE BBCODE
    // ============================================================
    window.generateBBCode = function () {
        if (!activeTemplate) return;
        var code = templates[activeTemplate].generate();
        bbOutput.value = code;
        outputArea.style.display = 'block';
        // Preview - parse BBCode directly without escaping HTML
        previewCard.style.display = 'block';
        previewEl.innerHTML = parseBBCode(code);
        outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('BBCode généré avec succès !');
    };

    // ============================================================
    // COPY - uses execCommand as primary (works on file:// protocol)
    // ============================================================
    window.copyBBCode = function () {
        var text = bbOutput.value;
        if (!text.trim()) { showToast('Rien à copier !', true); return; }
        // Method 1: select textarea + execCommand (works everywhere)
        bbOutput.select();
        bbOutput.setSelectionRange(0, 999999);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { }
        if (ok) {
            showToast('BBCode copié dans le presse-papiers !');
            return;
        }
        // Method 2: Clipboard API fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                showToast('BBCode copié dans le presse-papiers !');
            }).catch(function () {
                showToast('Erreur : impossible de copier', true);
            });
        } else {
            showToast('Erreur : impossible de copier', true);
        }
    };

    // ============================================================
    // CLEAR
    // ============================================================
    window.clearAll = function () {
        bbOutput.value = '';
        outputArea.style.display = 'none';
        previewCard.style.display = 'none';
        fcEl.querySelectorAll('input, textarea, select').forEach(function (el) {
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        });
        showToast('Formulaire réinitialisé.');
    };

    // ============================================================
    // TOAST
    // ============================================================
    var toastTimer = null;
    function showToast(msg, isErr) {
        toastMsg.textContent = msg;
        toastEl.style.borderColor = isErr ? 'var(--danger)' : 'var(--success)';
        toastEl.style.color = isErr ? 'var(--danger)' : 'var(--success)';
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2500);
    }

    // ============================================================
    // BBCODE PREVIEW PARSER (no HTML escaping — renders cleanly)
    // ============================================================
    function parseBBCode(s) {
        // Convert newlines
        s = s.replace(/\n/g, '<br>');
        // Basic formatting
        s = s.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>');
        s = s.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>');
        s = s.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>');
        s = s.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<s>$1</s>');
        // Alignment
        s = s.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div style="text-align:center">$1</div>');
        s = s.replace(/\[left\]([\s\S]*?)\[\/left\]/gi, '<div style="text-align:left">$1</div>');
        s = s.replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<div style="text-align:right">$1</div>');
        // Size (run multiple passes for nested [size] tags)
        for (var pass = 0; pass < 3; pass++) {
            s = s.replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size:$1px">$2</span>');
        }
        // Color
        s = s.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>');
        // URLs
        s = s.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" style="color:#0e7490">$2</a>');
        s = s.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" style="color:#0e7490">$1</a>');
        // Images
        s = s.replace(/\[img\(([^,]+),([^)]+)\)\]([\s\S]*?)\[\/img\]/gi, '<img src="$3" style="width:$1;height:$2" alt="">');
        s = s.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" alt="">');
        // Horizontal rule
        s = s.replace(/\[hr\]/gi, '<hr>');
        // Hide
        s = s.replace(/\[hide\]([\s\S]*?)\[\/hide\]/gi, '<div style="border:1px dashed #999;padding:10px;margin:5px 0;border-radius:4px"><small style="color:#666">▼ Contenu masqué (hide)</small>$1</div>');
        // Spoiler (handle both " and &quot; for quotes)
        s = s.replace(/\[spoiler="([^"]*)"\]([\s\S]*?)\[\/spoiler\]/gi, '<div class="sb"><div class="sh" onclick="this.nextElementSibling.classList.toggle(\'open\')">▶ $1</div><div class="sc">$2</div></div>');
        s = s.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, '<div class="sb"><div class="sh" onclick="this.nextElementSibling.classList.toggle(\'open\')">▶ Spoiler</div><div class="sc">$1</div></div>');
        // Table with style (handle raw quotes)
        s = s.replace(/\[table style="([^"]*)"\]/gi, '<table style="$1">');
        s = s.replace(/\[table\]/gi, '<table style="border:1px solid #ccc;width:100%;border-collapse:collapse">');
        s = s.replace(/\[\/table\]/gi, '</table>');
        // Table rows & cells
        s = s.replace(/\[tr\]/gi, '<tr>');
        s = s.replace(/\[\/tr\]/gi, '</tr>');
        s = s.replace(/\[td style="([^"]*)"\]/gi, '<td style="$1;padding:8px">');
        s = s.replace(/\[td([^\]]*)\]/gi, '<td$1 style="padding:8px">');
        s = s.replace(/\[\/td\]/gi, '</td>');
        return s;
    }

})();
