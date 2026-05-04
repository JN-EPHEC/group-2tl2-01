import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Club Sportif',
      version: '1.0.0',
      description:
        'API REST de gestion du club sportif — familles, membres, crédits (FIFO), présences, journal d\'activité et exports Excel.',
    },
    servers: [{ url: '/api', description: 'Serveur local' }],
    tags: [
      { name: 'Auth',          description: 'Authentification et profil' },
      { name: 'Utilisateurs',  description: 'Gestion des comptes (admin seulement)' },
      { name: 'Familles',      description: 'Gestion des familles et de leurs crédits' },
      { name: 'Membres',       description: 'Gestion des membres du club' },
      { name: 'Cours',         description: 'Séances d\'entraînement et présences' },
      { name: 'Types de cours', description: 'Référentiel des types de cours' },
      { name: 'Journal',       description: 'Journal d\'activité (admin seulement)' },
      { name: 'Export',        description: 'Exports Excel (admin seulement)' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via POST /auth/login',
        },
      },
      schemas: {
        // ── Erreur générique ──────────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            error:   { type: 'string', example: 'Message d\'erreur' },
            details: { type: 'string', nullable: true },
          },
        },

        // ── Auth ──────────────────────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'admin@club.fr' },
            password: { type: 'string', example: 'Admin1234!' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user:  { $ref: '#/components/schemas/UserPublic' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'Admin1234!' },
            newPassword:     { type: 'string', minLength: 8, example: 'Nouveau1234!' },
          },
        },

        // ── Utilisateur ───────────────────────────────────────────────────
        UserPublic: {
          type: 'object',
          properties: {
            id:                  { type: 'string', format: 'uuid' },
            email:               { type: 'string', format: 'email' },
            role:                { type: 'string', enum: ['admin', 'coach', 'family'] },
            firstName:           { type: 'string' },
            lastName:            { type: 'string' },
            isActive:            { type: 'boolean' },
            familyId:            { type: 'string', format: 'uuid', nullable: true },
            forcePasswordChange: { type: 'boolean' },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'password', 'role', 'firstName', 'lastName'],
          properties: {
            email:     { type: 'string', format: 'email', example: 'coach@club.fr' },
            password:  { type: 'string', minLength: 8 },
            role:      { type: 'string', enum: ['admin', 'coach', 'family'] },
            firstName: { type: 'string', example: 'Jean' },
            lastName:  { type: 'string', example: 'Dupont' },
            familyId:  { type: 'string', format: 'uuid', nullable: true,
                         description: 'Obligatoire si role = family' },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            email:     { type: 'string', format: 'email' },
            role:      { type: 'string', enum: ['admin', 'coach', 'family'] },
            firstName: { type: 'string' },
            lastName:  { type: 'string' },
            familyId:  { type: 'string', format: 'uuid', nullable: true },
          },
        },

        // ── Famille ───────────────────────────────────────────────────────
        Family: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            name:         { type: 'string', example: 'Famille Dupont' },
            phone:        { type: 'string', nullable: true, example: '0471234567' },
            email:        { type: 'string', nullable: true, example: 'dupont@mail.com' },
            address:      { type: 'string', nullable: true },
            isActive:     { type: 'boolean' },
            totalCredits: { type: 'integer',
                            description: 'Solde réel (peut être négatif si dettes)',
                            example: 7 },
            memberCount:  { type: 'integer', example: 3 },
          },
        },
        FamilyDetail: {
          allOf: [
            { $ref: '#/components/schemas/Family' },
            {
              type: 'object',
              properties: {
                members:       { type: 'array', items: { $ref: '#/components/schemas/Member' } },
                creditHistory: { type: 'array', items: { $ref: '#/components/schemas/CreditPurchase' } },
              },
            },
          ],
        },
        CreateFamilyRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name:    { type: 'string', example: 'Famille Martin' },
            phone:   { type: 'string', nullable: true },
            email:   { type: 'string', format: 'email', nullable: true },
            address: { type: 'string', nullable: true },
          },
        },
        AddCreditsRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'integer', minimum: 1, example: 10,
                      description: 'Nombre de cours à créditer (+10, +20, +30…)' },
            note:   { type: 'string', nullable: true, example: 'Paiement en espèces' },
          },
        },
        AddCreditsResponse: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            familyId:     { type: 'string', format: 'uuid' },
            amount:       { type: 'integer' },
            remaining:    { type: 'integer' },
            note:         { type: 'string', nullable: true },
            addedBy:      { type: 'string', format: 'uuid' },
            purchaseDate: { type: 'string', format: 'date-time' },
          },
        },

        // ── Membre ────────────────────────────────────────────────────────
        Member: {
          type: 'object',
          properties: {
            id:              { type: 'string', format: 'uuid' },
            firstName:       { type: 'string', example: 'Lucas' },
            lastName:        { type: 'string', example: 'Dupont' },
            photo:           { type: 'string', nullable: true, description: 'Nom du fichier dans /uploads/' },
            birthDate:       { type: 'string', format: 'date', nullable: true },
            weight:          { type: 'number', nullable: true, example: 35.5 },
            isActive:        { type: 'boolean' },
            familyId:        { type: 'string', format: 'uuid' },
            familyName:      { type: 'string', nullable: true },
            isAutonomous:    { type: 'boolean', description: 'Compteur de crédits individuel' },
            availableCredits:{ type: 'integer',
                               description: 'Solde réel (peut être négatif si dettes)',
                               example: 4 },
          },
        },
        MemberDetail: {
          allOf: [
            { $ref: '#/components/schemas/Member' },
            {
              type: 'object',
              properties: {
                family:          { $ref: '#/components/schemas/Family' },
                creditPurchases: { type: 'array', items: { $ref: '#/components/schemas/CreditPurchase' } },
                attendances:     { type: 'array', items: { $ref: '#/components/schemas/AttendanceWithCourse' } },
              },
            },
          ],
        },
        CreateMemberRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'familyId'],
          properties: {
            firstName: { type: 'string', example: 'Lucas' },
            lastName:  { type: 'string', example: 'Dupont' },
            familyId:  { type: 'string', format: 'uuid' },
            birthDate: { type: 'string', format: 'date', nullable: true },
            weight:    { type: 'number', nullable: true },
          },
        },
        UpdateMemberRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName:  { type: 'string' },
            familyId:  { type: 'string', format: 'uuid' },
            birthDate: { type: 'string', format: 'date', nullable: true },
            weight:    { type: 'number', nullable: true },
          },
        },

        // ── Crédit ────────────────────────────────────────────────────────
        CreditPurchase: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            familyId:     { type: 'string', format: 'uuid', nullable: true },
            memberId:     { type: 'string', format: 'uuid', nullable: true },
            amount:       { type: 'integer', example: 10 },
            remaining:    { type: 'integer', example: 7 },
            note:         { type: 'string', nullable: true },
            addedBy:      { type: 'string', format: 'uuid' },
            purchaseDate: { type: 'string', format: 'date-time' },
            addedByUser:  {
              nullable: true,
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName:  { type: 'string' },
              },
            },
          },
        },

        // ── Type de cours ─────────────────────────────────────────────────
        CourseType: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid' },
            name:     { type: 'string', example: 'Judo' },
            color:    { type: 'string', nullable: true, example: '#EF4444', description: 'Couleur hex pour l\'UI' },
            isActive: { type: 'boolean' },
          },
        },
        CreateCourseTypeRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name:  { type: 'string', example: 'Karaté' },
            color: { type: 'string', nullable: true, example: '#10B981' },
          },
        },

        // ── Cours ─────────────────────────────────────────────────────────
        Course: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            date:           { type: 'string', format: 'date', example: '2026-04-10' },
            time:           { type: 'string', example: '18:30' },
            courseTypeId:   { type: 'string', format: 'uuid' },
            courseType:     { $ref: '#/components/schemas/CourseType' },
            createdBy:      { type: 'string', format: 'uuid' },
            creator: {
              nullable: true,
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName:  { type: 'string' },
              },
            },
            notes:          { type: 'string', nullable: true },
            attendanceCount:{ type: 'integer', example: 12 },
          },
        },
        CourseDetail: {
          allOf: [
            { $ref: '#/components/schemas/Course' },
            {
              type: 'object',
              properties: {
                attendances: { type: 'array', items: { $ref: '#/components/schemas/AttendanceWithMember' } },
              },
            },
          ],
        },
        CreateCourseRequest: {
          type: 'object',
          required: ['date', 'time', 'courseTypeId'],
          properties: {
            date:         { type: 'string', format: 'date', example: '2026-04-10' },
            time:         { type: 'string', example: '18:30' },
            courseTypeId: { type: 'string', format: 'uuid' },
            notes:        { type: 'string', nullable: true },
          },
        },

        // ── Présence ──────────────────────────────────────────────────────
        Attendance: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid' },
            courseId:         { type: 'string', format: 'uuid' },
            memberId:         { type: 'string', format: 'uuid' },
            creditPurchaseId: { type: 'string', format: 'uuid', nullable: true,
                                description: 'null si aucun crédit disponible (dette)' },
            createdAt:        { type: 'string', format: 'date-time' },
          },
        },
        AttendanceWithMember: {
          allOf: [
            { $ref: '#/components/schemas/Attendance' },
            {
              type: 'object',
              properties: {
                member: { $ref: '#/components/schemas/Member' },
              },
            },
          ],
        },
        AttendanceWithCourse: {
          allOf: [
            { $ref: '#/components/schemas/Attendance' },
            {
              type: 'object',
              properties: {
                course: { $ref: '#/components/schemas/Course' },
              },
            },
          ],
        },
        AddAttendancesRequest: {
          type: 'object',
          required: ['memberIds'],
          properties: {
            memberIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              example: ['uuid-1', 'uuid-2'],
            },
          },
        },
        AddAttendancesResponse: {
          type: 'object',
          properties: {
            added:          { type: 'array', items: { type: 'string', format: 'uuid' },
                              description: 'IDs des membres ajoutés avec succès' },
            alreadyPresent: { type: 'array', items: { type: 'string', format: 'uuid' },
                              description: 'IDs des membres déjà présents (ignorés)' },
            noCredits:      { type: 'array', items: { type: 'string', format: 'uuid' },
                              description: 'IDs ajoutés sans crédit (dette créée)' },
          },
        },

        // ── Journal ───────────────────────────────────────────────────────
        ActivityLog: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            userId:     { type: 'string', format: 'uuid', nullable: true },
            user: {
              nullable: true,
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName:  { type: 'string' },
                role:      { type: 'string', enum: ['admin', 'coach', 'family'] },
              },
            },
            action:     { type: 'string', example: 'ADD_CREDITS',
                          enum: ['LOGIN','ADD_CREDITS','CREATE_COURSE','ADD_ATTENDANCE',
                                 'REMOVE_ATTENDANCE','UPDATE_PROFILE','CHANGE_PASSWORD',
                                 'FORCE_PASSWORD_RESET','DEACTIVATE_ACCOUNT','CREATE_USER',
                                 'CREATE_FAMILY','CREATE_MEMBER','MAKE_AUTONOMOUS'] },
            details:    { type: 'string', nullable: true, example: 'Ajout de 10 cours à Famille Dupont' },
            targetType: { type: 'string', nullable: true, example: 'Family' },
            targetId:   { type: 'string', nullable: true },
            createdAt:  { type: 'string', format: 'date-time' },
          },
        },
        PaginatedActivityLog: {
          type: 'object',
          properties: {
            total:      { type: 'integer' },
            page:       { type: 'integer' },
            limit:      { type: 'integer' },
            totalPages: { type: 'integer' },
            logs:       { type: 'array', items: { $ref: '#/components/schemas/ActivityLog' } },
          },
        },
      },

      // ── Réponses réutilisables ─────────────────────────────────────────
      responses: {
        Unauthorized: {
          description: 'Token JWT manquant ou invalide',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Rôle insuffisant pour cette action',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Ressource introuvable',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        BadRequest: {
          description: 'Données invalides ou champs obligatoires manquants',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);