# temps
/saas-app
│
├── /src
│   ├── /config
│   │   ├── db.js                   # MongoDB connection
│   │   ├── session.js              # Session config
│   │   ├── email.js                # Nodemailer config
│   │   └── appConfig.js            # App-wide constants (e.g., guest credentials, OTP settings)
│   │
│   ├── /controllers
│   │   ├── admin.controller.js
│   │   ├── superadmin.controller.js
│   │   ├── tenant.controller.js
│   │   ├── auth.controller.js
│   │   ├── application.controller.js
│   │   ├── guest.controller.js
│   │   └── common.controller.js    # Shared actions like logout/session status
│   │
│   ├── /models
│   │   ├── admin.model.js
│   │   ├── superadmin.model.js
│   │   ├── tenant.model.js
│   │   ├── role.model.js
│   │   ├── permission.model.js
│   │   ├── session.model.js
│   │   ├── log.model.js
│   │   ├── auth.model.js
│   │   └── application.model.js
│   │
│   ├── /routes
│   │   ├── admin.routes.js
│   │   ├── superadmin.routes.js
│   │   ├── tenant.routes.js
│   │   ├── auth.routes.js
│   │   ├── application.routes.js
│   │   ├── guest.routes.js
│   │   └── index.js                # Consolidates all routes
│   │
│   ├── /services
│   │   ├── admin.service.js
│   │   ├── superadmin.service.js
│   │   ├── tenant.service.js
│   │   ├── auth.service.js
│   │   ├── application.service.js
│   │   └── guest.service.js
│   │
│   ├── /middlewares
│   │   ├── rbac.middleware.js
│   │   ├── sessionAuth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── validate.middleware.js
│   │   └── guestAccess.middleware.js
│   │
│   ├── /helpers
│   │   ├── otp.helper.js
│   │   ├── email.helper.js
│   │   ├── logger.helper.js
│   │   ├── tenant.helper.js         # Convert tempId -> permanentId
│   │   └── response.helper.js       # Standardize API responses
│   │
│   ├── /validators
│   │   ├── auth.validator.js
│   │   ├── tenant.validator.js
│   │   ├── application.validator.js
│   │   └── admin.validator.js
│   │
│   ├── /utils
│   │   ├── customError.js           # Custom error class for safe rejections
│   │   ├── sanitize.js              # Input sanitization helpers
│   │   └── generateId.js            # Utility to generate tenantId (temp/permanent)
│   │
│   ├── /jobs
│   │   └── emailJob.js              # Email background job handler (optional for scalability)
│   │
│   ├── /app.js                      # Express app instance
│   └── /server.js                   # App bootstrap & listener
│
├── /logs
│   ├── error.log
│   └── access.log
│
├── .env
├── .gitignore
├── package.json
└── README.md




src/
├── config/
│   ├── db.js
│   └── index.js
├── controllers/
│   ├── application.controller.js
│   ├── auth.controller.js
│   ├── tenant.controller.js
│   └── user.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   └── validate.middleware.js
├── models/
│   ├── application.model.js
│   ├── auth.model.js
│   ├── log.model.js
│   ├── permission.model.js
│   ├── role.model.js
│   ├── session.model.js
│   ├── tenant.model.js
│   └── user.model.js
├── routes/
│   ├── application.routes.js
│   ├── auth.routes.js
│   ├── tenant.routes.js
│   └── user.routes.js
├── services/
│   ├── application.service.js
│   ├── auth.service.js
│   ├── tenant.service.js
│   └── user.service.js
├── utils/
│   ├── emailSender.js
│   ├── helpers.js
│   ├── logger.js
│   └── responseHandler.js
├── app.js
└── server.js



yurv cdsd dvcs zovx